import {SHOP_CATALOG} from './shop.js';

export class ShopPanel {
  constructor({shop,game,dialog,onChange,onEquip}){
    this.shop=shop;this.game=game;this.dialog=dialog;this.onChange=onChange;this.onEquip=onEquip;this.sequence=0;
    this.session=globalThis.crypto?.randomUUID?.()??`${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  }
  render(){
    const {shop,dialog}=this,items=dialog.querySelector('#shop-items');items.replaceChildren();
    dialog.querySelector('#shop-balance').textContent=shop.blocked?'No disponible':`${shop.balance} créditos`;
    dialog.querySelector('#shop-feedback').textContent=shop.blocked;
    for(const item of SHOP_CATALOG){
      const row=document.createElement('article');row.className='shop-item';row.dataset.item=item.id;
      const category=document.createElement('small'),title=document.createElement('h3'),description=document.createElement('p'),owned=document.createElement('span'),actions=document.createElement('div');
      category.textContent=item.category;title.textContent=item.name;description.textContent=item.description;owned.className='shop-owned';actions.className='shop-actions';
      const buy=document.createElement('button');buy.className='secondary-button';buy.dataset.buy=item.id;
      const refresh=()=>{owned.textContent=`En equipo: ${shop.count(item.id)}`;buy.textContent=`Comprar · ${item.price} créditos`;buy.disabled=!!shop.blocked||shop.balance<item.price;};
      let transactionId=`${this.session}-${++this.sequence}`,busy=false;
      buy.onclick=()=>{
        if(busy)return;busy=true;buy.disabled=true;
        const result=shop.buy(item.id,transactionId);dialog.querySelector('#shop-feedback').textContent=result.message;
        dialog.querySelector('#shop-balance').textContent=shop.blocked?'No disponible':`${shop.balance} créditos`;
        this.onChange();
        for(const button of items.querySelectorAll('[data-buy]')){const other=SHOP_CATALOG.find(i=>i.id===button.dataset.buy);button.disabled=!!shop.blocked||shop.balance<other.price;}
        owned.textContent=`En equipo: ${shop.count(item.id)}`;
        if(!result.ok){busy=false;refresh();return;}
        buy.disabled=true;buy.textContent='Compra registrada';
        // Keep the same receipt through compatibility clicks and double taps.
        // A later deliberate activation receives a fresh transaction.
        setTimeout(()=>{if(!buy.isConnected)return;transactionId=`${this.session}-${++this.sequence}`;busy=false;refresh();},800);
      };
      refresh();actions.append(buy);
      const equip=document.createElement('button');equip.className='secondary-button';equip.textContent=item.lureId?'Seleccionar':'Montar recambio';equip.dataset.equip=item.id;
      equip.onclick=()=>{const result=this.onEquip(item.id);dialog.querySelector('#shop-feedback').textContent=result.message;this.onChange();};actions.append(equip);
      row.append(category,title,description,owned,actions);items.append(row);
    }
  }
}
