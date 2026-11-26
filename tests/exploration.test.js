import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Exploration,WALK,bindModeToggle} from '../src/input/exploration.js';
import {walkHeight} from '../src/input/shore-route.js';

test('fishing stays stationary; active tackle cannot switch to exploration',()=>{
  const m=new Exploration();m.keys.add('KeyW');m.update(1,0);assert.equal(m.z,7);
  for(const state of ['charging','casting','waiting','bite','fighting','caught'])assert.ok(m.toggle(state,0,0));
  assert.equal(m.mode,'fishing');assert.equal(m.toggle('ready',0,0),null);assert.equal(m.keys.size,0);
});
test('walkable footprint prevents crossing ropes, posts, water and route boundaries',()=>{
  for(const key of ['KeyW','KeyS','KeyA','KeyD']){
    const m=new Exploration();m.toggle('ready',0,0);m.keys.add(key);
    for(let i=0;i<2000;i++)m.update(.05,0);
    assert.notEqual(walkHeight(m.x,m.z),null);
    const x=m.x,z=m.z;m.update(.25,0);assert.equal(m.x,x);assert.equal(m.z,z);
  }
});
test('diagonal and analog input have bounded speed and camera-relative heading',()=>{
  const forward=new Exploration(),diagonal=new Exploration(),turned=new Exploration();
  for(const m of [forward,diagonal,turned]){m.toggle('ready',0,0);m.keys.add('KeyW');}
  diagonal.keys.add('KeyD');forward.update(.25,0);diagonal.update(.25,0);turned.update(.25,Math.PI/2);
  const length=m=>Math.hypot(m.x,m.z-7);
  assert.ok(Math.abs(length(forward)-length(diagonal))<1e-9);assert.ok(turned.x<0);assert.ok(Math.abs(turned.z-7)<1e-9);
  const analog=new Exploration();analog.toggle('ready',0,0);analog.stick.y=-.5;analog.update(.25,0);
  assert.ok(Math.abs(length(analog)*2-length(forward))<1e-9);
});
test('acceleration, braking and different update rates stay smooth and equivalent',()=>{
  const positions=[];
  for(const fps of [20,60,120]){
    const m=new Exploration();m.toggle('ready',0,0);m.keys.add('KeyW');
    m.update(1/fps,0);assert.ok(Math.abs(m.vz)<WALK.speed);
    for(let i=1;i<fps;i++)m.update(1/fps,0);
    positions.push(m.z);m.keys.clear();const before=Math.abs(m.vz);m.update(.1,0);assert.ok(Math.abs(m.vz)<before);
  }
  assert.ok(Math.max(...positions)-Math.min(...positions)<.02);
});
test('return to fishing requires original post and valid existing camera orientation',()=>{
  const m=new Exploration();m.toggle('ready',0,0);m.x=1;assert.ok(m.toggle('ready',0,0));
  m.x=0;assert.ok(m.toggle('ready',2,0));assert.ok(m.toggle('ready',0,-1));
  m.z=7.1;assert.equal(m.toggle('ready',.4,.1),null);assert.equal(m.mode,'fishing');assert.equal(m.z,7);
});
test('cancel and focus cleanup remove keyboard, joystick and residual velocity',()=>{
  const m=new Exploration();m.toggle('ready',0,0);m.keys.add('KeyW');m.stick.x=.8;m.update(.1,0);m.clear();
  const x=m.x,z=m.z;m.update(.1,0);assert.equal(m.x,x);assert.equal(m.z,z);assert.equal(m.stick.x,0);
});

test('mode tap works without a compatibility click and never toggles twice; mouse and keyboard remain usable',()=>{
  const button=new EventTarget();let calls=0,time=0;bindModeToggle(button,()=>calls++,{now:()=>time});
  const send=(type,data={})=>button.dispatchEvent(Object.assign(new Event(type,{cancelable:true}),{pointerType:'touch',pointerId:1,clientX:20,clientY:20,...data}));
  send('pointerdown');send('pointerup');assert.equal(calls,1);
  send('click',{detail:1});assert.equal(calls,1,'compatibility click is suppressed');
  send('click',{detail:0});assert.equal(calls,2,'keyboard activation still works');
  time=1000;send('click',{detail:1,pointerType:'mouse'});assert.equal(calls,3);
  send('pointerdown');send('pointercancel');send('pointerup');assert.equal(calls,3);
  send('pointerdown');send('pointerup',{clientX:70});assert.equal(calls,3,'a drag is not a mode tap');
});
