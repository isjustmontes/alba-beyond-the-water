import {test} from 'node:test';
import assert from 'node:assert/strict';
import {MeshStandardMaterial,Texture,Vector3,Box3,Raycaster} from 'three';
import {MANUEL_SIGN,manuelMarkerState,makeManuelSign,makeCharacterSign} from '../src/visuals/manuel-sign.js';
import {SHOPKEEPER,SHOPKEEPER_SIGN} from '../src/dialogues/shopkeeper.js';
import {villageHeight} from '../src/village-layout.js';

test('Manuel marker range, modal hiding, bounded scale and subtle continuous bob',()=>{
 const s=MANUEL_SIGN;
 for(const blocked of [true,false])for(const d of [1,5,13,14.9,15,25]){
  const out={};assert.equal(manuelMarkerState(s.x,s.z+d,2,blocked,out),out);assert.equal(out.visible,!blocked&&d<15);assert.ok(out.opacity>=0&&out.opacity<=1);assert.ok(out.size>=.48&&out.size<=.88);
 }
 for(let t=0;t<10;t+=.01){const a=manuelMarkerState(6,7,t,false),b=manuelMarkerState(6,7,t+.01,false);assert.ok(Math.abs(a.y-s.iconHeight)<=.02501);assert.ok(Math.abs(a.y-b.y)<.00034);}
 assert.equal(manuelMarkerState(NaN,7,0,false).visible,false);
});
test('portrait sign has reused matte wood, matched portrait aspect/alpha, correct two-sided prints and no new solid footprint',()=>{
 const old=globalThis.document;
 globalThis.document={createElement:()=>({getContext:()=>new Proxy({createLinearGradient:()=>({addColorStop(){}})},{get:(target,key)=>target[key]||(()=>{})})})};
 try{
  const wood=new MeshStandardMaterial({roughness:.95}),iron=new MeshStandardMaterial({roughness:.72}),texture=new Texture();let loads=0;
  const sign=makeManuelSign(wood,iron,{portraitUrl:'supplied-portrait',loadPortrait:url=>{assert.equal(url,'supplied-portrait');loads++;return texture;}});
  assert.equal(loads,1);assert.equal(sign.group.getObjectByName('manuel-sign-joinery').material,wood);
  const front=sign.group.getObjectByName('manuel-sign-portrait-1'),back=sign.group.getObjectByName('manuel-sign-portrait--1');
  assert.equal(front.material,back.material);assert.equal(front.material.map,texture);assert.equal(front.material.transparent,true);assert.equal(front.material.depthWrite,false);assert.equal(front.material.roughness,1);
  assert.ok(Math.abs(front.geometry.parameters.width/front.geometry.parameters.height-760/1013)<1e-8);assert.equal(front.geometry,back.geometry);
  sign.group.updateMatrixWorld(true);const f=new Vector3(0,0,1).transformDirection(front.matrixWorld),b=new Vector3(0,0,1).transformDirection(back.matrixWorld);assert.ok(f.dot(b)<-.9999,'separate front faces prevent mirrored back text');
  for(const side of [1,-1])for(const [y,part]of [[1.315,'portrait'],[.92,'paper']]){
   const origin=sign.group.localToWorld(new Vector3(0,y,side*4)),direction=new Vector3(0,0,-side).transformDirection(sign.group.matrixWorld);
   const hits=new Raycaster(origin,direction).intersectObject(sign.group,true);
   assert.equal(hits[0]?.object.name,`manuel-sign-${part}-${side}`,'post must never cover the portrait or name on either face');
  }
  const bounds=new Box3().setFromObject(sign.group);assert.ok(bounds.min.x>3.55&&bounds.max.x<6.45&&bounds.min.z>6.35&&bounds.max.z<7.65,'all solids fit inside the existing bench guard');
  assert.ok(bounds.min.y<=sign.group.position.y,'post is planted');assert.ok(bounds.max.y-sign.group.position.y<1.8);
  assert.equal(sign.icon.material.depthTest,true);assert.equal(sign.icon.material.depthWrite,false);assert.equal(sign.icon.isSprite,true);
  const camera={position:new Vector3(5,3,10)};sign.update(camera,1,false);assert.equal(sign.icon.visible,true);sign.update(camera,1,true);assert.equal(sign.icon.visible,false);
  camera.position.z=40;sign.update(camera,1,false);assert.equal(sign.icon.visible,false);
  const second=makeCharacterSign(wood,iron,{config:SHOPKEEPER_SIGN,id:SHOPKEEPER.id,name:SHOPKEEPER.name,portraitAspect:SHOPKEEPER.aspect,resources:sign.resources,portraitUrl:'shopkeeper',loadPortrait:()=>new Texture()});
  assert.equal(second.group.getObjectByName('shopkeeper-sign-joinery').geometry,sign.group.getObjectByName('manuel-sign-joinery').geometry);
  assert.equal(second.icon.material.map,sign.icon.material.map,'both residents use the same bubble texture');
  second.group.updateMatrixWorld(true);const shopBounds=new Box3().setFromObject(second.group);
  assert.ok(shopBounds.max.z<1.35,'no new solid outside the existing house collision guard');
  assert.ok(shopBounds.max.x< -9.08,'door and jamb remain entirely unobstructed');
  assert.ok(shopBounds.max.y<villageHeight(-10,-3)+2.78-.275,'sign cannot cover the shop heading');
  const secondPortrait=second.group.getObjectByName('shopkeeper-sign-portrait-1');assert.ok(Math.abs(secondPortrait.geometry.parameters.width/secondPortrait.geometry.parameters.height-SHOPKEEPER.aspect)<1e-8);
 }finally{globalThis.document=old;}
});
