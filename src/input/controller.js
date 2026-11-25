import {FishingActions} from './actions.js';
import {TOUCH_SENSITIVITY} from './touch-mode.js';
const MAX_TOUCH_DELTA=40;

export class GameControls {
  constructor({canvas,button,game,world,isPaused,onPause,onCommand,isExploring=()=>false}) {
    this.actions=new FishingActions(game,{isBlocked:()=>isPaused()||isExploring()});this.cameraPointer=null;
    this.canvas=canvas;this.cleanup=[];
    const listen=(el,type,handler,options)=>{el.addEventListener(type,handler,options);this.cleanup.push(()=>el.removeEventListener(type,handler,options));};
    const stopCamera=id=>{if(this.cameraPointer===id)this.cameraPointer=null;};
    for(const el of [canvas,button]) {
      listen(el,'pointerdown',e=>{
        if(isPaused())return;
        if(el===canvas&&(e.pointerType==='touch'||e.button===2||isExploring())) {
          if(this.cameraPointer!==null)return;
          this.cameraPointer=e.pointerId;this.previousX=e.clientX;this.previousY=e.clientY;this.cameraTouch=e.pointerType==='touch';
          el.setPointerCapture(e.pointerId);e.preventDefault();return;
        }
        if(e.button!==0)return;
        e.preventDefault();el.setPointerCapture(e.pointerId);this.actions.hold(`pointer:${e.pointerId}`);
      });
      listen(el,'pointerup',e=>{stopCamera(e.pointerId);this.actions.release(`pointer:${e.pointerId}`);});
      const cancel=e=>{stopCamera(e.pointerId);this.actions.release(`pointer:${e.pointerId}`,{cancel:true});};
      listen(el,'pointercancel',cancel);listen(el,'lostpointercapture',cancel);
      listen(el,'contextmenu',e=>e.preventDefault());
    }
    listen(canvas,'pointermove',e=>{
      if(document.pointerLockElement===canvas)return;
      if(this.cameraPointer!==e.pointerId||isPaused())return;
      let dx=e.clientX-this.previousX,dy=e.clientY-this.previousY;
      this.previousX=e.clientX;this.previousY=e.clientY;
      if(this.cameraTouch){dx=Math.max(-MAX_TOUCH_DELTA,Math.min(MAX_TOUCH_DELTA,dx))*TOUCH_SENSITIVITY;dy=Math.max(-MAX_TOUCH_DELTA,Math.min(MAX_TOUCH_DELTA,dy))*TOUCH_SENSITIVITY;}
      world.look(dx,dy);
    });
    listen(button,'keydown',e=>{if(e.code==='Enter'&&!e.repeat){e.preventDefault();this.actions.hold('enter');}});
    listen(button,'keyup',e=>{if(e.code==='Enter'){e.preventDefault();this.actions.release('enter');}});
    listen(window,'keydown',e=>{
      if(e.code==='Space'){if(!isPaused()){e.preventDefault();if(!e.repeat)this.actions.hold('space');}return;}
      if(e.repeat)return;
      if(e.code==='KeyP'&&!document.querySelector('dialog[open]:not(#pause-dialog)'))onPause(!isPaused());
      if(e.code==='KeyR'&&!isPaused()&&!isExploring()){this.clear();game.reset();}
      const commands={KeyM:'sound',KeyF:'fullscreen',KeyJ:'journal',KeyH:'help',KeyE:'equipment'};
      const command=commands[e.code];
      if(command&&(!isPaused()||command==='sound'||command==='fullscreen'))onCommand(command);
    });
    listen(window,'keyup',e=>{if(e.code==='Space')this.actions.release('space');});
    const focusLost=()=>{this.clear();if(!isPaused())onPause(true);};
    listen(window,'blur',focusLost);listen(document,'visibilitychange',()=>{if(document.hidden)focusLost();});
    listen(window,'resize',()=>this.clear());
  }
  clear(){this.actions.clear();this.cameraPointer=null;}
  dispose(){this.clear();this.cleanup.forEach(fn=>fn());}
}
