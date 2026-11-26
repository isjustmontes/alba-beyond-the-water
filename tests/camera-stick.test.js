import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CameraStick,CAMERA_STICK} from '../src/input/camera-stick.js';
import {Exploration,ExplorationControls} from '../src/input/exploration.js';
import {LakeWorld} from '../src/world.js';

class Pad extends EventTarget {
  constructor(){super();this.captures=new Set();this.values={};this.style={setProperty:(k,v)=>this.values[k]=v};}
  getBoundingClientRect(){return {left:0,top:0,width:100,height:100};}
  setPointerCapture(id){this.captures.add(id);}
  hasPointerCapture(id){return this.captures.has(id);}
  releasePointerCapture(id){this.captures.delete(id);send(this,'lostpointercapture',id);}
}
function send(element,type,id=1,x=50,y=50,pointerType='touch'){
  element.dispatchEvent(Object.assign(new Event(type,{cancelable:true}),{pointerId:id,clientX:x,clientY:y,pointerType}));
}
function fixture(){
  const element=new Pad(),world={x:0,y:0,look(dx,dy){this.x+=dx;this.y+=dy;}},state={paused:false,active:true};
  const stick=new CameraStick({element,world,isPaused:()=>state.paused,isActive:()=>state.active});return {stick,element,world,state};
}

test('camera stick has a radial dead zone, proportional speed and bounded diagonal tilt',()=>{
  const run=(x,y)=>{const f=fixture();send(f.element,'pointerdown',1,x,y);for(let i=0;i<120;i++)f.stick.update(1/120);return f;};
  assert.equal(run(53,52).world.x,0);assert.equal(run(53,52).world.y,0);
  const full=run(82,50),half=run(50+32*(1+CAMERA_STICK.deadZone)/2,50),diagonal=run(500,500);
  assert.ok(Math.abs(half.world.x*2-full.world.x)<1e-8);
  assert.ok(Math.abs(Math.hypot(diagonal.stick.x,diagonal.stick.y)-1)<1e-10);
  assert.ok(full.stick.vx>0&&full.stick.vx<=1);
});

test('camera keeps turning without pointermove and smoothing is frame-rate independent',()=>{
  const totals=[];
  for(const fps of [20,60,120]){
    const f=fixture();send(f.element,'pointerdown',1,82,18);f.stick.update(1/fps);
    assert.ok(f.world.x<CAMERA_STICK.horizontal/fps,'starts smoothly');
    for(let i=1;i<fps;i++)f.stick.update(1/fps);totals.push([f.world.x,f.world.y]);
    const before=f.world.x;f.stick.update(1/fps);assert.ok(f.world.x>before,'held pad continues turning');
  }
  for(const v of totals){assert.ok(Math.abs(v[0]-totals[0][0])<1e-8);assert.ok(Math.abs(v[1]-totals[0][1])<1e-8);}
});

test('camera ignores other fingers/mouse, cancels only its pointer and stops immediately on release',()=>{
  const f=fixture();send(f.element,'pointerdown',1,82,50,'mouse');assert.equal(f.stick.pointer,null);
  send(f.element,'pointerdown',1,82,50);send(f.element,'pointerdown',2,18,50);send(f.element,'pointermove',2,18,50);send(f.element,'pointercancel',2);
  assert.equal(f.stick.pointer,1);assert.equal(f.stick.x,1);f.stick.update(.1);
  send(f.element,'pointerup');const before=f.world.x;f.stick.update(.2);assert.equal(f.world.x,before);
  assert.equal(f.element.values['--stick-x'],'0px');assert.equal(f.element.captures.size,0);
});

test('pause and switching to desktop clear captured camera input without residual turning',()=>{
  for(const key of ['paused','active']){
    const f=fixture();send(f.element,'pointerdown',1,82,50);f.stick.update(.1);
    f.state[key]=key==='paused';const before=f.world.x;f.stick.update(.1);assert.equal(f.world.x,before);assert.equal(f.stick.pointer,null);
    f.state.paused=false;f.state.active=true;f.stick.update(.1);assert.equal(f.world.x,before);
  }
});

test('both pads own independent pointers: releasing either leaves the other active; global cleanup resets both',()=>{
  const oldWindow=globalThis.window,oldDocument=globalThis.document;globalThis.window=new EventTarget();globalThis.document=new EventTarget();
  try{
    const left=new Pad(),right=new Pad(),motion=new Exploration(),world={look(){}};motion.mode='exploring';
    const controls=new ExplorationControls({motion,world,canvas:new Pad(),joystick:left,lookJoystick:right,toggle(){},isPaused:()=>false,isTouch:()=>true});
    send(left,'pointerdown',11,50,18);send(right,'pointerdown',22,82,50);
    assert.equal(motion.stick.y,-1);assert.equal(controls.cameraStick.x,1);
    send(right,'pointerup',22);assert.equal(motion.stick.y,-1);assert.equal(controls.pointer,11);
    send(right,'pointerdown',23,82,50);send(left,'pointerup',11);
    assert.equal(controls.cameraStick.pointer,23);assert.equal(controls.cameraStick.x,1);assert.equal(motion.stick.y,0);
    send(left,'pointerdown',12,50,18);globalThis.window.dispatchEvent(new Event('resize'));
    assert.equal(controls.pointer,null);assert.equal(controls.cameraStick.pointer,null);assert.deepEqual(motion.stick,{x:0,y:0});
    send(left,'pointerdown',13,50,18);send(right,'pointerdown',24,82,50);globalThis.window.dispatchEvent(new Event('blur'));
    assert.equal(controls.cameraStick.pointer,null);assert.equal(controls.pointer,null);
  }finally{globalThis.window=oldWindow;globalThis.document=oldDocument;}
});

test('stick uses the actual camera limits in exploration and fishing without changing PC look sensitivity',()=>{
  for(const exploring of [true,false]){
    const world={exploring,yaw:0,pitch:0,setView(){},look:LakeWorld.prototype.look},element=new Pad();
    const stick=new CameraStick({element,world,isPaused:()=>false,isActive:()=>true});
    send(element,'pointerdown',1,82,-100);for(let i=0;i<240;i++)stick.update(1/60);
    assert.equal(world.pitch,exploring?1.15:.25);if(!exploring)assert.equal(world.yaw,-.8);
    send(element,'pointermove',1,18,100);for(let i=0;i<240;i++)stick.update(1/60);
    assert.equal(world.pitch,exploring?-1.15:-.48);if(!exploring)assert.equal(world.yaw,.8);
  }
});
