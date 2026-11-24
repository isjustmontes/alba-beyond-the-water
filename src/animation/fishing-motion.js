// Shared visual timing, independent of Three.js and input devices.
export const CAST_TIMING=Object.freeze({loadEnd:.12,release:.32,followThrough:.53,impact:1.1,settle:1.55});
export const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
const lerp=(a,b,t)=>a+(b-a)*t;
function hermite(a,b,va,vb,t,duration){const t2=t*t,t3=t2*t;return (2*t3-3*t2+1)*a+(t3-2*t2+t)*duration*va+(-2*t3+3*t2)*b+(t3-t2)*duration*vb;}
export class DampedSpring {
  constructor(value=0,frequency=18,damping=.82){this.value=value;this.velocity=0;this.frequency=frequency;this.damping=damping;}
  update(dt,target){
    let remaining=clamp(dt,0,.25);
    while(remaining>1e-8){const h=Math.min(remaining,1/120);this.velocity+=((target-this.value)*this.frequency**2-2*this.damping*this.frequency*this.velocity)*h;this.value+=this.velocity*h;remaining-=h;}
    return this.value;
  }
}
export function castPose(elapsed,power=0,preparation=1,out={}){
  const c=CAST_TIMING,loaded=lerp(.04,1.28,smooth(preparation)),t=Math.max(0,elapsed);
  out.phase=t<c.loadEnd ? 'load' : t<c.release ? 'acceleration' : t<c.followThrough ? 'follow-through' : t<c.settle ? 'recovery' : 'settled';
  if(t<c.loadEnd)out.pitch=lerp(loaded,1.28,smooth(t/c.loadEnd));
  else if(t<c.release)out.pitch=hermite(1.28,.48,0,-7.5,(t-c.loadEnd)/(c.release-c.loadEnd),c.release-c.loadEnd);
  else if(t<c.followThrough)out.pitch=hermite(.48,-.16,-7.5,0,(t-c.release)/(c.followThrough-c.release),c.followThrough-c.release);
  else out.pitch=lerp(-.16,.04,smooth((t-c.followThrough)/.65))+Math.sin((t-c.followThrough)*23)*Math.exp(-(t-c.followThrough)*6)*.025*smooth((t-c.followThrough)/.08);
  const energy=.35+power*.65;
  if(t<c.release)out.load=energy*(.06+.17*Math.sin(clamp((t-c.loadEnd)/.2,0,1)*Math.PI*.85));
  else out.load=-.065*energy*Math.exp(-(t-c.release)*7)*Math.sin((t-c.release)*23);
  const recoil=Math.exp(-Math.max(0,t-c.release)*7);
  out.yaw=.055*recoil;out.roll=-.035*recoil;out.released=t>=c.release;return out;
}
export function rodPose(game,out={}){
  const t=game.time,state=game.state;
  out.pitch=.04+Math.sin(t*.85)*.007;out.yaw=0;out.roll=Math.sin(t*.9)*.005;out.load=.006;out.phase='idle';
  if(state==='charging'){
    const preparation=smooth((game.chargeTime||0)/.42);out.pitch=lerp(.04,1.28,preparation);out.load=preparation*(.04+game.power*.07);out.yaw=.055*preparation;out.roll=-.035*preparation;out.phase='preparation';
  }else if(state==='casting'||(state==='waiting'&&t-game.castStartedAt<CAST_TIMING.settle))castPose(t-game.castStartedAt,game.power,game.castPreparation,out);
  else if(state==='fighting'){out.phase='fight';out.pitch=.05+game.tension*.11;out.yaw=Math.sin(game.fightHeading-game.baseHeading)*.15;out.roll=Math.sin(t*5)*.006*game.tension;out.load=game.tension*(.53+Math.sin(t*7)*.018);}
  else if(state==='bite'){out.phase='bite';out.load=.055+Math.sin(t*22)*.016;out.pitch+=Math.sin(t*18)*.006;}
  else if(state==='caught'){out.phase='catch';out.pitch=.16;out.load=.035;}
  else if(game.reeling){out.phase='retrieve';out.load=.018+Math.sin(t*6)*.006;out.pitch+=.015;}
  return out;
}
// Endpoint-constrained ballistic arc: launch above water, forward from the real rod tip.
export function castFlight(start,end,progress,power,out={}){
  const u=clamp(progress,0,1),lift=1.6+clamp(power,0,1)*2.1;
  if(u===0||u===1){const p=u===0 ? start : end;out.x=p.x;out.y=p.y;out.z=p.z;return out;}
  out.x=lerp(start.x,end.x,u);out.z=lerp(start.z,end.z,u);
  out.y=lerp(start.y,end.y,u)+4*lift*u*(1-u);return out;
}
export function linePoint(start,end,f,{tension=0,windX=0,windZ=0,time=0,casting=false},out={}){
  if(f<=0){out.x=start.x;out.y=start.y;out.z=start.z;return out;}
  if(f>=1){out.x=end.x;out.y=end.y;out.z=end.z;return out;}
  const length=Math.hypot(end.x-start.x,end.y-start.y,end.z-start.z),envelope=Math.sin(f*Math.PI);
  const slack=casting ? .12 : Math.min(1.5,length*.035)*(1-clamp(tension,0,1))**2+.025;
  const breeze=(1-clamp(tension,0,1))**2*envelope*Math.min(1,length*.05)*.025;
  out.x=lerp(start.x,end.x,f)+windX*breeze;out.z=lerp(start.z,end.z,f)+windZ*breeze;
  out.y=lerp(start.y,end.y,f)-envelope*slack+Math.sin(time*2.2+f*5)*breeze;
  // The line can touch the surface; it must not sag metres below the water.
  if(start.y>=0&&end.y>=0)out.y=Math.max(.015,out.y);return out;
}
export function jumpHeight(age,duration=1){return age<=0||age>=duration ? 0 : Math.sin(age/duration*Math.PI)**2;}
export function canJump(game){return [0,2].includes(game.target?.speciesIndex)&&game.fightTime>4&&game.stamina>.28&&game.tension>.18&&game.tension<.88&&(game.pullCount+game.hookedId)%3===0;}
