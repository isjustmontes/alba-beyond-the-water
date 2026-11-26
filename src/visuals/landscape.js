import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import {VEGETATION_PROFILES,vegetationMaterial,padVegetationBounds,seedVegetationPhases} from './vegetation-wind.js';
import {shorelineMaterial} from './atmosphere.js';
import {noise,fbm,terrainHeight} from '../terrain-height.js';
import {SHORE_PATH,pathDistance,shoreCenter,shoreWidth,shoreHeight} from '../input/shore-route.js';
export {terrainHeight} from '../terrain-height.js';

const smooth=(a,b,x)=>THREE.MathUtils.smoothstep(x,a,b);

export function shoreGeometry(){
  const positions=[],colors=[],uvs=[],indices=[],rows=144,columns=40;
  for(let i=0;i<=rows;i++){
    const z=10+i*.5,center=shoreCenter(z),width=shoreWidth(z);
    for(let j=0;j<=columns;j++){
      const x=center+(j/columns*2-1)*width,y=shoreHeight(x,z),trail=1-THREE.MathUtils.smoothstep(pathDistance(x,z),.65,1.8);
      positions.push(x,y,z);uvs.push(x*.055,z*.055);
      const color=new THREE.Color().setRGB(.20+trail*.18,.29+trail*.025,.12+trail*.055).multiplyScalar(.88+noise(x*.6,z*.6)*.24);colors.push(color.r,color.g,color.b);
      if(i<rows&&j<columns){const a=i*(columns+1)+j;indices.push(a,a+columns+1,a+1,a+1,a+columns+1,a+columns+2);}
    }
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
  geo.setIndex(indices);geo.computeVertexNormals();return geo;
}

function stoneTexture() {
  const size=256,data=new Uint8ClampedArray(size*size*4);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++) {
    const n=fbm(x*.07,y*.07),grain=noise(x*1.23,y*1.23),vein=Math.abs(Math.sin(x*.08+y*.15+n*14));
    const value=82+n*116+grain*28+(vein>.97 ? -27 : 0),i=(y*size+x)*4;
    data[i]=value;data[i+1]=value;data[i+2]=value;data[i+3]=255;
  }
  const c=document.createElement('canvas');c.width=c.height=size;c.getContext('2d').putImageData(new ImageData(data,size,size),0,0);
  const tex=new THREE.CanvasTexture(c);tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.anisotropy=4;return tex;
}

export function terrainGeometry(angles,rings) {
  const positions=[],uvs=[],indices=[];
  for(let r=0;r<=rings;r++)for(let a=0;a<=angles;a++) {
    const radius=1+Math.pow(r/rings,1.55)*3.9,angle=a/angles*Math.PI*2;
    const x=Math.cos(angle)*82*radius,z=-42+Math.sin(angle)*108*radius;
    positions.push(x,terrainHeight(x,z),z);uvs.push(x*.055,z*.055);
    if(r<rings && a<angles){const i=r*(angles+1)+a;indices.push(i,i+1,i+angles+1,i+1,i+angles+2,i+angles+1);}
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geo.setIndex(indices);geo.computeVertexNormals();
  const colors=[],pos=geo.attributes.position,normals=geo.attributes.normal;
  const grass=new THREE.Color(0x526448),stone=new THREE.Color(0x85877d),snow=new THREE.Color(0xd8dedb);
  for(let i=0;i<pos.count;i++) {
    const h=pos.getY(i),slope=1-Math.abs(normals.getY(i));
    const exposed=Math.max(smooth(15,48,h)*.7,smooth(.12,.55,slope));
    const color=grass.clone().lerp(stone,exposed);
    const snowline=55+noise(pos.getX(i)*.06,pos.getZ(i)*.06)*9;
    color.lerp(snow,smooth(snowline,snowline+8,h)*(1-smooth(.2,.65,slope)));
    color.multiplyScalar(.88+fbm(pos.getX(i)*.12,pos.getZ(i)*.12)*.3);
    colors.push(color.r,color.g,color.b);
  }
  geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));return geo;
}

function treeTexture(kind,rand) {
  const c=document.createElement('canvas');c.width=256;c.height=512;
  const ctx=c.getContext('2d');
  ctx.strokeStyle=kind===2 ? '#b6b4a1' : '#5c523e';ctx.lineWidth=kind===2 ? 5 : 4;
  ctx.beginPath();ctx.moveTo(128,512);ctx.lineTo(127,kind===2 ? 58 : 18);ctx.stroke();
  const greens=kind===1 ? ['#243f38','#3a5544','#56705a','#738763'] : ['#243d2b','#3e5836','#5e7645','#81945a'];
  if(kind===2) {
    for(let i=0;i<16;i++) {
      const y=95+i*23,dx=(i%2 ? 1 : -1)*(30+rand()*55);
      ctx.strokeStyle='#6d6a51';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(128,y+60);ctx.lineTo(128+dx,y-28);ctx.stroke();
    }
    for(let i=0;i<2900;i++) {
      const clusters=[[100,100],[153,130],[127,64],[171,192],[86,201],[144,245],[116,288]];
      const [cx,cy]=clusters[i%clusters.length],a=rand()*Math.PI*2,r=Math.sqrt(rand()),x=cx+Math.cos(a)*r*43,y=cy+Math.sin(a)*r*62;
      ctx.fillStyle=greens[Math.floor(rand()*4)];ctx.beginPath();ctx.ellipse(x,y,2+rand()*5,1.5+rand()*3,rand()*3,0,Math.PI*2);ctx.fill();
    }
    ctx.fillStyle='#565f50';for(let i=0;i<18;i++)ctx.fillRect(125,250+i*14,2+rand()*4,2);
  } else {
    for(let level=0;level<40;level++) {
      const f=level/40,y=30+f*430,wide=Math.pow(f,.73)*107*(kind===1 ? .76 : 1);
      for(const side of [-1,1]) {
        const length=wide*(.68+rand()*.35),drop=12+f*12;
        ctx.strokeStyle='#514f36';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(128,y-9);ctx.lineTo(128+side*length,y+drop);ctx.stroke();
        for(let twig=0;twig<26;twig++) {
          const along=twig/26,x=128+side*length*along,yy=y+drop*along;
          for(let needle=0;needle<8;needle++) {
            const angle=rand()*Math.PI*2,reach=4+rand()*9;
            ctx.strokeStyle=greens[Math.floor(rand()*4)];ctx.lineWidth=1.3+rand();
            ctx.beginPath();ctx.moveTo(x,yy);ctx.lineTo(x+Math.cos(angle)*reach,yy+Math.sin(angle)*reach*.55);ctx.stroke();
          }
        }
      }
    }
  }
  const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=4;return tex;
}

function crossedCards(count,distant=false) {
  const planes=[];
  for(let i=0;i<count;i++) {const p=new THREE.PlaneGeometry(.55,1,1,distant ? 1 : 2);p.translate(0,.5,0);p.rotateY(i*Math.PI/count);planes.push(p);}
  const geo=mergeGeometries(planes);planes.forEach(p=>p.dispose());return geo;
}

export function makeLandscape(rand) {
  const group=new THREE.Group(),clock={value:0},wind={value:new THREE.Vector2(1.1,0)},detail={value:1},rain={value:0},texture=stoneTexture();
  const uniforms={time:clock,flow:wind,detail};
  const terrainMat=new THREE.MeshStandardMaterial({map:texture,bumpMap:texture,bumpScale:.24,vertexColors:true,roughness:1});
  terrainMat.onBeforeCompile=shader=>{
    shader.vertexShader='varying vec3 vLandPosition; varying vec3 vLandNormal;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvLandPosition=position;vLandNormal=normal;');
    shader.fragmentShader='varying vec3 vLandPosition; varying vec3 vLandNormal;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',/* glsl */`
      vec3 blend=pow(abs(normalize(vLandNormal)),vec3(4.));blend/=max(.001,blend.x+blend.y+blend.z);
      vec3 stone=texture2D(map,vLandPosition.yz*.07).rgb*blend.x+texture2D(map,vLandPosition.xz*.07).rgb*blend.y+texture2D(map,vLandPosition.xy*.07).rgb*blend.z;
      diffuseColor.rgb*=mix(vec3(.64),vec3(1.34),stone);`);
  };
  terrainMat.customProgramCacheKey=()=> 'alba-triplanar-terrain-v1';
  shorelineMaterial(terrainMat,rain);
  const terrainHigh=new THREE.Mesh(terrainGeometry(256,64),terrainMat),terrainLow=new THREE.Mesh(terrainGeometry(128,32),terrainMat);
  terrainHigh.receiveShadow=true;terrainLow.receiveShadow=true;terrainLow.visible=false;group.add(terrainHigh,terrainLow);
  const shore=new THREE.Mesh(shoreGeometry(),terrainMat);shore.name='walkable-shore';shore.receiveShadow=true;group.add(shore);
  const walkObstacles=[],waterObstacles=[],castSurfaces=[terrainHigh,terrainLow,shore];
  const treeGroups=[];
  for(let kind=0;kind<3;kind++) {
    const profile=VEGETATION_PROFILES[['pine','spruce','birch'][kind]];
    const mat=vegetationMaterial(new THREE.MeshStandardMaterial({map:treeTexture(kind,rand),alphaTest:.43,side:THREE.DoubleSide,roughness:.95,color:0xc5d1bb,emissive:0x152317,emissiveIntensity:.14}),uniforms,profile);
    const positions=[],count=kind===0 ? 410 : kind===1 ? 190 : 150;
    for(let i=0;i<count;i++) {
      const a=rand()*Math.PI*2,r=1.018+Math.pow(rand(),1.5)*.35;
      let x=Math.cos(a)*82*r,z=-42+Math.sin(a)*108*r;
      if(i<8){z=25+i*6;const side=i%2?1:-1;x=shoreCenter(z)+side*shoreWidth(z)*.70;}
      const clearX=z>12&&z<82&&pathDistance(x,z)<3 ? x+(x<shoreCenter(z)?-4:4) : x;
      positions.push({x:clearX,z,y:i<8?shoreHeight(clearX,z):terrainHeight(clearX,z),height:kind===2 ? 4+rand()*6 : 5+rand()*8,angle:rand()*Math.PI});
    }
    for(const distant of [false,true]) {
      const trees=positions.filter(p=>(Math.hypot(p.x,p.z-7)>155)===distant).sort((a,b)=>Math.hypot(a.x,a.z-7)-Math.hypot(b.x,b.z-7));
      const instanced=new THREE.InstancedMesh(crossedCards(distant ? 2 : 3,distant),mat,trees.length),dummy=new THREE.Object3D();
      instanced.name=`vegetation-tree-${kind}-${distant ? 'far' : 'near'}`;
      trees.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.scale.set(p.height,p.height,p.height);dummy.rotation.y=p.angle;dummy.updateMatrix();instanced.setMatrixAt(i,dummy.matrix);instanced.setColorAt(i,new THREE.Color().setHSL(.23+rand()*.08,.06,.75+rand()*.2));
        if(p.z>12&&p.z<80&&Math.abs(p.x-shoreCenter(p.z))<shoreWidth(p.z)+2)walkObstacles.push({x:p.x,z:p.z,y:p.y,height:p.height,radius:.45,mesh:instanced,index:i,tree:true});
      });
      seedVegetationPhases(instanced,profile);padVegetationBounds(instanced,profile,kind===2 ? 10 : 13);group.add(instanced);treeGroups.push({mesh:instanced,total:trees.length,distant});
    }
  }
  const rockGeo=new THREE.SphereGeometry(1,14,10),pos=rockGeo.attributes.position;
  for(let i=0;i<pos.count;i++) {
    const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i),r=.9+noise(x*4+9,z*4+y)*.24;
    pos.setXYZ(i,x*r,y*r,z*r);
  }
  rockGeo.computeVertexNormals();
  const rockMat=shorelineMaterial(new THREE.MeshStandardMaterial({map:texture,bumpMap:texture,bumpScale:.17,color:0x858a76,roughness:.96}),rain);
  const rocks=new THREE.InstancedMesh(rockGeo,rockMat,130),dummy=new THREE.Object3D(),reedSites=[];
  for(let i=0;i<130;i++) {
    let x,z,y,size;
    if(i<24) {
      const side=i%2 ? 1 : -1;x=side*(12+rand()*12);z=-8-rand()*27;y=-.45;size=1+rand()*2.1;
      reedSites.push({x,z,y:.05});
    } else {
      const a=rand()*Math.PI*2,r=1.003+rand()*.037;x=Math.cos(a)*82*r;z=-42+Math.sin(a)*108*r;y=terrainHeight(x,z);size=.5+rand()*1.5;
      reedSites.push({x,z,y:y+.25});
    }
    if(z>12&&z<82&&pathDistance(x,z)<size+2){x+=x<shoreCenter(z)?-size-4:size+4;y=terrainHeight(x,z);}
    dummy.position.set(x,y,z);dummy.scale.set(size,.5+size*.5,size*.8);dummy.rotation.set(rand()*.2,rand()*Math.PI,rand()*.15);dummy.updateMatrix();rocks.setMatrixAt(i,dummy.matrix);
    waterObstacles.push({x,z,rx:size*1.2+.4,rz:size*1.2+.4});
    if(z>12&&z<80)walkObstacles.push({x,z,y,height:size+1,radius:size*1.14,mesh:rocks,index:i});
    rocks.setColorAt(i,new THREE.Color().setHSL(.17+rand()*.05,.09,.55+rand()*.25));
  }
  rocks.receiveShadow=true;rocks.castShadow=true;group.add(rocks);
  castSurfaces.push(rocks);
  // Raised, mossy foreground banks keep the casting corridor open.
  for(const side of [-1,1]) {
    const bank=new THREE.Mesh(rockGeo,shorelineMaterial(new THREE.MeshStandardMaterial({map:texture,bumpMap:texture,bumpScale:.3,color:0x63724a,roughness:1}),rain));
    bank.position.set(side*23,-.8,-4);bank.scale.set(12,1.1,23);bank.receiveShadow=true;group.add(bank);
    waterObstacles.push({x:bank.position.x,z:bank.position.z,rx:13.5,rz:25.5});
    castSurfaces.push(bank);
  }
  const blade=new THREE.PlaneGeometry(.045,.9,1,4),bp=blade.attributes.position;
  blade.translate(0,.45,0);
  for(let i=0;i<bp.count;i++)bp.setX(i,bp.getX(i)+Math.pow(bp.getY(i),2)*.23);
  blade.computeVertexNormals();
  const blades=[];for(let i=0;i<3;i++){const b=blade.clone();b.rotateY(i*Math.PI/3);blades.push(b);}
  const grassGeo=mergeGeometries(blades);blades.forEach(b=>b.dispose());blade.dispose();
  const grassMat=vegetationMaterial(new THREE.MeshStandardMaterial({color:0x7b8e55,side:THREE.DoubleSide,roughness:1}),uniforms,VEGETATION_PROFILES.grass);
  const grass=new THREE.InstancedMesh(grassGeo,grassMat,1800);
  grass.name='vegetation-grass';
  for(let i=0;i<1800;i++) {
    const site=reedSites[i%reedSites.length],a=rand()*Math.PI*2,r=rand()*1.35;
    if(i<240){
      let z=15+i/239*63;const side=i%2?1:-1;let x=shoreCenter(z)+side*shoreWidth(z)*(.73+rand()*.14);
      if(i<120){
        const t=i/119*(SHORE_PATH.length-1),segment=Math.min(SHORE_PATH.length-2,Math.floor(t)),u=t-segment;
        const [ax,az]=SHORE_PATH[segment],[bx,bz]=SHORE_PATH[segment+1],length=Math.hypot(bx-ax,bz-az),offset=side*2.1;
        x=ax+(bx-ax)*u-(bz-az)/length*offset;z=az+(bz-az)*u+(bx-ax)/length*offset;
      }
      dummy.position.set(x,shoreHeight(x,z),z);
    }else dummy.position.set(site.x+Math.cos(a)*r,site.y,site.z+Math.sin(a)*r);
    dummy.scale.setScalar(.45+rand()*1.1);dummy.rotation.set(0,rand()*Math.PI,0);dummy.updateMatrix();grass.setMatrixAt(i,dummy.matrix);
    grass.setColorAt(i,new THREE.Color().setHSL(.17+rand()*.10,.22+rand()*.2,.35+rand()*.2));
  }
  seedVegetationPhases(grass,VEGETATION_PROFILES.grass);padVegetationBounds(grass,VEGETATION_PROFILES.grass,1.55);group.add(grass);
  // Existing seed heads gain a lightweight stem, merged into the same draw call.
  const reedHead=new THREE.CapsuleGeometry(.035,.19,3,5);reedHead.translate(0,1,0);
  const reedStem=new THREE.CylinderGeometry(.008,.012,1,4,2);reedStem.translate(0,.5,0);
  const reedGeometry=mergeGeometries([reedHead,reedStem]);reedHead.dispose();reedStem.dispose();
  const reeds=new THREE.InstancedMesh(reedGeometry,vegetationMaterial(new THREE.MeshStandardMaterial({color:0x685333,roughness:1}),uniforms,VEGETATION_PROFILES.reed),160);
  reeds.name='vegetation-reeds';
  for(let i=0;i<160;i++) {
    const site=reedSites[i%24],x=site.x+(rand()-.5),height=.8+rand()*.35,z=site.z+(rand()-.5),width=.7+rand()*.4;
    dummy.position.set(x,site.y,z);dummy.scale.set(width,height,width);dummy.rotation.set(0,0,(rand()-.5)*.2);dummy.updateMatrix();reeds.setMatrixAt(i,dummy.matrix);
  }
  seedVegetationPhases(reeds,VEGETATION_PROFILES.reed);padVegetationBounds(reeds,VEGETATION_PROFILES.reed,1.15);group.add(reeds);
  return {group,clock,wind,rain,walkObstacles,waterObstacles,castSurfaces,counts:{trees:750,rocks:130,grass:1800},setQuality(high) {
    detail.value=high ? 1 : 0;
    terrainHigh.visible=high;terrainLow.visible=!high;
    for(const {mesh,total,distant} of treeGroups)mesh.count=high ? total : Math.ceil(total*(distant ? .55 : .8));
    grass.count=high ? 1800 : 1000;reeds.count=high ? 160 : 90;
  }};
}
