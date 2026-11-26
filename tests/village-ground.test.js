import {test} from 'node:test';
import assert from 'node:assert/strict';
import {villageHeight,villageWalkHeight,VILLAGE_HOUSES,VILLAGE_TREES} from '../src/village-layout.js';
import {villageGroundHeight,villagePathCover,villagePlantSite} from '../src/visuals/village-ground.js';

test('visual ground keeps every existing navigable point at its original height, including outer corners',()=>{
  for(let x=-23.5;x<=23.5;x+=.5)for(let z=-29;z<=32;z+=.5){
    const walk=villageWalkHeight(x,z);
    if(walk!==null)assert.equal(villageGroundHeight(x,z),walk,`${x},${z}`);
  }
  for(const h of VILLAGE_HOUSES)assert.equal(villageGroundHeight(h.x,h.z),villageHeight(h.x,h.z));
  for(const t of VILLAGE_TREES)assert.ok(Number.isFinite(villageGroundHeight(t.x,t.z)));
});

test('outer banks join continuously without changing navigation or introducing sharp steps',()=>{
  for(let x=-40;x<40;x+=.2)for(const z of [-30,-29.5,0,32.5,35]){
    const delta=Math.abs(villageGroundHeight(x+.02,z)-villageGroundHeight(x,z));
    assert.ok(delta<.03,`${x},${z}: ${delta}`);
  }
  assert.ok(villageGroundHeight(35,0)>villageHeight(35,0)+.3);
  assert.equal(villageWalkHeight(35,0),null);
});

test('organic ground cover leaves approach, plaza, shop and signs clear without hard-edged path colouring',()=>{
  for(const [x,z]of [[0,29],[0,14],[0,5],[-8.35,2.4],[10,-.8],[-5,-17.5]]){
    assert.ok(villagePathCover(x,z)>.8,`${x},${z}`);
    assert.equal(villagePlantSite(x,z),false);assert.equal(villagePlantSite(x,z,true),false);
  }
  assert.equal(villagePlantSite(1.8,28),false);
  let intermediate=0,grass=0,ferns=0;
  for(let x=-23;x<=23;x+=.5)for(let z=-27;z<=30;z+=.5){
    const c=villagePathCover(x,z);assert.ok(c>=0&&c<=1);
    if(c>.1&&c<.9)intermediate++;
    if(villagePlantSite(x,z))grass++;
    if(villagePlantSite(x,z,true))ferns++;
    if(villagePlantSite(x,z))assert.equal(villagePlantSite(x,z),villagePlantSite(x,z),'placement is stable');
  }
  assert.ok(intermediate>100);assert.ok(grass>100);assert.ok(ferns>50&&ferns<grass);
});
