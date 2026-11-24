import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

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
    };
    blank.customProgramCacheKey=()=> 'alba-flexing-rod-v1';this.root.add(new THREE.Mesh(tube,blank));
    const grip=new THREE.Mesh(new THREE.CylinderGeometry(.043,.048,.57,20),cork);grip.rotation.x=-.5;grip.position.set(.04,-.16,.17);this.root.add(grip);
    const butt=new THREE.Mesh(new THREE.CylinderGeometry(.052,.052,.065,20),black);butt.position.set(.04,-.44,.32);butt.rotation.x=-.5;this.root.add(butt);
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
    const metals=[];
    const metal=(geometry,position,rotation=[0,0,0])=>{
      const m=new THREE.Mesh(geometry);m.position.set(...position);m.rotation.set(...rotation);m.updateMatrix();geometry.applyMatrix4(m.matrix);metals.push(geometry);
    };
    // A spinning reel: spool lips, bail wire, stem and bearing housing.
    const body=new THREE.Mesh(new THREE.SphereGeometry(.12,20,12),this.graphite);body.scale.set(.85,1.2,.9);body.position.set(.03,-.14,-.2);this.root.add(body);
    metal(new THREE.CylinderGeometry(.016,.025,.2,10),[.02,-.03,-.19]);
    const spool=new THREE.Mesh(new THREE.CylinderGeometry(.085,.085,.12,24),lineMat);spool.rotation.x=Math.PI/2;spool.position.set(.025,-.145,-.32);this.root.add(spool);
    for(const z of [-.385,-.255]) metal(new THREE.TorusGeometry(.096,.011,8,32),[.025,-.145,z]);
    for(let i=0;i<12;i++) {
      const wound=new THREE.Mesh(new THREE.TorusGeometry(.086,.0018,4,24),lineMat);wound.position.set(.025,-.145,-.375+i*.01);this.root.add(wound);
    }
    const bail=new THREE.TorusGeometry(.145,.008,8,32,Math.PI*1.7);metal(bail,[.025,-.145,-.30],[.3,.25,.4]);
    metal(new THREE.CylinderGeometry(.055,.055,.055,20),[.12,-.14,-.18],[0,0,Math.PI/2]);
    this.root.add(new THREE.Mesh(mergeGeometries(metals),silver));metals.forEach(g=>g.dispose());
    this.handle=new THREE.Group();this.handle.position.set(.15,-.14,-.18);
    const arm=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,.16,8),silver);arm.position.y=-.08;this.handle.add(arm);
    const knob=new THREE.Mesh(new THREE.CapsuleGeometry(.032,.055,5,10),black);knob.rotation.z=Math.PI/2;knob.position.set(.03,-.16,0);this.handle.add(knob);this.root.add(this.handle);
    this.guidePositions=new Float32Array(12*3);
    const guideGeo=new THREE.BufferGeometry();guideGeo.setAttribute('position',new THREE.BufferAttribute(this.guidePositions,3));
    this.guideLine=new THREE.Line(guideGeo,new THREE.LineBasicMaterial({color:0xd5dbc4,transparent:true,opacity:.48}));this.guideLine.frustumCulled=false;this.root.add(this.guideLine);
    this.update(0,0,0,false);
  }
  update(dt,tension,time,reeling) {
    const target=tension*(.43+Math.sin(time*8)*.025);
    this.bend.value=THREE.MathUtils.damp(this.bend.value,target,8,dt);
    for(const {mesh,point,u} of this.guides) {
      mesh.position.copy(point);mesh.position.y-=Math.pow(u,2.4)*this.bend.value;
    }
    this.tip.position.copy(this.curve.getPointAt(1));this.tip.position.y-=this.bend.value;
    for(let i=0;i<12;i++) {
      const u=i/11,p=this.curve.getPointAt(u);
      this.guidePositions.set([p.x,p.y-Math.pow(u,2.4)*this.bend.value-.035,p.z],i*3);
    }
    this.guideLine.geometry.attributes.position.needsUpdate=true;
    if(reeling)this.handle.rotation.x-=dt*12;
    this.root.position.x=innerWidth/innerHeight<1 ? .40 : .82;
  }
}
