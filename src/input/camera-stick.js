// Same camera path as mouse/drag: look() owns pitch and fishing yaw limits.
export const CAMERA_STICK={deadZone:.14,smoothing:12,horizontal:825,vertical:600};
export class CameraStick {
  constructor({element,world,isPaused,isActive}){
    this.element=element;this.world=world;this.isPaused=isPaused;this.isActive=isActive;
    this.pointer=null;this.x=this.y=this.vx=this.vy=0;
    const move=e=>{
      const r=element.getBoundingClientRect(),radius=r.width*.32;
      let x=(e.clientX-r.left-r.width/2)/radius,y=(e.clientY-r.top-r.height/2)/radius;
      const length=Math.hypot(x,y);if(length>1){x/=length;y/=length;}
      element.style.setProperty('--stick-x',`${x*radius}px`);element.style.setProperty('--stick-y',`${y*radius}px`);
      const magnitude=Math.hypot(x,y),gain=magnitude>CAMERA_STICK.deadZone?(magnitude-CAMERA_STICK.deadZone)/(1-CAMERA_STICK.deadZone)/magnitude:0;
      this.x=x*gain;this.y=y*gain;
    };
    element.addEventListener('pointerdown',e=>{
      if(e.pointerType!=='touch'||!isActive()||isPaused()||this.pointer!==null)return;
      e.preventDefault();this.pointer=e.pointerId;element.setPointerCapture(e.pointerId);move(e);
    });
    element.addEventListener('pointermove',e=>{if(e.pointerId===this.pointer)move(e);});
    for(const type of ['pointerup','pointercancel','lostpointercapture'])element.addEventListener(type,e=>{if(e.pointerId===this.pointer)this.clear();});
  }
  update(dt){
    if(this.isPaused()||!this.isActive()){if(this.pointer!==null)this.clear();return;}
    if(this.pointer===null)return;
    dt=Math.min(.25,Math.max(0,dt));
    const decay=Math.exp(-CAMERA_STICK.smoothing*dt),integral=(1-decay)/CAMERA_STICK.smoothing;
    const dx=this.x*dt+(this.vx-this.x)*integral,dy=this.y*dt+(this.vy-this.y)*integral;
    this.vx=this.x+(this.vx-this.x)*decay;this.vy=this.y+(this.vy-this.y)*decay;
    if(dx||dy)this.world.look(dx*CAMERA_STICK.horizontal,dy*CAMERA_STICK.vertical);
  }
  clear(){
    const pointer=this.pointer;this.pointer=null;this.x=this.y=this.vx=this.vy=0;
    if(pointer!==null&&this.element.hasPointerCapture(pointer))this.element.releasePointerCapture(pointer);
    this.element.style.setProperty('--stick-x','0px');this.element.style.setProperty('--stick-y','0px');
  }
}
