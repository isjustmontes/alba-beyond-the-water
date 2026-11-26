import {test} from 'node:test';
import assert from 'node:assert/strict';
import {FishSchool} from '../src/simulation/fish-ai.js';
import {habitatDepth,fishWater} from '../src/simulation/lake-habitat.js';
import {seededRandom,Environment} from '../src/simulation/environment.js';
import {FishingGame,LURES} from '../src/fishing.js';

test('27 fish inhabit both new shores and interior water without dock-only concentration',()=>{
  for(const seed of [1,7,42,109]){
    const s=new FishSchool({random:seededRandom(seed)});assert.equal(s.fish.length,27);
    assert.ok(s.fish.filter(f=>f.position.z>8&&f.position.x<0).length>=4);
    assert.ok(s.fish.filter(f=>f.position.z>8&&f.position.x>0).length>=4);
    assert.ok(s.fish.filter(f=>f.position.z< -50).length>=4);
    for(const f of s.fish){assert.ok(fishWater(f.position.x,f.position.z));assert.ok(-f.position.y<habitatDepth(f.position.x,f.position.z));}
  }
  const s=new FishSchool({random:()=>.5});assert.equal(new Set(s.fish.map(f=>`${f.home.x},${f.home.z}`)).size,27);
});
test('shore, rocks and shallow rim are not fish habitat; ordinary open lake is',()=>{
  assert.equal(fishWater(0,20),false);assert.equal(fishWater(0,100),false);
  assert.equal(fishWater(-30,24),true);assert.equal(fishWater(30,24),true);
  assert.equal(fishWater(30,24,[{x:30,z:24,rx:2,rz:3}]),false);
});
test('individual fish patrol the new shores for five minutes without crossing ground or rocks',()=>{
  const obstacles=[{x:-30,z:25,rx:3,rz:4},{x:30,z:25,rx:3,rz:4}];
  const s=new FishSchool({random:seededRandom(51),obstacles}),env=new Environment();
  const initial=s.fish.map(f=>({...f.position}));
  for(let i=0;i<3000;i++){
    s.update(.1,{environment:env});
    for(const f of s.fish){assert.ok(fishWater(f.position.x,f.position.z,obstacles));assert.ok(f.position.y>=-habitatDepth(f.position.x,f.position.z,obstacles));assert.ok(f.position.y<=-.22);}
  }
  assert.ok(s.fish.filter(f=>f.position.z>8).length>=8);
  assert.ok(s.fish.filter((f,i)=>Math.hypot(f.position.x-initial[i].x,f.position.z-initial[i].z)>.5).length>=20);
});
test('a shore fish can investigate a local lure while distant fish do not teleport to it',()=>{
  const s=new FishSchool({random:()=>.5}),f=s.fish.find(f=>f.position.z>8),lure={...f.position};
  const far=s.fish.find(f=>f.position.z< -50),before={...far.position};
  for(let i=0;i<600;i++)s.update(1/60,{active:true,lure,lureType:LURES[0]});
  assert.ok(Math.hypot(f.position.x-lure.x,f.position.z-lure.z)<8);
  assert.ok(Math.hypot(far.position.x-before.x,far.position.z-before.z)<8);
  assert.ok(!['investigating','attacking'].includes(far.state));
});
test('retrieve stops at the wet edge without changing the original dock arrival',()=>{
  for(const arrival of [undefined,6]){
    const g=new FishingGame({random:()=>.5});g.landingDistance=arrival;
    g.state='waiting';g.distance=7;g.castDistance=7;g.press();
    for(let i=0;i<500&&g.state==='waiting';i++)g.update(.05);
    assert.equal(g.state,'ready');
    if(arrival)assert.ok(g.lure.z<=4-(arrival-.1),'never retrieves across the dry bank');
  }
});
test('pursuit cannot move a fish through the dry bank even when the lure is on land',()=>{
  const s=new FishSchool({count:1,random:()=>.5}),f=s.fish[0];
  f.position={x:-22,y:-.75,z:24};f.home={...f.position};s.transition(f,'investigating');
  for(let i=0;i<600;i++){
    s.update(1/60,{active:true,lure:{x:-14,y:-.75,z:24},lureType:LURES[0]});
    assert.ok(fishWater(f.position.x,f.position.z));
  }
});
test('shore combat and capture respect the wet arrival without changing catch data',()=>{
  const g=new FishingGame({random:()=>.5}),f=g.school.fish[0];g.school.fish=[f];
  f.position={x:-24,y:-.75,z:24};g.setOrigin(-14,24);g.setAim(-1,0);g.landingDistance=6;
  g.state='bite';g.hookedId=f.id;g.target={speciesIndex:f.speciesIndex,weight:1,length:30};g.distance=g.castDistance=10;g.press();
  for(let i=0;i<2400&&g.state==='fighting';i++){
    if(g.tension<.55)g.press();else g.release();g.update(.05);
    assert.ok(fishWater(f.position.x,f.position.z));assert.ok(-f.position.y<habitatDepth(f.position.x,f.position.z));
  }
  assert.equal(g.state,'caught');assert.equal(g.catches.length,1);assert.equal(g.catches[0].length,30);assert.equal(g.catches[0].lureId,'spinner');
});
