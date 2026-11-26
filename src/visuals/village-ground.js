import {villageHeight,VILLAGE_HOUSES} from '../village-layout.js';
import {noise} from '../terrain-height.js';

const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
const segmentDistance=(x,z,ax,az,bx,bz)=>{
  const dx=bx-ax,dz=bz-az,t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/(dx*dx+dz*dz)));
  return Math.hypot(x-ax-t*dx,z-az-t*dz);
};

// Visual banks only: retain the exact existing walking height throughout the
// navigable rectangle, including its corners (the old radial rise did not).
export function villageGroundHeight(x,z){
  const outside=Math.max(Math.abs(x)-24, -29.5-z,z-32.5,0);
  return villageHeight(x,z)+smooth(0,8,outside)*(.35+noise(x*.08,z*.08)*1.3)+Math.max(0,outside-12)*.045;
}

export function villagePathCover(x,z){
  const edge=(noise(x*.39+5,z*.39)-.5)*.65;
  const main=Math.abs(x-Math.sin(z*.09)*1.1);
  const entry=z> -15?1-smooth(1.35,2.9,main+edge):0;
  const plaza=1-smooth(.78,1.35,x*x/48+z*z/95+edge*.09);
  const shop=1-smooth(.8,1.9,segmentDistance(x,z,-.4,4,-8.35,2.4)+edge);
  const cottage=1-smooth(.65,1.7,segmentDistance(x,z,1,1,10,-.8)+edge);
  const farm=1-smooth(.7,1.8,segmentDistance(x,z,0,-12,-5,-17.5)+edge);
  return Math.max(entry,plaza,shop,cottage,farm);
}

// Low groundcover has no collision. Keep every entrance, sign and solid object
// clear rather than introducing invisible obstacles or narrowing the route.
export function villagePlantSite(x,z,fern=false){
  if(Math.abs(x)>32||z< -28||z>32||villagePathCover(x,z)>.12)return false;
  for(const h of VILLAGE_HOUSES)if(Math.abs(x-h.x)<h.w/2+1.35&&Math.abs(z-h.z)<h.d/2+1.5)return false;
  for(const [cx,cz,r]of [[3.5,3,2],[5,7,2],[-4,9,2],[1.8,28,2.4]])if(Math.hypot(x-cx,z-cz)<r)return false;
  // Avoid the existing low field walls; vegetation can grow on either side.
  if(Math.abs(Math.abs(x)-24.5)<.6)return false;
  const patch=noise(x*.31+18,z*.31-4);
  return patch>(fern?.46:.28)&&(!fern||Math.abs(x)>12);
}
