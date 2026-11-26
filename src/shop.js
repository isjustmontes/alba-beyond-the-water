import {LURES,EQUIPMENT} from './simulation/config.js';

export const SHOP_STORAGE_KEY='alba-village-progress-v1';
export const INITIAL_COINS=100;
export const SHOP_CATALOG=Object.freeze([
  ...LURES.map(lure=>Object.freeze({id:lure.id,name:lure.name,description:lure.description,category:lure.id==='worm'?'Cebos':'Señuelos',price:{spinner:20,worm:15,minnow:35}[lure.id],lureId:lure.id})),
  Object.freeze({id:'line',name:EQUIPMENT.line,description:'Sedal de recambio para el aparejo actual. Sin cambios de resistencia.',category:'Aparejos',price:25})
]);
const itemFor=id=>SHOP_CATALOG.find(item=>item.id===id);
const validId=id=>typeof id==='string'&&/^[a-zA-Z0-9_-]{1,100}$/.test(id);
function initialState(){return {version:1,balance:INITIAL_COINS,items:Object.fromEntries(SHOP_CATALOG.map(item=>[item.id,1])),receipts:[]};}
function decode(raw){
  const s=JSON.parse(raw);
  if(!s||s.version!==1||!Number.isSafeInteger(s.balance)||s.balance<0||s.balance>INITIAL_COINS||!s.items||typeof s.items!=='object'||Array.isArray(s.items))throw Error('Invalid progress');
  if(Object.keys(s.items).length!==SHOP_CATALOG.length||!SHOP_CATALOG.every(item=>Object.hasOwn(s.items,item.id)&&Number.isSafeInteger(s.items[item.id])&&s.items[item.id]>=1&&s.items[item.id]<=1000))throw Error('Invalid inventory');
  if(!Array.isArray(s.receipts)||s.receipts.length>128||s.receipts.some(r=>!r||!validId(r.id)||!itemFor(r.itemId))||new Set(s.receipts.map(r=>r.id)).size!==s.receipts.length)throw Error('Invalid receipts');
  return s;
}

// One local document: persist the whole candidate before exposing any purchase.
// Catch records, equipped lure and audio preferences retain their existing keys.
export class VillageShop {
  constructor(storage){
    this.storage=storage;this.state=initialState();this.raw=null;this.blocked='';
    try{
      const raw=storage.getItem(SHOP_STORAGE_KEY);
      if(raw===null){const first=JSON.stringify(this.state);storage.setItem(SHOP_STORAGE_KEY,first);this.raw=first;}
      else{this.state=decode(raw);this.raw=raw;}
    }catch{this.blocked='Compras no disponibles: no se pudo leer o guardar el progreso. Se conservan los datos existentes.';}
  }
  get balance(){return this.state.balance;}
  count(id){return this.state.items[id]??0;}
  buy(itemId,transactionId){
    const fail=message=>({ok:false,message}),item=itemFor(itemId);
    if(this.blocked)return fail(this.blocked);
    if(!item||!validId(transactionId))return fail('Compra no válida.');
    try{
      const latest=this.storage.getItem(SHOP_STORAGE_KEY);
      if(latest!==this.raw){
        // Never overwrite newer progress from another instance or a reset key.
        if(latest===null)throw Error('Missing progress');
        this.state=decode(latest);this.raw=latest;
        return fail('El progreso ha cambiado. Revisa el saldo y vuelve a intentarlo.');
      }
    }catch{this.blocked='No se puede leer el progreso. No se han modificado tus datos.';return fail(this.blocked);}
    const receipt=this.state.receipts.find(r=>r.id===transactionId);
    if(receipt)return receipt.itemId===itemId?{ok:true,duplicate:true,message:'Esta compra ya estaba registrada.'}:fail('La operación ya corresponde a otro artículo.');
    if(this.balance<item.price)return fail('No tienes créditos suficientes.');
    if(this.count(itemId)>=1000||this.state.receipts.length>=128)return fail('Inventario completo.');
    const next={...this.state,balance:this.balance-item.price,items:{...this.state.items,[itemId]:this.count(itemId)+1},receipts:[...this.state.receipts,{id:transactionId,itemId}]};
    const raw=JSON.stringify(next);
    try{this.storage.setItem(SHOP_STORAGE_KEY,raw);}catch{return fail('No se pudo guardar la compra. No se han gastado créditos; puedes reintentar.');}
    this.state=next;this.raw=raw;
    return {ok:true,duplicate:false,message:`${item.name}: una unidad añadida al equipo.`};
  }
}
