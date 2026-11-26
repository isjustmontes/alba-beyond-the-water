import {clamp,smooth} from './fishing-motion.js';
// Presentation only: one scalar moves the existing rod and reel together.
export class EquipmentTransition {
  constructor(){this.value=1;}
  get ready(){return this.value>=1;}
  get lowered(){return 1-smooth(this.value);}
  update(dt,equipped){
    this.value=clamp(this.value+(equipped?1:-1)*clamp(dt,0,.25)/.38,0,1);
    return this.lowered;
  }
}
