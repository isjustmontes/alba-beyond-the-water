import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Environment,GameClock,WeatherSystem,WEATHER,ENVIRONMENT_CONFIG,dayPeriod,formatHour,speciesResponse,thermalSuitability,preferredDepth,biteChance,seededRandom} from '../src/simulation/environment.js';
import {FishingGame,SPECIES,LURES} from '../src/fishing.js';
import {FishSchool} from '../src/simulation/fish-ai.js';
import {lakeDepth} from '../src/simulation/lake.js';
import {fishWater,habitatDepth} from '../src/simulation/lake-habitat.js';
import {migrateCatches,captureConditions,exportCatches} from '../src/journal.js';

test('independent clock wraps a 60-minute day and respects different speeds',()=>{
  for(const speed of [.5,1,10]){const clock=new GameClock({speed});clock.update(3600/speed);assert.ok(Math.abs(clock.hour-6.4)<1e-9);}
  assert.equal(new GameClock({startHour:0}).hour,0);
  const clock=new GameClock();clock.update(-100);clock.update(NaN);assert.equal(formatHour(clock.hour),'06:24');
  assert.deepEqual([0,6,9,12,16,19,22].map(dayPeriod),['Noche','Amanecer','Mañana','Mediodía','Tarde','Atardecer','Noche']);
});
test('daylight is continuous at period boundaries and all hours remain playable',()=>{
  const e=new Environment();for(let h=0;h<24;h+=.05){e.clock.totalHours=h;const a=e.daylight;e.clock.totalHours=h+.001;assert.ok(Math.abs(e.daylight-a)<.002);assert.ok(a>=0&&a<=1);}
});
test('automatic weather follows its graph; wind and rain interpolate without jumps',()=>{
  const w=new WeatherSystem({random:seededRandom(7)});const seen=new Set([w.state]);
  for(let i=0;i<36000;i++){const previous=w.state,wind=w.wind,rain=w.rain,cloud=w.cloud;w.update(.1);seen.add(w.state);if(w.state!==previous)assert.ok(WEATHER[previous].next.includes(w.state));assert.ok(w.wind>=0&&w.wind<=ENVIRONMENT_CONFIG.maxWind);assert.ok(Math.abs(w.wind-wind)<.05);assert.ok(Math.abs(w.rain-rain)<.02);assert.ok(Math.abs(w.cloud-cloud)<.02);}
  assert.ok(seen.size>=4);assert.equal(w.request('tornado'),false);assert.equal(w.request('__proto__'),false);assert.equal(w.request('constructor'),false);
  w.direction=-Math.PI*20;assert.ok(['N','NE','E','SE','S','SO','O','NO'].includes(w.windLabel));
});
test('manual weather overrides also blend smoothly, then automatic weather can resume',()=>{
  const w=new WeatherSystem();w.request('heavyRain',{manual:true});assert.equal(w.rain,0);w.update(.1);assert.ok(w.rain<.02);for(let i=0;i<2000;i++)w.update(.1);assert.equal(w.state,'heavyRain');assert.ok(w.rain>.99);w.manual=false;w.update(1);assert.equal(w.state,'lightRain');
});
test('water stays within configured temperatures, changes slowly and is cooler at depth in warm conditions',()=>{
  const a=new Environment(),b=new Environment();let last=a.water.surface;
  for(let i=0;i<14400;i++){a.update(.5);b.update(.5);assert.equal(a.water.surface,b.water.surface);assert.ok(Math.abs(a.water.surface-last)<.04);assert.ok(a.water.surface>=10&&a.water.surface<=25);last=a.water.surface;}
  a.water.surface=24;assert.ok(a.water.atDepth(4)<a.water.atDepth(.5));assert.ok(thermalSuitability(0,15)>thermalSuitability(0,25));assert.ok(thermalSuitability(1,24)>thermalSuitability(0,24));
});
test('species have distinct daily and weather responses; hot trout seek bounded deeper water',()=>{
  const e=new Environment({startHour:23});const perch=speciesResponse(3,e),tench=speciesResponse(4,e);assert.ok(tench.activity>perch.activity);
  e.clock.totalHours=12;e.water.surface=24;
  assert.ok(preferredDepth(0,1,e,5)>2);assert.ok(preferredDepth(0,1,e,1)<=.75);
  const before=SPECIES.map((_,i)=>speciesResponse(i,e).activity);e.weather.cloud=1;e.weather.rain=1;
  const changes=SPECIES.map((_,i)=>speciesResponse(i,e).activity-before[i]);assert.ok(changes[0]>changes[3]);assert.ok(changes[3]<0);
});
test('fish retain threat memory, recover gradually and never cross the lake bed or water boundary',()=>{
  const e=new Environment({startHour:12}),school=new FishSchool({random:seededRandom(11)});e.water.surface=24;
  const f=school.fish[0];school.release(f.id);assert.equal(f.memory,35);assert.equal(f.alert,1);
  for(let i=0;i<600;i++){school.update(.1,{environment:e});for(const a of school.fish){assert.ok(a.position.y<0);assert.ok(a.position.y>-habitatDepth(a.position.x,a.position.z));assert.ok(fishWater(a.position.x,a.position.z));}}
  assert.equal(f.memory,0);assert.equal(f.alert,0);assert.ok(f.targetDepth>1);assert.ok(['resting','feeding','searching','exploring'].includes(f.activity));
});
test('bite model is spatial, behavioural and bounded, with several contributing factors',()=>{
  const args={base:.85,affinity:1.2,activity:1,thermal:1,alert:0,hunger:1,depthMatch:1,motion:1,distance:.4};
  assert.equal(biteChance({...args,distance:3}),0);assert.equal(biteChance({...args,state:'recovering'}),0);assert.equal(biteChance({...args,affinity:0}),0);
  const p=biteChance(args);for(const change of [{activity:.4},{thermal:.25},{alert:1},{hunger:.35},{depthMatch:.45},{motion:.65}])assert.ok(biteChance({...args,...change})<p);
  assert.ok(biteChance({...args,activity:99})<1);assert.ok(biteChance({...args,activity:.32,thermal:.25})>0);
});
test('all five species retain viable bait affinities and can be caught at 20 and 60 fps',()=>{
  for(const fps of [20,60])for(let index=0;index<SPECIES.length;index++){
    const school=new FishSchool({random:()=>.5,count:5}),f=school.fish[index];school.fish=[f];const game=new FishingGame({random:()=>.5,school});
    const lure=LURES.reduce((a,b)=>a.affinity[index]>b.affinity[index] ? a : b);game.selectLure(lure.id);game.press();game.update(2);game.release();f.position={...game.lure};f.home={...game.lure};
    for(let i=0;i<fps*30&&game.state!=='bite';i++)game.update(1/fps);
    assert.equal(game.state,'bite',`species ${index} finds real bait`);game.press();let reel=true;
    for(let i=0;i<fps*150&&game.state==='fighting';i++){if(game.tension>.65)reel=false;if(game.tension<.28)reel=true;if(reel)game.press();else game.release();game.update(1/fps);}
    assert.equal(game.state,'caught');const caught=game.catches[0];assert.ok(caught.environment.depth>0);assert.ok(caught.environment.temperature>=10);assert.ok(caught.environment.hour>=0);assert.equal(caught.speciesIndex,index);
  }
});
test('journal migration preserves old records, validates partial conditions and round-trips new captures',()=>{
  const old={name:'Trucha arcoíris',speciesIndex:0,weight:1,length:40,date:'2026-11-24T12:00:00Z'};
  const current={...old,lureId:'spinner',environment:new Environment().snapshot(1.5)};
  const data=migrateCatches([old,current,{...old,environment:{temperature:NaN,weather:'tornado',hour:Infinity}}]);
  assert.equal(data.length,3);assert.equal(data[0].environment,null);assert.ok(captureConditions(data[0]).includes('No registrado'));assert.equal(data[1].environment.depth,1.5);assert.equal(data[2].environment.temperature,null);
  assert.deepEqual(migrateCatches(JSON.parse(JSON.stringify(data))),data);const csv=exportCatches(data);assert.ok(csv.includes('No registrado'));assert.ok(csv.includes('Despejado'));assert.ok(csv.includes('Profundidad'));
});
test('wind changes cast and drift modestly without changing distance or the shared action logic',()=>{
  const e=new Environment();e.weather.windX=6;e.weather.windZ=0;const game=new FishingGame({environment:e,school:new FishSchool({count:0})});game.press();game.update(1);game.release();assert.ok(game.windOffset.x>0&&game.windOffset.x<.6);const cast=game.distance;
  for(let i=0;i<60*120;i++)game.update(1/60);assert.equal(game.distance,cast);assert.ok(Math.abs(game.windOffset.x)<=1.5);assert.equal(game.state,'waiting');
});
