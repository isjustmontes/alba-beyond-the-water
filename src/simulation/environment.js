// Lightweight, renderer-independent environment. Times are simulated, never wall-clock time.
export const ENVIRONMENT_CONFIG=Object.freeze({dayDuration:3600,startHour:6.4,weatherHold:150,weatherTransition:35,minTemperature:10,maxTemperature:25,deepTemperature:14,thermalInertia:150,maxWind:6});
export const WEATHER={
  clear:{name:'Despejado',icon:'☀',cloud:0.12,rain:0,wind:1.1,cooling:0,next:['partly','windy']},
  partly:{name:'Parcialmente nublado',icon:'◒',cloud:.42,rain:0,wind:1.8,cooling:.3,next:['clear','cloudy','windy']},
  cloudy:{name:'Nublado',icon:'☁',cloud:.85,rain:0,wind:2.3,cooling:1,next:['partly','lightRain','windy']},
  lightRain:{name:'Lluvia ligera',icon:'☂',cloud:.92,rain:.32,wind:2.7,cooling:1.6,next:['cloudy','heavyRain']},
  heavyRain:{name:'Lluvia intensa',icon:'☂',cloud:1,rain:1,wind:4.2,cooling:2.5,next:['lightRain']},
  windy:{name:'Viento moderado',icon:'≋',cloud:.5,rain:0,wind:4.8,cooling:.7,next:['partly','cloudy']}
};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t);};
export const seededRandom=seed=>()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
export function dayPeriod(hour){return hour<5||hour>=21 ? 'Noche' : hour<8 ? 'Amanecer' : hour<11 ? 'Mañana' : hour<15 ? 'Mediodía' : hour<18 ? 'Tarde' : 'Atardecer';}
export function formatHour(hour){const minutes=Math.floor(((hour%24+24)%24)*60+1e-7);return `${String(Math.floor(minutes/60)).padStart(2,'0')}:${String(minutes%60).padStart(2,'0')}`;}
export class GameClock {
  constructor({dayDuration=ENVIRONMENT_CONFIG.dayDuration,startHour=ENVIRONMENT_CONFIG.startHour,speed=1}={}){this.dayDuration=Math.max(1,dayDuration);this.totalHours=startHour;this.speed=clamp(speed,0,120);}
  update(dt){if(Number.isFinite(dt)&&dt>0)this.totalHours+=dt*24/this.dayDuration*this.speed;}
  get hour(){return (this.totalHours%24+24)%24;}
  get period(){return dayPeriod(this.hour);}
}
export class WeatherSystem {
  constructor({random=seededRandom(72931),config=ENVIRONMENT_CONFIG}={}) {
    this.random=random;this.config=config;this.state='clear';this.from='clear';this.elapsed=0;this.transition=1;this.manual=false;
    this.cloud=WEATHER.clear.cloud;this.rain=0;this.wind=1.1;this.cooling=0;this.direction=Math.PI/2;this.targetDirection=this.direction;this.windX=1.1;this.windZ=0;
  }
  request(state,{manual=false}={}) {
    if(!Object.hasOwn(WEATHER,state))return false;
    if(state===this.state&&this.transition===1){this.manual=manual;return true;}
    // Test/observation overrides also fade; never snap weather values.
    this.manual=manual;this.from=this.state;this.state=state;this.elapsed=0;this.transition=0;
    this.targetDirection=this.direction+(this.random()-.5)*Math.PI*.6;return true;
  }
  update(dt) {
    if(!Number.isFinite(dt)||dt<=0)return;
    this.elapsed+=dt;
    if(!this.manual&&this.elapsed>=this.config.weatherHold){const options=WEATHER[this.state].next;this.request(options[Math.min(options.length-1,Math.floor(this.random()*options.length))]);}
    const target=WEATHER[this.state],k=1-Math.exp(-dt/(this.config.weatherTransition/3));
    for(const key of ['cloud','rain','wind','cooling'])this[key]+=(target[key]-this[key])*k;
    this.wind=clamp(this.wind,0,this.config.maxWind);this.direction+=(this.targetDirection-this.direction)*k;
    this.transition=Math.min(1,this.transition+dt/this.config.weatherTransition);
    this.windX=Math.sin(this.direction)*this.wind;this.windZ=-Math.cos(this.direction)*this.wind;
  }
  get name(){return WEATHER[this.state].name;}
  get windLabel(){const names=['N','NE','E','SE','S','SO','O','NO'],turn=Math.PI*2;return names[Math.round((((this.direction+Math.PI)%turn+turn)%turn)/(Math.PI/4))%8];} // Meteorological origin, opposite drift.
}
export class WaterTemperature {
  constructor(config=ENVIRONMENT_CONFIG){this.config=config;this.surface=16.4;}
  update(dt,hour,weather){const c=this.config,target=clamp(18+2.7*Math.cos((hour-16)/24*Math.PI*2)-weather.cooling,c.minTemperature,c.maxTemperature);this.surface=clamp(this.surface+(target-this.surface)*(1-Math.exp(-dt/c.thermalInertia)),c.minTemperature,c.maxTemperature);}
  atDepth(depth){return this.surface+(this.config.deepTemperature-this.surface)*smooth(.5,5.3,Math.max(0,depth));}
}
export class Environment {
  constructor(options={}){this.config={...ENVIRONMENT_CONFIG,...options};this.clock=new GameClock(this.config);this.weather=new WeatherSystem({random:options.random,config:this.config});this.water=new WaterTemperature(this.config);this.time=0;this.thermalElapsed=0;}
  update(dt){
    if(!Number.isFinite(dt)||dt<=0)return;
    this.clock.update(dt);this.weather.update(dt);this.time+=dt;
    // Slow thermal model at 1 Hz; weather visuals interpolate continuously.
    this.thermalElapsed+=dt;if(this.thermalElapsed>=1){this.water.update(this.thermalElapsed,this.clock.hour,this.weather);this.thermalElapsed=0;}
  }
  get daylight(){return smooth(-.16,.24,Math.sin((this.clock.hour-6)/24*Math.PI*2));}
  snapshot(depth=0){return {hour:this.clock.hour,period:this.clock.period,weather:this.weather.state,weatherName:this.weather.name,temperature:+this.water.atDepth(depth).toFixed(1),surfaceTemperature:+this.water.surface.toFixed(1),depth:+depth.toFixed(1),windSpeed:+this.weather.wind.toFixed(2),windDirection:this.weather.windLabel};}
}

// Deliberately broad, tunable game preferences, not claims of precise biological thresholds.
export const ECOLOGY=[
  {thermal:[12,19],tolerance:7,peaks:[6.5,19],night:.48,cloud:.25,rain:.05,deepHeat:.5,feeding:'drift'},
  {thermal:[18,25],tolerance:9,peaks:[7,20],night:.9,cloud:.08,rain:-.12,deepHeat:.18,feeding:'bottom'},
  {thermal:[18,26],tolerance:8,peaks:[7,19],night:.65,cloud:.30,rain:-.16,deepHeat:.35,feeding:'predator'},
  {thermal:[14,22],tolerance:8,peaks:[8,17],night:.32,cloud:.12,rain:-.28,deepHeat:.3,feeding:'predator'},
  {thermal:[18,25],tolerance:9,peaks:[5.5,21],night:1.12,cloud:.02,rain:.08,deepHeat:.10,feeding:'bottom'}
];
export function thermalSuitability(index,temp){const e=ECOLOGY[index]||ECOLOGY[0],gap=Math.max(e.thermal[0]-temp,0,temp-e.thermal[1]);return clamp(1-gap/e.tolerance,.25,1);}
export function speciesResponse(index,environment,depth=1){
  const e=ECOLOGY[index]||ECOLOGY[0],hour=environment.clock.hour,w=environment.weather;
  const peak=Math.max(...e.peaks.map(h=>Math.exp(-((Math.min(Math.abs(hour-h),24-Math.abs(hour-h))/2.7)**2))));
  const circadian=.58+peak*.52+(environment.daylight<.3 ? e.night-.65 : 0);
  const thermal=thermalSuitability(index,environment.water.atDepth(depth));
  const weather=1+w.cloud*e.cloud+w.rain*e.rain;
  return {activity:clamp(circadian*.55+thermal*.3+weather*.15,.32,1.35),thermal,feeding:e.feeding};
}
export function preferredDepth(index,base,environment,maxDepth){
  const e=ECOLOGY[index]||ECOLOGY[0],heat=Math.max(0,environment.water.surface-e.thermal[1]);
  const bright=environment.daylight*(1-environment.weather.cloud);
  return clamp(base+heat*e.deepHeat+bright*(e.feeding==='predator' ? .65 : .22)-(1-environment.daylight)*.2,.3,Math.max(.3,maxDepth-.25));
}
export function biteChance({base,affinity,activity=1,thermal=1,alert=0,hunger=1,depthMatch=1,motion=1,distance=0,state='investigating'}){
  if(distance>=1||!['investigating','attacking'].includes(state)||affinity<=0)return 0;
  // Spatial + behavioural gate, then a bounded blend: no one condition guarantees a bite.
  const conditions=.3*activity+.2*thermal+.2*depthMatch+.15*motion+.15*hunger;
  return clamp(base*affinity*.8*conditions*(1-clamp(alert,0,1)*.65),.015,.94);
}
