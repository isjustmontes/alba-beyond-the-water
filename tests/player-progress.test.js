import {test} from 'node:test';
import assert from 'node:assert/strict';
import {PlayerProgress,PLAYER_STORAGE_KEY,PLAZA_LOCATION,DOCK_LOCATION,safeLocation} from '../src/player-progress.js';
import {villageWalkHeight} from '../src/village-layout.js';
import {walkHeight} from '../src/input/shore-route.js';
import {ZoneManager} from '../src/zones.js';
import {VillageShop} from '../src/shop.js';
const height=(zone,x,z)=>zone==='anglers-village'?villageWalkHeight(x,z):walkHeight(x,z);
function storage(entries={}){const data=new Map(Object.entries(entries));let writes=0;return {data,get writes(){return writes;},getItem:key=>data.get(key)??null,setItem(key,value){writes++;data.set(key,String(value));}};}

test('a truly new profile is classified before shop writes and consumes intro with its plaza pose atomically',()=>{
  const s=storage(),progress=new PlayerProgress(s);assert.equal(s.writes,0);
  const startup=progress.begin(height);assert.equal(startup.playIntro,true);assert.equal(startup.location.zoneId,'anglers-village');
  assert.equal(s.writes,1);assert.equal(JSON.parse(s.getItem(PLAYER_STORAGE_KEY)).introSeen,true);
  new VillageShop(s);const reload=new PlayerProgress(s).begin(height);assert.equal(reload.playIntro,false);assert.deepEqual(reload.location,startup.location);
});
test('any legacy data, even empty, corrupt or audio-only, excludes a new game without rewriting it',()=>{
  for(const key of ['alba-catches-v1','alba-equipment-v1','alba-village-progress-v1','alba-audio-v1','alba-onboarding-v1']){
    for(const raw of ['', '[]','broken','false']){
      const s=storage({[key]:raw}),progress=new PlayerProgress(s),startup=progress.begin(height);
      assert.equal(startup.playIntro,false);assert.deepEqual(startup.location,DOCK_LOCATION);
      assert.equal(s.writes,0);assert.equal(s.getItem(key),raw);
      assert.equal(progress.save(startup.location,height),true);assert.equal(s.getItem(key),raw);
    }
  }
});
test('reload during, after or skipping an introduction never requests a second one',()=>{
  for(const outcome of ['during','complete','skip','reduced-motion']){
    const s=storage(),p=new PlayerProgress(s),first=p.begin(height);assert.equal(first.playIntro,true);
    if(outcome!=='during')p.save(first.location,height);
    assert.equal(new PlayerProgress(s).begin(height).playIntro,false);
  }
});
test('available saved zone, coordinates and orientation restore without changing commerce or catches',()=>{
  const location={zoneId:'anglers-village',position:{x:-5,y:2.8,z:5},yaw:.64,pitch:-.22,mode:'exploring'};
  const s=storage({'alba-catches-v1':'[]','alba-audio-v1':'false','alba-equipment-v1':'worm'});
  const shop=new VillageShop(s);shop.buy('spinner','existing-purchase');const commerce=s.getItem('alba-village-progress-v1');
  s.setItem(PLAYER_STORAGE_KEY,JSON.stringify({version:1,location,custom:'keep'}));
  const progress=new PlayerProgress(s),startup=progress.begin(height);assert.equal(startup.playIntro,false);
  assert.equal(startup.location.position.x,-5);assert.equal(startup.location.position.z,5);assert.equal(startup.location.yaw,.64);assert.equal(startup.location.pitch,-.22);
  progress.save(startup.location,height);assert.equal(JSON.parse(s.getItem(PLAYER_STORAGE_KEY)).custom,'keep');
  assert.equal(s.getItem('alba-village-progress-v1'),commerce);assert.equal(s.getItem('alba-catches-v1'),'[]');assert.equal(s.getItem('alba-equipment-v1'),'worm');
});
test('missing location falls back compatibly; corrupt, unknown or unsafe location records are preserved',()=>{
  const s=storage({[PLAYER_STORAGE_KEY]:JSON.stringify({version:1,introSeen:true})});
  assert.deepEqual(new PlayerProgress(s).begin(height),{playIntro:false,location:DOCK_LOCATION});
  for(const raw of ['bad',JSON.stringify({version:9}),JSON.stringify({version:1,location:{...PLAZA_LOCATION,zoneId:'missing'}}),JSON.stringify({version:1,location:{...PLAZA_LOCATION,position:{x:-10,y:2,z:-3}}})]){
    const store=storage({[PLAYER_STORAGE_KEY]:raw}),p=new PlayerProgress(store);assert.equal(p.begin(height).playIntro,false);
    assert.equal(p.save(PLAZA_LOCATION,height),false);assert.equal(store.getItem(PLAYER_STORAGE_KEY),raw);
  }
});
test('denied reads, quota errors and writes that do not persist skip the intro and keep playing',()=>{
  for(const s of [null,{getItem(){throw Error('denied');}}, {getItem(){return null;},setItem(){throw Error('quota');}}, {getItem(){return null;},setItem(){}}]){
    const p=new PlayerProgress(s);assert.deepEqual(p.begin(height),{playIntro:false,location:DOCK_LOCATION});assert.equal(p.save(PLAZA_LOCATION,height),false);
  }
});
test('another writer cannot be silently overwritten, including a legacy key created before begin',()=>{
  const s=storage(),p=new PlayerProgress(s);s.setItem('alba-catches-v1','[]');assert.equal(p.begin(height).playIntro,false);
  const a=storage(),one=new PlayerProgress(a),two=new PlayerProgress(a);one.begin(height);assert.equal(two.begin(height).playIntro,false);
  const keep=a.getItem(PLAYER_STORAGE_KEY);assert.equal(two.save(DOCK_LOCATION,height),false);assert.equal(a.getItem(PLAYER_STORAGE_KEY),keep);
});
test('unchanged poses cause no further writes and invalid water/air data cannot become a playable location',()=>{
  const s=storage(),p=new PlayerProgress(s),first=p.begin(height),writes=s.writes;
  for(let i=0;i<10;i++)assert.equal(p.save(first.location,height),true);assert.equal(s.writes,writes);
  for(const location of [{...PLAZA_LOCATION,position:{x:0,y:3,z:-100}},{...PLAZA_LOCATION,pitch:2},{...PLAZA_LOCATION,position:{x:NaN,y:2,z:11}}])assert.equal(p.save(location,height),false);
  assert.equal(safeLocation({...PLAZA_LOCATION,position:{x:0,y:99,z:11}},height).position.y,villageWalkHeight(0,11)+1.7,'saved eye height is derived from safe ground, never an airborne camera');
});
test('zone round trips and reloading preserve current location without restarting the intro',()=>{
  const s=storage(),p=new PlayerProgress(s);p.begin(height);const zones=new ZoneManager({zoneId:'anglers-village'});
  const outward=zones.travel('lake',{position:{x:0,y:3,z:29},yaw:0,pitch:0},{mode:'exploring',state:'ready',heightAt:height});assert.ok(outward);
  const lake={zoneId:zones.zoneId,...outward.spawn,mode:'exploring'};assert.equal(p.save(lake,height),true);
  const reloaded=new PlayerProgress(s).begin(height);assert.equal(reloaded.playIntro,false);assert.equal(reloaded.location.zoneId,'lago-sereno');assert.equal(reloaded.location.position.z,73);
  const back=zones.travel('village',{position:{x:6,y:3,z:74},yaw:Math.PI,pitch:0},{mode:'exploring',state:'ready',heightAt:height});assert.ok(back);
  assert.equal(p.save({zoneId:zones.zoneId,...back.spawn,mode:'exploring'},height),true);assert.equal(new PlayerProgress(s).begin(height).location.zoneId,'anglers-village');
});
