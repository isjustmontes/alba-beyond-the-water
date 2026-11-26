import {FirstMorningTimeline,INTRO_DURATION} from '../animation/first-morning.js';
import './first-morning.css';

// Opt-in presentation adapter; the caller alone decides eligibility and spawn.
export class FirstMorning {
  constructor({world,target,clearHeld,onFinish}){
    this.world=world;this.clearHeld=clearHeld;this.onFinish=onFinish;
    this.timeline=new FirstMorningTimeline(target);this.blocking=false;this.finished=false;
    this.keys=new Set();this.pointers=new Set();this.cleanup=[];this.suspended=false;
    this.motion=matchMedia('(prefers-reduced-motion: reduce)');
    this.root=document.createElement('section');this.root.className='first-morning';this.root.hidden=true;
    this.root.setAttribute('aria-label','La primera mañana');
    const copy=document.createElement('div');copy.className='first-morning__copy';
    const title=document.createElement('h1');title.textContent='ALBA';
    const subtitle=document.createElement('p');subtitle.className='first-morning__subtitle';subtitle.textContent='— Beyond the Water';
    const phrase=document.createElement('p');phrase.className='first-morning__phrase';phrase.textContent='Cada agua guarda una historia. Esta es la tuya';
    copy.append(title,subtitle,phrase);copy.setAttribute('role','status');
    this.button=document.createElement('button');this.button.className='first-morning__skip';this.button.textContent='Saltar introducción';
    this.button.setAttribute('aria-keyshortcuts','Space Escape');this.root.append(copy,this.button);document.body.append(this.root);
    const listen=(el,type,fn,options)=>{el.addEventListener(type,fn,options);this.cleanup.push(()=>el.removeEventListener(type,fn,options));};
    const consume=e=>{e.preventDefault();e.stopImmediatePropagation();};
    listen(window,'keydown',e=>{
      if(!this.blocking)return;
      if(e.code==='Tab')return;
      this.keys.add(e.code);
      if(['Space','Escape','Enter'].includes(e.code)&&!e.repeat)this.skip();
      consume(e);
    },true);
    listen(window,'keyup',e=>{const held=this.keys.delete(e.code);if(this.blocking||held)consume(e);},true);
    for(const type of ['pointerdown','pointermove','pointerup','pointercancel','click','contextmenu','wheel'])listen(window,type,e=>{
      if(!this.blocking)return;
      if(type==='pointerdown')this.pointers.add(e.pointerId);
      if(type==='pointerup'||type==='pointercancel')this.pointers.delete(e.pointerId);
      if(!this.root.contains(e.target))consume(e);
    },{capture:true,passive:false});
    listen(this.button,'click',e=>{consume(e);this.skip();});
    listen(window,'blur',()=>{if(this.blocking){this.suspended=true;this.clearInputs();}});
    listen(window,'focus',()=>{this.suspended=false;});
    listen(document,'visibilitychange',()=>{if(document.hidden){this.suspended=true;this.clearInputs();}else this.suspended=false;});
    listen(this.motion,'change',e=>{if(this.blocking&&e.matches)this.skip(true);});
  }
  clearInputs(){this.keys.clear();this.pointers.clear();this.clearHeld();}
  start(){
    if(!this.timeline.start({reducedMotion:this.motion.matches}))return false;
    this.clearInputs();this.root.hidden=false;this.blocking=true;
    document.documentElement.classList.add('intro-active');
    this.applyPose();
    if(this.motion.matches)this.finish(true);else this.button.focus({preventScroll:true});
    return true;
  }
  skip(reducedMotion=false){this.timeline.skip({reducedMotion});}
  applyPose(){
    const p=this.timeline.pose;this.world.camera.position.set(p.x,p.y,p.z);
    this.world.yaw=p.yaw;this.world.pitch=p.pitch;this.world.viewPitchTarget=null;this.world.setView();
  }
  update(dt){
    if(!this.blocking)return;
    this.timeline.update(dt,{suspended:this.suspended||document.hidden});this.applyPose();
    // Titles fade before normal completion; skipping retains the view during its short ease-out.
    const t=this.timeline.elapsed;
    const opacity=this.timeline.state==='handing-off'?1:Math.min(1,.2+t/1.4,(INTRO_DURATION-t)/1.5);
    this.root.style.setProperty('--intro-copy-opacity',String(Math.max(0,opacity)));
    if(this.timeline.state==='complete'&&!this.keys.size&&!this.pointers.size)this.finish(this.motion.matches);
  }
  finish(reducedMotion=false){
    if(this.finished)return;this.finished=true;this.blocking=false;
    this.clearInputs();document.documentElement.classList.remove('intro-active');
    this.button.hidden=true;this.button.blur();
    if(reducedMotion){
      this.root.classList.add('first-morning--caption');this.root.style.setProperty('--intro-copy-opacity','1');
      this.captionTimer=setTimeout(()=>{this.root.hidden=true;},2400);
    }else this.root.hidden=true;
    this.onFinish({...this.timeline.target});
    // No camera listeners or capture gate remain once control has been returned.
    this.cleanup.forEach(fn=>fn());this.cleanup.length=0;
  }
  dispose(){clearTimeout(this.captionTimer);this.cleanup.forEach(fn=>fn());this.cleanup.length=0;this.root.remove();}
}
