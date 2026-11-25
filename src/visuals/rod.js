import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import {DampedSpring,clamp} from '../animation/fishing-motion.js';

function finishTexture(kind) {
  const c=document.createElement('canvas');c.width=128;c.height=256;
  const ctx=c.getContext('2d');ctx.fillStyle=kind==='cork' ? '#a48c61' : '#243a37';ctx.fillRect(0,0,128,256);
  for(let i=0;i<1500;i++) {
    const x=(i*73.31)%128,y=(i*131.73)%256;
    ctx.fillStyle=i%3 ? 'rgba(20,27,19,.17)' : 'rgba(245,231,178,.22)';
    if(kind==='cork') ctx.fillRect(x,y,1+(i%7),.7+i%2);
    else {ctx.save();ctx.translate(x,y);ctx.rotate(Math.PI/4);ctx.fillRect(0,0,2,9);ctx.restore();}
  }
  const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.anisotropy=4;return tex;
}

export class RodRig {
  constructor() {
    this.root=new THREE.Group();this.root.position.set(.82,-.33,-1.05);
    this.bend={value:0};
    this.flex=new DampedSpring();this.reelMotion=new DampedSpring(0,14,1);this.reelRate=0;
    this.graphite=new THREE.MeshStandardMaterial({color:0x405553,map:finishTexture('carbon'),metalness:.48,roughness:.29,envMapIntensity:1});
    const cork=new THREE.MeshStandardMaterial({map:finishTexture('cork'),roughness:.94});
    const silver=new THREE.MeshStandardMaterial({color:0xb8c4c1,metalness:.92,roughness:.22});
    const gold=new THREE.MeshStandardMaterial({color:0xaaa17b,metalness:.78,roughness:.36});
    const black=new THREE.MeshStandardMaterial({color:0x132321,roughness:.5,metalness:.4});
    const lineMat=new THREE.MeshStandardMaterial({color:0xc2c9ac,roughness:.5,metalness:.16});
    this.curve=new THREE.CatmullRomCurve3([
      new THREE.Vector3(0,0,0),new THREE.Vector3(-.14,.34,-.63),new THREE.Vector3(-.35,.69,-1.42),new THREE.Vector3(-.59,.96,-2.23),new THREE.Vector3(-.83,1.08,-3.04)
    ]);
    const segments=72,tube=new THREE.TubeGeometry(this.curve,segments,.017,8,false),fractions=[];
    const pos=tube.attributes.position;
    for(let i=0;i<=segments;i++) {
      const u=i/segments,center=this.curve.getPointAt(u),radiusFactor=1-u*.84;
      for(let j=0;j<=8;j++) {
        const k=i*9+j;
        pos.setXYZ(k,center.x+(pos.getX(k)-center.x)*radiusFactor,center.y+(pos.getY(k)-center.y)*radiusFactor,center.z+(pos.getZ(k)-center.z)*radiusFactor);
        fractions.push(u);
      }
    }
    tube.setAttribute('rodFraction',new THREE.Float32BufferAttribute(fractions,1));tube.computeVertexNormals();
    const blank=this.graphite.clone();
    blank.onBeforeCompile=shader=>{
      shader.uniforms.rodBend=this.bend;
      shader.vertexShader='attribute float rodFraction; uniform float rodBend;\n'+shader.vertexShader;
      shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed.y-=pow(rodFraction,2.4)*rodBend;');
      shader.vertexShader=shader.vertexShader.replace('#include <beginnormal_vertex>','#include <beginnormal_vertex>\nobjectNormal.z-=pow(rodFraction,1.4)*rodBend*.78*objectNormal.y;');
    };
    blank.customProgramCacheKey=()=> 'alba-flexing-rod-v1';this.root.add(new THREE.Mesh(tube,blank));
    // Validated cork proportions: align the grip's front with the blank root.
    // Keep the rod/reel rig scale and all animated pivots unchanged.
    const gripAxis=this.curve.getTangentAt(0).normalize(),gripLength=.57*.60;
    const grip=new THREE.Mesh(new THREE.CylinderGeometry(.043,.048,.57,20),cork);
    grip.scale.set(.46,.60,.46);grip.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),gripAxis);
    grip.position.copy(gripAxis).multiplyScalar(-gripLength/2);this.root.add(grip);
    const butt=new THREE.Mesh(new THREE.CylinderGeometry(.052,.052,.065,20),black);
    butt.scale.set(.46,.4,.46);butt.quaternion.copy(grip.quaternion);
    butt.position.copy(gripAxis).multiplyScalar(-gripLength-.065*.4/2);this.root.add(butt);
    this.guides=[];
    for(let i=1;i<=9;i++) {
      const u=.10+i*.096,point=this.curve.getPointAt(u),radius=.032*(1-u*.7);
      const ring=new THREE.TorusGeometry(radius,.0035,6,14);ring.translate(0,-radius-.016,0);
      const foot=new THREE.CylinderGeometry(.003,.003,.035,5);foot.translate(0,-.014,0);
      const guide=new THREE.Mesh(mergeGeometries([ring,foot]),silver);ring.dispose();foot.dispose();guide.position.copy(point);this.root.add(guide);
      this.guides.push({mesh:guide,point,u});
      const binding=new THREE.Mesh(new THREE.TorusGeometry(.017*(1-u*.84)+.002,.002,5,12),gold);binding.rotation.x=.42;binding.position.copy(point);this.root.add(binding);this.guides.push({mesh:binding,point,u});
    }
    this.tip=new THREE.Object3D();this.tip.position.copy(this.curve.getPointAt(1));this.root.add(this.tip);
    this.restTip=this.tip.position.clone();
    const metals=[];
    const metal=(geometry,position,rotation=[0,0,0])=>{
      const m=new THREE.Mesh(geometry);m.position.set(...position);m.rotation.set(...rotation);m.updateMatrix();geometry.applyMatrix4(m.matrix);metals.push(geometry);
    };
    // A spinning reel: spool lips, bail wire, stem and bearing housing.
    const body=new THREE.Mesh(new THREE.SphereGeometry(.12,20,12),this.graphite);body.scale.set(.85,1.2,.9);body.position.set(.03,-.14,-.2);this.root.add(body);
    metal(new THREE.CylinderGeometry(.016,.025,.2,10),[.02,-.03,-.19]);
    this.spool=new THREE.Group();this.spool.position.set(.025,-.145,-.32);this.root.add(this.spool);
    const core=new THREE.CylinderGeometry(.085,.085,.12,24);core.rotateX(Math.PI/2);const windings=[core],lips=[];
    for(const z of [-.065,.065]){const g=new THREE.TorusGeometry(.096,.011,8,32);g.translate(0,0,z);lips.push(g);}
    for(let i=0;i<12;i++) {
      const wound=new THREE.TorusGeometry(.086,.0018,4,24);wound.translate(0,0,-.055+i*.01);windings.push(wound);
    }
    this.spool.add(new THREE.Mesh(mergeGeometries(windings),lineMat),new THREE.Mesh(mergeGeometries(lips),silver));[...windings,...lips].forEach(g=>g.dispose());
    this.rotor=new THREE.Group();this.rotor.position.set(.025,-.145,-.30);this.root.add(this.rotor);
    const bail=new THREE.Mesh(new THREE.TorusGeometry(.145,.006,8,32,Math.PI*1.7),silver);bail.rotation.set(.3,.25,.4);this.rotor.add(bail);
    const skirt=new THREE.Mesh(new THREE.TorusGeometry(.115,.012,8,28),this.graphite);skirt.position.z=.06;this.rotor.add(skirt);
    metal(new THREE.CylinderGeometry(.055,.055,.055,20),[.12,-.14,-.18],[0,0,Math.PI/2]);
    this.root.add(new THREE.Mesh(mergeGeometries(metals),silver));metals.forEach(g=>g.dispose());
    this.handle=new THREE.Group();this.handle.position.set(.15,-.14,-.18);
    const arm=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,.16,8),silver);arm.position.y=-.08;this.handle.add(arm);
    const knob=new THREE.Mesh(new THREE.CapsuleGeometry(.032,.055,5,10),black);knob.rotation.z=Math.PI/2;knob.position.set(.03,-.16,0);this.handle.add(knob);this.root.add(this.handle);
    this.gripSocket=new THREE.Object3D();this.gripSocket.name='RodGrip_R';this.gripSocket.position.copy(grip.position);this.root.add(this.gripSocket);
    this.crankSocket=new THREE.Object3D();this.crankSocket.name='ReelGrip_L';this.crankSocket.position.copy(knob.position);this.handle.add(this.crankSocket);
    this.guidePositions=new Float32Array(12*3);
    const guideGeo=new THREE.BufferGeometry();guideGeo.setAttribute('position',new THREE.BufferAttribute(this.guidePositions,3));
    this.guideLine=new THREE.Line(guideGeo,new THREE.LineBasicMaterial({color:0xd5dbc4,transparent:true,opacity:.48}));this.guideLine.frustumCulled=false;this.root.add(this.guideLine);
    this.lineRest=new Float32Array(36);this.lineFractions=new Float32Array(12);this.lineRest.set([.025,-.145,-.35]);
    for(let i=1;i<12;i++){const u=.1+(i-1)*.09,p=this.curve.getPointAt(u);this.lineFractions[i]=u;this.lineRest.set([p.x,p.y-.035,p.z],i*3);}
    this.update(0,0,0,false);
  }
  update(dt,tension,time,reeling,load=undefined,retrieveRate=1,lineOut=0) {
    const target=load??tension*(.53+Math.sin(time*8)*.018);
    this.bend.value=clamp(this.flex.update(dt,target),-.12,.72);
    for(const {mesh,point,u} of this.guides) {
      mesh.position.copy(point);mesh.position.y-=Math.pow(u,2.4)*this.bend.value;
    }
    this.tip.position.copy(this.restTip);this.tip.position.y-=this.bend.value;
    for(let i=0;i<12;i++) {
      const u=this.lineFractions[i],k=i*3;
      this.guidePositions[k]=this.lineRest[k];this.guidePositions[k+1]=this.lineRest[k+1]-Math.pow(u,2.4)*this.bend.value;this.guidePositions[k+2]=this.lineRest[k+2];
    }
    this.guideLine.geometry.attributes.position.needsUpdate=true;
    this.reelRate=Math.max(0,this.reelMotion.update(dt,reeling ? retrieveRate : 0));
    this.handle.rotation.x-=dt*this.reelRate*10;
    this.rotor.rotation.z-=dt*this.reelRate*32;
    this.spool.position.z=-.32+Math.sin(this.handle.rotation.x*.7)*.014;
    this.spool.rotation.z+=dt*Math.max(0,lineOut)*7;
    this.root.position.x=innerWidth/innerHeight<1 ? .40 : .82;
  }
}
