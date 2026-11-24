import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CAST_TIMING,castPose,castFlight,linePoint,DampedSpring,rodPose,jumpHeight,canJump} from '../src/animation/fishing-motion.js';
import {FishingGame} from '../src/fishing.js';
const tick=(game,time)=>{for(let t=0;t<time-1e-8;t+=1/120)game.update(Math.min(1/120,time-t));};
test('overhead cast loads above the head, accelerates forward and settles without pose jumps',()=>{
  const c=CAST_TIMING;assert.ok(castPose(c.loadEnd,1).pitch>1.2);assert.ok(castPose(c.release,1).pitch>.4);assert.ok(castPose(c.followThrough,1).pitch<0);
  for(const boundary of [c.loadEnd,c.release,c.followThrough])assert.ok(Math.abs(castPose(boundary-1e-5,1).pitch-castPose(boundary+1e-5,1).pitch)<.001);
  const epsilon=1e-5,left=(castPose(c.release,1).pitch-castPose(c.release-epsilon,1).pitch)/epsilon,right=(castPose(c.release+epsilon,1).pitch-castPose(c.release,1).pitch)/epsilon;
  assert.ok(Math.abs(left-right)<.01);assert.ok(Math.abs(castPose(2,1).pitch-.04)<.001);
});
test('line releases once during the forward stroke, before impact, with original cast range',()=>{
  const events=[],g=new FishingGame({onEvent:e=>events.push({type:e.type,time:g.castTime})});g.press();tick(g,1);g.release();const range=g.distance;
  tick(g,CAST_TIMING.release-.02);assert.equal(g.lineReleased,false);tick(g,.04);assert.equal(g.lineReleased,true);tick(g,1);
  assert.equal(g.state,'waiting');assert.equal(g.distance,range);assert.ok(range>=9&&range<=40);assert.equal(events.filter(e=>e.type==='line-release').length,1);assert.equal(events.filter(e=>e.type==='splash').length,1);
  assert.ok(events.find(e=>e.type==='line-release').time<events.find(e=>e.type==='splash').time);
});
test('cancel and reset do not leave a phantom cast or emit a line release',()=>{
  const events=[],g=new FishingGame({onEvent:e=>events.push(e.type)});g.press();tick(g,.2);g.cancelHeld();tick(g,2);assert.equal(events.includes('line-release'),false);
  g.press();tick(g,.1);g.release();g.reset();tick(g,2);assert.equal(events.includes('line-release'),false);assert.equal(rodPose(g).phase,'idle');
});
test('flight follows a forward arc from the elevated rod tip to the actual water endpoint',()=>{
  const start={x:.2,y:4.8,z:3.4},end={x:0,y:.12,z:-25};assert.deepEqual(castFlight(start,end,0,1),start);assert.deepEqual(castFlight(start,end,1,1),end);
  for(let u=0;u<=1;u+=.01){const p=castFlight(start,end,u,1);assert.ok(p.y>=.12);assert.ok(p.z<4);assert.ok(Number.isFinite(p.x));}
  assert.ok(castFlight(start,end,.3,1).y>start.y);
});
test('slack and wind shape the line while endpoints remain attached and tension straightens it',()=>{
  const a={x:1,y:3,z:2},b={x:0,y:.12,z:-20},loose=linePoint(a,b,.5,{windX:4}),tight=linePoint(a,b,.5,{tension:1,windX:4});assert.ok(loose.y<tight.y);assert.ok(loose.x>tight.x);
  assert.deepEqual(linePoint(a,b,0,{windX:6}),a);assert.deepEqual(linePoint(a,b,1,{windX:6}),b);
});
test('rod springs remain stable at 20/60/120 fps and recover gradually after tension falls',()=>{
  const result=[];for(const fps of [20,60,120]){const s=new DampedSpring();for(let i=0;i<fps;i++)s.update(1/fps,.5);assert.ok(s.value>.49&&s.value<.51);const previous=s.value;s.update(1/fps,0);assert.ok(s.value>0&&s.value<previous);for(let i=0;i<fps*2;i++)s.update(1/fps,0);assert.ok(Math.abs(s.value)<.001);result.push(s.value);}
  assert.ok(Math.max(...result)-Math.min(...result)<.001);
});
test('jumps are bounded and reserved for energetic trout/bass fights; never change fishing logic',()=>{
  const game={target:{speciesIndex:0},fightTime:8,stamina:.7,tension:.5,pullCount:3,hookedId:0};assert.equal(canJump(game),true);assert.equal(canJump({...game,target:{speciesIndex:1}}),false);assert.equal(canJump({...game,stamina:.1}),false);
  assert.equal(jumpHeight(0),0);assert.equal(jumpHeight(1),0);assert.equal(jumpHeight(.5),1);
});
