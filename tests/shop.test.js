import {test} from 'node:test';
import assert from 'node:assert/strict';
import {VillageShop,SHOP_CATALOG,SHOP_STORAGE_KEY} from '../src/shop.js';
import {nearVillageShop,villageWalkHeight} from '../src/village-layout.js';
import {FishingGame,LURES,EQUIPMENT} from '../src/fishing.js';
import {ZoneManager} from '../src/zones.js';

function storage(){const data=new Map();return {data,getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value)};}
test('initial funds are granted once, all legacy gear stays owned and old storage keys are untouched',()=>{
 const s=storage();s.setItem('alba-catches-v1','legacy catches');s.setItem('alba-equipment-v1','worm');s.setItem('alba-audio-v1','false');
 const shop=new VillageShop(s);assert.equal(shop.balance,100);assert.equal(shop.blocked,'');
 for(const item of SHOP_CATALOG)assert.equal(shop.count(item.id),1);
 assert.equal(shop.buy('spinner','first').ok,true);assert.equal(shop.balance,80);assert.equal(shop.count('spinner'),2);
 const restored=new VillageShop(s);assert.equal(restored.balance,80);assert.equal(restored.count('spinner'),2);
 assert.equal(s.getItem('alba-catches-v1'),'legacy catches');assert.equal(s.getItem('alba-equipment-v1'),'worm');assert.equal(s.getItem('alba-audio-v1'),'false');
});
test('a persisted transaction cannot charge twice, even after reloading or for a different item',()=>{
 const s=storage(),shop=new VillageShop(s);shop.buy('worm','tap-1');const saved=s.getItem(SHOP_STORAGE_KEY);
 const duplicate=shop.buy('worm','tap-1');assert.equal(duplicate.duplicate,true);assert.equal(shop.balance,85);assert.equal(s.getItem(SHOP_STORAGE_KEY),saved);
 assert.equal(new VillageShop(s).buy('worm','tap-1').duplicate,true);assert.equal(shop.buy('line','tap-1').ok,false);assert.equal(s.getItem(SHOP_STORAGE_KEY),saved);
});
test('catalog prices, finite inventory and sufficient balance are enforced without mutation on refusal',()=>{
 const s=storage(),shop=new VillageShop(s);
 for(const [id,tx]of [['__proto__','bad'],['missing','bad'],['worm',''],['worm',null]])assert.equal(shop.buy(id,tx).ok,false);
 assert.equal(shop.balance,100);
 for(let i=0;i<6;i++)assert.equal(shop.buy('worm',`worm-${i}`).ok,true);
 const before=s.getItem(SHOP_STORAGE_KEY);assert.equal(shop.balance,10);assert.equal(shop.buy('worm','extra').ok,false);assert.equal(s.getItem(SHOP_STORAGE_KEY),before);assert.equal(shop.count('worm'),7);
});
test('a failed purchase write cannot spend coins or grant items and is retryable',()=>{
 const s=storage(),shop=new VillageShop(s),before=s.getItem(SHOP_STORAGE_KEY),write=s.setItem;
 s.setItem=()=>{throw Error('quota');};assert.equal(shop.buy('line','retry').ok,false);assert.equal(shop.balance,100);assert.equal(shop.count('line'),1);assert.equal(s.getItem(SHOP_STORAGE_KEY),before);
 s.setItem=write;assert.equal(shop.buy('line','retry').ok,true);assert.equal(shop.balance,75);assert.equal(shop.count('line'),2);
});
test('corrupt, future and invalid progress remain byte-for-byte intact with commerce disabled',()=>{
 const base={version:1,balance:100,items:{spinner:1,worm:1,minnow:1,line:1},receipts:[]};
 for(const raw of ['{bad',JSON.stringify({...base,version:99}),JSON.stringify({...base,balance:-1}),JSON.stringify({...base,items:{worm:1}}),JSON.stringify({...base,receipts:[{id:'x',itemId:'missing'}]})]){
  const s=storage();s.setItem(SHOP_STORAGE_KEY,raw);const shop=new VillageShop(s);assert.ok(shop.blocked);assert.equal(shop.buy('worm','x').ok,false);assert.equal(s.getItem(SHOP_STORAGE_KEY),raw);
 }
 const s={getItem(){throw Error('denied');},setItem(){throw Error('denied');}};assert.ok(new VillageShop(s).blocked);assert.ok(new VillageShop(null).blocked);
});
test('newer progress from another instance is reloaded instead of overwritten',()=>{
 const s=storage(),a=new VillageShop(s),b=new VillageShop(s);assert.equal(a.buy('spinner','a').ok,true);
 const before=s.getItem(SHOP_STORAGE_KEY);assert.equal(b.buy('line','b').ok,false);assert.equal(b.balance,80);assert.equal(s.getItem(SHOP_STORAGE_KEY),before);
 assert.equal(b.buy('line','b').ok,true);assert.equal(b.balance,55);assert.equal(b.count('spinner'),2);
});
test('shop proximity is reachable at the existing door, without reaching through walls or distant ground',()=>{
 assert.equal(nearVillageShop(-8.35,2.5),true);assert.ok(Number.isFinite(villageWalkHeight(-8.35,2.5)));
 for(const [x,z]of [[-8,-3],[0,29],[-15,2],[-8,0]])assert.equal(nearVillageShop(x,z),false);
});
test('catalog gear maps to existing selection without changing fishing properties',()=>{
 const before=JSON.stringify({LURES,EQUIPMENT}),shop=new VillageShop(storage()),game=new FishingGame();
 for(const item of SHOP_CATALOG){if(item.lureId){assert.ok(game.selectLure(item.lureId));assert.equal(shop.count(item.id),1);}}
 shop.buy('minnow','fish-gear');game.press();game.release();assert.equal(game.actionCounts.casts,1);assert.equal(shop.count('minnow'),2);assert.equal(JSON.stringify({LURES,EQUIPMENT}),before);
});

test('C progress imports legacy selection without resetting funds, receipts or quantities',()=>{
 const s=storage(),old={version:1,balance:65,items:{spinner:1,worm:1,minnow:2,line:1},receipts:[{id:'c-buy',itemId:'minnow'}]},raw=JSON.stringify(old);
 s.setItem(SHOP_STORAGE_KEY,raw);s.setItem('alba-equipment-v1','worm');
 const shop=new VillageShop(s);assert.equal(shop.balance,65);assert.equal(shop.count('minnow'),2);assert.equal(shop.equipment.lureId,'worm');assert.equal(s.getItem(SHOP_STORAGE_KEY),raw,'reading old data does not rewrite it');
 assert.equal(shop.equip('minnow').ok,true);const upgraded=JSON.parse(s.getItem(SHOP_STORAGE_KEY));
 assert.equal(upgraded.version,2);assert.equal(upgraded.balance,65);assert.deepEqual(upgraded.items,old.items);assert.deepEqual(upgraded.receipts,old.receipts);
 assert.equal(new VillageShop(s).equipment.lureId,'minnow','new document is authoritative over stale legacy mirror');
 assert.equal(new VillageShop(s).buy('minnow','c-buy').duplicate,true);
});
test('legacy equipment with no commerce save receives initial funds only once and keeps its lure',()=>{
 const s=storage();s.setItem('alba-equipment-v1','worm');const first=new VillageShop(s);
 assert.equal(first.equipment.lureId,'worm');assert.equal(first.balance,100);first.buy('line','legacy-line');
 const again=new VillageShop(s);assert.equal(again.balance,75);assert.equal(again.equipment.lureId,'worm');assert.equal(again.count('line'),2);
});
test('purchased line can be mounted repeatedly without a second charge or duplicated items',()=>{
 const s=storage(),shop=new VillageShop(s);shop.buy('line','spare-line');const before=JSON.parse(s.getItem(SHOP_STORAGE_KEY));
 assert.equal(shop.equip('line').ok,true);assert.deepEqual(shop.equipment,{lureId:'spinner',lineId:'line',lineUnit:2});
 for(let i=0;i<5;i++)shop.equip('line');
 const after=JSON.parse(s.getItem(SHOP_STORAGE_KEY));assert.equal(after.balance,before.balance);assert.deepEqual(after.items,before.items);assert.deepEqual(after.receipts,before.receipts);
 assert.equal(new VillageShop(s).equipment.lineUnit,2);
});
test('failed equipment write preserves previous usable gear, money and purchases and can retry',()=>{
 const s=storage(),shop=new VillageShop(s);shop.buy('line','line');const before=s.getItem(SHOP_STORAGE_KEY),write=s.setItem;
 s.setItem=()=>{throw Error('quota');};assert.equal(shop.equip('line').ok,false);assert.equal(shop.equip('worm').ok,false);
 assert.equal(shop.equipment.lineUnit,1);assert.equal(shop.equipment.lureId,'spinner');assert.equal(s.getItem(SHOP_STORAGE_KEY),before);assert.equal(shop.count('line'),2);assert.equal(shop.balance,75);
 s.setItem=write;assert.equal(shop.equip('line').ok,true);assert.equal(shop.equipment.lineUnit,2);
});
test('zone travel, reload and casting keep the bought lure and mounted line without changing inventory',()=>{
 const s=storage(),shop=new VillageShop(s);shop.buy('minnow','lure');shop.buy('line','line');shop.equip('minnow');shop.equip('line');
 const before=s.getItem(SHOP_STORAGE_KEY),zones=new ZoneManager(),options={mode:'exploring',state:'ready',heightAt:()=>1};
 for(let i=0;i<5;i++){
  const out=zones.travel('village',{position:{x:6,y:3,z:74},yaw:0,pitch:0},options);assert.ok(out);
  const back=zones.travel('lake',{position:{x:0,y:3,z:29},yaw:0,pitch:0},options);assert.ok(back);
 }
 const restored=new VillageShop(s),game=new FishingGame();game.lureId=restored.equipment.lureId;game.press();game.release();game.update(1.2);
 assert.equal(game.lureType.id,'minnow');assert.equal(restored.equipment.lineUnit,2);assert.equal(s.getItem(SHOP_STORAGE_KEY),before);
});
test('invalid mounted items in the new schema are preserved and never silently repaired',()=>{
 const s=storage(),shop=new VillageShop(s),base=JSON.parse(s.getItem(SHOP_STORAGE_KEY));
 for(const equipment of [{lureId:'missing',lineId:'line',lineUnit:1},{lureId:'worm',lineId:'unknown',lineUnit:1},{lureId:'worm',lineId:'line',lineUnit:0},{lureId:'worm',lineId:'line',lineUnit:2}]){
  const raw=JSON.stringify({...base,equipment});s.setItem(SHOP_STORAGE_KEY,raw);const invalid=new VillageShop(s);assert.ok(invalid.blocked);assert.equal(invalid.equip('worm').ok,false);assert.equal(s.getItem(SHOP_STORAGE_KEY),raw);
 }
});
