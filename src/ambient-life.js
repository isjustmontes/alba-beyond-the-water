// Decorative wildlife only. No fishing decisions or shared game RNG consumption.
const clamp=v=>Math.max(0,Math.min(1,v));
export function faunaConditions(environment,out={}){
  const {daylight:day,weather:w}=environment,hour=environment.clock?.hour??12;
  const dawn=Math.exp(-(((hour-6.5)/2)**2)),dusk=Math.exp(-(((hour-19.5)/2)**2));
  out.birds=day*(.45+.55*dawn)*(1-w.rain)**2*(1-clamp(w.wind/8));
  out.dragonflies=day*(1-w.rain)**3*(1-clamp(w.wind/4.8))*(.65+.35*Math.sin(hour/24*Math.PI));
  out.crickets=(1-day*.95)*(.65+.35*dusk)*(1-w.rain)**2*(1-clamp(w.wind/7));
  out.rustle=clamp(w.wind/6)*(1-w.rain*.35);
  return out;
}
export function makeFaunaSlots(count,seed=9137){
  const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  return Array.from({length:count},(_,i)=>({phase:rand()*Math.PI*2,offset:rand()*65,duration:17+rand()*17,cycle:65+rand()*60,side:i%2?1:-1,depth:rand(),height:rand(),speed:.7+rand()*.6}));
}
export function birdPose(slot,time,activity,out={}){
  const elapsed=((time+slot.offset)%slot.cycle+slot.cycle)%slot.cycle,u=elapsed/slot.duration;
  out.opacity=u<1 ? clamp(u*7)*clamp((1-u)*7)*activity : 0;
  out.x=slot.side*(-115+u*230);out.y=26+slot.height*16+Math.sin(time*.19+slot.phase)*1.4;
  out.z=-92-slot.depth*45+Math.sin(u*Math.PI)*12;
  out.flap=Math.sin(time*slot.speed*4+slot.phase)*.24;
  return out;
}
export function insectPose(slot,time,activity,out={}){
  const t=time*slot.speed,p=slot.phase;
  // Short dart followed by a hover, differing between individuals.
  const dart=Math.tanh(Math.sin(t*.37+p)*4);
  const envelope=.25+.75*(.5+.5*Math.sin(t*.13+p));
  out.opacity=activity*envelope;
  out.x=slot.side*(15+slot.depth*9)+dart*.8+Math.sin(t*.9+p)*.22;
  out.z=-10-slot.height*22+Math.cos(t*.46+p)*.9;
  out.y=2.2+slot.height*.9+Math.sin(t*1.7+p)*.12;
  out.yaw=p+Math.sin(t*.37+p)*.7;
  return out;
}
