import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const random = seed => () => { seed=(seed*1664525+1013904223)>>>0; return seed/4294967296; };

function skinTexture(species) {
  const canvas=document.createElement('canvas'); canvas.width=512; canvas.height=256;
  const ctx=canvas.getContext('2d'), rand=random(1973+species*847);
  const palettes=[['#334b43','#9daea2','#e0dcc4'],['#414529','#b29b60','#d5c99b'],['#2b4132','#809275','#dddcc1']];
  const [back,flank,belly]=palettes[species];
  const gradient=ctx.createLinearGradient(0,0,0,256);
  gradient.addColorStop(0,back); gradient.addColorStop(.24,flank); gradient.addColorStop(.5,belly); gradient.addColorStop(.76,flank); gradient.addColorStop(1,back);
  ctx.fillStyle=gradient; ctx.fillRect(0,0,512,256);
  for(let row=0;row<28;row++) for(let col=0;col<65;col++) {
    const x=col*8+(row%2)*4, y=row*9;
    ctx.strokeStyle=`rgba(25,39,24,${species===1 ? .25 : .13})`; ctx.lineWidth=.65;
    ctx.beginPath(); ctx.ellipse(x,y,5,4,0,-Math.PI/2,Math.PI/2); ctx.stroke();
    ctx.strokeStyle='rgba(255,250,218,.18)'; ctx.beginPath(); ctx.ellipse(x+.7,y-.7,4,3,0,-Math.PI/2,Math.PI/2); ctx.stroke();
  }
  if(species===0) {
    for(const y of [62,194]) {
      const stripe=ctx.createLinearGradient(0,y-16,0,y+16);
      stripe.addColorStop(0,'#b7738300'); stripe.addColorStop(.5,'#c48e9b88'); stripe.addColorStop(1,'#b7738300');
      ctx.fillStyle=stripe; ctx.fillRect(40,y-16,430,32);
    }
    for(let i=0;i<550;i++) {
      const x=rand()*470,y=rand()*256;
      if(y>93 && y<163) continue;
      ctx.fillStyle=`rgba(28,40,33,${.3+rand()*.4})`; ctx.beginPath(); ctx.ellipse(x,y,.8+rand()*1.5,.7+rand(),rand()*3,0,Math.PI*2); ctx.fill();
    }
  } else if(species===2) {
    for(const y of [64,192]) for(let x=18;x<475;x+=8) {
      ctx.fillStyle=`rgba(27,47,27,${.2+rand()*.3})`; ctx.fillRect(x,y-4+rand()*5,8,5+rand()*5);
    }
  }
  ctx.strokeStyle='rgba(34,48,35,.45)';ctx.lineWidth=1.6;
  for(const y of [64,192]) {ctx.beginPath();ctx.moveTo(412,y-28);ctx.quadraticCurveTo(440,y,410,y+27);ctx.stroke();}
  const tex=new THREE.CanvasTexture(canvas); tex.colorSpace=THREE.SRGBColorSpace; tex.anisotropy=4; return tex;
}

function finTexture() {
  const c=document.createElement('canvas'); c.width=128;c.height=128;
  const ctx=c.getContext('2d');ctx.fillStyle='#a8aa83';ctx.fillRect(0,0,128,128);
  for(let i=0;i<22;i++) {
    ctx.strokeStyle=i%2 ? '#d9d7af' : '#5a6753';ctx.lineWidth=.8;
    ctx.beginPath();ctx.moveTo(64,128);ctx.quadraticCurveTo(i*6,75,i*6,0);ctx.stroke();
  }
  const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;return tex;
}

function bodyGeometry(species,rings,sides) {
  const positions=[],uvs=[],indices=[];
  for(let i=0;i<=rings;i++) {
    const u=i/rings, bell=Math.pow(Math.sin(u*Math.PI),.73);
    const height=(species===1 ? .255 : species===2 ? .195 : .165)*bell+.018;
    const width=(species===1 ? .173 : .143)*bell+.015;
    for(let j=0;j<=sides;j++) {
      const a=j/sides*Math.PI*2;
      positions.push((u-.5)*1.5,Math.cos(a)*height+.025*Math.sin(u*Math.PI),Math.sin(a)*width);
      uvs.push(u,j/sides);
      if(i<rings && j<sides) {const k=i*(sides+1)+j;indices.push(k,k+1,k+sides+1,k+1,k+sides+2,k+sides+1);}
    }
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geo.setIndex(indices);geo.computeVertexNormals();return geo;
}

function finGeometry(points) {
  const shape=new THREE.Shape();points.forEach(([x,y],i)=>i ? shape.lineTo(x,y) : shape.moveTo(x,y));shape.closePath();
  const geo=new THREE.ShapeGeometry(shape);geo.computeBoundingBox();
  const {min,max}=geo.boundingBox,positions=geo.attributes.position,uv=geo.attributes.uv;
  for(let i=0;i<uv.count;i++) uv.setXY(i,(positions.getX(i)-min.x)/(max.x-min.x),(positions.getY(i)-min.y)/(max.y-min.y));
  return geo;
}

export class FishModels {
  constructor() {
    this.clock={value:0};this.assets=[];
    const finMap=finTexture();
    for(let species=0;species<3;species++) {
      const map=skinTexture(species);
      const variants=Array.from({length:5},(_,i)=>{
        const mat=new THREE.MeshStandardMaterial({map,color:new THREE.Color().setHSL(.10+i*.014,.035+i*.012,.87+i*.018),roughness:.31,metalness:.18,envMapIntensity:.8});
        mat.onBeforeCompile=shader=>{
          shader.uniforms.swimTime=this.clock;shader.uniforms.swimPhase={value:i*1.7};
          shader.vertexShader='uniform float swimTime; uniform float swimPhase;\n'+shader.vertexShader;
          shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
            float tailWeight=pow(clamp((.7-position.x)/1.45,0.,1.),2.);
            transformed.z+=sin(position.x*7.-swimTime*5.5+swimPhase)*tailWeight*.065;`);
        };
        mat.customProgramCacheKey=()=> 'alba-swimming-fish-v1';return mat;
      });
      const fins=new THREE.MeshStandardMaterial({map:finMap,color:species===1 ? 0x9d8352 : species===0 ? 0x9e9e8a : 0x778a69,roughness:.5,side:THREE.DoubleSide,transparent:true,opacity:.88,depthWrite:false});
      const dorsal=finGeometry([[-.34,.1],[-.26,.36],[-.13,.41],[.17,.3],[.26,.13]]);
      const dorsalPoints=dorsal.attributes.position;
      for(let i=0;i<dorsalPoints.count;i++)dorsalPoints.setY(i,.1+(dorsalPoints.getY(i)-.1)*(species===1 ? .9 : species===0 ? .58 : .72));
      const anal=finGeometry([[-.38,-.09],[-.34,-.3],[-.09,-.2],[.04,-.12]]);
      const pectoral=finGeometry([[.30,0],[.05,-.23],[-.12,-.21],[.10,.015]]);
      const staticFins=[dorsal,anal];
      for(const side of [-1,1]) {const g=pectoral.clone();g.rotateX(side*.8);g.translate(.05,-.04,side*.13);staticFins.push(g);}
      const mergedFins=mergeGeometries(staticFins);staticFins.forEach(g=>g.dispose());pectoral.dispose();
      const tail=finGeometry([[.04,0],[-.42,.31],[-.34,.08],[-.30,0],[-.34,-.08],[-.42,-.3]]);
      const iris=[],pupils=[];
      for(const side of [-1,1]) {
        const g=new THREE.SphereGeometry(.026,10,8);g.scale(1,1,.4);g.translate(.54,.052,side*.093);iris.push(g);
        const p=new THREE.SphereGeometry(.016,10,8);p.scale(1,1,.3);p.translate(.546,.053,side*.104);pupils.push(p);
      }
      const irisGeo=mergeGeometries(iris),pupilGeo=mergeGeometries(pupils);[...iris,...pupils].forEach(g=>g.dispose());
      const mouth=new THREE.TorusGeometry(species===2 ? .046 : .031,.009,6,14);mouth.rotateY(Math.PI/2);mouth.translate(.75,-.015,0);
      this.assets.push({near:bodyGeometry(species,40,20),far:bodyGeometry(species,14,10),variants,fins,mergedFins,tail,irisGeo,pupilGeo,mouth,
        irisMat:new THREE.MeshStandardMaterial({color:0xb2a56b,roughness:.28,metalness:.3}),eyeMat:new THREE.MeshStandardMaterial({color:0x090e0c,roughness:.12}),mouthMat:new THREE.MeshStandardMaterial({color:0x6a735a,roughness:.6})});
    }
  }
  create(species,seed=0) {
    const a=this.assets[species],group=new THREE.Group(),lod=new THREE.LOD();
    const material=a.variants[Math.abs(seed)%5];
    const detailed=new THREE.Group(),distant=new THREE.Group();
    detailed.add(new THREE.Mesh(a.near,material),new THREE.Mesh(a.mergedFins,a.fins),new THREE.Mesh(a.irisGeo,a.irisMat),new THREE.Mesh(a.pupilGeo,a.eyeMat),new THREE.Mesh(a.mouth,a.mouthMat));
    distant.add(new THREE.Mesh(a.far,material));
    const tails=[];
    for(const target of [detailed,distant]) {
      const tail=new THREE.Mesh(a.tail,a.fins);tail.position.set(-.7,.005,0);target.add(tail);tails.push(tail);
    }
    lod.addLevel(detailed,0);lod.addLevel(distant,22);group.add(lod);
    group.userData={tails,lod,phase:seed*1.7};return group;
  }
  animate(fish,time,camera) {
    fish.userData.lod.update(camera);
    const phase=fish.userData.phase;
    for(const tail of fish.userData.tails) tail.rotation.y=Math.sin(time*5.5+phase)*.32;
  }
}
