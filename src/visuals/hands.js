import {Group} from 'three';

// Integration boundary only. No placeholder anatomy, downloads or loader in the game bundle.
// A future, reviewed GLB adapter owns skeletal animation/retargeting and alignment to both grips.
export class FirstPersonHands {
  constructor(camera,rig){
    this.root=new Group();this.root.name='FirstPersonHands';this.root.visible=false;camera.add(this.root);
    this.rig=rig;this.available=false;this.enabled=false;this.model=null;this.driver=null;
    this.context={dt:0,state:'ready',castTime:0,chargeTime:0,tension:0,power:0,reelRate:0,rightGrip:rig.gripSocket,leftGrip:rig.crankSocket};
  }
  mount({model,driver,source,license,visuallyValidated=false}={}){
    let skinned=false;model?.traverse?.(node=>{if(node.isSkinnedMesh)skinned=true;});
    if(!skinned||typeof driver?.update!=='function'||!source||!license||!visuallyValidated)return false;
    // Calling code must first verify actual provenance, licensing and all poses on PC/mobile.
    this.unmount();this.model=model;this.driver=driver;this.root.add(model);this.available=true;return true;
  }
  setEnabled(value){this.enabled=Boolean(value&&this.available);this.root.visible=this.enabled;return this.enabled;}
  update(dt,game){
    if(!this.enabled)return;
    const c=this.context;c.dt=dt;c.state=game.state;c.castTime=game.castTime||0;c.chargeTime=game.chargeTime||0;c.tension=game.tension;c.power=game.power;c.reelRate=this.rig.reelRate;
    this.driver.update(c);
  }
  unmount(){this.setEnabled(false);if(this.model)this.root.remove(this.model);this.driver?.dispose?.();this.model=null;this.driver=null;this.available=false;}
}
