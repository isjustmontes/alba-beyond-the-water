import {test} from 'node:test';
import assert from 'node:assert/strict';
import {EquipmentTransition} from '../src/animation/equipment-transition.js';
import {Exploration} from '../src/input/exploration.js';
import {atSpot,walkHeight} from '../src/input/shore-route.js';
import {FishingActions} from '../src/input/actions.js';
import {FishingGame} from '../src/fishing.js';
import {LakeWorld} from '../src/world.js';

test('free shore selection has no cove radius, preserves position and requires safe access',()=>{
  for(const [x,z]of [[-11,24],[11,24],[4,32]]){
    assert.notEqual(walkHeight(x,z),null);assert.equal(atSpot(x,z).id,'shore');
    const m=new Exploration();m.toggle('ready',0,0);m.x=x;m.z=z;
    assert.ok(m.toggle('ready',.3,0,()=>false));assert.equal(m.mode,'exploring');
    assert.equal(m.toggle('ready',.3,0,()=>true),null);assert.equal(m.x,x);assert.equal(m.z,z);
  }
  assert.equal(atSpot(-11,24,[{x:-11,z:24,radius:1}]),null);
  assert.equal(atSpot(60,20),null);assert.equal(atSpot(1,7),null);
});
test('equip and stow are continuous, reversible and frame-rate independent',()=>{
  for(const fps of [20,60,120]){
    const e=new EquipmentTransition();assert.equal(e.ready,true);
    e.update(1/fps,false);assert.ok(e.value>0&&e.value<1);
    const before=e.lowered;e.update(0,true);assert.equal(e.lowered,before);
    for(let i=0;i<fps;i++)e.update(1/fps,false);assert.equal(e.value,0);
    for(let i=0;i<fps;i++)e.update(1/fps,true);assert.equal(e.ready,true);assert.equal(e.lowered,0);
  }
});
test('held inputs during equip cannot become phantom casts after equip or cancellation',()=>{
  const e=new EquipmentTransition(),g=new FishingGame(),a=new FishingActions(g,{isBlocked:()=>!e.ready});
  e.update(.25,false);assert.equal(a.hold('space'),false);
  e.update(.25,true);assert.equal(e.ready,true);assert.equal(a.release('space'),false);assert.equal(g.actionCounts.casts,0);
  a.hold('space');a.clear();a.release('space');assert.equal(g.state,'ready');assert.equal(g.actionCounts.casts,0);
});
test('equip preserves out-of-range pitch until smoothly settled; free shore yaw wraps',()=>{
  const w=Object.create(LakeWorld.prototype);w.pitch=-.9;w.yaw=3.13;w.fishingLook=Math.PI;w.setView=()=>{};
  w.setExploring(false);assert.equal(w.pitch,-.9);assert.equal(w.viewPitchTarget,-.48);
  w.look(-20,0);assert.equal(w.pitch,-.9);assert.ok(w.yaw<0,'crosses pi without getting stuck');
  w.setExploring(true);assert.equal(w.viewPitchTarget,null);
});
