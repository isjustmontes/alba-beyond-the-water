import {test} from 'node:test';
import assert from 'node:assert/strict';
import {VillageShop,SHOP_CATALOG,SHOP_STORAGE_KEY} from '../src/shop.js';
import {nearVillageShop,villageWalkHeight} from '../src/village-layout.js';
import {FishingGame,LURES,EQUIPMENT} from '../src/fishing.js';

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
 for(const raw of ['{bad',JSON.stringify({...base,version:2}),JSON.stringify({...base,balance:-1}),JSON.stringify({...base,items:{worm:1}}),JSON.stringify({...base,receipts:[{id:'x',itemId:'missing'}]})]){
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
