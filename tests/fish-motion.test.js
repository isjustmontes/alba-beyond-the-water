import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createFishMotion,updateFishMotion} from '../src/animation/fish-motion.js';
import {FishingEffects} from '../src/visuals/effects.js';
import {waterElevation} from '../src/visuals/water.js';
const agent=()=>({position:{x:0,y:-1,z:-15},heading:0,phase:0});
test('visual fish motion turns and changes depth smoothly without modifying the AI agent',()=>{
  const a=agent(),m=createFishMotion(a);a.position={x:1,y:-2,z:-16};a.heading=Math.PI;const before=JSON.stringify(a);updateFishMotion(m,a,1/60);
  assert.equal(JSON.stringify(a),before);assert.ok(m.x>0&&m.x<1);assert.ok(m.y>-2&&m.y<-1);assert.ok(m.heading>0&&m.heading<Math.PI);assert.ok(Math.abs(m.pitch)<.1);
  const frozen=JSON.stringify(m);updateFishMotion(m,a,0);assert.equal(JSON.stringify(m),frozen);
});
test('swim phase follows actual speed and remains stable at different render rates',()=>{
  const phases=[];for(const fps of [20,60,120]){const a=agent(),m=createFishMotion(a),idle=createFishMotion(a),rest=agent();for(let i=0;i<fps;i++){a.position.x+=1/fps;updateFishMotion(m,a,1/fps);updateFishMotion(idle,rest,1/fps);}assert.ok(m.speed>.95&&m.speed<1.05);assert.ok(m.phase>idle.phase);phases.push(m.phase);}
  assert.ok(Math.max(...phases)-Math.min(...phases)<.08);
});
test('water interaction pools remain bounded through hundreds of impacts and expire particles',()=>{
  const scene=new THREE.Scene(),ripples=Array.from({length:4},()=>new THREE.Vector4()),effects=new FishingEffects(scene,()=>.5,ripples),geometry=effects.mesh.geometry,particles=[...effects.particles];
  for(let i=0;i<200;i++){effects.emit({x:i,y:0,z:-10},.5);effects.update(.01);}
  assert.equal(effects.particles.length,48);assert.equal(effects.ripples.length,4);assert.equal(effects.mesh.geometry,geometry);assert.deepEqual(effects.particles.map(p=>particles.includes(p)),Array(48).fill(true));
  effects.update(2);effects.update(.01);assert.equal(effects.active,false);assert.equal(effects.mesh.visible,false);assert.ok(ripples.every(v=>Number.isFinite(v.z)&&v.w>0));
});
test('bobber surface follows bounded, continuous Living Waters waves for both calm and wind',()=>{
  for(const wind of [0,6]){const w={wind,windX:wind,windZ:wind*.2};let previous=waterElevation(0,-20,0,w);for(let t=.01;t<10;t+=.01){const y=waterElevation(0,-20,t,w);assert.ok(Math.abs(y)<.17);assert.ok(Math.abs(y-previous)<.01);previous=y;}}
});
