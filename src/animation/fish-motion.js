import {clamp} from './fishing-motion.js';
import {lakeDepth} from '../simulation/lake.js';
export function createFishMotion(agent){return {x:agent.position.x,y:agent.position.y,z:agent.position.z,lastX:agent.position.x,lastY:agent.position.y,lastZ:agent.position.z,speed:0,heading:agent.heading,pitch:0,bank:0,phase:agent.phase||0};}
export function updateFishMotion(m,agent,dt){
  if(dt<=0)return m;
  const p=agent.position,k=1-Math.exp(-dt*10),dx=p.x-m.lastX,dy=p.y-m.lastY,dz=p.z-m.lastZ;
  const speed=clamp(Math.hypot(dx,dy,dz)/dt,0,7),turn=Math.atan2(Math.sin(agent.heading-m.heading),Math.cos(agent.heading-m.heading));
  m.lastX=p.x;m.lastY=p.y;m.lastZ=p.z;m.speed+=(speed-m.speed)*k;
  m.x+=(p.x-m.x)*k;m.y+=(p.y-m.y)*k;m.z+=(p.z-m.z)*k;m.heading+=turn*(1-Math.exp(-dt*5));
  const desiredPitch=clamp(Math.atan2(dy,Math.max(.001,Math.hypot(dx,dz))),-.3,.3);
  m.pitch+=(desiredPitch-m.pitch)*(1-Math.exp(-dt*4));m.bank+=(clamp(-turn*.18,-.15,.15)-m.bank)*k;
  m.y=clamp(m.y,-Math.max(.25,lakeDepth(m.x,m.z)-.13),-.18);
  m.phase=(m.phase+dt*(2.2+m.speed*2.4))%(Math.PI*2);return m;
}
