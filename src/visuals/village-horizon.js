import * as THREE from 'three';
import {noise} from '../terrain-height.js';
import {villageGroundHeight,villagePathCover} from './village-ground.js';
import {seedVegetationPhases,padVegetationBounds,VEGETATION_PROFILES} from './vegetation-wind.js';

const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
const hills=[[-130,-160,12,100],[140,-190,17,120],[210,80,10,110],[-200,60,13,105],[10,240,9,140]];

export function villageHorizonHeight(x,z){
  const edge=Math.max(Math.abs(x),Math.abs(z)),base=villageGroundHeight(x,z);
  if(edge<84.5)return base;
  let rise=0;
  for(const [cx,cz,h,width]of hills)rise+=h*Math.exp(-((x-cx)**2+(z-cz)**2)/(width*width));
  // Match the existing square at the inner edge. Lower the far skirt behind
  // the rolling skyline so no finite ground cut is exposed against the sky.
  return base+.1+smooth(85,120,edge)*(rise+noise(x*.018+8,z*.018)*.7)-smooth(240,320,edge)*28;
}

export function villageHorizonTrees(count=360){
  let seed=71823;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;},sites=[];
  for(let attempts=0;sites.length<count&&attempts<30000;attempts++){
    const x=(rand()-.5)*470,z=(rand()-.5)*470,edge=Math.max(Math.abs(x),Math.abs(z));
    if(edge<105||noise(x*.024+19,z*.024)<.57)continue;
    sites.push({x,z,y:villageHorizonHeight(x,z),height:3.8+rand()*5.2,yaw:rand()*Math.PI*2,frame:rand()>.5?1:0,tint:.65+rand()*.17});
  }
  return sites;
}

export function makeVillageHorizon(groundMaterial,treeSources){
  const group=new THREE.Group();group.name='village-distant-landscape';
  const positions=[],colors=[],uv=[],indices=[],segments=128,rings=[80,82,85,90,105,130,155,185,220,260,290,320];
  const color=new THREE.Color(),grass=new THREE.Color(0x586c43),meadow=new THREE.Color(0x879062),soil=new THREE.Color(0x9e8c6e),woodland=new THREE.Color(0x415c45);
  for(const r of rings)for(let j=0;j<=segments;j++){
    const a=j/segments*Math.PI*2,dx=Math.cos(a),dz=Math.sin(a),factor=r/Math.max(Math.abs(dx),Math.abs(dz)),x=dx*factor,z=dz*factor;
    // Bury the inner edge beneath the existing mesh; overlap crosses back
    // above it before its boundary, hiding interpolation cracks at grazing angles.
    positions.push(x,villageHorizonHeight(x,z)-(r<85?.35*(1-smooth(80,85,r)):0),z);uv.push(.5+x/170,.5-z/170);
    color.copy(grass).lerp(meadow,noise(x*.27+6,z*.27)*.58).lerp(soil,villagePathCover(x,z)*(1-smooth(85,112,r)));
    color.multiplyScalar(.86+noise(x*.65,z*.65)*.09+noise(x*.10+8,z*.10)*.14);
    color.lerp(woodland,smooth(90,160,r)*smooth(.43,.75,noise(x*.024+19,z*.024))*.5);
    colors.push(color.r,color.g,color.b);
  }
  for(let ring=0;ring<rings.length-1;ring++)for(let j=0;j<segments;j++){
    const k=ring*(segments+1)+j,next=k+segments+1;indices.push(k,k+1,next,k+1,next+1,next);
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeVertexNormals();
  const material=new THREE.MeshStandardMaterial({map:groundMaterial.map,vertexColors:true,roughness:1});
  const terrain=new THREE.Mesh(geometry,material);terrain.name='village-distant-hills';group.add(terrain);
  const allSites=villageHorizonTrees(),dummy=new THREE.Object3D(),plants=[];
  for(let kind=0;kind<treeSources.length;kind++){
    const source=treeSources[kind],sites=allSites.filter((_,i)=>i%treeSources.length===kind),geo=source.geometry.clone();
    const trees=new THREE.InstancedMesh(geo,source.material,sites.length),frames=new Float32Array(sites.length);trees.name=`village-distant-grove-${kind}`;
    sites.forEach((s,i)=>{
      dummy.position.set(s.x,s.y,s.z);dummy.scale.set(s.height*(.85+noise(s.x,s.z)*.3),s.height,s.height);dummy.rotation.set(0,s.yaw,0);dummy.updateMatrix();trees.setMatrixAt(i,dummy.matrix);
      trees.setColorAt(i,color.setRGB(s.tint*.90,s.tint,s.tint*.92));frames[i]=s.frame;
    });
    geo.setAttribute('villageTreeFrame',new THREE.InstancedBufferAttribute(frames,1));seedVegetationPhases(trees,VEGETATION_PROFILES.birch);padVegetationBounds(trees,VEGETATION_PROFILES.birch,10);
    group.add(trees);plants.push({mesh:trees,count:sites.length});
  }
  return {group,plants};
}
