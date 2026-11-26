import {SPECIES} from './config.js';
import {lakeDepth} from './lake.js';
import {fishHome,fishWater,habitatDepth} from './lake-habitat.js';
import {speciesResponse,preferredDepth,biteChance} from './environment.js';

const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
export const FISH_STATES=['swimming','foraging','investigating','attacking','fleeing','resisting','recovering'];

// Perception and attention are deliberately separate from the existing bite model.
export const ATTENTION=Object.freeze({rangeScale:.7,minRange:3,maxRange:12,decisionMin:.6,decisionSpread:1.2,ignoreMin:2,ignoreSpread:4,competition:.65});
export function lurePerception(fish,lure,lureType,{environment,moving=false}={},out={}) {
  const s=SPECIES[fish.speciesIndex],p=fish.position;
  const visibility=environment ? clamp(.72+environment.daylight*.28-environment.weather.rain*.25,.45,1) : 1;
  const range=clamp(lureType.attraction*ATTENTION.rangeScale*visibility*(.85+fish.response.activity*.15),ATTENTION.minRange,ATTENTION.maxRange);
  const depthRange=1.05+s.aggression*.9+(moving&&fish.response.feeding!=='bottom' ? .25 : 0);
  const d=distance(p,lure),depthGap=Math.abs(p.y-lure.y);
  out.distance=d;out.range=range;out.depthGap=depthGap;out.depthRange=depthRange;out.detected=d<range&&depthGap<depthRange;return out;
}
export function lureInterest(fish,lureType,{moving=false,competitors=0,proximity=1}={}) {
  const s=SPECIES[fish.speciesIndex];
  const sizeBias=lureType.id==='minnow' ? .65+clamp((fish.weight-s.min)/(s.max-s.min),0,1)*.65 : 1;
  const affinity=(lureType.affinity[fish.speciesIndex]||0)*sizeBias;
  const motion=moving ? (fish.response.feeding==='bottom'||fish.speciesIndex===1 ? .65 : 1.15) : 1;
  const memory=fish.memory>0&&fish.avoidedLure===lureType.id ? .6 : 1;
  const desire=(.12+.8*affinity*fish.hunger*fish.response.activity*(.65+.35*fish.response.thermal)*fish.curiosity)*motion*memory*(1-fish.alert*.8);
  return clamp(desire*(.6+.4*proximity)/(1+competitors*ATTENTION.competition),.015,.92);
}

export class FishSchool {
  constructor({random=Math.random,count=27,obstacles=[]}={}) {
    this.random=random;this.obstacles=obstacles;this.time=0;this.fish=[];this.approaching=0;this.nearLure=0;
    for(let i=0;i<count;i++) {
      const speciesIndex=i%SPECIES.length,species=SPECIES[speciesIndex];
      const {x,z}=fishHome(i,random,obstacles);
      const y=-Math.min(species.depth,habitatDepth(x,z,obstacles)-.25);
      const weight=+(species.min+random()*(species.max-species.min)).toFixed(2);
      this.fish.push({id:i,speciesIndex,weight,length:Math.round((species.lengthFactor||23)*Math.cbrt(weight)+(species.lengthBase??22)),position:{x,y,z},home:{x,y,z},heading:random()*6.28,state:'swimming',stateTime:0,interest:0,hunger:.55+random()*.45,phase:random()*6.28,cooldown:0,nextStrike:0,alert:0,memory:0,avoidedLure:null,activity:'exploring',decisionIn:0,response:{activity:1,thermal:1,feeding:'drift'},targetDepth:-y});
      const fish=this.fish[this.fish.length-1],individual=(fish.phase/6.28+i*.61803398875)%1;
      fish.curiosity=.8+individual*.4;fish.decisionOffset=individual;fish.decisionIn=.15+individual*1.2;
      fish.ignoreUntil=0;fish.intent='ignore';fish.pursuitLimit=12+individual*6;
      fish.perception={};
    }
  }
  transition(fish,state) {
    if(fish.state===state)return;
    fish.state=state;fish.stateTime=0;
    if(state==='investigating'){fish.nextStrike=.8+fish.decisionOffset*1.4;fish.interest=0;fish.intent='investigate';}
    else if(state==='attacking'){fish.intent='attack';fish.biteHoldUntil=0;}
    else fish.intent=state==='fleeing' ? 'flee' : 'ignore';
  }
  disengage(fish) {
    fish.interest=0;fish.ignoreUntil=this.time+ATTENTION.ignoreMin+this.random()*ATTENTION.ignoreSpread+fish.decisionOffset*2;
    this.transition(fish,'foraging');fish.intent='ignore';
  }
  release(id,caught=false) {
    const fish=this.fish.find(f=>f.id===id);if(!fish)return;
    fish.cooldown=caught ? 20 : 7;fish.interest=0;fish.ignoreUntil=this.time+fish.cooldown+3;fish.alert=1;fish.memory=35;fish.avoidedLure=fish.lastLure||null;fish.hunger=Math.max(.35,fish.hunger-.12);this.transition(fish,'recovering');
  }
  hook(id) {const fish=this.fish.find(f=>f.id===id);if(fish)this.transition(fish,'resisting');}
  update(dt,{active=false,lure,lureType,moving=false,jerk=false,environment}={}) {
    this.time+=dt;this.approaching=0;this.nearLure=0;let attacker=null;
    // Snapshot before decisions: avoid iteration-order bias and a hard pursuer cap.
    let competitors=0;
    if(active)for(const fish of this.fish)if(['investigating','attacking'].includes(fish.state)&&distance(fish.position,lure)<ATTENTION.maxRange)competitors++;
    for(const fish of this.fish) {
      const s=SPECIES[fish.speciesIndex],p=fish.position;
      fish.stateTime+=dt;
      if(fish.state==='resisting')continue;
      fish.alert=Math.max(0,fish.alert-dt*.025);fish.memory=Math.max(0,fish.memory-dt);
      fish.hunger=clamp(fish.hunger+dt*.001,.35,1);fish.decisionIn-=dt;
      const decides=fish.decisionIn<=0;
      if(decides){
        fish.decisionIn+=ATTENTION.decisionMin+fish.decisionOffset*.6+this.random()*ATTENTION.decisionSpread;
        if(environment){fish.response=speciesResponse(fish.speciesIndex,environment,-p.y);fish.targetDepth=preferredDepth(fish.speciesIndex,s.depth,environment,lakeDepth(p.x,p.z));}
        fish.activity=fish.alert>.45 ? 'threatened' : fish.response.activity<.65 ? 'resting' : fish.hunger>.75 ? 'feeding' : fish.state==='foraging' ? 'searching' : 'exploring';
      }
      const d=active ? distance(p,lure) : Infinity;
      if(d<2)this.nearLure++;
      const sizeBias=lureType?.id==='minnow' ? .65+clamp((fish.weight-s.min)/(s.max-s.min),0,1)*.65 : 1;
      const affinity=(lureType?.affinity[fish.speciesIndex]||0)*sizeBias;
      const motion=moving ? (fish.response.feeding==='bottom'||fish.speciesIndex===1 ? .65 : 1.3) : 1;
      const memory=fish.memory>0&&fish.avoidedLure===lureType?.id ? .7 : 1;
      const depthMatch=clamp(1-Math.abs((lure ? -lure.y : 0)-fish.targetDepth)/6,.45,1);
      const perception=active ? lurePerception(fish,lure,lureType,{environment,moving},fish.perception) : null;
      if(jerk && d<4.5 && s.caution>.6 && fish.state!=='recovering') {
        this.transition(fish,'fleeing');fish.cooldown=3;fish.alert=1;fish.memory=25;fish.avoidedLure=lureType.id;
      }
      if(fish.state==='fleeing') {
        fish.cooldown-=dt;if(fish.cooldown<=0){fish.cooldown=3;this.transition(fish,'recovering');}
      } else if(fish.state==='recovering') {
        fish.cooldown-=dt;if(fish.cooldown<=0)this.transition(fish,'swimming');
      } else if(active && perception.detected) {
        if((fish.state==='swimming'||fish.state==='foraging')&&decides&&this.time>=fish.ignoreUntil){
          const interest=lureInterest(fish,lureType,{moving,competitors,proximity:1-d/perception.range});
          if(fish.alert>.65&&this.random()<s.caution*.5){this.transition(fish,'fleeing');fish.cooldown=2+fish.decisionOffset;}
          else if(this.random()<interest)this.transition(fish,'investigating');
          else this.disengage(fish);
        }
        if(fish.state==='investigating') {
          // Losing interest, failed inspection and crowding can end a pursuit.
          // A hungry bold fish can still compete: there is no fixed population quota.
          if(fish.stateTime>fish.pursuitLimit||(decides&&fish.stateTime>2&&this.random()<clamp((competitors-1)*.045+fish.alert*.2+(1-fish.hunger)*.07,0,.5))){
            this.disengage(fish);
          }else{
            this.approaching++;fish.intent=moving&&fish.stateTime>.8+fish.decisionOffset ? 'follow' : 'investigate';
            if(d<1.4)fish.interest+=dt*s.biteRate*affinity*motion*fish.hunger*fish.response.activity*memory*(1-fish.alert*.5);
            else fish.interest=Math.max(0,fish.interest-dt*.08);
            if(fish.interest>1 && d<1.0 && fish.stateTime>=fish.nextStrike) {
              fish.nextStrike=fish.stateTime+.9+fish.decisionOffset*.5;
              const chance=biteChance({base:s.biteProbability,affinity,activity:fish.response.activity,thermal:fish.response.thermal,alert:fish.alert,hunger:fish.hunger,depthMatch,motion,distance:d,state:fish.state});
              if(this.random()<chance*memory){fish.lastLure=lureType.id;this.transition(fish,'attacking');}
            }
          }
        }
        if(fish.state==='attacking'){
          if(fish.stateTime>3.5&&this.time>=fish.biteHoldUntil)this.disengage(fish);
          else if(d<.62&&!attacker){
            attacker=fish;
            // Preserve the existing three-second hook window; never hold bait forever.
            if(!fish.biteHoldUntil)fish.biteHoldUntil=this.time+3.2;
          }
        }
      } else if(fish.state==='investigating'||fish.state==='attacking') {
        this.disengage(fish);
      } else if(fish.state==='swimming' && fish.stateTime>4+fish.phase)this.transition(fish,'foraging');
      else if(fish.state==='foraging' && fish.stateTime>6+fish.phase){fish.hunger=Math.max(.4,fish.hunger-.10);this.transition(fish,'swimming');}

      let tx,tz,ty,speed=s.speed*(.7+fish.response.activity*.3);
      if(fish.state==='investigating'||fish.state==='attacking') {
        const orbit=fish.state==='attacking' ? 0 : Math.max(.18,.9+fish.decisionOffset*.3-fish.interest*.7);
        const angle=this.time*(.6+fish.decisionOffset*.3)+fish.phase+fish.id*2.399963;
        tx=lure.x+Math.cos(angle)*orbit;tz=lure.z+Math.sin(angle)*orbit;ty=lure.y;
        speed*=fish.state==='attacking' ? 1.5+s.aggression : 1.1+s.aggression*.4;
      } else if(fish.state==='fleeing') {
        const away=Math.atan2(p.x-lure.x,p.z-lure.z);tx=p.x+Math.sin(away)*5;tz=p.z+Math.cos(away)*5;ty=p.y-.2;speed*=2.7;
      } else {
        const a=this.time*(.13+fish.decisionOffset*.07)+fish.phase,r=fish.state==='foraging' ? 2.5 : 4;
        tx=fish.home.x+Math.cos(a)*r;tz=fish.home.z+Math.sin(a)*r;ty=environment ? -fish.targetDepth-Math.min(.6,fish.alert*.6)+Math.sin(a*.7)*.12 : fish.home.y+Math.sin(a*.7)*.12;
        if(fish.activity==='resting')speed*=.55;
        // Hungry fish explore slowly towards wind-driven food, within the same bounded lake.
        if(environment&&fish.activity==='feeding'&&fish.state==='foraging'){tx+=environment.weather.windX*.3;tz+=environment.weather.windZ*.3;}
        if(fish.state==='recovering')speed*=.65;
      }
      const dx=tx-p.x,dz=tz-p.z,dy=ty-p.y,len=Math.hypot(dx,dy,dz),step=Math.min(1,speed*dt/Math.max(.001,len));
      const nx=p.x+dx*step,nz=p.z+dz*step;
      if(fishWater(nx,nz,this.obstacles)){p.x=nx;p.z=nz;}
      else if(fishWater(nx,p.z,this.obstacles))p.x=nx;
      else if(fishWater(p.x,nz,this.obstacles))p.z=nz;
      p.y=clamp(p.y+dy*step,-Math.max(.25,habitatDepth(p.x,p.z,this.obstacles)-.15),-.22);
      if(Math.hypot(dx,dz)>.01)fish.heading=Math.atan2(-dz,dx);
    }
    return attacker;
  }
}
