import {terrainHeight} from '../terrain-height.js';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const smooth=(v)=>{const t=clamp(v,0,1);return t*t*(3-2*t);};
export const SHORE_PATH=[[0,13],[0,17],[-6,20],[0,23],[6,20],[3,32],[4,48],[5,66],[6,76]];
export const FISHING_SPOTS=[
  {id:'dock',name:'Muelle',x:0,z:7,yaw:0,look:.8,originX:0,originZ:4},
  {id:'willows',name:'Ribera oeste',x:-6,z:20,yaw:0,look:Math.PI,originX:-6,originZ:17},
  {id:'reeds',name:'Cala de juncos',x:6,z:20,yaw:0,look:Math.PI,originX:6,originZ:17}
];
export function pathDistance(x,z){
  let best=Infinity;
  for(let i=1;i<SHORE_PATH.length;i++){
    const [ax,az]=SHORE_PATH[i-1],[bx,bz]=SHORE_PATH[i],dx=bx-ax,dz=bz-az;
    const t=clamp(((x-ax)*dx+(z-az)*dz)/(dx*dx+dz*dz),0,1);
    best=Math.min(best,Math.hypot(x-ax-t*dx,z-az-t*dz));
  }
  return best;
}
export const shoreCenter=z=>(z-13)*.06;
export const shoreWidth=z=>3.8+20*smooth((z-12)/20);
export function shoreHeight(x,z){
  const cross=Math.abs(x-shoreCenter(z))/shoreWidth(z);
  const crown=.78+.65*smooth((z-14)/50);
  const bank=-.38+(crown+.38)*smooth((z-10)/3)*(1-smooth((cross-.67)/.33));
  // Merge into the existing terrain above the water, including its actual slope.
  return Math.max(bank,terrainHeight(x,z)+.018);
}
export function walkHeight(x,z,obstacles=[]){
  if(Math.abs(x)<=2.1&&z>=2.01&&z<=13.39)return .78;
  if(z<12.8||z>77.3||Math.abs(x-shoreCenter(z))>shoreWidth(z)-.3)return null;
  for(const obstacle of obstacles){
    if(obstacle.mesh&&obstacle.index>=obstacle.mesh.count)continue;
    if(Math.hypot(x-obstacle.x,z-obstacle.z)<obstacle.radius+.3)return null;
  }
  const height=shoreHeight(x,z);
  // The whole visible dry bank is walkable; retain a body-radius water margin.
  if(height<=.35)return null;
  for(const [dx,dz]of [[.3,0],[-.3,0],[0,.3],[0,-.3]])if(shoreHeight(x+dx,z+dz)<=.22)return null;
  return height;
}
export function nearestSpot(x,z){
  let spot=FISHING_SPOTS[0],distance=Infinity;
  for(const candidate of FISHING_SPOTS){const d=Math.hypot(x-candidate.x,z-candidate.z);if(d<distance){spot=candidate;distance=d;}}
  return {spot,distance};
}
export function atSpot(x,z){
  const found=nearestSpot(x,z);
  if(found.spot.id==='dock')return found.distance<=.18?found.spot:null;
  return found.distance<=4&&walkHeight(x,z)!==null?found.spot:null;
}
