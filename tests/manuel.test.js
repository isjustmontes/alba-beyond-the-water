import {test} from 'node:test';
import assert from 'node:assert/strict';
import {MANUEL_NODES,ManuelConversation,nearManuel,MANUEL} from '../src/dialogues/manuel.js';
import {SPECIES,LURES} from '../src/simulation/config.js';
import {Environment} from '../src/simulation/environment.js';

test('every Manuel node is reachable, has valid unique choices and a path home and out',()=>{
 const ids=Object.keys(MANUEL_NODES);
 const reachable=start=>{const seen=new Set(),todo=[start];let exit=false;while(todo.length){const id=todo.pop();if(seen.has(id))continue;seen.add(id);for(const c of MANUEL_NODES[id].choices){if(c.next===null)exit=true;else{assert.ok(MANUEL_NODES[c.next],`${id}: valid destination`);todo.push(c.next);}}}return {seen,exit};};
 assert.equal(reachable('welcome').seen.size,ids.length);
 for(const id of ids){const n=MANUEL_NODES[id];assert.ok(n.choices.length>=2&&n.choices.length<=4);assert.equal(new Set(n.choices.map(c=>c.id)).size,n.choices.length);const r=reachable(id);assert.ok(r.seen.has('welcome'));assert.equal(r.exit,true);}
});
test('all branches render real local content and every action has a response',()=>{
 const env=new Environment(),conversation=new ManuelConversation(env);
 for(const id of Object.keys(MANUEL_NODES)){
  conversation.node=id;const view=conversation.view();assert.ok(view.text.length>60&&view.text.length<600,`${id}: short complete copy`);
  for(const c of view.choices){conversation.node=id;assert.ok(c.label.trim());const result=conversation.choose(c);assert.ok(result===true||result==='close');if(result===true)assert.ok(conversation.view().text);}
 }
 conversation.node='species';for(const s of SPECIES)assert.ok(conversation.view().text.includes(s.name.toLocaleLowerCase('es')));
 conversation.node='lures';for(const l of LURES)assert.ok(conversation.view().text.includes(l.name));
});
test('stale or unknown choices cannot skip nodes; reopening resets greeting',()=>{
 const c=new ManuelConversation(new Environment()),first=c.view().choices[0];assert.equal(c.choose(first),true);assert.equal(c.node,'fishing');assert.equal(c.choose(first),false);assert.equal(c.choose({id:'missing',from:'fishing'}),false);
 c.reset();assert.equal(c.node,'welcome');assert.equal(c.choose(c.view().choices.find(c=>c.next===null)),'close');
});
test('environment dialogue observes existing live clock and weather without changing them',()=>{
 const env=new Environment({startHour:21});env.weather.request('heavyRain',{manual:true});env.update(25);
 const before=JSON.stringify(env.snapshot()),c=new ManuelConversation(env);c.node='conditions';const text=c.view().text;
 assert.ok(text.includes(env.snapshot().weatherName));assert.ok(text.includes('21:'));assert.ok(text.includes('poca luz'));assert.ok(text.includes('lluvia'));assert.equal(JSON.stringify(env.snapshot()),before);
 env.clock.totalHours=12;assert.ok(c.view().text.includes('12:'));assert.ok(c.view().text.includes('zonas más profundas'));
});
const near=(extras={})=>nearManuel({zone:'anglers-village',mode:'exploring',state:'ready',grounded:true,x:MANUEL.x,z:MANUEL.z,...extras});
test('Manuel proximity is contextual, on foot, on ground, within reach and never across the bench',()=>{
 assert.equal(near(),true);assert.equal(near({x:4,z:8.8}),true);
 for(const extras of [{zone:'lago-sereno'},{mode:'fishing'},{state:'fighting'},{state:'casting'},{grounded:false},{x:0,z:10},{x:5,z:7},{x:5,z:6},{x:3.5,z:3},{x:-8.35,z:2.5},{x:0,z:29},{x:NaN}])assert.equal(near(extras),false,JSON.stringify(extras));
});
