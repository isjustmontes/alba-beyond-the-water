// Walkable footprint of the existing dock boards (x +/-2.4, z 1.71..13.69).
// Inset by a body radius: posts and side ropes remain outside the walkable area.
import {walkHeight,nearestSpot,atSpot,FISHING_SPOTS} from './shore-route.js';
import {CameraStick} from './camera-stick.js';
export const WALK={radius:.3,minX:-2.1,maxX:2.1,minZ:2.01,maxZ:13.39,floor:.78,eye:1.7,speed:2.8,runMultiplier:4/2.8,jumpSpeed:3.8,gravity:12};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export class Exploration {
  constructor(){this.mode='fishing';this.x=0;this.z=7;this.spot=FISHING_SPOTS[0];this.obstacles=[];this.heightAt=(x,z)=>walkHeight(x,z,this.obstacles);this.vx=0;this.vz=0;this.keys=new Set();this.stick={x:0,y:0};this.sprint=false;this.jumpHeight=0;this.verticalSpeed=0;}
  get floor(){return this.heightAt(this.x,this.z)??WALK.floor;}
  get nearest(){return nearestSpot(this.x,this.z);}
  get grounded(){return this.jumpHeight===0&&this.verticalSpeed===0;}
  jump(){
    if(this.mode!=='exploring'||!this.grounded||this.heightAt(this.x,this.z)===null)return false;
    this.verticalSpeed=WALK.jumpSpeed;return true;
  }
  get running(){return this.mode==='exploring'&&(this.sprint||this.keys.has('ShiftLeft')||this.keys.has('ShiftRight'));}
  clear(){this.keys.clear();this.stick.x=this.stick.y=0;this.vx=this.vz=0;this.sprint=false;}
  toggle(state,yaw,pitch,canFish=()=>true){
    if(!this.grounded)return 'Espera a aterrizar antes de equipar la caña.';
    if(this.mode==='fishing'){
      if(state!=='ready')return 'Recupera el aparejo y termina la captura antes de explorar.';
      this.mode='exploring';
    }else{
      const spot=atSpot(this.x,this.z,this.obstacles);
      if(!spot)return 'Acércate a una orilla transitable o al puesto del muelle.';
      if(spot.id==='dock'&&(Math.abs(yaw-spot.yaw)>spot.look||pitch<-.48||pitch>.25))return 'Mira hacia el lago para volver a pescar.';
      if(spot.id!=='dock'&&!canFish())return 'Apunta hacia agua libre de tierra y obstáculos para pescar.';
      this.spot=spot;this.mode='fishing';
      if(spot.id==='dock'){this.x=spot.x;this.z=spot.z;}
    }
    this.clear();return null;
  }
  update(dt,yaw){
    if(this.mode!=='exploring')return;
    let x=(this.keys.has('KeyD')?1:0)-(this.keys.has('KeyA')?1:0)+this.stick.x;
    let y=(this.keys.has('KeyS')?1:0)-(this.keys.has('KeyW')?1:0)+this.stick.y;
    const length=Math.hypot(x,y);if(length>1){x/=length;y/=length;}
    const speed=WALK.speed*(this.running?WALK.runMultiplier:1);
    // Substeps and exponential smoothing keep speed and boundaries stable at low FPS.
    let remaining=Math.min(.25,Math.max(0,dt));
    while(remaining>1e-8){
      const step=Math.min(remaining,1/120),blend=1-Math.exp(-step*14),c=Math.cos(yaw),s=Math.sin(yaw);
      this.vx+=((x*c+y*s)*speed-this.vx)*blend;
      this.vz+=((-x*s+y*c)*speed-this.vz)*blend;
      const nextX=this.x+this.vx*step,nextZ=this.z+this.vz*step;
      if(this.heightAt(nextX,nextZ)!==null){this.x=nextX;this.z=nextZ;}
      else if(this.heightAt(nextX,this.z)!==null)this.x=nextX;
      else if(this.heightAt(this.x,nextZ)!==null)this.z=nextZ;
      if(this.x!==nextX)this.vx=0;if(this.z!==nextZ)this.vz=0;
      if(!this.grounded){
        this.jumpHeight+=this.verticalSpeed*step-.5*WALK.gravity*step*step;
        this.verticalSpeed-=WALK.gravity*step;
        if(this.jumpHeight<=0){this.jumpHeight=0;this.verticalSpeed=0;}
      }
      remaining-=step;
    }
  }
}

export class ExplorationControls {
  constructor({motion,world,canvas,joystick,lookJoystick,modeButton,runButton,toggle,isPaused,isTouch=()=>false}){
    this.motion=motion;this.pointer=null;this.joystick=joystick;this.runButton=runButton;
    this.cameraStick=lookJoystick?new CameraStick({element:lookJoystick,world,isPaused,isActive:isTouch}):null;
    this.listen=(el,type,fn,options)=>el.addEventListener(type,fn,options);
    if(modeButton)bindModeToggle(modeButton,toggle);
    if(runButton)bindModeToggle(runButton,()=>{if(!isPaused()&&motion.mode==='exploring'){motion.sprint=!motion.sprint;runButton.setAttribute('aria-pressed',String(motion.sprint));}});
    this.listen(window,'keydown',e=>{
      if(e.code==='Escape'&&document.pointerLockElement===canvas){document.exitPointerLock();this.clear();return;}
      if(e.code==='KeyV'&&!e.repeat&&!isPaused()){e.preventDefault();toggle();return;}
      if(e.code==='Space'&&motion.mode==='exploring'&&!isPaused()){
        e.preventDefault();if(!e.repeat&&!motion.keys.has('Space')){motion.keys.add('Space');motion.jump();}return;
      }
      if(motion.mode!=='exploring'||isPaused()||!['KeyW','KeyA','KeyS','KeyD','ShiftLeft','ShiftRight'].includes(e.code))return;
      e.preventDefault();motion.keys.add(e.code);
    });
    this.listen(window,'keyup',e=>motion.keys.delete(e.code));
    this.listen(canvas,'click',e=>{
      if(motion.mode==='exploring'&&e.pointerType!=='touch'&&!isPaused()){
        try{canvas.requestPointerLock?.()?.catch(()=>{});}catch{/* Mouse drag remains available. */}
      }
    });
    this.listen(document,'mousemove',e=>{
      if(document.pointerLockElement===canvas&&motion.mode==='exploring'&&!isPaused())world.look(e.movementX,e.movementY);
    });
    this.listen(document,'pointerlockchange',()=>{if(document.pointerLockElement!==canvas)this.clear();});
    const move=e=>{
      const r=joystick.getBoundingClientRect(),radius=r.width*.32;
      let x=(e.clientX-r.left-r.width/2)/radius,y=(e.clientY-r.top-r.height/2)/radius;
      const length=Math.hypot(x,y);if(length>1){x/=length;y/=length;}
      motion.stick.x=x;motion.stick.y=y;
      joystick.style.setProperty('--stick-x',`${x*radius}px`);joystick.style.setProperty('--stick-y',`${y*radius}px`);
    };
    this.listen(joystick,'pointerdown',e=>{
      if(isPaused()||motion.mode!=='exploring'||this.pointer!==null)return;
      e.preventDefault();this.pointer=e.pointerId;joystick.setPointerCapture(e.pointerId);move(e);
    });
    this.listen(joystick,'pointermove',e=>{if(this.pointer===e.pointerId)move(e);});
    for(const type of ['pointerup','pointercancel','lostpointercapture'])this.listen(joystick,type,e=>{if(this.pointer===e.pointerId)this.clearMove();});
    for(const type of ['blur','resize'])this.listen(window,type,()=>this.clear());
    this.listen(document,'visibilitychange',()=>{if(document.hidden)this.clear();});
  }
  update(dt){this.cameraStick?.update(dt);}
  clearMove(){
    const pointer=this.pointer;this.pointer=null;this.motion.clear();
    if(pointer!==null&&this.joystick.hasPointerCapture(pointer))this.joystick.releasePointerCapture(pointer);
    this.runButton?.setAttribute('aria-pressed','false');this.joystick.style.setProperty('--stick-x','0px');this.joystick.style.setProperty('--stick-y','0px');
  }
  clear(){this.clearMove();this.cameraStick?.clear();}
}

// Some mobile browsers suppress the compatibility click after a camera drag.
// A completed tap uses pointerup; the later compatibility click cannot toggle twice.
export function bindModeToggle(button,toggle,{now=()=>performance.now()}={}){
  let touch=null,lastTouch=-Infinity;
  button.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')touch={id:e.pointerId,x:e.clientX,y:e.clientY};});
  button.addEventListener('pointercancel',()=>{touch=null;});
  button.addEventListener('pointerup',e=>{
    const start=touch;touch=null;
    if(e.pointerType!=='touch'||!start||start.id!==e.pointerId||Math.hypot(e.clientX-start.x,e.clientY-start.y)>14)return;
    e.preventDefault();lastTouch=now();toggle();lastTouch=now();
  });
  button.addEventListener('click',e=>{if(e.detail!==0&&now()-lastTouch<700)return;toggle();});
}
