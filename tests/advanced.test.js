import {test} from 'node:test';
import assert from 'node:assert/strict';
import {FishingGame,LURES} from '../src/fishing.js';
import {FishSchool} from '../src/simulation/fish-ai.js';
import {FishingActions} from '../src/input/actions.js';
const tick=(game,seconds)=>{for(let i=0;i<seconds*60;i++)game.update(1/60);};
function bitten() {
  const game=new FishingGame({random:()=>.5});game.press();tick(game,1);game.release();
  for(let i=0;i<60*60&&game.state!=='bite';i++)game.update(1/60);
  assert.equal(game.state,'bite');return game;
}
test('a biting fish stays at the actual bait throughout the hook window',()=>{
  const game=bitten(),id=game.hookedId;tick(game,1.5);
  assert.equal(game.state,'bite');const fish=game.school.fish.find(f=>f.id===id);
  assert.equal(fish.state,'attacking');assert.ok(Math.hypot(fish.position.x-game.lure.x,fish.position.z-game.lure.z)<1);
});
test('lures have different real depth and retrieve motion; equipment cannot change in water',()=>{
  const depths=[];
  for(const lure of LURES) {
    const game=new FishingGame({school:new FishSchool({count:0})});assert.ok(game.selectLure(lure.id));game.press();tick(game,1.7);game.release();tick(game,2);
    depths.push(game.lure.y);const z=game.lure.z;
    assert.equal(game.selectLure('worm'),false);game.press();tick(game,1);game.release();assert.ok(game.lure.z>z,'reeling moves the real lure toward the dock');
  }
  assert.ok(depths[1]<depths[0]);assert.ok(depths[2]<depths[0]);
});
test('bait affinity affects whether a real carp attacks',()=>{
  const school=new FishSchool({random:()=>.5,count:2}),carp=school.fish[1];school.fish=[carp];const lure={...carp.position};let attack=null;
  for(let i=0;i<60*15;i++)attack=school.update(1/60,{active:true,lure,lureType:LURES[0]})||attack;
  assert.equal(attack,null);
  for(let i=0;i<60*10&&!attack;i++)attack=school.update(1/60,{active:true,lure,lureType:LURES[1]});
  assert.equal(attack?.speciesIndex,1);
});
test('critical tension has a short recovery window and fighting causes fatigue and direction changes',()=>{
  const game=bitten();game.press();const first={...game.lure};
  for(let i=0;i<60*15&&game.tension<.98;i++)game.update(1/60);
  assert.equal(game.state,'fighting');assert.ok(game.stamina<1);assert.ok(Math.hypot(game.lure.x-first.x,game.lure.z-first.z)>1);
  game.release();tick(game,1);assert.equal(game.state,'fighting');assert.ok(game.tension<.98);
});
test('two input sources hook only once and capture records store the equipped bait',()=>{
  const game=bitten(),actions=new FishingActions(game);actions.hold('touch');actions.hold('mouse');assert.equal(game.actionCounts.hooks,1);
  actions.clear();let reel=false;
  for(let i=0;i<60*120&&game.state==='fighting';i++) {
    if(game.tension>.65)reel=false;if(game.tension<.28)reel=true;
    if(reel)game.press();else game.release();game.update(1/60);
  }
  assert.equal(game.state,'caught');assert.equal(game.catches[0].lureId,'spinner');assert.equal(game.catches[0].lureName,'Cucharilla');
});
