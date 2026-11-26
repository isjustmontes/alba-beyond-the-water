// Zone data and session-only travel. Rendering remains owned by LakeWorld.
export const ZONES=Object.freeze({
  'lago-sereno':Object.freeze({
    id:'lago-sereno',name:'Lago Sereno',defaultEntry:'dock',
    entries:Object.freeze({dock:Object.freeze({
      position:Object.freeze({x:0,y:3,z:7}),yaw:0,pitch:-.065
    }),villagePath:Object.freeze({position:Object.freeze({x:6,y:3,z:73}),yaw:Math.PI,pitch:0})}),
    exits:Object.freeze({village:Object.freeze({zoneId:'anglers-village',entryId:'lakePath',x:6,z:74,radius:3,name:'Viajar a la aldea'})})
  }),
  'anglers-village':Object.freeze({
    id:'anglers-village',name:'Aldea de Lago Sereno',defaultEntry:'lakePath',
    entries:Object.freeze({lakePath:Object.freeze({position:Object.freeze({x:0,y:2.94,z:29}),yaw:0,pitch:0})}),
    exits:Object.freeze({lake:Object.freeze({zoneId:'lago-sereno',entryId:'villagePath',x:0,z:30,radius:3,name:'Volver a Lago Sereno'})})
  })
});

function entryFor(zones,zoneId,entryId){
  if(!Object.hasOwn(zones,zoneId))throw new Error(`Unknown zone: ${zoneId}`);
  const zone=zones[zoneId];
  if(zone.id!==zoneId||!zone.entries||!zone.exits)throw new Error(`Invalid zone: ${zoneId}`);
  if(!Object.hasOwn(zone.entries,entryId))throw new Error(`Unknown entry: ${zoneId}/${entryId}`);
  const spawn=zone.entries[entryId];
  if(![spawn?.position?.x,spawn?.position?.y,spawn?.position?.z,spawn?.yaw,spawn?.pitch].every(Number.isFinite))throw new Error(`Invalid spawn: ${zoneId}/${entryId}`);
  return {position:{...spawn.position},yaw:spawn.yaw,pitch:spawn.pitch};
}

export class ZoneManager {
  constructor({zones=ZONES,zoneId='lago-sereno',entryId,scene}={}){
    if(!Object.hasOwn(zones,zoneId))throw new Error(`Unknown zone: ${zoneId}`);
    entryId??=zones[zoneId].defaultEntry;
    entryFor(zones,zoneId,entryId);
    this.zones=zones;this.zoneId=zoneId;this.entryId=entryId;this.scene=scene;this.positions=new Map();
  }
  get current(){return this.zones[this.zoneId];}
  get spawn(){return entryFor(this.zones,this.zoneId,this.entryId);}
  nearbyExit(x,z){
    for(const [id,exit]of Object.entries(this.current.exits))if(Math.hypot(x-exit.x,z-exit.z)<=exit.radius)return {id,...exit};
    return null;
  }
  travel(exitId,pose,{mode,state,heightAt}={}){
    if(mode!=='exploring'||state!=='ready')return null;
    const exit=this.nearbyExit(pose.position.x,pose.position.z);
    if(!exit||exit.id!==exitId)return null;
    if(![pose.position.x,pose.position.y,pose.position.z,pose.yaw,pose.pitch].every(Number.isFinite))return null;
    const plan=this.prepareExit(exitId),saved=this.positions.get(plan.to),spawn=saved?structuredClone(saved):plan.spawn;
    if(typeof heightAt!=='function'||!Number.isFinite(heightAt(plan.to,spawn.position.x,spawn.position.z)))return null;
    this.positions.set(this.zoneId,structuredClone(pose));this.zoneId=plan.to;this.entryId=plan.entryId;
    return {...plan,spawn};
  }
  prepareExit(exitId){
    if(!Object.hasOwn(this.current.exits,exitId))return null;
    const exit=this.current.exits[exitId];
    // A future adapter can consume this plan; nothing is applied here.
    return {from:this.zoneId,to:exit.zoneId,entryId:exit.entryId,spawn:entryFor(this.zones,exit.zoneId,exit.entryId)};
  }
}
