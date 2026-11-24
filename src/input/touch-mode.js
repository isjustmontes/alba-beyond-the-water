export const TOUCH_SENSITIVITY=.8;
export function shouldUseTouch({coarse=false,hover=true,anyFine=false,anyHover=true,touchPoints=0,width=1440,lastInput=null}={}) {
  if(lastInput==='mouse'||lastInput==='keyboard')return false;
  if(lastInput==='touch')return touchPoints>0&&(width<=1180||(coarse&&!hover));
  return touchPoints>0&&coarse&&!hover&&(!(anyFine&&anyHover)||width<=900);
}
export class InputMode {
  constructor(onChange) {
    this.onChange=onChange;this.lastInput=null;this.active=null;
    this.queries={coarse:matchMedia('(pointer: coarse)'),hover:matchMedia('(hover: hover)'),anyFine:matchMedia('(any-pointer: fine)'),anyHover:matchMedia('(any-hover: hover)')};
    this.refresh=()=>this.update();
    Object.values(this.queries).forEach(q=>q.addEventListener('change',this.refresh));
    addEventListener('resize',this.refresh);
    this.pointer=e=>{if(e.pointerType==='touch'||e.pointerType==='mouse'){this.lastInput=e.pointerType;this.update();}};
    this.keyboard=e=>{if(!e.metaKey&&!e.ctrlKey&&!e.altKey){this.lastInput='keyboard';this.update();}};
    document.addEventListener('pointerdown',this.pointer,true);
    document.addEventListener('keydown',this.keyboard,true);this.update();
  }
  update() {
    const state={touchPoints:navigator.maxTouchPoints,width:innerWidth,lastInput:this.lastInput};
    for(const [key,query]of Object.entries(this.queries))state[key]=query.matches;
    const next=shouldUseTouch(state);
    if(next!==this.active){this.active=next;this.onChange(next);}
  }
  dispose() {
    Object.values(this.queries).forEach(q=>q.removeEventListener('change',this.refresh));removeEventListener('resize',this.refresh);
    document.removeEventListener('pointerdown',this.pointer,true);document.removeEventListener('keydown',this.keyboard,true);
  }
}
