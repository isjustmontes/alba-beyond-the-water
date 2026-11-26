// Data and planning only. The existing LakeWorld still owns rendering and gameplay.
export const ZONES=Object.freeze({
  'lago-sereno':Object.freeze({
    id:'lago-sereno',name:'Lago Sereno',defaultEntry:'dock',
    entries:Object.freeze({dock:Object.freeze({
      position:Object.freeze({x:0,y:3,z:7}),yaw:0,pitch:-.065
    })}),
    exits:Object.freeze({})
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
    this.zones=zones;this.zoneId=zoneId;this.entryId=entryId;this.scene=scene;
  }
  get current(){return this.zones[this.zoneId];}
  get spawn(){return entryFor(this.zones,this.zoneId,this.entryId);}
  prepareExit(exitId){
    if(!Object.hasOwn(this.current.exits,exitId))return null;
    const exit=this.current.exits[exitId];
    // A future adapter can consume this plan; nothing is applied here.
    return {from:this.zoneId,to:exit.zoneId,entryId:exit.entryId,spawn:entryFor(this.zones,exit.zoneId,exit.entryId)};
  }
}
