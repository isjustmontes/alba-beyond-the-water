import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Exploration,WALK} from '../src/input/exploration.js';
import {walkHeight} from '../src/input/shore-route.js';
import {FishSchool} from '../src/simulation/fish-ai.js';
import {FishingGame} from '../src/fishing.js';
import {seededRandom} from '../src/simulation/environment.js';

test('Shift and mobile sprint reach the configured sprint speed with smooth acceleration at different frame rates',()=>{
  for(const fps of [20,60,120])for(const input of ['ShiftLeft','ShiftRight','touch']){
    const m=new Exploration();m.mode='exploring';m.x=4;m.z=32;m.keys.add('KeyS');
    if(input==='touch')m.sprint=true;else m.keys.add(input);
    m.update(1/fps,0);assert.ok(m.vz>0&&m.vz<WALK.speed*WALK.runMultiplier);
    for(let i=1;i<fps;i++)m.update(1/fps,0);
    assert.ok(Math.abs(m.vz-WALK.speed*WALK.runMultiplier)<.00001);
    m.keys.delete(input);m.sprint=false;const before=m.vz;m.update(1/fps,0);
    assert.ok(m.vz<before&&m.vz>WALK.speed,'deceleration remains gradual');
  }
});
test('running respects water limits and is cleared on mode change or input cancellation',()=>{
  const m=new Exploration();m.toggle('ready',0,0);m.sprint=true;m.keys.add('KeyA');
  for(let i=0;i<600;i++){m.update(.05,0);assert.notEqual(walkHeight(m.x,m.z),null);}
  m.clear();assert.equal(m.running,false);assert.equal(m.sprint,false);assert.equal(m.vx,0);
  m.x=0;m.z=7;m.sprint=true;m.toggle('ready',0,0);assert.equal(m.running,false);assert.equal(m.sprint,false);
  m.keys.add('ShiftLeft');m.keys.add('KeyW');m.update(.25,0);assert.equal(m.z,7,'fishing cannot move');
});
test('natural bites remain possible at both remote shores and the northern lake',()=>{
  for(const [x,z]of [[-32,24],[32,24],[0,-85]]){
    let successes=0;
    for(let seed=1;seed<=8;seed++){
      const random=seededRandom(seed),school=new FishSchool({count:1,random}),f=school.fish[0];
      // Controlled fixture supplies one real nearby fish, without forcing its state or decision.
      f.position={x,y:-.75,z};f.home={...f.position};
      const g=new FishingGame({school,random});g.setOrigin(x,z+11.48);g.press();g.release();
      for(let i=0;i<3600&&g.state!=='bite';i++)g.update(1/60);
      if(g.state==='bite'){successes++;assert.equal(g.hookedId,f.id);assert.ok(Math.hypot(f.position.x-g.lure.x,f.position.y-g.lure.y,f.position.z-g.lure.z)<.62);}
    }
    assert.ok(successes>=3,`${x},${z}: ${successes}/8 viable natural bites`);
  }
});
test('remote water with no fish cannot produce a timer-driven bite',()=>{
  const g=new FishingGame({school:new FishSchool({count:0})});g.setOrigin(32,35.48);g.press();g.release();
  for(let i=0;i<3600;i++)g.update(1/60);
  assert.equal(g.state,'waiting');assert.equal(g.hookedId,null);assert.equal(g.catches.length,0);
});
