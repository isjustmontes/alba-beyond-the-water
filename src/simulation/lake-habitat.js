import {lakeDepth} from './lake.js';
import {shoreHeight,shoreWidth,shoreCenter} from '../input/shore-route.js';

// Simulation-only footprint. Rock ellipses are supplied from the actual landscape.
export function habitatDepth(x,z,obstacles=[]){
  if(Math.hypot(x/82,(z+42)/108)>.98)return 0;
  let depth=lakeDepth(x,z);
  if(z>=10&&z<=82&&Math.abs(x-shoreCenter(z))<=shoreWidth(z))depth=Math.min(depth,-shoreHeight(x,z));
  for(const o of obstacles)if(((x-o.x)/o.rx)**2+((z-o.z)/o.rz)**2<1)return 0;
  return Math.max(0,depth);
}
export const fishWater=(x,z,obstacles=[])=>habitatDepth(x,z,obstacles)>.5;

export function fishHome(id,random,obstacles=[]){
  for(let attempt=0;attempt<48;attempt++){
    let x,z;
    if(id%3===0&&attempt===0){const n=Math.floor(id/3);x=(n%3-1)*6+(random()-.5)*3;z=-7-Math.floor(n/3)*11+(random()-.5)*3;}
    else if(id%9>=7||attempt>20){const offset=(id*.61803398875)%1-.5;x=(random()-.5)*90+offset*18;z=-50-random()*60-offset*20;}
    else{z=14+Math.floor(id/3)*4.3+(random()-.5)*5;x=(id%3===1?-1:1)*(shoreWidth(z)+4+random()*7);}
    if(fishWater(x,z,obstacles))return {x,z};
  }
  // A constant RNG must still get a valid, deterministic home.
  for(let i=0;i<80;i++){
    const a=(id+i)*2.399963,x=Math.cos(a)*45,z=-45+Math.sin(a)*55;
    if(fishWater(x,z,obstacles))return {x,z};
  }
  return {x:0,z:-60};
}
