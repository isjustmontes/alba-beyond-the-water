import {SPECIES} from './config.js';
import {lakeDepth} from './lake.js';
import {speciesResponse,preferredDepth,biteChance} from './environment.js';

const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
export const FISH_STATES=['swimming','foraging','investigating','attacking','fleeing','resisting','recovering'];

export class FishSchool {
  constructor({random=Math.random,count=27}={}) {
    this.random=random;this.time=0;this.fish=[];this.approaching=0;this.nearLure=0;
    for(let i=0;i<count;i++) {
      const speciesIndex=i%SPECIES.length,species=SPECIES[speciesIndex],station=Math.floor(i/SPECIES.length);
      const x=((i+station)%3-1)*8+(random()-.5)*3,z=-4-station*4.1+(random()-.5)*2;
      const y=-Math.min(species.depth,lakeDepth(x,z)-.25);
      const weight=+(species.min+random()*(species.max-species.min)).toFixed(2);
      this.fish.push({id:i,speciesIndex,weight,length:Math.round((species.lengthFactor||23)*Math.cbrt(weight)+(species.lengthBase??22)),position:{x,y,z},home:{x,y,z},heading:random()*6.28,state:'swimming',stateTime:0,interest:0,hunger:.55+random()*.45,phase:random()*6.28,cooldown:0,nextStrike:0,alert:0,memory:0,avoidedLure:null,activity:'exploring',decisionIn:0,response:{activity:1,thermal:1,feeding:'drift'},targetDepth:-y});
    }
  }
  transition(fish,state) {if(fish.state!==state){fish.state=state;fish.stateTime=0;if(state==='investigating'){fish.nextStrike=0;fish.interest=0;}}}
  release(id,caught=false) {
    const fish=this.fish.find(f=>f.id===id);if(!fish)return;
    fish.cooldown=caught ? 20 : 7;fish.interest=0;fish.alert=1;fish.memory=35;fish.avoidedLure=fish.lastLure||null;fish.hunger=Math.max(.35,fish.hunger-.12);this.transition(fish,'recovering');
  }
  hook(id) {const fish=this.fish.find(f=>f.id===id);if(fish)this.transition(fish,'resisting');}
  update(dt,{active=false,lure,lureType,moving=false,jerk=false,environment}={}) {
    this.time+=dt;this.approaching=0;this.nearLure=0;let attacker=null;
    for(const fish of this.fish) {
      const s=SPECIES[fish.speciesIndex],p=fish.position;
      fish.stateTime+=dt;
      if(fish.state==='resisting')continue;
      fish.alert=Math.max(0,fish.alert-dt*.025);fish.memory=Math.max(0,fish.memory-dt);
      fish.hunger=clamp(fish.hunger+dt*.001,.35,1);fish.decisionIn-=dt;
      if(fish.decisionIn<=0){
        fish.decisionIn=.75;
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
      if(jerk && d<4.5 && s.caution>.6 && fish.state!=='recovering') {
        this.transition(fish,'fleeing');fish.cooldown=3;fish.alert=1;fish.memory=25;fish.avoidedLure=lureType.id;
      }
      if(fish.state==='fleeing') {
        fish.cooldown-=dt;if(fish.cooldown<=0){fish.cooldown=3;this.transition(fish,'recovering');}
      } else if(fish.state==='recovering') {
        fish.cooldown-=dt;if(fish.cooldown<=0)this.transition(fish,'swimming');
      } else if(active && d<lureType.attraction*(.7+affinity*.3)) {
        if(fish.state==='swimming'||fish.state==='foraging')this.transition(fish,'investigating');
        if(fish.state==='investigating') {
          this.approaching++;
          if(d<1.4)fish.interest+=dt*s.biteRate*affinity*motion*fish.hunger*fish.response.activity*memory*(1-fish.alert*.5);
          else fish.interest=Math.max(0,fish.interest-dt*.08);
          if(fish.interest>1 && d<1.0 && fish.stateTime>=fish.nextStrike) {
            fish.nextStrike=fish.stateTime+.9;
            const chance=biteChance({base:s.biteProbability,affinity,activity:fish.response.activity,thermal:fish.response.thermal,alert:fish.alert,hunger:fish.hunger,depthMatch,motion,distance:d,state:fish.state});
            if(this.random()<chance*memory){fish.lastLure=lureType.id;this.transition(fish,'attacking');}
          }
        }
        if(fish.state==='attacking' && d<.62 && !attacker)attacker=fish;
      } else if(fish.state==='investigating'||fish.state==='attacking') {
        fish.interest=0;this.transition(fish,'foraging');
      } else if(fish.state==='swimming' && fish.stateTime>4+fish.phase)this.transition(fish,'foraging');
      else if(fish.state==='foraging' && fish.stateTime>6+fish.phase){fish.hunger=Math.max(.4,fish.hunger-.10);this.transition(fish,'swimming');}

      let tx,tz,ty,speed=s.speed*(.7+fish.response.activity*.3);
      if(fish.state==='investigating'||fish.state==='attacking') {
        const orbit=fish.state==='attacking' ? 0 : Math.max(.15,.65-fish.interest*.6);
        tx=lure.x+Math.cos(this.time+fish.phase)*orbit;tz=lure.z+Math.sin(this.time+fish.phase)*orbit;ty=lure.y;
        speed*=fish.state==='attacking' ? 1.5+s.aggression : 1.1+s.aggression*.4;
      } else if(fish.state==='fleeing') {
        const away=Math.atan2(p.x-lure.x,p.z-lure.z);tx=p.x+Math.sin(away)*5;tz=p.z+Math.cos(away)*5;ty=p.y-.2;speed*=2.7;
      } else {
        const a=this.time*.17+fish.phase,r=fish.state==='foraging' ? 2.5 : 4;
        tx=fish.home.x+Math.cos(a)*r;tz=fish.home.z+Math.sin(a)*r;ty=environment ? -fish.targetDepth-Math.min(.6,fish.alert*.6)+Math.sin(a*.7)*.12 : fish.home.y+Math.sin(a*.7)*.12;
        if(fish.activity==='resting')speed*=.55;
        // Hungry fish explore slowly towards wind-driven food, within the same bounded lake.
        if(environment&&fish.activity==='feeding'&&fish.state==='foraging'){tx+=environment.weather.windX*.3;tz+=environment.weather.windZ*.3;}
        if(fish.state==='recovering')speed*=.65;
      }
      const dx=tx-p.x,dz=tz-p.z,dy=ty-p.y,len=Math.hypot(dx,dy,dz),step=Math.min(1,speed*dt/Math.max(.001,len));
      p.x+=dx*step;p.z+=dz*step;p.y+=dy*step;
      p.x=clamp(p.x,-65,65);p.z=clamp(p.z,-125,8);
      const radius=Math.hypot(p.x/78,(p.z+42)/100);if(radius>.93){p.x/=(radius/.93);p.z=-42+(p.z+42)/(radius/.93);}
      p.y=clamp(p.y,-Math.max(.25,lakeDepth(p.x,p.z)-.15),-.22);
      if(Math.hypot(dx,dz)>.01)fish.heading=Math.atan2(-dz,dx);
    }
    return attacker;
  }
}
