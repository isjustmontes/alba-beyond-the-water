import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Exploration,ExplorationControls,WALK} from '../src/input/exploration.js';
import {GameControls} from '../src/input/controller.js';
import {walkHeight,SHORE_PATH,FISHING_SPOTS} from '../src/input/shore-route.js';
import {villageWalkHeight,VILLAGE_HOUSES} from '../src/village-layout.js';
import {zoneMapData,mapProjection,mapHeading,mapSurface} from '../src/zone-map.js';
import {ZONES} from '../src/zones.js';

test('walk and sprint increases meet the requested independent ranges on keyboard and touch',()=>{
  assert.ok(WALK.speed/2.2>=1.25&&WALK.speed/2.2<=1.30);
  assert.ok(WALK.speed*WALK.runMultiplier/3.3>=1.20&&WALK.speed*WALK.runMultiplier/3.3<=1.25);
  for(const touch of [false,true]){
    const m=new Exploration();m.mode='exploring';m.x=4;m.z=32;
    if(touch){m.stick.y=1;m.sprint=true;}else{m.keys.add('KeyS');m.keys.add('ShiftLeft');}
    for(let i=0;i<60;i++)m.update(1/60,0);
    assert.ok(Math.abs(m.vz-4)<.0001);
  }
});

test('jump uses gravity, lands once, rejects air jumps/equipping and behaves consistently across frame rates',()=>{
  for(const fps of [20,60,120]){
    const m=new Exploration();assert.equal(m.jump(),false,'fishing cannot jump');m.mode='exploring';
    assert.equal(m.jump(),true);assert.equal(m.jump(),false);assert.ok(m.toggle('ready',0,0));
    let peak=0,airTime=0;
    while(!m.grounded&&airTime<2){m.update(1/fps,0);peak=Math.max(peak,m.jumpHeight);airTime+=1/fps;}
    assert.ok(peak>.58&&peak<.61);assert.ok(airTime>.6&&airTime<.7);
    assert.equal(m.jumpHeight,0);assert.equal(m.verticalSpeed,0);m.update(.25,0);assert.equal(m.jumpHeight,0);
    assert.equal(m.jump(),true,'another press can jump after landing');
  }
});

test('jump never bypasses water or solid footprints and input cleanup preserves its physical trajectory',()=>{
  for(const village of [false,true]){
    const m=new Exploration();m.mode='exploring';m.heightAt=village?villageWalkHeight:walkHeight;
    m.x=village?0:2;m.z=7;m.keys.add('KeyD');m.sprint=true;
    for(let i=0;i<900;i++){if(m.grounded)m.jump();m.update(1/60,0);assert.notEqual(m.heightAt(m.x,m.z),null);}
    m.jump();m.update(.1,0);const height=m.jumpHeight,velocity=m.verticalSpeed;
    m.clear();assert.equal(m.jumpHeight,height);assert.equal(m.verticalSpeed,velocity);
    for(let i=0;i<60;i++)m.update(1/60,0);assert.equal(m.grounded,true);
  }
});

test('Space is routed once per press to jump or fishing; paused menus block both; M and N are separate',()=>{
  const oldWindow=globalThis.window,oldDocument=globalThis.document;
  const win=new EventTarget(),doc=new EventTarget(),canvas=new EventTarget(),button=new EventTarget(),stick=new EventTarget();
  doc.querySelector=()=>null;stick.style={setProperty(){}};globalThis.window=win;globalThis.document=doc;
  try{
    const m=new Exploration();m.mode='exploring';let paused=false,presses=0,releases=0;const commands=[];
    new ExplorationControls({motion:m,world:{},canvas,joystick:stick,toggle(){},isPaused:()=>paused});
    const input=new GameControls({canvas,button,game:{press(){presses++;},release(){releases++;},cancelHeld(){}},world:{},isExploring:()=>m.mode==='exploring',isPaused:()=>paused,onPause(){},onCommand:c=>commands.push(c)});
    const send=(type,code,repeat=false)=>win.dispatchEvent(Object.assign(new Event(type,{cancelable:true}),{code,repeat}));
    send('keydown','Space');const velocity=m.verticalSpeed;send('keydown','Space',true);assert.equal(m.verticalSpeed,velocity);assert.equal(presses,0);
    for(let i=0;i<60;i++)m.update(1/60,0);
    send('keydown','Space',true);assert.equal(m.grounded,true,'holding Space does not auto-bounce');
    send('keyup','Space');paused=true;send('keydown','Space');assert.equal(m.grounded,true);
    send('keydown','KeyM');send('keydown','KeyM',true);send('keydown','KeyN');assert.deepEqual(commands,['map','sound']);
    paused=false;m.mode='fishing';send('keydown','Space');send('keydown','Space',true);send('keyup','Space');assert.equal(presses,1);assert.equal(releases,1);assert.equal(m.grounded,true);
    input.dispose();
  }finally{globalThis.window=oldWindow;globalThis.document=oldDocument;}
});

test('map features use existing houses, fishing spots, paths and exit coordinates, with independent points',()=>{
  const lake=zoneMapData('lago-sereno'),village=zoneMapData('anglers-village');
  assert.deepEqual(lake.points.slice(0,3),FISHING_SPOTS.map(({name,x,z})=>({name,x,z})));
  assert.equal(lake.paths[0],SHORE_PATH);assert.equal(village.buildings,VILLAGE_HOUSES);
  for(const map of [lake,village])for(const exit of Object.values(ZONES[map.id].exits))assert.ok(map.points.some(p=>p.x===exit.x&&p.z===exit.z));
  lake.points[0].x=999;assert.equal(FISHING_SPOTS[0].x,0);assert.throws(()=>zoneMapData('invented'));
  assert.equal(mapSurface('lago-sereno',0,-40),'water');assert.notEqual(mapSurface('lago-sereno',0,40),'water');
  assert.notEqual(mapSurface('lago-sereno',0,-40,[{x:0,z:-40,rx:3,rz:3}]),'water');
  assert.equal(mapSurface('anglers-village',0,0),'path');
});

test('map projection preserves proportions, includes valid player routes and headings follow actual camera yaw',()=>{
  for(const id of Object.keys(ZONES)){
    const data=zoneMapData(id),project=mapProjection(data.bounds,600,600);
    const a=project(0,0),b=project(1,0),c=project(0,1);assert.ok(Math.abs((b.x-a.x)-(c.y-a.y))<1e-10);
    for(const p of data.points){const s=project(p.x,p.z);assert.ok(s.x>=30&&s.y>=30&&s.x<=570&&s.y<=570);}
  }
  assert.deepEqual(mapHeading(0),{x:-0,y:-1});assert.ok(mapHeading(Math.PI/2).x<-.99);assert.ok(mapHeading(Math.PI).y>.99);
});
