import {test} from 'node:test';
import assert from 'node:assert/strict';
import {LakeAudio,AUDIO_STORAGE_KEY} from '../src/audio.js';

function setup(t,{saved=null,blocked=false}={}){
  const writes=[],contexts=[];
  const storage={getItem:key=>{assert.equal(key,AUDIO_STORAGE_KEY);return saved;},setItem:(key,value)=>writes.push([key,value])};
  class Param {constructor(){this.value=0;this.targets=[];}setTargetAtTime(v){this.targets.push(v);}setValueAtTime(){}exponentialRampToValueAtTime(){}linearRampToValueAtTime(){}}
  const node=()=>({gain:new Param(),frequency:new Param(),connect(){return this;},disconnect(){},start(){},stop(){}});
  class Context {
    constructor(){contexts.push(this);this.state='suspended';this.sampleRate=8;this.currentTime=0;this.destination={};this.resumes=0;}
    createGain(){return node();}createBiquadFilter(){return node();}createBufferSource(){return node();}createOscillator(){return node();}
    createBuffer(){return {getChannelData:()=>new Float32Array(32)};}
    resume(){this.resumes++;if(blocked)return Promise.reject(new Error('Autoplay blocked'));this.state='running';return Promise.resolve();}
  }
  const previous=globalThis.window;globalThis.window={AudioContext:Context};t.after(()=>{if(previous===undefined)delete globalThis.window;else globalThis.window=previous;});
  return {audio:new LakeAudio({storage}),writes,contexts,storage};
}

test('new players default to enabled without creating a context or playing before interaction',t=>{
  const {audio,contexts,writes}=setup(t);
  assert.equal(audio.enabled,true);assert.equal(audio.ctx,undefined);
  audio.event('bite');audio.update({weather:{wind:1,rain:0},daylight:1},0);
  assert.equal(contexts.length,0);assert.deepEqual(writes,[]);
  audio.unlock();assert.equal(contexts.length,1);assert.equal(audio.ctx.state,'running');
  audio.unlock();assert.equal(contexts.length,1);assert.equal(audio.ctx.resumes,1);
});

test('saved mute is respected and cannot be undone by automatic gesture unlock',t=>{
  const {audio,contexts}=setup(t,{saved:'false'});
  assert.equal(audio.enabled,false);assert.equal(audio.unlock(),false);assert.equal(contexts.length,0);
  assert.equal(audio.toggle(),true);assert.equal(contexts.length,1);
});

test('saved enable stays enabled but still waits for interaction',t=>{
  const {audio,contexts}=setup(t,{saved:'true'});assert.equal(audio.enabled,true);assert.equal(contexts.length,0);
  audio.unlock();assert.equal(contexts.length,1);
});

test('muting as the first action never creates audio; toggles persist and reuse the context',t=>{
  const {audio,writes,contexts}=setup(t);
  assert.equal(audio.toggle(),false);assert.equal(contexts.length,0);
  assert.equal(audio.toggle(),true);const master=audio.master;assert.equal(contexts.length,1);
  assert.equal(audio.toggle(),false);assert.equal(master.gain.targets.at(-1),0);
  audio.unlock();assert.equal(audio.enabled,false);
  assert.deepEqual(writes.map(v=>v[1]),['false','true','false']);
});

test('suspended context can resume after another gesture without changing preference',t=>{
  const {audio}=setup(t);audio.unlock();audio.ctx.state='suspended';audio.unlock();
  assert.equal(audio.ctx.resumes,2);assert.equal(audio.enabled,true);
});

test('autoplay rejection is handled and can retry without changing the saved preference',async t=>{
  const {audio,writes}=setup(t,{blocked:true});audio.unlock();await Promise.resolve();
  audio.event('bite');audio.unlock();await Promise.resolve();
  assert.equal(audio.ctx.resumes,2);assert.equal(audio.enabled,true);assert.deepEqual(writes,[]);
});

test('storage failures and browsers without Web Audio do not break sound controls',t=>{
  setup(t);const audio=new LakeAudio({storage:{getItem(){throw new Error('Storage denied');},setItem(){throw new Error('Storage denied');}}});
  assert.equal(audio.enabled,true);assert.equal(audio.toggle(),false);assert.equal(audio.toggle(),true);
  globalThis.window={};const unsupported=new LakeAudio({storage:{getItem:()=>null}});
  assert.equal(unsupported.unlock(),false);unsupported.event('bite');assert.equal(unsupported.toggle(),false);
});

test('ambient calls vary with daylight and rain, with bounded independent schedules',t=>{
  const {audio}=setup(t);audio.unlock();const calls=[];
  audio.ambientCall=(kind,strength)=>calls.push({kind,strength});
  const e={clock:{hour:6.5},daylight:1,weather:{wind:1,rain:0}};
  audio.nextBird=0;audio.nextInsect=0;audio.update(e,10);
  assert.deepEqual(calls.map(c=>c.kind),['bird']);assert.ok(audio.nextBird>=12&&audio.nextBird<51);
  audio.update(e,10.5);assert.equal(calls.length,1,'no calls on every update');
  e.clock.hour=0;e.daylight=0;audio.ctx.currentTime=100;audio.update(e,11);
  assert.equal(calls.at(-1).kind,'insect');assert.equal(calls.length,2);
  e.weather.rain=1;audio.ctx.currentTime=200;audio.update(e,12);assert.equal(calls.length,2,'no calls in heavy rain');
  audio.toggle();audio.ctx.currentTime=300;audio.update(e,13);assert.equal(calls.length,2,'mute prevents new calls');
});

test('tree rustle follows wind, shares master mute and reuses its noise nodes',t=>{
  const {audio}=setup(t);audio.unlock();const node=audio.rustleGain,filter=audio.rustleFilter;
  const e={clock:{hour:12},daylight:1,weather:{wind:0,rain:0}};
  audio.update(e,2);assert.equal(node.gain.targets.at(-1),0);
  e.weather.wind=5;audio.update(e,2);assert.ok(node.gain.targets.at(-1)>0);assert.ok(node.gain.targets.at(-1)<.1);
  audio.update(e,3);assert.equal(audio.rustleGain,node);assert.equal(audio.rustleFilter,filter);
  audio.toggle();assert.equal(audio.master.gain.targets.at(-1),0);
});

test('short ambient voices use master gain, stop and disconnect without timers',t=>{
  const {audio}=setup(t);audio.unlock();const voices=[],gains=[];
  audio.ctx.createOscillator=()=>{const voice={frequency:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(n){this.target=n;return n;},start(){this.started=true;},stop(time){this.stopTime=time;},disconnect(){this.disconnected=true;}};voices.push(voice);return voice;};
  audio.ctx.createGain=()=>{const gain={gain:{setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(n){this.target=n;return n;},disconnect(){this.disconnected=true;}};gains.push(gain);return gain;};
  audio.ambientCall('bird',.5);audio.ambientCall('insect',.5);
  assert.equal(voices.length,2);
  voices.forEach((voice,i)=>{assert.equal(voice.target,gains[i]);assert.equal(gains[i].target,audio.master);assert.equal(voice.started,true);assert.ok(voice.stopTime>.18&&voice.stopTime<.6);voice.onended();assert.equal(voice.disconnected,true);assert.equal(gains[i].disconnected,true);});
  audio.toggle();audio.ambientCall('bird',1);assert.equal(voices.length,2);
});
