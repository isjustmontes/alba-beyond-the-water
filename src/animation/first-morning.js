export const INTRO_DURATION=12;
export const INTRO_HANDOFF=.65;
const clamp=v=>Math.max(0,Math.min(1,v));
const smooth=v=>{const t=clamp(v);return t*t*t*(t*(t*6-15)+10);};
const fields=['x','y','z','yaw','pitch'];

// Presentation only: no storage, zone activation or player-spawn decisions.
export class FirstMorningTimeline {
  constructor(target){
    this.target={...target};this.pose={...target};this.from={...target};
    this.startPose={x:1.4,y:7.8,z:24,yaw:.12,pitch:-.24};
    this.state='inactive';this.elapsed=0;this.exitElapsed=0;
  }
  get active(){return this.state==='presenting'||this.state==='handing-off';}
  start({reducedMotion=false}={}){
    if(this.state!=='inactive')return false;
    this.state=reducedMotion?'complete':'presenting';
    Object.assign(this.pose,reducedMotion?this.target:this.startPose);return true;
  }
  skip({reducedMotion=false}={}){
    if(!this.active)return false;
    if(reducedMotion){Object.assign(this.pose,this.target);this.state='complete';return true;}
    if(this.state==='handing-off')return false;
    Object.assign(this.from,this.pose);this.exitElapsed=0;this.state='handing-off';return true;
  }
  update(dt,{suspended=false}={}){
    if(!this.active||suspended||!Number.isFinite(dt)||dt<=0)return this.pose;
    if(this.state==='presenting'){
      this.elapsed=Math.min(INTRO_DURATION,this.elapsed+dt);
      this.interpolate(this.startPose,smooth(this.elapsed/INTRO_DURATION));
      if(this.elapsed===INTRO_DURATION){Object.assign(this.pose,this.target);this.state='complete';}
    }else{
      this.exitElapsed=Math.min(INTRO_HANDOFF,this.exitElapsed+dt);
      this.interpolate(this.from,smooth(this.exitElapsed/INTRO_HANDOFF));
      if(this.exitElapsed===INTRO_HANDOFF){Object.assign(this.pose,this.target);this.state='complete';}
    }
    return this.pose;
  }
  interpolate(from,t){for(const key of fields)this.pose[key]=from[key]+(this.target[key]-from[key])*t;}
}
