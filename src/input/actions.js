// All devices hold the same action. Multiple pointers/keys cannot double-clava.
export class FishingActions {
  constructor(game,{isBlocked=()=>false}={}){this.game=game;this.isBlocked=isBlocked;this.sources=new Set();}
  hold(source) {
    if(this.isBlocked()||this.sources.has(source))return false;
    const first=this.sources.size===0;this.sources.add(source);
    if(first)this.game.press();return first;
  }
  release(source,{cancel=false}={}) {
    if(!this.sources.delete(source))return false;
    if(this.sources.size===0){if(cancel)this.game.cancelHeld();else this.game.release();}
    return true;
  }
  clear(){this.sources.clear();this.game.cancelHeld();}
}
