import {test} from 'node:test';
import assert from 'node:assert/strict';
import {FirstMorningTimeline,INTRO_DURATION,INTRO_HANDOFF} from '../src/animation/first-morning.js';
import {villageWalkHeight} from '../src/village-layout.js';
const target={x:0,y:villageWalkHeight(0,11)+1.7,z:11,yaw:0,pitch:-.055};
const make=()=>new FirstMorningTimeline(target);

test('introduction is opt-in, takes 12 seconds and hands off to the exact pose once',()=>{
  const t=make();assert.equal(t.active,false);assert.deepEqual(t.update(1),target);
  assert.equal(t.start(),true);assert.equal(t.start(),false);
  t.update(INTRO_DURATION-.01);assert.equal(t.active,true);
  t.update(.01);assert.equal(t.state,'complete');assert.deepEqual(t.pose,target);
  assert.equal(t.skip(),false);assert.equal(t.start(),false);
});
test('different frame rates give the same continuous camera path',()=>{
  for(const hz of [20,30,60,120]){
    const t=make();t.start();for(let i=0;i<hz*6;i++)t.update(1/hz);
    assert.ok(Math.abs(t.pose.z-17.5)<1e-8);assert.ok(Math.abs(t.pose.y-(7.8+target.y)/2)<1e-8);
  }
});
test('camera stays above clear central ground and approaches with low speed at both ends',()=>{
  const t=make();t.start();let previous={...t.pose};
  for(let i=0;i<720;i++){
    t.update(1/60);const floor=villageWalkHeight(t.pose.x,t.pose.z);
    assert.notEqual(floor,null,'path never crosses house, well or bench footprint');
    assert.ok(t.pose.y>=floor+1.69);assert.ok(Math.hypot(t.pose.x-previous.x,t.pose.y-previous.y,t.pose.z-previous.z)<.06);
    previous={...t.pose};
  }
  const start=make();start.start();start.update(.01);assert.ok(Math.abs(start.pose.z-24)<1e-6);
});
test('skip eases from the current pose, cannot restart its handoff, and ends exactly',()=>{
  for(const at of [0,3,8,11.9]){
    const t=make();t.start();t.update(at);const before={...t.pose};
    assert.equal(t.skip(),true);assert.deepEqual(t.pose,before);assert.equal(t.skip(),false);
    t.update(INTRO_HANDOFF/2);assert.equal(t.active,true);t.update(INTRO_HANDOFF/2);
    assert.equal(t.state,'complete');assert.deepEqual(t.pose,target);
  }
});
test('hidden/focus-lost time and invalid deltas cannot advance or corrupt the camera',()=>{
  const t=make();t.start();t.update(2);const pose={...t.pose};
  for(const dt of [30,-1,NaN,Infinity])t.update(dt,{suspended:true});
  for(const dt of [-1,NaN,Infinity])t.update(dt);
  assert.deepEqual(t.pose,pose);assert.equal(t.elapsed,2);t.update(1);assert.equal(t.elapsed,3);
});
test('reduced motion at startup or during presentation immediately selects a stationary final view',()=>{
  const t=make();t.start({reducedMotion:true});assert.equal(t.state,'complete');assert.deepEqual(t.pose,target);
  const mid=make();mid.start();mid.update(5);mid.skip({reducedMotion:true});assert.equal(mid.active,false);assert.deepEqual(mid.pose,target);
});
