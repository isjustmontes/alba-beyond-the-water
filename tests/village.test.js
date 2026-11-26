import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ZoneManager} from '../src/zones.js';
import {villageHeight,villageWalkHeight,VILLAGE_HOUSES} from '../src/village-layout.js';
import {walkHeight,SHORE_PATH} from '../src/input/shore-route.js';
import {Exploration} from '../src/input/exploration.js';

const heightAt=(id,x,z)=>id==='lago-sereno'?walkHeight(x,z):villageWalkHeight(x,z);
const pose=(x,z,yaw=0)=>({position:{x,y:heightAt('lago-sereno',x,z)+1.7,z},yaw,pitch:.1});
test('zone travel requires exploration, ready tackle, proximity and a safe destination',()=>{
  const zones=new ZoneManager(),p=pose(6,74);
  for(const guards of [{mode:'fishing',state:'ready'},{mode:'exploring',state:'waiting'},{mode:'exploring',state:'fighting'}])assert.equal(zones.travel('village',p,{...guards,heightAt}),null);
  assert.equal(zones.travel('village',pose(0,7),{mode:'exploring',state:'ready',heightAt}),null);
  for(const bad of [null,NaN,Infinity])assert.equal(zones.travel('village',p,{mode:'exploring',state:'ready',heightAt:()=>bad}),null);
  assert.equal(zones.zoneId,'lago-sereno');assert.equal(zones.positions.size,0);
});
test('five round trips preserve independent positions, yaw and pitch without mutating spawn data',()=>{
  const zones=new ZoneManager(),options={mode:'exploring',state:'ready',heightAt},lake=pose(6,74,2.6);
  for(let i=0;i<5;i++){
    const plan=zones.travel('village',lake,options);assert.equal(plan.to,'anglers-village');
    const village={position:{x:.3,y:2.94,z:29.2},yaw:-.8,pitch:.2};
    if(i)assert.deepEqual(plan.spawn,village);
    const back=zones.travel('lake',village,options);assert.deepEqual(back.spawn,lake);assert.equal(zones.zoneId,'lago-sereno');
    back.spawn.position.x=999;
  }
  assert.equal(zones.positions.size,2);assert.equal(zones.spawn.position.x,6);
});
function go(motion,x,z){
  motion.keys.add('KeyW');let steps=0;
  while(Math.hypot(motion.x-x,motion.z-z)>.09&&steps++<8000){const yaw=Math.atan2(-(x-motion.x),-(z-motion.z));motion.update(1/60,yaw);}
  motion.clear();assert.ok(steps<8000,`blocked at ${motion.x},${motion.z} towards ${x},${z}`);
}
test('walkable dock-to-village approach and village square/shop loop use existing motion',()=>{
  const m=new Exploration();m.mode='exploring';
  for(const [x,z]of SHORE_PATH.slice(1))go(m,x,z);
  assert.ok(Math.hypot(m.x-6,m.z-74)<3);
  m.heightAt=villageWalkHeight;m.x=0;m.z=29;
  for(const [x,z]of [[0,14],[0,5],[-6,5],[-8,4],[-6,6],[0,10],[8,2],[3,-10],[0,-14],[4,-14],[0,14],[0,29]])go(m,x,z);
  assert.ok(Number.isFinite(m.floor));
});
test('village building footprints and external limits block movement with body margin',()=>{
  for(const h of VILLAGE_HOUSES){assert.equal(villageWalkHeight(h.x,h.z),null);assert.equal(villageWalkHeight(h.x,h.z+h.d/2+.2),null);}
  assert.equal(villageWalkHeight(3.5,3),null);assert.equal(villageWalkHeight(24,0),null);assert.equal(villageWalkHeight(0,33),null);
  assert.equal(villageWalkHeight(NaN,0),null);
  const m=new Exploration();m.mode='exploring';m.heightAt=villageWalkHeight;m.x=-10;m.z=4;
  m.keys.add('KeyW');for(let i=0;i<600;i++)m.update(1/60,0);
  assert.ok(m.z>=1.35);assert.equal(m.floor,villageHeight(m.x,m.z));
});
