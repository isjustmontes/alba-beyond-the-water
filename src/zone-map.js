import {SHORE_PATH,FISHING_SPOTS,walkHeight} from './input/shore-route.js';
import {habitatDepth} from './simulation/lake-habitat.js';
import {VILLAGE_HOUSES} from './village-layout.js';
import {villagePathCover} from './visuals/village-ground.js';
import {ZONES} from './zones.js';

// Read the existing footprints; this map neither navigates nor changes the world.
export function zoneMapData(zoneId){
  const zone=ZONES[zoneId];if(!zone)throw new Error(`Unknown map zone: ${zoneId}`);
  const village=zoneId==='anglers-village';
  const points=village?[
    {name:'Plaza',x:0,z:0},
    {name:'ARTES DE PESCA',x:VILLAGE_HOUSES[0].x+1.65,z:VILLAGE_HOUSES[0].z+VILLAGE_HOUSES[0].d/2+1}
  ]:FISHING_SPOTS.map(({name,x,z})=>({name,x,z}));
  for(const exit of Object.values(zone.exits))points.push({name:exit.name,x:exit.x,z:exit.z});
  return {id:zoneId,name:zone.name,bounds:village?{minX:-28,maxX:28,minZ:-34,maxZ:36}:{minX:-88,maxX:88,minZ:-155,maxZ:82},points,paths:village?[]:[SHORE_PATH],buildings:village?VILLAGE_HOUSES:[]};
}

export function mapProjection(bounds,width,height,padding=30){
  const scale=Math.min((width-2*padding)/(bounds.maxX-bounds.minX),(height-2*padding)/(bounds.maxZ-bounds.minZ));
  const midX=(bounds.minX+bounds.maxX)/2,midZ=(bounds.minZ+bounds.maxZ)/2;
  return (x,z)=>({x:width/2+(x-midX)*scale,y:height/2+(z-midZ)*scale});
}

export const mapHeading=yaw=>({x:-Math.sin(yaw),y:-Math.cos(yaw)});
export function mapSurface(zoneId,x,z,obstacles=[]){
  if(zoneId==='anglers-village')return villagePathCover(x,z)>.28?'path':'land';
  if(habitatDepth(x,z,obstacles)>.05)return 'water';
  return walkHeight(x,z)!==null?'shore':'land';
}

export function renderZoneMap(canvas,{zoneId,x,z,yaw,obstacles=[]}){
  const data=zoneMapData(zoneId),ctx=canvas.getContext('2d'),{width,height}=canvas;
  const project=mapProjection(data.bounds,width,height),b=data.bounds;
  ctx.fillStyle='#122c28';ctx.fillRect(0,0,width,height);
  // A bounded coarse raster, drawn only when the paused map is opened.
  const cells=112,dx=(b.maxX-b.minX)/cells,dz=(b.maxZ-b.minZ)/cells;
  for(let row=0;row<cells;row++)for(let col=0;col<cells;col++){
    const wx=b.minX+col*dx,wz=b.minZ+row*dz,p=project(wx,wz),q=project(wx+dx,wz+dz);
    const surface=mapSurface(zoneId,wx+dx/2,wz+dz/2,obstacles);
    ctx.fillStyle={land:'#435d42',shore:'#71805a',path:'#ab9c76',water:'#286367'}[surface];ctx.fillRect(p.x,p.y,q.x-p.x+1,q.y-p.y+1);
  }
  ctx.strokeStyle='#d6c59b';ctx.lineWidth=3;
  for(const path of data.paths){ctx.beginPath();path.forEach(([x,z],i)=>{const p=project(x,z);if(i)ctx.lineTo(p.x,p.y);else ctx.moveTo(p.x,p.y);});ctx.stroke();}
  for(const h of data.buildings){const p=project(h.x-h.w/2,h.z-h.d/2),q=project(h.x+h.w/2,h.z+h.d/2);ctx.fillStyle='#938f7c';ctx.fillRect(p.x,p.y,q.x-p.x,q.y-p.y);ctx.strokeStyle='#e1d2ac';ctx.strokeRect(p.x,p.y,q.x-p.x,q.y-p.y);}
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 17px sans-serif';
  data.points.forEach((point,i)=>{
    const p=project(point.x,point.z);ctx.beginPath();ctx.arc(p.x,p.y,10,0,Math.PI*2);ctx.fillStyle='#e1d2ac';ctx.fill();ctx.fillStyle='#16352e';ctx.fillText(String(i+1),p.x,p.y);
  });
  const player=project(x,z),heading=mapHeading(yaw);
  // Forward at yaw zero is -Z, therefore up on this fixed-orientation map.
  ctx.save();ctx.translate(player.x,player.y);ctx.rotate(Math.atan2(heading.y,heading.x)+Math.PI/2);
  ctx.beginPath();ctx.moveTo(0,-17);ctx.lineTo(11,11);ctx.lineTo(0,6);ctx.lineTo(-11,11);ctx.closePath();ctx.fillStyle='#f6f0da';ctx.strokeStyle='#102824';ctx.lineWidth=3;ctx.fill();ctx.stroke();ctx.restore();
  ctx.fillStyle='#eadbb6';ctx.font='18px sans-serif';ctx.fillText('↑',width-30,17);
  return data;
}
