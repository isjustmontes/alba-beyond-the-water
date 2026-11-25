import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {Environment} from '../src/simulation/environment.js';
import {VEGETATION_PROFILES,sampleVegetationWind,vegetationMaterial,padVegetationBounds,seedVegetationPhases} from '../src/visuals/vegetation-wind.js';
const sample=(p,options={})=>sampleVegetationWind(options.x??.15,options.y??p.height,options.anchorX??13,options.anchorZ??-9,options.time??3,options.windX??4.8,options.windZ??0,p,options.detail??1);

test('vegetation stays rooted and still in calm air; displacement is bounded for all profiles',()=>{
  for(const p of Object.values(VEGETATION_PROFILES)){
    for(let t=0;t<60;t+=.17){
      assert.equal(Math.abs(sample(p,{y:p.root,time:t}).offset),0);
      assert.equal(Math.abs(sample(p,{time:t,windX:0,windZ:0}).offset),0);
      const s=sample(p,{time:t,windX:100});
      assert.ok(Math.abs(s.offset)<=p.height*(p.bend+p.flutter));
      assert.ok(Number.isFinite(s.dx)&&Number.isFinite(s.dy));
    }
  }
});

test('actual environmental wind strength drives vegetation without changing the environment',()=>{
  const e=new Environment(),p=VEGETATION_PROFILES.grass,w=e.weather;
  const calm=sample(p,{windX:w.windX,windZ:w.windZ}).offset;
  w.request('windy',{manual:true});for(let i=0;i<600;i++)e.update(.1);
  const before=e.snapshot(),strong=sample(p,{windX:w.windX,windZ:w.windZ}).offset;
  assert.ok(Math.abs(strong)>Math.abs(calm)*3);assert.deepEqual(e.snapshot(),before);
  assert.equal(sample(p,{windX:2,windZ:0}).offset,sample(p,{windX:0,windZ:-2}).offset,'strength is independent of flow direction');
});

test('spatial phases and species differ; wind and time transitions stay continuous',()=>{
  const p=VEGETATION_PROFILES.pine,values=[];
  for(let i=0;i<12;i++)values.push(sample(p,{anchorX:i*2.1}).offset);
  assert.ok(new Set(values.map(x=>x.toFixed(5))).size>10);
  assert.notEqual(sample(p).offset,sample(VEGETATION_PROFILES.birch).offset);
  for(let t=0;t<8;t+=.05){const a=sample(p,{time:t}),b=sample(p,{time:t+.001});assert.ok(Math.abs(a.offset-b.offset)<.001);}
  const a=sample(p,{windX:3}),b=sample(p,{windX:3.001});assert.ok(Math.abs(a.offset-b.offset)<.001);
});

test('analytic deformation derivatives match finite differences for coherent lighting',()=>{
  const eps=1e-5;
  for(const p of Object.values(VEGETATION_PROFILES)){
    const opts={x:.12,y:p.height*.63},a=sample(p,opts);
    const dx=(sample(p,{...opts,x:opts.x+eps}).offset-sample(p,{...opts,x:opts.x-eps}).offset)/(2*eps);
    const dy=(sample(p,{...opts,y:opts.y+eps}).offset-sample(p,{...opts,y:opts.y-eps}).offset)/(2*eps);
    assert.ok(Math.abs(dx-a.dx)<1e-6);assert.ok(Math.abs(dy-a.dy)<1e-6);
  }
});

test('shader shares uniforms and corrects positions and normals without mutating instance buffers',()=>{
  const u={time:{value:0},flow:{value:new THREE.Vector2(1.1,0)},detail:{value:1}},p=VEGETATION_PROFILES.pine;
  const mat=vegetationMaterial(new THREE.MeshStandardMaterial(),u,p);
  const shader={uniforms:{},vertexShader:'#include <beginnormal_vertex>\n#include <begin_vertex>'};mat.onBeforeCompile(shader);
  assert.equal(shader.uniforms.vegetationTime,u.time);assert.equal(shader.uniforms.vegetationFlow,u.flow);
  assert.ok(shader.vertexShader.includes('transformed+=vegetationOffset'));assert.ok(shader.vertexShader.includes('objectNormal-=vegetationGradient'));
  assert.ok(shader.vertexShader.includes('vegetationLocalX*flow.x'));
  const mesh=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1),mat,1),matrix=mesh.instanceMatrix.array.slice();
  const r=(()=>{mesh.computeBoundingSphere();return mesh.boundingSphere.radius;})();padVegetationBounds(mesh,p,13);
  assert.ok(mesh.boundingSphere.radius>r+13*(p.bend+p.flutter));
  u.time.value=100;u.flow.value.set(-5,1);u.detail.value=0;
  assert.deepEqual(mesh.instanceMatrix.array,matrix);mesh.geometry.dispose();mat.dispose();
});

test('cached instance bases preserve world wind direction through plant rotation and nonuniform scale',()=>{
  const mesh=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1),new THREE.MeshStandardMaterial(),1),dummy=new THREE.Object3D();
  dummy.rotation.set(.1,1.1,.2);dummy.scale.set(2,3,4);dummy.updateMatrix();mesh.setMatrixAt(0,dummy.matrix);seedVegetationPhases(mesh,VEGETATION_PROFILES.reed);
  for(const [attribute,expected]of [['vegetationLocalX',new THREE.Vector3(3,0,0)],['vegetationLocalZ',new THREE.Vector3(0,0,3)]]){
    const a=mesh.geometry.getAttribute(attribute),local=new THREE.Vector3(a.getX(0),a.getY(0),a.getZ(0)),basis=new THREE.Matrix3().setFromMatrix4(dummy.matrix);
    assert.ok(local.applyMatrix3(basis).distanceTo(expected)<1e-6);
  }
  mesh.geometry.dispose();mesh.material.dispose();
});

test('low detail retains the broad bend and removes only fine flutter',()=>{
  const p=VEGETATION_PROFILES.grass;
  for(let t=0;t<10;t+=.2){const a=sample(p,{time:t}),b=sample(p,{time:t,detail:0});assert.ok(Math.abs(b.offset)>0);assert.ok(Math.abs(a.offset-b.offset)<=p.height*p.flutter);}
});
