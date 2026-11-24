import {test} from 'node:test';
import assert from 'node:assert/strict';
import {FishSchool,lurePerception,lureInterest} from '../src/simulation/fish-ai.js';
import {LURES} from '../src/simulation/config.js';
import {Environment,seededRandom} from '../src/simulation/environment.js';

const engaged=f=>['investigating','attacking'].includes(f.state);
const bait={x:0,y:-1,z:-15};
function crowd(seed=42,count=25){
  const school=new FishSchool({random:seededRandom(seed),count});
  for(const f of school.fish){f.position={x:Math.cos(f.id*2.4)*3,y:-1,z:-15+Math.sin(f.id*2.4)*3};f.home={...f.position};}
  return school;
}
const update=(school,dt=1/60,extra={})=>school.update(dt,{active:true,lure:bait,lureType:LURES[0],...extra});

test('perception filters distance and depth, with shorter detection in darkness and heavy rain',()=>{
  const s=crowd(),f=s.fish[0],e=new Environment({startHour:12});
  f.position={x:4,y:-1,z:-15};
  const clear=lurePerception(f,bait,LURES[0],{environment:e});assert.equal(clear.detected,true);
  e.clock.totalHours=0;e.weather.rain=1;
  assert.ok(lurePerception(f,bait,LURES[0],{environment:e}).range<clear.range);
  f.position.x=12;assert.equal(lurePerception(f,bait,LURES[0]).detected,false);
  f.position={x:0,y:-5,z:-15};assert.equal(lurePerception(f,bait,LURES[0]).detected,false);
  f.position={x:0,y:-1,z:-15};assert.equal(lurePerception(f,bait,LURES[0]).detected,true);
  // No teleporting into pursuit, even with every decision due and ideal RNG.
  s.fish=[f];f.position.y=-5;f.decisionIn=0;s.random=()=>0;update(s);
  assert.equal(engaged(f),false);
});

test('individual interest respects species, hunger, alert, escape memory, lure and competition',()=>{
  const s=crowd(),f=s.fish[1];
  const worm=lureInterest(f,LURES[1]);assert.ok(worm>lureInterest(f,LURES[0]));
  const before=f.hunger;f.hunger=.35;assert.ok(lureInterest(f,LURES[1])<worm);f.hunger=before;
  f.alert=.8;assert.ok(lureInterest(f,LURES[1])<worm);f.alert=0;
  f.memory=20;f.avoidedLure='worm';assert.ok(lureInterest(f,LURES[1])<worm);f.memory=0;
  assert.ok(lureInterest(f,LURES[1],{competitors:3})<worm);
  assert.ok(lureInterest(f,LURES[1],{moving:true})<worm,'bottom feeder favours a slower bait');
  f.response.activity=.4;assert.ok(lureInterest(f,LURES[1])<worm);
});

test('fish react individually rather than charging together, across seeds and frame rates',()=>{
  for(const fps of [20,60])for(const seed of [3,11,42,73,109]){
    const s=crowd(seed),first=new Map();let maximum=0,simultaneous=0;
    for(let i=0;i<fps*8;i++){
      update(s,1/fps);let started=0;
      for(const f of s.fish)if(engaged(f)&&!first.has(f.id)){first.set(f.id,s.time);started++;}
      simultaneous=Math.max(simultaneous,started);
      maximum=Math.max(maximum,s.fish.filter(engaged).length);
    }
    const times=[...first.values()];
    assert.ok(times.length>=2,'occasional competition remains possible');
    assert.ok(Math.max(...times)-Math.min(...times)>.4,'reactions are spread over time');
    assert.ok(simultaneous<5,`seed ${seed}, ${fps} fps: staggered decisions`);
    assert.ok(maximum<s.fish.length/2,'a crowded fixture must not mobilise the whole school');
    assert.ok(s.fish.some(f=>!first.has(f.id)),'some fish ignore the lure entirely');
  }
});

test('individual clocks remain staggered even when the supplied RNG returns a constant',()=>{
  const s=new FishSchool({random:()=>.5,count:12});
  assert.equal(new Set(s.fish.map(f=>f.decisionIn)).size,12);
  assert.equal(new Set(s.fish.map(f=>f.curiosity)).size,12);
  for(const f of s.fish)s.transition(f,'investigating');
  assert.equal(new Set(s.fish.map(f=>f.nextStrike)).size,12);
});

test('crowding reduces interest without a fixed cap on competing fish',()=>{
  const s=crowd(11,6);s.random=()=>0;
  for(const f of s.fish){f.decisionIn=0;f.hunger=1;}
  for(const f of s.fish.slice(0,4))s.transition(f,'investigating');
  update(s);
  assert.ok(s.fish.filter(engaged).length>4,'a sufficiently interested fish can join existing competitors');
});

test('a failed inspection or lost lure causes abandonment and a genuine period of disinterest',()=>{
  const s=crowd(7,1),f=s.fish[0];s.random=()=>0;
  s.transition(f,'investigating');f.stateTime=f.pursuitLimit+1;update(s);
  assert.equal(f.state,'foraging');assert.ok(f.ignoreUntil>s.time);
  f.decisionIn=0;update(s,.2);assert.equal(engaged(f),false);
  f.ignoreUntil=0;f.decisionIn=0;update(s);assert.equal(f.state,'investigating');
  update(s,1/60,{lure:{x:40,y:-1,z:-15}});assert.equal(engaged(f),false);
  assert.ok(f.ignoreUntil>s.time);
});

test('investigating fish can follow actual moving bait, flee threats, and remember an escape',()=>{
  const s=crowd(7,1),f=s.fish[0];s.transition(f,'investigating');f.stateTime=2;
  update(s,1/60,{moving:true});assert.equal(f.intent,'follow');
  update(s,1/60,{jerk:true});assert.equal(f.state,'fleeing');assert.equal(f.intent,'flee');
  s.release(f.id);assert.equal(f.state,'recovering');assert.ok(f.memory>0);assert.ok(f.ignoreUntil>s.time+7);
});

test('a real nearby fish can still bite under favourable and adverse conditions',()=>{
  for(const fps of [20,60])for(const adverse of [false,true]){
    let successes=0;
    for(let seed=1;seed<=8;seed++){
      const s=new FishSchool({random:seededRandom(seed),count:1}),f=s.fish[0],lure={...f.position};
      const e=new Environment({startHour:adverse ? 0 : 6});
      if(adverse){e.weather.rain=1;e.weather.cloud=1;e.water.surface=24;}
      let attack=null;
      for(let i=0;i<fps*60&&!attack;i++)attack=s.update(1/fps,{active:true,lure,lureType:LURES[0],environment:e});
      if(attack){successes++;assert.equal(attack.id,f.id);assert.ok(Math.hypot(f.position.x-lure.x,f.position.y-lure.y,f.position.z-lure.z)<.7);}
    }
    assert.ok(successes>=5,`${fps} fps, adverse ${adverse}: viable but spatially gated`);
  }
});
