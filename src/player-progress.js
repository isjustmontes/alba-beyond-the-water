import {ZONES} from './zones.js';
export const PLAYER_STORAGE_KEY='alba-player-v1';
const PREVIOUS_KEYS=['alba-catches-v1','alba-equipment-v1','alba-village-progress-v1','alba-audio-v1','alba-onboarding-v1'];
const clone=value=>structuredClone(value);
export const PLAZA_LOCATION=Object.freeze({zoneId:'anglers-village',position:Object.freeze({x:0,y:2.788,z:11}),yaw:0,pitch:-.055,mode:'exploring'});
export const DOCK_LOCATION=Object.freeze({zoneId:'lago-sereno',position:Object.freeze({x:0,y:3,z:7}),yaw:0,pitch:-.065,mode:'fishing'});

export function safeLocation(value,heightAt){
  if(!value||!Object.hasOwn(ZONES,value.zoneId)||!value.position||!['exploring','fishing'].includes(value.mode))return null;
  const {x,y,z}=value.position;
  if(![x,y,z,value.yaw,value.pitch].every(Number.isFinite)||Math.abs(value.pitch)>1.15)return null;
  const floor=heightAt(value.zoneId,x,z);
  if(!Number.isFinite(floor))return null;
  const mode=value.zoneId==='anglers-village'?'exploring':value.mode;
  const dock=mode==='fishing'&&value.zoneId==='lago-sereno'&&x===0&&z===7;
  return {zoneId:value.zoneId,position:{x,y:dock?3:floor+1.7,z},yaw:Math.atan2(Math.sin(value.yaw),Math.cos(value.yaw)),pitch:value.pitch,mode};
}

// Local, additive document. It never mutates commerce, catches or preferences.
export class PlayerProgress {
  constructor(storage){
    this.storage=storage;this.raw=null;this.document=null;this.blocked=false;this.fresh=false;this.begun=false;
    try{
      this.raw=storage.getItem(PLAYER_STORAGE_KEY);
      // Snapshot every known legacy key before any startup writer can create one.
      this.fresh=this.raw===null&&PREVIOUS_KEYS.every(key=>storage.getItem(key)===null);
      if(this.raw!==null){
        const value=JSON.parse(this.raw);
        if(!value||value.version!==1||(value.introSeen!==undefined&&typeof value.introSeen!=='boolean'))throw Error('Unknown player progress');
        this.document=value;
      }
    }catch{this.blocked=true;}
  }
  begin(heightAt){
    if(this.begun)throw Error('Player startup already resolved');this.begun=true;
    const fallback=()=>({playIntro:false,location:clone(DOCK_LOCATION)});
    if(this.blocked)return fallback();
    if(this.document){
      if(!this.document.location)return fallback();
      const location=safeLocation(this.document.location,heightAt);
      if(!location){this.blocked=true;return fallback();}
      return {playIntro:false,location};
    }
    if(!this.fresh)return fallback();
    try{if(PREVIOUS_KEYS.some(key=>this.storage.getItem(key)!==null))return fallback();}catch{this.blocked=true;return fallback();}
    const location=safeLocation(PLAZA_LOCATION,heightAt);
    if(!location||!this.write({version:1,introSeen:true,location}))return fallback();
    return {playIntro:true,location};
  }
  write(document){
    if(this.blocked)return false;
    try{
      if(this.storage.getItem(PLAYER_STORAGE_KEY)!==this.raw)throw Error('Player progress changed');
      const raw=JSON.stringify(document);
      if(raw!==this.raw){
        this.storage.setItem(PLAYER_STORAGE_KEY,raw);
        if(this.storage.getItem(PLAYER_STORAGE_KEY)!==raw)throw Error('Player progress not persisted');
      }
      this.raw=raw;this.document=document;return true;
    }catch{this.blocked=true;return false;}
  }
  save(location,heightAt){
    if(!this.begun||this.blocked)return false;
    const safe=safeLocation(location,heightAt);if(!safe)return false;
    return this.write({...this.document,version:1,introSeen:true,location:safe});
  }
}
