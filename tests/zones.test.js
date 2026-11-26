import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ZONES,ZoneManager} from '../src/zones.js';

test('Lago Sereno reuses the supplied scene and describes the unchanged dock spawn',()=>{
  const scene={camera:{x:2},children:['existing']},before=structuredClone(scene),session=new ZoneManager({scene});
  assert.equal(session.scene,scene);assert.equal(session.current.id,'lago-sereno');assert.equal(session.entryId,'dock');
  assert.deepEqual(session.spawn,{position:{x:0,y:3,z:7},yaw:0,pitch:-.065});assert.deepEqual(scene,before);
  assert.deepEqual(Object.keys(ZONES),['lago-sereno']);assert.deepEqual(session.current.exits,{});assert.equal(session.prepareExit('future'),null);
});
test('exit planning resolves independent entries without switching zone, scene or player',()=>{
  const entry=(x)=>({position:{x,y:2,z:3},yaw:.2,pitch:0});
  // Test-only zones: no additional game content is registered.
  const zones={a:{id:'a',defaultEntry:'start',entries:{start:entry(1)},exits:{path:{zoneId:'b',entryId:'gate'}}},b:{id:'b',defaultEntry:'gate',entries:{gate:entry(10)},exits:{}}};
  const scene={player:{x:1}},s=new ZoneManager({zones,zoneId:'a',scene}),before=structuredClone(zones);
  const plan=s.prepareExit('path');assert.deepEqual(plan,{from:'a',to:'b',entryId:'gate',spawn:entry(10)});
  assert.equal(s.current.id,'a');assert.equal(s.entryId,'start');assert.equal(s.scene,scene);assert.deepEqual(scene,{player:{x:1}});
  plan.spawn.position.x=999;assert.deepEqual(zones,before);assert.equal(s.prepareExit('path').spawn.position.x,10);
});
test('unknown and malformed destinations cannot produce a transition plan',()=>{
  assert.throws(()=>new ZoneManager({zoneId:'__proto__'}),/Unknown zone/);
  assert.throws(()=>new ZoneManager({entryId:'missing'}),/Unknown entry/);
  const zones={a:{id:'a',defaultEntry:'start',entries:{start:{position:{x:0,y:0,z:0},yaw:0,pitch:0}},exits:{bad:{zoneId:'missing',entryId:'gate'},wrong:{zoneId:'a',entryId:'missing'}}}};
  const s=new ZoneManager({zones,zoneId:'a'});assert.throws(()=>s.prepareExit('bad'),/Unknown zone/);assert.throws(()=>s.prepareExit('wrong'),/Unknown entry/);
  zones.a.entries.start.position.x=NaN;assert.throws(()=>new ZoneManager({zones,zoneId:'a'}),/Invalid spawn/);
});
test('production zone definitions and returned spawn values cannot be accidentally shared/mutated',()=>{
  const s=new ZoneManager();s.spawn.position.x=50;assert.equal(s.spawn.position.x,0);
  assert.throws(()=>{ZONES['lago-sereno'].entries.dock.position.z=99;},TypeError);
  assert.throws(()=>{ZONES['lago-sereno'].exits.path={};},TypeError);
});
