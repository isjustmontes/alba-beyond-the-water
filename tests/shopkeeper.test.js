import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Conversation} from '../src/dialogues/conversation.js';
import {SHOPKEEPER,SHOPKEEPER_NODES,nearShopkeeper} from '../src/dialogues/shopkeeper.js';
import {ManuelConversation,MANUEL_NODES} from '../src/dialogues/manuel.js';
import {Environment} from '../src/simulation/environment.js';

test('all shopkeeper branches have valid answers, home, farewell and access to the real catalog',()=>{
 const ids=Object.keys(SHOPKEEPER_NODES),reach=start=>{const seen=new Set(),todo=[start];let exit=false,shop=false;while(todo.length){const id=todo.pop();if(seen.has(id))continue;seen.add(id);const node=SHOPKEEPER_NODES[id];assert.ok(node);assert.ok(node.choices.length>=2&&node.choices.length<=4);assert.equal(new Set(node.choices.map(c=>c.id)).size,node.choices.length);for(const c of node.choices){if(c.action){assert.equal(c.action,'shop');shop=true;}else if(c.next===null)exit=true;else todo.push(c.next);}}return {seen,exit,shop};};
 assert.equal(reach('welcome').seen.size,ids.length);
 const env=new Environment(),before=JSON.stringify(env.snapshot()),conversation=new Conversation(SHOPKEEPER_NODES,env);
 for(const id of ids){const r=reach(id);assert.ok(r.seen.has('welcome')&&r.exit&&r.shop);conversation.node=id;const v=conversation.view();assert.ok(v.text.length>60&&v.text.length<650);for(const c of v.choices){conversation.node=id;assert.ok(conversation.choose(c));}}
 assert.equal(JSON.stringify(env.snapshot()),before);
});
test('one shared session class preserves Manuel and isolates nodes/stale choices between residents',()=>{
 const env=new Environment(),manuel=new ManuelConversation(env),shop=new Conversation(SHOPKEEPER_NODES,env);assert.ok(manuel instanceof Conversation);assert.equal(manuel.nodes,MANUEL_NODES);
 const old=shop.view().choices[0];assert.equal(shop.choose(old),true);assert.equal(shop.choose(old),false);assert.equal(manuel.node,'welcome');shop.reset();assert.equal(shop.node,'welcome');
 const action=shop.view().choices.find(c=>c.action);assert.deepEqual(shop.choose({...action,action:'invalid'}),{action:'shop'},'effects come from authored nodes, never event payloads');
 assert.equal(shop.choose({from:'welcome',id:'not-found',action:'shop'}),false);
});
test('shopkeeper encounter is only on safe ground in front of the existing shop, distinct from Manuel',()=>{
 const context={zone:'anglers-village',mode:'exploring',state:'ready',grounded:true,x:-8.35,z:2.5};assert.equal(nearShopkeeper(context),true);
 for(const change of [{zone:'lago-sereno'},{mode:'fishing'},{state:'fighting'},{grounded:false},{x:5,z:8.2},{x:-8.35,z:-2},{x:-10,z:1.1},{x:0,z:29},{x:-8.35,z:6}])assert.equal(nearShopkeeper({...context,...change}),false);
});
test('provisional name can change once without editing authored dialogue',()=>{
 const before=SHOPKEEPER.name;
 try{SHOPKEEPER.name='Nome de proba';assert.ok(new Conversation(SHOPKEEPER_NODES,new Environment()).view().text.includes('Nome de proba'));}finally{SHOPKEEPER.name=before;}
});
