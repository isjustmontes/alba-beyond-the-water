import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FishingGame,SPECIES } from '../src/fishing.js';

function advance(game,seconds,nearby=[]) { for(let i=0;i<Math.ceil(seconds*60);i++) game.update(1/60,nearby); }
function castGame(random = ()=>.5) { const events=[]; const game=new FishingGame({random,onEvent:e=>events.push(e)}); game.press(); advance(game,1); game.release(); advance(game,1.2); return {game,events}; }
function awaitBite(game) { for(let i=0;i<60*90&&game.state==='waiting';i++)game.update(1/60);assert.equal(game.state,'bite'); }
function hookGame() { const result=castGame(); awaitBite(result.game); result.game.press(); result.game.release(); return result; }
test('hold duration changes cast range, release lands in water',()=>{
  const short=castGame(); const long=new FishingGame(); long.press(); advance(long,3); long.release();
  assert.equal(short.game.state,'waiting'); assert.ok(long.distance>short.game.distance); assert.ok(long.distance<=40); assert.ok(short.events.some(e=>e.type==='splash'));
});
test('a bite comes from a real nearby fish of the recorded species',()=>{
  const {game}=castGame();awaitBite(game);
  const fish=game.school.fish.find(f=>f.id===game.hookedId);
  assert.equal(game.target.speciesIndex,fish.speciesIndex);assert.equal(game.target.weight,fish.weight);
  assert.ok(Math.hypot(fish.position.x-game.lure.x,fish.position.z-game.lure.z)<1);
});
test('missed bite returns to a castable state',()=>{const {game}=castGame(); advance(game,14); assert.equal(game.state,'ready'); game.press(); assert.equal(game.state,'charging');});
test('continuous reeling breaks the line',()=>{ const {game,events}=hookGame(); game.press(); advance(game,7); assert.equal(game.state,'ready'); assert.equal(game.catches.length,0); assert.ok(events.some(e=>e.message?.includes('rompió'))); });
test('leaving too much slack loses the fish',()=>{ const {game}=hookGame(); advance(game,7); assert.equal(game.state,'ready'); assert.equal(game.catches.length,0); });
test('balanced reeling captures a fish and resets for another cast',()=>{
  const {game,events}=hookGame(); let reel=false;
  for(let i=0;i<60*90 && game.state==='fighting';i++) {
    if(game.tension>.65) reel=false;
    if(game.tension<.28) reel=true;
    if(reel) game.press(); else game.release();
    game.update(1/60);
  }
  assert.equal(game.state,'caught'); assert.equal(game.catches.length,1); const fish=game.catches[0]; assert.ok(fish.weight>0); assert.ok(fish.length>22); assert.ok(events.some(e=>e.type==='catch')); advance(game,5); assert.equal(game.state,'ready');
});
test('reset is safe during charging, flight, and combat',()=>{const {game}=hookGame(); game.reset(); assert.equal(game.reeling,false); assert.equal(game.distance,0); game.press(); game.reset(); assert.equal(game.power,0); game.press(); game.release(); game.reset(); advance(game,2); assert.equal(game.state,'ready');});
test('all species can be landed at maximum weight and distance at 20 and 60 fps',()=>{
  for(const fps of [20,60]) for(const speciesIndex of [0,1,2]) {
    const game=new FishingGame({random:()=>.5});const lure=speciesIndex===1 ? 'worm' : speciesIndex===2 ? 'minnow' : 'spinner';game.selectLure(lure); game.press(); advance(game,2); game.release();
    const agent=game.school.fish[speciesIndex];game.school.fish=[agent];
    agent.weight=SPECIES[speciesIndex].max;
    agent.position={...game.lure};agent.home={...game.lure};
    advance(game,1.2);
    for(let i=0;i<fps*20 && game.state==='waiting';i++) game.update(1/fps,[{id:0,speciesIndex}]);
    assert.equal(game.state,'bite'); game.press(); let reel=true;
    for(let i=0;i<fps*150 && game.state==='fighting';i++) {
      if(game.tension>.65) reel=false;
      if(game.tension<.28) reel=true;
      if(reel) game.press(); else game.release(); game.update(1/fps);
    }
    assert.equal(game.state,'caught',`species ${speciesIndex}, ${fps} fps`);
    assert.equal(game.catches[0].lureId,lure);
  }
});
