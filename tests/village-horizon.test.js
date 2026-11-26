import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {villageHorizonHeight,villageHorizonTrees,makeVillageHorizon} from '../src/visuals/village-horizon.js';
import {villageGroundHeight} from '../src/visuals/village-ground.js';

test('distant hills join the existing boundary and preserve all near ground with a hidden outer skirt',()=>{
  for(let x=-80;x<=80;x+=5)for(let z=-80;z<=80;z+=5)assert.equal(villageHorizonHeight(x,z),villageGroundHeight(x,z));
  for(let a=0;a<Math.PI*2;a+=.05){
    const dx=Math.cos(a),dz=Math.sin(a),m=Math.max(Math.abs(dx),Math.abs(dz));
    assert.ok(Math.abs(villageHorizonHeight(dx*85/m,dz*85/m)-villageGroundHeight(dx*85/m,dz*85/m)-.1)<1e-8);
    assert.ok(villageHorizonHeight(dx*320/m,dz*320/m)<villageHorizonHeight(dx*185/m,dz*185/m));
  }
  let low=Infinity,high=-Infinity;
  for(let x=-250;x<=250;x+=5)for(let z=-250;z<=250;z+=5){
    if(Math.max(Math.abs(x),Math.abs(z))<85)continue;
    const h=villageHorizonHeight(x,z);assert.ok(Number.isFinite(h)&&h<35);
    assert.ok(Math.abs(villageHorizonHeight(x+.1,z)-h)<.15,'soft hills, no terrain steps');low=Math.min(low,h);high=Math.max(high,h);
  }
  assert.ok(high-low>8,'a genuinely varied distant relief');
});
test('distant woodland is deterministic, clustered and wholly outside current trees/navigation',()=>{
  const sites=villageHorizonTrees();assert.equal(sites.length,360);assert.deepEqual(sites,villageHorizonTrees());
  for(const s of sites){assert.ok(Math.max(Math.abs(s.x),Math.abs(s.z))>=105);assert.equal(s.y,villageHorizonHeight(s.x,s.z));assert.ok(s.height>=3.8&&s.height<=9);}
});
test('backdrop has bounded geometry and reuses maps/materials without changing current tree buffers',()=>{
  const ground=new THREE.MeshStandardMaterial({map:new THREE.Texture()}),sources=[0,1].map(()=>new THREE.InstancedMesh(new THREE.PlaneGeometry(.55,1,1,2),new THREE.MeshStandardMaterial(),1));
  const {group,plants}=makeVillageHorizon(ground,sources);assert.equal(group.children.length,3);assert.equal(plants.length,2);
  assert.equal(group.children[0].material.map,ground.map);assert.ok(group.children[0].geometry.index.count/3<3000);
  const normals=group.children[0].geometry.attributes.normal;for(let i=0;i<normals.count;i++)assert.ok(normals.getY(i)>0,'terrain faces the sky');
  for(let i=0;i<2;i++){assert.equal(plants[i].mesh.material,sources[i].material);assert.notEqual(plants[i].mesh.geometry,sources[i].geometry);assert.equal(sources[i].geometry.attributes.villageTreeFrame,undefined);assert.equal(sources[i].count,1);}
  for(const mesh of group.children){if(mesh.isInstancedMesh)mesh.material=null;mesh.geometry.dispose();}group.children[0].material.dispose();
  for(const s of sources){s.geometry.dispose();s.material.dispose();}ground.map.dispose();ground.dispose();
});
