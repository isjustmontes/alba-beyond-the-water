// Metres, shared by visible buildings and navigation. No renderer dependency.
export const VILLAGE_HOUSES=Object.freeze([
  Object.freeze({id:'shop',x:-10,z:-3,w:7,d:8,h:5.3,roof:2.1}),
  Object.freeze({id:'cottage',x:10,z:-5,w:7,d:6,h:3.3,roof:1.8}),
  Object.freeze({id:'farmhouse',x:-5,z:-21,w:8,d:6,h:4.8,roof:2})
]);
export const VILLAGE_TREES=Object.freeze(Array.from({length:38},(_,i)=>{
  const a=i*2.399963,r=29+(i%4)*3.2;
  return Object.freeze({x:Math.cos(a)*r,z:Math.sin(a)*r-2,height:6+(i%7)*.65});
}));
export const villageHeight=(x,z)=>1+.008*z+.07*Math.sin(x*.17)*Math.sin(z*.13);
export function nearVillageShop(x,z){
  const house=VILLAGE_HOUSES[0],front=house.z+house.d/2;
  return z>=front+.35&&Math.hypot(x-(house.x+1.65),z-(front+1))<=2.3;
}
export function villageWalkHeight(x,z){
  if(!Number.isFinite(x)||!Number.isFinite(z)||x< -23.5||x>23.5||z< -29||z>32)return null;
  for(const h of VILLAGE_HOUSES)if(Math.abs(x-h.x)<h.w/2+.35&&Math.abs(z-h.z)<h.d/2+.35)return null;
  // The stone well, benches and tree trunks have matching solid footprints.
  if(Math.hypot(x-3.5,z-3)<1.15)return null;
  for(const b of [{x:5,z:7},{x:-4,z:9}])if(Math.abs(x-b.x)<1.45&&Math.abs(z-b.z)<.65)return null;
  for(const t of VILLAGE_TREES)if(Math.hypot(x-t.x,z-t.z)<.65)return null;
  return villageHeight(x,z);
}
