import {test} from 'node:test';
import assert from 'node:assert/strict';
import {FishSchool,FISH_STATES} from '../src/simulation/fish-ai.js';
import {LURES} from '../src/simulation/config.js';
import {FishingGame} from '../src/fishing.js';
const step=(game,seconds)=>{for(let i=0;i<seconds*60;i++)game.update(1/60);};
test('empty water never produces a timer-generated bite',()=>{
  const game=new FishingGame({school:new FishSchool({count:0})});game.press();game.release();step(game,120);assert.equal(game.state,'waiting');
});
test('fish investigate actual lure coordinates, attack nearby and recover after escape',()=>{
  const school=new FishSchool({random:()=>.5,count:1}),f=school.fish[0];
  const lure={...f.position};let bite=null;
  for(let i=0;i<600&&!bite;i++)bite=school.update(1/60,{active:true,lure,lureType:LURES[0]});
  assert.equal(bite?.id,0);assert.equal(f.state,'attacking');assert.ok(Math.hypot(f.position.x-lure.x,f.position.z-lure.z)<1);
  school.hook(0);assert.equal(f.state,'resisting');school.release(0);assert.equal(f.state,'recovering');
});
test('nearby cautious fish flee abrupt lure movement, distant fish ignore it',()=>{
  const school=new FishSchool({random:()=>.5,count:2}),f=school.fish[1];
  school.update(.1,{active:true,lure:{...f.position},lureType:LURES[2],jerk:true});assert.equal(f.state,'fleeing');
  const far=new FishSchool({count:1});far.update(.1,{active:true,lure:{x:200,y:-1,z:200},lureType:LURES[0],jerk:true});assert.equal(far.fish[0].state,'swimming');
  assert.equal(FISH_STATES.length,7);
});
