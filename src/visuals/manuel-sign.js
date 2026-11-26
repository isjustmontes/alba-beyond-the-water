import * as THREE from 'three';
import {villageHeight} from '../village-layout.js';

// Entire solid board/post stays within the existing bench's collision footprint.
export const MANUEL_SIGN=Object.freeze({x:6.24,z:7,yaw:-1.7,width:.69,height:.95,center:1.26,iconHeight:2.12,range:15});
export const manuelMarkerState=(x,z,time,blocked,out={})=>characterMarkerState(MANUEL_SIGN,x,z,time,blocked,out);
export function characterMarkerState(config,x,z,time,blocked,out={}){
  const d=Math.hypot(x-config.x,z-config.z);
  out.visible=!blocked&&Number.isFinite(d)&&d<config.range;
  out.opacity=Math.max(0,Math.min(1,(config.range-d)/2));
  out.size=Math.max(.48,Math.min(.88,d*.065));
  out.y=config.iconHeight+Math.sin(time*1.35)*.025;
  return out;
}
function canvasTexture(width,height,paint){
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;paint(canvas.getContext('2d'));
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=4;return map;
}
function paperTexture(name){
  return canvasTexture(256,384,ctx=>{
    const wash=ctx.createLinearGradient(0,0,256,384);wash.addColorStop(0,'#f3e8ce');wash.addColorStop(.55,'#eee0c1');wash.addColorStop(1,'#ddc9a3');ctx.fillStyle=wash;ctx.fillRect(0,0,256,384);
    // Sparse deterministic fibres, with no extra texture download or animation.
    for(let i=0;i<1600;i++){ctx.fillStyle=i%2?'#765f3410':'#fff8e718';ctx.fillRect((i*73)%256,(i*137)%384,1+(i%3),1);}
    ctx.strokeStyle='#8b714768';ctx.lineWidth=1;ctx.strokeRect(9.5,9.5,237,365);
    ctx.fillStyle='#e9d8b3';ctx.fillRect(14,324,228,45);ctx.strokeStyle='#94734680';ctx.strokeRect(14.5,324.5,227,44);
    ctx.font='600 28px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#493b29';ctx.fillText(name,128,348);
  });
}
function bubbleTexture(){
  return canvasTexture(128,128,ctx=>{
    ctx.shadowColor='#17291c40';ctx.shadowBlur=5;ctx.shadowOffsetY=3;
    ctx.fillStyle='#f0e1be';ctx.strokeStyle='#8a714b';ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(28,19);ctx.lineTo(100,19);ctx.quadraticCurveTo(115,19,115,35);ctx.lineTo(115,76);ctx.quadraticCurveTo(115,91,100,91);ctx.lineTo(58,91);ctx.quadraticCurveTo(43,108,27,109);ctx.lineTo(32,91);ctx.lineTo(28,91);ctx.quadraticCurveTo(13,91,13,76);ctx.lineTo(13,35);ctx.quadraticCurveTo(13,19,28,19);ctx.closePath();ctx.fill();ctx.shadowBlur=0;ctx.stroke();
    ctx.strokeStyle='#fff8e078';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(28,25);ctx.lineTo(100,25);ctx.stroke();
    ctx.fillStyle='#365347';for(const x of [40,64,88]){ctx.beginPath();ctx.arc(x,56,5,0,Math.PI*2);ctx.fill();}
  });
}
export function makeCharacterSign(wood,iron,{config=MANUEL_SIGN,id='manuel',name='Manuel',portraitAspect=760/1013,resources={},portraitUrl=`${import.meta.env.BASE_URL}assets/dialogues/manuel-portrait.webp`,loadPortrait=url=>new THREE.TextureLoader().load(url)}={}){
  const group=new THREE.Group();group.name=`${id}-sign`;group.position.set(config.x,villageHeight(config.x,config.z),config.z);group.rotation.y=config.yaw;
  if(!resources.joinery){
    const shape=new THREE.Shape();shape.moveTo(-.5,-.5);shape.lineTo(.5,-.5);shape.lineTo(.5,.5);shape.lineTo(-.5,.5);shape.closePath();
    const joinery=new THREE.ExtrudeGeometry(shape,{depth:1,bevelEnabled:true,bevelSize:.018,bevelThickness:.018,bevelSegments:1,steps:1});joinery.translate(0,0,-.5);resources.joinery=joinery;
  }
  const pieces=[
    [0,.63,0,.11,1.34,.11], // planted post
    [0,1.26,0,.61,.88,.06], // fitted backboard
    [-.318,1.26,0,.055,.95,.15],[.318,1.26,0,.055,.95,.15],
    [0,1.708,0,.585,.055,.15],[0,.812,0,.585,.055,.15],
    [0,1.011,.066,.55,.018,.028],[0,1.011,-.066,.55,.018,.028]
  ];
  const timber=new THREE.InstancedMesh(resources.joinery,wood,pieces.length),dummy=new THREE.Object3D();timber.name=`${id}-sign-joinery`;
  pieces.forEach(([x,y,z,w,h,d],i)=>{dummy.position.set(x,y,z);dummy.scale.set(w,h,d);dummy.updateMatrix();timber.setMatrixAt(i,dummy.matrix);timber.setColorAt(i,new THREE.Color().setScalar(.88+(i%3)*.045));});
  timber.castShadow=true;timber.receiveShadow=true;group.add(timber);
  const print=new THREE.MeshStandardMaterial({map:paperTexture(name),roughness:.98,metalness:0});
  const portrait=loadPortrait(portraitUrl);portrait.colorSpace=THREE.SRGBColorSpace;portrait.anisotropy=4;
  const ink=new THREE.MeshStandardMaterial({map:portrait,transparent:true,depthWrite:false,roughness:1,metalness:0});
  const sheetGeometry=resources.sheetGeometry??=new THREE.PlaneGeometry(.55,.80),portraitGeometry=new THREE.PlaneGeometry(.65*portraitAspect,.65);
  for(const side of [1,-1]){
    const face=new THREE.Group();face.rotation.y=side===1?0:Math.PI;face.position.z=side*.066;
    const sheet=new THREE.Mesh(sheetGeometry,print);sheet.name=`${id}-sign-paper-${side}`;sheet.position.y=1.26;sheet.receiveShadow=true;
    const image=new THREE.Mesh(portraitGeometry,ink);image.name=`${id}-sign-portrait-${side}`;image.position.set(0,1.315,.002);image.receiveShadow=true;
    face.add(sheet,image);group.add(face);
  }
  const pegGeometry=resources.pegGeometry??=new THREE.CylinderGeometry(.008,.008,.008,8),pegs=new THREE.InstancedMesh(pegGeometry,iron,8);pegs.name=`${id}-sign-pegs`;
  let i=0;dummy.scale.set(1,1,1);dummy.rotation.x=Math.PI/2;
  for(const side of [-1,1])for(const x of [-.318,.318])for(const y of [.86,1.66]){dummy.position.set(x,y,side*.081);dummy.updateMatrix();pegs.setMatrixAt(i++,dummy.matrix);}group.add(pegs);
  const icon=new THREE.Sprite(new THREE.SpriteMaterial({map:resources.bubble??=bubbleTexture(),transparent:true,depthTest:true,depthWrite:false,toneMapped:false,fog:true}));icon.name=`${id}-speech-marker`;icon.visible=false;
  // Parent is the scene, so board orientation does not constrain the billboard.
  icon.position.set(group.position.x,group.position.y+config.iconHeight,group.position.z);
  const state={};
  return {group,icon,resources,update(camera,time,blocked){
    characterMarkerState(config,camera.position.x,camera.position.z,time,blocked,state);icon.visible=state.visible;
    if(!state.visible)return;icon.position.y=group.position.y+state.y;icon.scale.set(state.size,state.size,1);icon.material.opacity=state.opacity;
  }};
}

// Preserve the accepted Manuel factory and defaults; both characters share the same implementation.
export const makeManuelSign=(wood,iron,options)=>makeCharacterSign(wood,iron,options);
