import {SPECIES,LURES,EQUIPMENT,getLure} from './simulation/config.js';
import {FishSchool} from './simulation/fish-ai.js';
import {lakeDepth} from './simulation/lake.js';
import {Environment} from './simulation/environment.js';
import {CAST_TIMING} from './animation/fishing-motion.js';
export {SPECIES,LURES,EQUIPMENT};
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));

// Authoritative simulation shared by every input device; renderer-independent.
export class FishingGame {
  constructor({random=Math.random,onEvent=()=>{},school,now=()=>new Date().toISOString(),environment=new Environment()}={}) {
    this.random=random;this.onEvent=onEvent;this.now=now;
    this.school=school||new FishSchool({random});
    this.environment=environment;this.windOffset={x:0,z:0};
    this.state='ready';this.time=0;this.power=0;this.tension=0;this.distance=0;
    this.reeling=false;this.catches=[];this.lureId='spinner';this.aim={x:0,z:-1};
    this.lure={x:0,y:-.75,z:4};this.lureSpeed=0;this.hookedId=null;
    this.actionCounts={casts:0,hooks:0};
    this.chargeTime=0;this.castStartedAt=-Infinity;this.castPreparation=0;this.lineReleased=false;this.pullCount=0;
  }
  get lureType(){return getLure(this.lureId);}
  emit(type,data={}){this.onEvent({type,...data});}
  setAim(x,z){const len=Math.hypot(x,z)||1;this.aim.x=x/len;this.aim.z=z/len;}
  selectLure(id) {
    if(!['ready','caught'].includes(this.state)||!LURES.some(l=>l.id===id))return false;
    this.lureId=id;this.emit('equipment');return true;
  }
  press() {
    if(this.state==='ready'){this.state='charging';this.power=.08;this.chargeTime=0;}
    else if(this.state==='bite') {
      this.state='fighting';this.tension=.28;this.stamina=1;this.fightTime=0;this.slackTime=0;this.overloadTime=0;
      this.burstRemaining=.6+this.random();this.surge=true;this.burstForce=.8+this.random()*.4;
      this.fightHeading=Math.atan2(this.aim.x,-this.aim.z);this.baseHeading=this.fightHeading;
      this.reeling=true;this.school.hook(this.hookedId);this.actionCounts.hooks++;
      this.pullCount=0;
      this.emit('hook',{fish:this.target,fishId:this.hookedId});
    } else if(this.state==='fighting'||this.state==='waiting')this.reeling=true;
  }
  release() {
    this.reeling=false;
    if(this.state!=='charging')return;
    this.state='casting';this.distance=9+this.power*31;this.castDistance=this.distance;this.castTime=0;
    this.castStartedAt=this.time;this.castPreparation=Math.min(1,this.chargeTime/.42);this.lineReleased=false;
    const wind=this.environment.weather;
    this.windOffset.x=wind.windX*this.power*.09;this.windOffset.z=wind.windZ*this.power*.09;
    this.actionCounts.casts++;this.emit('cast',{distance:this.distance});this.updateLure();
  }
  cancelHeld() {
    this.reeling=false;if(this.state==='charging'){this.state='ready';this.power=0;}
  }
  reset(message='Aparejo recuperado. Puedes volver a lanzar.') {
    if(this.hookedId!==null&&this.state!=='caught')this.school.release(this.hookedId);
    this.hookedId=null;this.state='ready';this.power=0;this.tension=0;this.distance=0;this.reeling=false;
    this.lureSpeed=0;this.emit('reset',{message});
    this.castStartedAt=-Infinity;
  }
  updateLure() {
    const type=this.lureType;
    this.lure.x=this.aim.x*this.distance+this.windOffset.x;this.lure.z=4+this.aim.z*this.distance+this.windOffset.z;
    this.lure.y=-Math.min(type.depth,lakeDepth(this.lure.x,this.lure.z)-.2);
    this.lure.y+=Math.sin(this.time*(type.id==='worm' ? 1.3 : 4.5))*type.motion*(this.reeling ? 1 : .3);
    this.lure.y=Math.min(-.22,this.lure.y);
  }
  update(dt) {
    this.time+=dt;
    this.environment.update(dt);
    if(this.state==='charging'){this.power=Math.min(1,this.power+dt*.58);this.chargeTime+=dt;}
    if(this.state==='casting') {
      this.castTime+=dt;
      if(!this.lineReleased&&this.castTime>=CAST_TIMING.release){this.lineReleased=true;this.emit('line-release');}
      if(this.castTime>=CAST_TIMING.impact){this.state='waiting';this.waitTime=0;this.emit('splash');}
    }
    let jerk=false;
    if(this.state==='waiting') {
      this.waitTime+=dt;
      const wind=this.environment.weather,drift=this.lureType.id==='worm' ? .002 : .012;
      this.windOffset.x=clamp(this.windOffset.x+wind.windX*dt*drift,-1.5,1.5);
      this.windOffset.z=clamp(this.windOffset.z+wind.windZ*dt*drift,-1.5,1.5);
      const speed=this.reeling ? this.lureType.retrieveSpeed : 0;
      jerk=speed>1.8 && this.lureSpeed<.1;this.lureSpeed=speed;
      this.distance=Math.max(2.5,this.distance-speed*dt);this.updateLure();
      if(this.distance<=2.5)this.reset();
    }
    const attacker=this.school.update(dt,{active:this.state==='waiting'||this.state==='bite',lure:this.lure,lureType:this.lureType,moving:this.reeling,jerk,environment:this.environment});
    if(attacker && this.state==='waiting') {
      this.hookedId=attacker.id;this.biteDepth=Math.abs(this.lure.y);const species=SPECIES[attacker.speciesIndex];
      this.target={speciesIndex:attacker.speciesIndex,name:species.name,weight:attacker.weight,length:attacker.length};
      this.state='bite';this.biteTime=0;this.reeling=false;this.emit('bite',{fish:this.target,fishId:attacker.id});
    } else if(this.state==='bite') {
      this.biteTime+=dt;if(this.biteTime>3)this.reset('El pez soltó el cebo. Clava en cuanto se hunda la boya.');
    } else if(this.state==='fighting')this.updateFight(dt);
    else if(this.state==='caught') {
      this.resultTime+=dt;if(this.resultTime>4.5)this.reset('Buen trabajo. El lago guarda más historias.');
    }
  }
  updateFight(dt) {
    this.fightTime+=dt;this.burstRemaining-=dt;const species=SPECIES[this.target.speciesIndex];
    if(this.burstRemaining<=0) {
      this.surge=!this.surge;
      this.burstRemaining=(this.surge ? .8+this.random()*1.6 : 1.2+this.random()*2.0)*species.endurance;
      this.burstForce=.75+this.random()*.55;this.fightHeading=this.baseHeading+(this.random()-.5)*.7;
      if(this.surge){this.pullCount++;this.emit('pull',{strength:this.burstForce});}
    }
    const force=species.strength*(.8+this.target.weight/12)*(EQUIPMENT.lineStrengthKg/7.5)**-1,fatigue=.5+this.stamina*.5;
    if(this.reeling) {
      this.tension+=dt*(this.surge ? .27*this.burstForce : .11)*force*fatigue;
      this.distance-=dt*(this.surge ? .95 : 2.9)*(1.35-this.stamina*.4)/Math.sqrt(force);
    } else {
      this.tension-=dt*(this.surge ? .17 : .29);
      this.distance=Math.min(this.castDistance+12,this.distance+dt*(this.surge ? .95 : .2)*this.stamina);
    }
    this.stamina=clamp(this.stamina-dt*(.018+(this.reeling ? .028 : .006))*Math.max(.25,this.tension)/species.endurance,0,1);
    this.tension=clamp(this.tension,0,1.08);
    this.overloadTime=this.tension>.97 ? this.overloadTime+dt : Math.max(0,this.overloadTime-dt*2);
    this.slackTime=this.tension<.035 ? this.slackTime+dt : 0;
    const heading=this.fightHeading+Math.sin(this.fightTime*1.2)*.08*this.stamina;
    const fish=this.school.fish.find(f=>f.id===this.hookedId);
    const desiredX=Math.sin(heading)*this.distance,desiredZ=4-Math.cos(heading)*this.distance;
    if(fish) {
      const p=fish.position,k=1-Math.exp(-dt*4),prevX=p.x,prevZ=p.z;
      p.x+=(desiredX-p.x)*k;p.z+=(desiredZ-p.z)*k;p.y=-.35-Math.sin(this.fightTime*3)**2*.25;
      fish.heading=Math.atan2(-(p.z-prevZ),p.x-prevX);this.lure.x=p.x;this.lure.y=p.y;this.lure.z=p.z;
    }
    if(this.overloadTime>.65)this.reset('El sedal se rompió. Suelta antes de mantener la tensión al límite.');
    else if(this.slackTime>4)this.reset('Demasiada holgura: el pez se ha escapado.');
    else if(this.distance<=2.6) {
      const type=this.lureType,caught={...this.target,lureId:type.id,lureName:type.name,date:this.now(),environment:this.environment.snapshot(this.biteDepth??Math.abs(this.lure.y))};
      this.catches.push(caught);this.state='caught';this.reeling=false;this.resultTime=0;
      this.school.release(this.hookedId,true);this.emit('catch',{fish:caught});
    }
  }
}
