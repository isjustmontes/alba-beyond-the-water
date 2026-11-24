import {test} from 'node:test';
import assert from 'node:assert/strict';
import {LakeAudio,AUDIO_STORAGE_KEY} from '../src/audio.js';

function setup(t,{saved=null,blocked=false}={}){
  const writes=[],contexts=[];
  const storage={getItem:key=>{assert.equal(key,AUDIO_STORAGE_KEY);return saved;},setItem:(key,value)=>writes.push([key,value])};
  class Param {constructor(){this.value=0;this.targets=[];}setTargetAtTime(v){this.targets.push(v);}setValueAtTime(){}exponentialRampToValueAtTime(){}}
  const node=()=>({gain:new Param(),frequency:new Param(),connect(){return this;},start(){},stop(){}});
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
