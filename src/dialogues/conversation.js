import {villageWalkHeight} from '../village-layout.js';

// Shared encounter gate; retaining Manuel's exact distance and solid-footprint checks.
export function nearEncounter(point,{zone,mode,state,grounded,x,z}){
  if(zone!=='anglers-village'||mode!=='exploring'||state!=='ready'||!grounded||villageWalkHeight(x,z)===null)return false;
  const distance=Math.hypot(x-point.x,z-point.z);
  if(distance>point.radius)return false;
  const steps=Math.max(1,Math.ceil(distance/.15));
  for(let i=1;i<=steps;i++)if(villageWalkHeight(x+(point.x-x)*i/steps,z+(point.z-z)*i/steps)===null)return false;
  return true;
}
export class Conversation {
  constructor(nodes,environment){this.nodes=nodes;this.environment=environment;this.node='welcome';}
  reset(){this.node='welcome';}
  view(){
    const data=this.nodes[this.node];
    return {text:typeof data.text==='function'?data.text(this.environment):data.text,choices:data.choices.map(c=>({...c,from:this.node}))};
  }
  choose(choice){
    if(choice.from!==this.node)return false;
    const selected=this.nodes[this.node].choices.find(c=>c.id===choice.id);
    if(!selected)return false;
    if(selected.action)return {action:selected.action};
    if(selected.next===null)return 'close';
    this.node=selected.next;return true;
  }
}
