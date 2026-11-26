import * as THREE from 'three';
import {VILLAGE_HOUSES,VILLAGE_TREES,villageHeight} from '../village-layout.js';
import {noise} from '../terrain-height.js';
import {seedVegetationPhases,padVegetationBounds,VEGETATION_PROFILES,vegetationMaterial} from './vegetation-wind.js';
import {shoreHeight} from '../input/shore-route.js';
import {villageGroundHeight,villagePathCover,villagePlantSite,villageTreeVariation,villageSoilNoise} from './village-ground.js';
import {villageSurfaceTexel,villageSurfaceMaterial} from './village-materials.js';
import {villageAtmosphere,advanceVillageWetness,villageRainMaterial} from './village-atmosphere.js';
import {makeVillageHorizon} from './village-horizon.js';

export function makeVillageTrailSign(){
  const group=new THREE.Group(),c=document.createElement('canvas');c.width=512;c.height=128;
  const ctx=c.getContext('2d');ctx.fillStyle='#454939';ctx.fillRect(0,0,512,128);
  ctx.strokeStyle='#ab9d76';ctx.lineWidth=3;ctx.strokeRect(7,7,498,114);ctx.fillStyle='#eee2bf';ctx.font='42px Georgia';ctx.textAlign='center';ctx.fillText('ALDEA  ↑',256,80);
  const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;
  const wood=new THREE.MeshStandardMaterial({color:0x5b4c35,roughness:.96});
  const board=new THREE.Mesh(new THREE.BoxGeometry(1.25,.32,.08),[wood,wood,wood,wood,new THREE.MeshStandardMaterial({map,roughness:.95}),wood]);board.position.y=1.45;
  const post=new THREE.Mesh(new THREE.CylinderGeometry(.045,.065,1.55,8),wood);post.position.y=.775;
  group.add(board,post);group.position.set(8,shoreHeight(8,68.5),68.5);group.rotation.y=Math.PI;return group;
}

function random(seed=8172){return ()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};}

// Locally drawn cutouts, not solid geometric crowns. Separate branch structures,
// lobed oak leaves and long chestnut leaves keep the two silhouettes distinct.
function atlanticTreeTexture(chestnut){
  const c=document.createElement('canvas');c.width=512;c.height=1024;
  const ctx=c.getContext('2d'),rand=random(chestnut?149:877);
  // Two independently drawn crowns per species in the same material/atlas.
  // Branch forks end inside foliage, instead of an exposed repeated Y shape.
  for(let variant=0;variant<2;variant++){
    ctx.save();ctx.translate(0,variant*512);ctx.beginPath();ctx.rect(0,0,512,512);ctx.clip();ctx.lineCap='round';
    const trunk=ctx.createLinearGradient(243,0,270,0);trunk.addColorStop(0,'#393d2e');trunk.addColorStop(.5,chestnut?'#766447':'#73705b');trunk.addColorStop(1,'#424536');
    ctx.fillStyle=trunk;ctx.beginPath();ctx.moveTo(244,512);ctx.bezierCurveTo(250,453,245,377,252,292);ctx.lineTo(262,292);ctx.bezierCurveTo(255,379,265,456,272,512);ctx.closePath();ctx.fill();
    for(let i=0;i<7;i++){
      const side=i%2?1:-1,reach=60+rand()*75,y=265+rand()*75;
      ctx.strokeStyle=chestnut?'#514933':'#58533f';ctx.lineWidth=4+rand()*3;
      ctx.beginPath();ctx.moveTo(256,416-i*7);ctx.bezierCurveTo(255,y+60,256+side*reach*.6,y+15,256+side*reach,y);ctx.stroke();
    }
    const cx=variant?237:267,cy=chestnut?229:208,rx=(chestnut?158:190)+(variant?-12:0),ry=(chestnut?164:139)+(variant?16:0),phase=variant*2.1+(chestnut?.8:0);
    for(let i=0;i<(variant?5700:6600);i++){
      const a=rand()*Math.PI*2,r=Math.sqrt(rand()),lower=i%5===0;
      const edge=1+.11*Math.sin(a*3+phase)+.06*Math.sin(a*7-phase);
      const x=(lower?252:cx)+Math.cos(a)*r*(lower?135:rx)*edge;
      const y=(lower?334:cy)+Math.sin(a)*r*(lower?72:ry)*edge;
      const shade=rand(),light=1-y/520;
      ctx.fillStyle=`hsl(${chestnut?77+rand()*14:85+rand()*17},${23+rand()*18}%,${14+shade*16+light*10}%)`;
      ctx.save();ctx.translate(x,y);ctx.rotate(rand()*Math.PI);ctx.beginPath();
      if(chestnut){ctx.moveTo(-5,0);ctx.quadraticCurveTo(0,-3,7,0);ctx.quadraticCurveTo(0,3,-5,0);}
      else{ctx.moveTo(-4,0);ctx.bezierCurveTo(-3,-4,-1,-1,0,-3);ctx.bezierCurveTo(3,-4,2,-1,5,0);ctx.bezierCurveTo(3,3,1,1,0,3);ctx.bezierCurveTo(-3,3,-2,1,-4,0);}
      ctx.fill();ctx.restore();
    }
    ctx.restore();
  }
  const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=4;return map;
}

function fernFronds(){
  const c=document.createElement('canvas');c.width=128;c.height=512;
  const ctx=c.getContext('2d');ctx.strokeStyle='#71804a';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(64,512);ctx.quadraticCurveTo(56,256,64,6);ctx.stroke();
  for(let i=0;i<30;i++)for(const side of [-1,1]){
    const t=(i+1)/32,y=500-t*485,w=Math.sin(t*Math.PI)*55;
    ctx.fillStyle=i%3?'#496b36':'#657f43';ctx.beginPath();ctx.moveTo(63,y+9);
    ctx.bezierCurveTo(64+side*w*.45,y+7,64+side*w,y-7,64+side*w,y-19);
    ctx.quadraticCurveTo(64+side*w*.25,y-10,64,y);ctx.fill();
  }
  const positions=[],uv=[],indices=[];
  for(let f=0;f<7;f++){
    const a=f*Math.PI*2/7,base=positions.length/3;
    for(let j=0;j<=10;j++)for(const side of [-1,1]){
      const t=j/10,r=t*(.58+(f%3)*.09),width=.15*Math.min(1,t*8);
      positions.push(Math.cos(a)*r-Math.sin(a)*side*width,.04+Math.sin(t*Math.PI*.87)*(.55+(f%2)*.10),Math.sin(a)*r+Math.cos(a)*side*width);
      uv.push((side+1)/2,t);
    }
    for(let j=0;j<10;j++){const k=base+j*2;indices.push(k,k+2,k+1,k+1,k+2,k+3);}
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeVertexNormals();
  const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;return {geometry,map};
}
// Generated locally; masonry is staggered, granular and weathered rather than flat blocks.
function texture(kind){
  const c=document.createElement('canvas');c.width=c.height=512;
  const ctx=c.getContext('2d'),rand=random(),image=ctx.createImageData(512,512),pixel={};
  for(let y=0;y<512;y++)for(let x=0;x<512;x++){
    const grain=rand(),n=noise(x*.035,y*.035),i=(y*512+x)*4;
    let r,g,b;
    if(kind!=='soil'){
      villageSurfaceTexel(kind,x,y,pixel);r=pixel.r;g=pixel.g;b=pixel.b;
    }else{
      // Neutral mineral detail lets vertex grass/soil colors read naturally,
      // rather than multiplying both by the same dark brown wash.
      const mineral=villageSoilNoise(x,y,.012),v=150+villageSoilNoise(x,y,.035)*25+grain*20+mineral*12;
      r=v;g=v*.97;b=v*.89;
    }
    image.data.set([r,g,b,255],i);
  }
  ctx.putImageData(image,0,0);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
  t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return t;
}

function tileGeometry(){
  const p=[],uv=[],indices=[];
  for(let j=0;j<2;j++)for(let i=0;i<=8;i++){
    const a=-Math.PI/2+i*Math.PI/8;
    p.push(Math.sin(a)*(.12-j*.008),Math.cos(a)*.075,(j-.5)*.48);uv.push(i/8,j);
    if(j===0&&i<8){const k=i;indices.push(k,k+9,k+1,k+1,k+9,k+10);}
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g;
}

export class VillageView {
  constructor(world){
    this.scene=new THREE.Scene();this.scene.fog=new THREE.FogExp2();this.scene.environment=world.scene.environment;this.scene.environmentIntensity=.35;
    this.sky=world.sky.clone();this.scene.add(this.sky);
    this.ambient=new THREE.HemisphereLight();this.sun=new THREE.DirectionalLight();this.moon=new THREE.DirectionalLight();
    this.sun.castShadow=true;this.sun.shadow.mapSize.set(1024,1024);Object.assign(this.sun.shadow.camera,{left:-30,right:30,top:35,bottom:-35,near:1,far:160});this.sun.shadow.normalBias=.035;this.sun.shadow.bias=-.0003;
    this.scene.add(this.ambient,this.sun,this.sun.target,this.moon);
    // Rain geometry/material and atmospheric uniforms already belong to the lake.
    this.rain=world.environmentView.rain.clone();this.scene.add(this.rain);
    this.atmosphere={};this.wetness={value:world.landscape.rain.value};this.lastEnvironmentTime=null;
    const granite=texture('granite'),trim=texture('trim'),wood=texture('wood'),tile=texture('tile'),soil=texture('soil');
    const material=(map,roughness=.94)=>new THREE.MeshStandardMaterial({map,bumpMap:map,bumpScale:.035,roughness});
    const surface=(map,kind)=>villageRainMaterial(villageSurfaceMaterial(material(map),kind),this.wetness);
    this.materials={granite:surface(granite,'granite'),trim:surface(trim,'trim'),wood:surface(wood,'wood'),tile:surface(tile,'tile'),dark:new THREE.MeshStandardMaterial({color:0x202d2b,roughness:.44,metalness:.12}),iron:new THREE.MeshStandardMaterial({color:0x373a35,roughness:.72,metalness:.7})};
    this.materials.trim.color.set(0xbdbbb0);this.materials.granite.bumpScale=.018;this.materials.trim.bumpScale=.012;this.materials.wood.bumpScale=.004;this.materials.tile.bumpScale=.009;this.materials.tile.side=THREE.DoubleSide;
    soil.repeat.set(30,30);
    const groundMat=villageRainMaterial(material(soil),this.wetness);groundMat.vertexColors=true;groundMat.bumpScale=.055;
    const groundGeo=new THREE.PlaneGeometry(170,170,128,128);groundGeo.rotateX(-Math.PI/2);
    const p=groundGeo.attributes.position,colors=[];
    for(let i=0;i<p.count;i++){
      const x=p.getX(i),z=p.getZ(i);p.setY(i,villageGroundHeight(x,z));
      const cover=villagePathCover(x,z),patch=noise(x*.27+6,z*.27);
      const col=new THREE.Color(0x586c43).lerp(new THREE.Color(0x879062),patch*.58).lerp(new THREE.Color(0x9e8c6e),cover);
      col.multiplyScalar(.86+noise(x*.65,z*.65)*.09+noise(x*.10+8,z*.10)*.14);
      colors.push(col.r,col.g,col.b);
    }
    groundGeo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));groundGeo.computeVertexNormals();
    const ground=new THREE.Mesh(groundGeo,groundMat);ground.receiveShadow=true;this.scene.add(ground);
    this.batches=new Map();this.cube=new THREE.BoxGeometry(1,1,1);this.tiles=[];
    for(const h of VILLAGE_HOUSES)this.house(h);
    this.details();this.finishBatches();
    this.plants=[];this.vegetation(world);
    this.horizon=makeVillageHorizon(groundMat,[this.scene.getObjectByName('village-oaks'),this.scene.getObjectByName('village-chestnuts')]);
    this.scene.add(this.horizon.group);this.plants.push(...this.horizon.plants);
    this.lastQuality=null;
  }
  box(key,x,y,z,w,h,d,rotation=0){
    if(!this.batches.has(key))this.batches.set(key,[]);
    this.batches.get(key).push({x,y,z,w,h,d,rotation});
  }
  house(h){
    const y=villageHeight(h.x,h.z),front=h.z+h.d/2;
    this.box('granite',h.x,y+h.h/2,h.z,h.w,h.h,h.d);
    // Individual quoins and a continuous plinth break the masonry silhouette.
    this.box('trim',h.x,y+.15,h.z,h.w+.18,.3,h.d+.18);
    for(const sx of [-1,1])for(const sz of [-1,1])for(let i=0;i<h.h/.36;i++)
      this.box('trim',h.x+sx*(h.w/2-.12),y+.18+i*.36,h.z+sz*(h.d/2-.12),i%2?.45:.65,.32,i%2?.65:.45);
    // Solid gables, fitted to the pitched roof rather than a floating roof slab.
    const shape=new THREE.Shape();shape.moveTo(-h.w/2,0);shape.lineTo(h.w/2,0);shape.lineTo(0,h.roof);shape.closePath();
    const geo=new THREE.ExtrudeGeometry(shape,{depth:h.d,bevelEnabled:false});geo.translate(h.x,y+h.h,h.z-h.d/2);
    const gable=new THREE.Mesh(geo,this.materials.granite);gable.castShadow=true;gable.receiveShadow=true;this.scene.add(gable);
    const half=h.w/2+.43,rise=h.roof+.15,slope=Math.atan2(rise,half);
    for(const side of [-1,1]){
      // Timber fascia follows the roof pitch; tiled surface has actual curved profiles.
      const fascia=new THREE.Mesh(new THREE.BoxGeometry(Math.hypot(half,rise),.13,h.d+.95),this.materials.wood);
      fascia.rotation.z=-side*slope;fascia.position.set(h.x+side*half/2,y+h.h+rise/2-.06,h.z);fascia.castShadow=true;this.scene.add(fascia);
      const nx=Math.ceil(half/.21),nz=Math.ceil((h.d+.9)/.38);
      for(let ix=0;ix<nx;ix++)for(let iz=0;iz<nz;iz++){
        const dx=(ix+.5)*half/nx;
        this.tiles.push({x:h.x+side*dx,y:y+h.h+rise*(1-dx/half)+.065,z:h.z-(h.d+.9)/2+(iz+.5)*(h.d+.9)/nz,rotation:-side*slope});
      }
      this.box('wood',h.x+side*half,y+h.h-.04,h.z,.14,.18,h.d+1.05);
    }
    this.box('trim',h.x+h.w*.24,y+h.h+h.roof+.25,h.z-h.d*.23,.65,1.45,.7);
    this.box('trim',h.x+h.w*.24,y+h.h+h.roof+1,h.z-h.d*.23,.85,.16,.88);
    // Recessed dark doors, granite jambs, individual boards, iron hardware.
    const doorX=h.id==='shop'?h.x+1.65:h.x;
    this.box('dark',doorX,y+1.12,front+.025,1.22,2.24,.09);
    for(let i=0;i<7;i++)this.box('wood',doorX-.51+i*.17,y+1.08,front+.09,.156,2.08,.07);
    for(const sx of [-1,1])this.box('trim',doorX+sx*.73,y+1.12,front+.10,.23,2.42,.29);
    this.box('trim',doorX,y+2.35,front+.10,1.7,.25,.29);
    this.box('trim',doorX,y+.055,front+.26,1.65,.11,.65);
    for(const dy of [.55,1.65])this.box('iron',doorX-.28,y+dy,front+.14,.7,.045,.035);
    this.box('iron',doorX+.35,y+1.05,front+.17,.055,.15,.06);
    for(const level of (h.h>4?[1.5,3.85]:[1.6]))for(const side of [-1,1]){
      const wx=h.x+side*(h.w*.3);if(level<2&&Math.abs(wx-doorX)<1.35)continue;
      this.window(wx,y+level,front);
    }
    // A side window gives the building depth when walking around it.
    const sideWindow=new THREE.Group();
    const pane=new THREE.Mesh(new THREE.PlaneGeometry(.9,1.05),this.materials.dark);pane.rotation.y=Math.PI/2;pane.position.set(h.x+h.w/2+.015,y+1.65,h.z);sideWindow.add(pane);this.scene.add(sideWindow);
    for(const dz of [-.56,.56])this.box('trim',h.x+h.w/2+.05,y+1.65,h.z+dz,.2,1.42,.18);
    for(const dy of [-.64,.64])this.box('trim',h.x+h.w/2+.05,y+1.65+dy,h.z,.2,.18,1.3);
    if(h.id==='shop')this.sign('ARTES DE PESCA',h.x,y+2.78,front+.22,3.8,.55);
  }
  window(x,y,z){
    this.box('dark',x,y,z+.025,.95,1.16,.06);
    for(const sx of [-1,1]){
      this.box('trim',x+sx*.59,y,z+.09,.22,1.54,.24);
      this.box('wood',x+sx*.98,y,z+.11,.53,1.25,.075);
      for(let i=0;i<3;i++)this.box('wood',x+sx*.98-.17+i*.17,y,z+.16,.13,1.21,.035);
      for(const dy of [-.4,.4])this.box('iron',x+sx*.98,y+dy,z+.18,.48,.025,.025);
    }
    for(const dy of [-.7,.7])this.box('trim',x,y+dy,z+.11,1.42,.18,.34);
    this.box('wood',x,y,z+.10,.045,1.2,.08);this.box('wood',x,y,z+.10,1,.045,.08);
  }
  sign(text,x,y,z,w,h,textFace=4){
    const c=document.createElement('canvas');c.width=1024;c.height=160;const ctx=c.getContext('2d');
    ctx.fillStyle='#343c30';ctx.fillRect(0,0,1024,160);ctx.strokeStyle='#b3aa80';ctx.lineWidth=3;ctx.strokeRect(12,12,1000,136);
    ctx.fillStyle='#e3d6b1';ctx.font='58px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,512,80);
    const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;
    // BoxGeometry faces: 4 = +Z, 5 = -Z. Put the lettering on the
    // actual town-facing surface; keep board/post transforms untouched.
    const materials=Array(6).fill(this.materials.wood);materials[textFace]=new THREE.MeshStandardMaterial({map,roughness:.94});
    const sign=new THREE.Mesh(new THREE.BoxGeometry(w,h,.10),materials);sign.position.set(x,y,z);this.scene.add(sign);return sign;
  }
  details(){
    // Well with an open centre and irregular granite coping; no opaque cylinder.
    for(let row=0;row<3;row++)for(let i=0;i<12;i++){
      const a=(i+(row%2)*.5)*Math.PI/6,r=.69;
      this.box('granite',3.5+Math.sin(a)*r,villageHeight(3.5,3)+.13+row*.25,3+Math.cos(a)*r,.39,.23,.28,-a);
    }
    for(const b of [{x:5,z:7},{x:-4,z:9}]){
      const y=villageHeight(b.x,b.z);
      for(const sx of [-.85,.85])this.box('trim',b.x+sx,y+.23,b.z,.27,.46,.48);
      for(let i=0;i<3;i++)this.box('wood',b.x,y+.52,b.z+(i-1)*.16,2.2,.12,.14);
    }
    // Low field walls define the rural edge while leaving the central path open.
    for(const side of [-1,1])for(let i=0;i<28;i++){
      const z=-26+i*1.9,x=side*24.5,y=villageHeight(x,z);
      this.box('granite',x,y+.32,z,.5,.6,1.8);
      this.box('trim',x,y+.65,z,.65,.12,1.78);
    }
    // Irregular, inset granite paving at the centre: reused stone geometry/material.
    const rand=random(31);
    for(let x=-4;x<=4;x++)for(let z=-4;z<=4;z++){
      const px=x*.93+(rand()-.5)*.09,pz=z*1.05+(rand()-.5)*.09;
      this.box('trim',px,villageHeight(px,pz)-.01,pz,.82+rand()*.07,.045,.94, (rand()-.5)*.035);
    }
    this.sign('LAGO SERENO',1.8,villageHeight(1.8,28)+1.45,28,1.6,.32,5);
    this.box('wood',1.8,villageHeight(1.8,28)+.7,28,.10,1.4,.10);
  }
  finishBatches(){
    const dummy=new THREE.Object3D(),color=new THREE.Color(),rand=random(232);
    for(const [key,items]of this.batches){
      const m=new THREE.InstancedMesh(this.cube,this.materials[key],items.length);
      for(let i=0;i<items.length;i++){
        const b=items[i];dummy.position.set(b.x,b.y,b.z);dummy.scale.set(b.w,b.h,b.d);dummy.rotation.set(0,b.rotation,0);dummy.updateMatrix();m.setMatrixAt(i,dummy.matrix);
        color.setScalar(.86+rand()*.20);m.setColorAt(i,color);
      }
      m.castShadow=true;m.receiveShadow=true;this.scene.add(m);
    }
    const tiles=new THREE.InstancedMesh(tileGeometry(),this.materials.tile,this.tiles.length);
    for(let i=0;i<this.tiles.length;i++){
      const b=this.tiles[i];dummy.position.set(b.x,b.y,b.z);dummy.scale.set(1,1,1);dummy.rotation.set(0,0,b.rotation);dummy.updateMatrix();tiles.setMatrixAt(i,dummy.matrix);
      color.setRGB(.86+rand()*.14,.82+rand()*.15,.79+rand()*.16);tiles.setColorAt(i,color);
    }
    tiles.castShadow=true;tiles.receiveShadow=true;this.scene.add(tiles);
    this.batches.clear();this.tiles.length=0;
  }
  vegetation(world){
    const source=world.landscape.group.getObjectByName('vegetation-tree-2-near');
    // Per-instance shader attributes live on geometry: clone before seeding to
    // avoid overwriting the lake's instance buffers; materials/textures are shared.
    const dummy=new THREE.Object3D(),rand=random(128),color=new THREE.Color();
    this.plantDetail={value:1};const uniforms={time:world.landscape.clock,flow:world.landscape.wind,detail:this.plantDetail};
    for(const chestnut of [false,true]){
      const sites=VILLAGE_TREES.filter((_,i)=>(noise(i*9.7+8,3.2)>.6)===chestnut);
      const geometry=source.geometry.clone(),spread=chestnut?1.45:1.65;geometry.scale(spread,1,spread);
      const mat=vegetationMaterial(new THREE.MeshStandardMaterial({map:atlanticTreeTexture(chestnut),alphaTest:.43,side:THREE.DoubleSide,roughness:.95,color:0xc5d1bb,emissive:0x152317,emissiveIntensity:.14}),uniforms,VEGETATION_PROFILES.birch);
      const compileTree=mat.onBeforeCompile.bind(mat),treeKey=mat.customProgramCacheKey();
      mat.onBeforeCompile=shader=>{
        compileTree(shader);shader.vertexShader='attribute float villageTreeFrame;\n'+shader.vertexShader;
        shader.vertexShader=shader.vertexShader.replace('#include <uv_vertex>','#include <uv_vertex>\n#ifdef USE_MAP\nvMapUv.y=(clamp(vMapUv.y,.001,.999)+villageTreeFrame)*.5;\n#endif');
        // A soft sky-facing foliage normal avoids dark vertical card seams.
        shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_begin>','#include <normal_fragment_begin>\nnormal=normalize(normal*.3+(viewMatrix*vec4(0.,1.,0.,0.)).xyz*.7);');
      };
      mat.customProgramCacheKey=()=>`${treeKey}-village-crowns-v2`;
      const trees=new THREE.InstancedMesh(geometry,mat,sites.length);trees.name=chestnut?'village-chestnuts':'village-oaks';
      const frames=new Float32Array(sites.length);
      sites.forEach((t,i)=>{
        const v=villageTreeVariation(t,VILLAGE_TREES.indexOf(t));
        dummy.position.set(v.x,villageGroundHeight(v.x,v.z),v.z);dummy.rotation.set(0,v.yaw,v.lean);dummy.scale.set(v.height*v.width,v.height,v.height*v.depth);dummy.updateMatrix();trees.setMatrixAt(i,dummy.matrix);
        trees.setColorAt(i,color.setHSL(.20+rand()*.065,.10,.78+rand()*.19));
        frames[i]=v.frame;
      });
      geometry.setAttribute('villageTreeFrame',new THREE.InstancedBufferAttribute(frames,1));
      seedVegetationPhases(trees,VEGETATION_PROFILES.birch);padVegetationBounds(trees,VEGETATION_PROFILES.birch,14);this.scene.add(trees);
    }
    const grassSource=world.landscape.group.getObjectByName('vegetation-grass'),grass=new THREE.InstancedMesh(grassSource.geometry.clone(),grassSource.material,720);
    const site=fern=>{let x,z;do{x=-32+rand()*64;z=-28+rand()*60;}while(!villagePlantSite(x,z,fern)||rand()>(.25+noise(x*.18+7,z*.18)*.75));return {x,z};};
    for(let i=0;i<720;i++){
      const {x,z}=site(false),size=.2+rand()*.46;
      dummy.position.set(x,villageGroundHeight(x,z),z);dummy.rotation.set(0,rand()*Math.PI,0);dummy.scale.set(size*(1.1+rand()*.8),size,size*(1+rand()*.5));dummy.updateMatrix();grass.setMatrixAt(i,dummy.matrix);
      grass.setColorAt(i,color.setHSL(.20+rand()*.055,.12+rand()*.13,.66+rand()*.2));
    }
    seedVegetationPhases(grass,VEGETATION_PROFILES.grass);padVegetationBounds(grass,VEGETATION_PROFILES.grass,1);this.scene.add(grass);this.plants.push({mesh:grass,count:720});
    const fern=fernFronds(),fernMat=vegetationMaterial(new THREE.MeshStandardMaterial({map:fern.map,alphaTest:.4,side:THREE.DoubleSide,roughness:.95}),uniforms,VEGETATION_PROFILES.grass);
    const ferns=new THREE.InstancedMesh(fern.geometry,fernMat,80);ferns.name='village-ferns';
    for(let i=0;i<80;i++){
      const {x,z}=site(true),size=.48+rand()*.65;dummy.position.set(x,villageGroundHeight(x,z),z);dummy.rotation.set(0,rand()*6.28,0);dummy.scale.set(size*(.9+rand()*.3),size,size);dummy.updateMatrix();ferns.setMatrixAt(i,dummy.matrix);
      ferns.setColorAt(i,color.setHSL(.23,.1,.8+rand()*.2));
    }
    seedVegetationPhases(ferns,VEGETATION_PROFILES.grass);padVegetationBounds(ferns,VEGETATION_PROFILES.grass,1.2);this.scene.add(ferns);this.plants.push({mesh:ferns,count:80});
  }
  update(world,environment){
    const view=villageAtmosphere(world.environmentView.atmosphere,environment.daylight,environment.weather,this.atmosphere);
    const elapsed=this.lastEnvironmentTime===null?0:Math.max(0,environment.time-this.lastEnvironmentTime);
    this.wetness.value=advanceVillageWetness(this.wetness.value,environment.weather.rain,elapsed);this.lastEnvironmentTime=environment.time;
    this.ambient.color.copy(world.ambient.color);this.ambient.groundColor.copy(world.ambient.groundColor);
    this.ambient.groundColor.r+=view.groundLift*.8;this.ambient.groundColor.g+=view.groundLift;this.ambient.groundColor.b+=view.groundLift*.75;
    this.ambient.intensity=world.ambient.intensity*view.ambientScale;
    this.sun.color.copy(world.sun.color);this.sun.intensity=world.sun.intensity*view.sunScale;this.sun.position.copy(world.sunDirection).multiplyScalar(90);
    this.sun.shadow.intensity=view.shadowStrength;
    this.moon.color.copy(world.environmentView.moon.color);this.moon.intensity=world.environmentView.moon.intensity;this.moon.position.copy(world.sunDirection).multiplyScalar(-90);
    this.scene.environmentIntensity=view.reflection;
    this.scene.fog.color.copy(world.scene.fog.color);this.scene.fog.density=view.fogDensity;
    this.rain.visible=world.environmentView.rain.visible;
    const low=world.touchMode||!world.highQuality;
    this.plantDetail.value=low?0:1;
    for(const {mesh,count}of this.plants)mesh.count=low?Math.ceil(count*.6):count;
    if(this.lastQuality!==world.highQuality){this.sun.castShadow=world.highQuality;this.lastQuality=world.highQuality;world.renderer.shadowMap.needsUpdate=true;}
  }
}
