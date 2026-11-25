import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Scene} from 'three';
import {faunaConditions,makeFaunaSlots,birdPose,insectPose} from '../src/ambient-life.js';
import {AmbientFauna} from '../src/visuals/fauna.js';
const env=(hour=12,rain=0,wind=1)=>({clock:{hour},daylight:hour===0?0:1,weather:{rain,wind}});
test('fauna follows dawn, daylight, rain and wind without modifying the environment',()=>{
  const e=env(),saved=JSON.stringify(e),day=faunaConditions(e);
  assert.ok(faunaConditions(env(6.5)).birds>day.birds);
  assert.equal(faunaConditions(env(0)).birds,0);assert.equal(faunaConditions(env(0)).dragonflies,0);
  assert.ok(faunaConditions(env(0)).crickets>day.crickets);
  assert.equal(faunaConditions(env(12,1)).birds,0);assert.equal(faunaConditions(env(12,1)).dragonflies,0);
  assert.ok(faunaConditions(env(12,0,4)).dragonflies<day.dragonflies);
  assert.equal(JSON.stringify(e),saved);
});
test('individual flight windows are staggered, occasional and smoothly faded',()=>{
  const slots=makeFaunaSlots(5),starts=slots.map(s=>s.cycle-s.offset);
  assert.equal(new Set(starts).size,5);assert.deepEqual(slots,makeFaunaSlots(5));
  for(const s of slots){
    assert.equal(birdPose(s,s.duration+.01-s.offset,1).opacity,0);
    assert.equal(birdPose(s,-s.offset,1).opacity,0);
    assert.ok(birdPose(s,s.duration*.5-s.offset,1).opacity>.9);
    const a=birdPose(s,10,1),b=birdPose(s,10.001,1);assert.ok(Math.abs(a.x-b.x)<.02);assert.ok(Math.abs(a.opacity-b.opacity)<.001);
  }
  let different=false;
  for(let t=0;t<100;t++)if(new Set(slots.map(s=>birdPose(s,t,1).opacity>0)).size>1)different=true;
  assert.ok(different,'some birds rest while others fly');
});
test('insects remain by side banks and vary their hover and dart phases',()=>{
  const slots=makeFaunaSlots(10,451),out={};
  for(let t=0;t<150;t+=.1)for(const s of slots){
    const p=insectPose(s,t,1,out);assert.equal(p,out);assert.ok(Math.abs(p.x)>13&&Math.abs(p.x)<26);
    assert.ok(p.y>2&&p.y<3.3);assert.ok(p.z<-9&&p.z>-34);assert.ok(p.opacity>=.25&&p.opacity<=1);
  }
  assert.notEqual(insectPose(slots[0],4,1).yaw,insectPose(slots[1],4,1).yaw);
});
test('unvalidated visual fauna adds no scene objects or rendering resources in any conditions',()=>{
  const scene=new Scene(),fauna=new AmbientFauna(scene);
  for(const environment of [env(),env(6.5),env(0),env(12,1)]){
    const saved=JSON.stringify(environment);
    for(let i=0;i<1000;i++)fauna.update(environment,i/60,i%2===0);
    assert.equal(scene.children.length,0,'no primitive birds or insects reappear');
    assert.equal(JSON.stringify(environment),saved,'environment remains untouched');
  }
  assert.deepEqual(Object.keys(fauna),[],'no geometry, material or animation pools allocated');
});
