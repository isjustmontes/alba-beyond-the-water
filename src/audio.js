// Entirely synthesized: no audio downloads or third-party services.
import {faunaConditions} from './ambient-life.js';
export const AUDIO_STORAGE_KEY='alba-audio-v1';
export class LakeAudio {
  constructor({storage}={}) {
    this.enabled=true;
    this.ambientConditions={};
    try{this.storage=storage??globalThis.localStorage;const saved=this.storage?.getItem(AUDIO_STORAGE_KEY);this.enabled=!(saved==='false'||saved==='off'||saved==='0');}catch{/* Storage restrictions must not prevent session audio. */}
  }
  // Called only from a trusted interaction, never during page initialization.
  unlock() {
    if(!this.enabled)return false;
    if (!this.ctx) {
      const Context=window.AudioContext || window.webkitAudioContext;if(!Context)return false;
      this.ctx = new Context();
      this.master = this.ctx.createGain(); this.master.gain.value = 0; this.master.connect(this.ctx.destination);
      const buffer = this.ctx.createBuffer(1,this.ctx.sampleRate*4,this.ctx.sampleRate);
      const data = buffer.getChannelData(0); let last = 0;
      for (let i = 0; i < data.length; i++) { last = (last + (Math.random()*2-1)*.025)/1.025; data[i] = last*2; }
      const noise = this.ctx.createBufferSource(); noise.buffer = buffer; noise.loop = true;
      const filter = this.ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 700;
      const gain = this.ctx.createGain(); gain.gain.value = .25; noise.connect(filter).connect(gain).connect(this.master); noise.start();
      this.windGain=gain;this.windFilter=filter;
      const rainFilter=this.ctx.createBiquadFilter();rainFilter.type='highpass';rainFilter.frequency.value=1100;
      this.rainGain=this.ctx.createGain();this.rainGain.gain.value=0;
      noise.connect(rainFilter).connect(this.rainGain).connect(this.master);
      // Broad leaf rustle shares the existing generated noise buffer.
      this.rustleFilter=this.ctx.createBiquadFilter();this.rustleFilter.type='bandpass';this.rustleFilter.frequency.value=1800;
      this.rustleGain=this.ctx.createGain();this.rustleGain.gain.value=0;
      noise.connect(this.rustleFilter).connect(this.rustleGain).connect(this.master);
    }
    if(this.ctx.state!=='running')this.ctx.resume()?.catch(()=>{/* Retry on the next trusted gesture if autoplay was blocked. */});
    this.master.gain.setTargetAtTime(.5,this.ctx.currentTime,.2);return true;
  }
  toggle() {
    this.enabled=!this.enabled;
    try{this.storage?.setItem(AUDIO_STORAGE_KEY,String(this.enabled));}catch{/* Keep the preference for this session. */}
    if(this.enabled)this.unlock();
    else if(this.master)this.master.gain.setTargetAtTime(0,this.ctx.currentTime,.2);
    return this.enabled;
  }
  update(environment,time){
    if(!this.enabled||!this.ctx||this.ctx.state!=='running')return;
    const w=environment.weather,t=this.ctx.currentTime;
    const life=faunaConditions(environment,this.ambientConditions);
    this.windGain.gain.setTargetAtTime(.15+w.wind*.025,t,1);
    this.windFilter.frequency.setTargetAtTime(400+w.wind*100,t,1);
    this.rainGain.gain.setTargetAtTime(w.rain*1.2,t,1);
    const gust=.65+.2*Math.sin(time*.37)+.15*Math.sin(time*.83+2);
    this.rustleGain.gain.setTargetAtTime(life.rustle*gust*.10,t,1.4);
    this.rustleFilter.frequency.setTargetAtTime(1250+w.wind*130,t,1.4);
    // Schedule against audio time, so pauses cannot queue a burst of overdue calls.
    if(this.nextBird===undefined)this.nextBird=t+3+Math.random()*9;
    if(t>=this.nextBird){
      if(life.birds>.06)this.ambientCall('bird',life.birds);
      this.nextBird=t+12+Math.random()*22+(1-life.birds)*16;
    }
    if(this.nextInsect===undefined)this.nextInsect=t+1+Math.random()*4;
    if(t>=this.nextInsect){
      if(life.crickets>.08)this.ambientCall('insect',life.crickets);
      this.nextInsect=t+1.7+Math.random()*5+(1-life.crickets)*4;
    }
  }
  ambientCall(kind,strength){
    if(!this.enabled||!this.ctx||this.ctx.state!=='running')return;
    const bird=kind==='bird',osc=this.ctx.createOscillator(),gain=this.ctx.createGain(),t=this.ctx.currentTime;
    const pitch=bird?1700+Math.random()*1000:3900+Math.random()*700,duration=bird?.32+Math.random()*.2:.18+Math.random()*.12;
    osc.frequency.setValueAtTime(pitch,t);osc.frequency.exponentialRampToValueAtTime(pitch*(bird?1.32:1.04),t+duration*.3);
    osc.frequency.exponentialRampToValueAtTime(pitch*(bird?.83:.98),t+duration);
    const volume=strength*(bird?.022:.008);
    gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(volume,t+.018);
    gain.gain.exponentialRampToValueAtTime(.0001,t+duration*.48);
    gain.gain.linearRampToValueAtTime(volume*.65,t+duration*.62);
    gain.gain.exponentialRampToValueAtTime(.0001,t+duration);
    osc.connect(gain).connect(this.master);osc.onended=()=>{osc.disconnect();gain.disconnect();};osc.start();osc.stop(t+duration+.02);
  }
  tone(frequency,duration = .15,type = 'sine',volume = .15) {
    if (!this.enabled||!this.ctx||this.ctx.state!=='running') return;
    const osc = this.ctx.createOscillator(), gain = this.ctx.createGain(), t = this.ctx.currentTime;
    osc.type = type; osc.frequency.setValueAtTime(frequency,t); osc.frequency.exponentialRampToValueAtTime(frequency*.65,t+duration);
    gain.gain.setValueAtTime(volume,t); gain.gain.exponentialRampToValueAtTime(.001,t+duration);
    osc.connect(gain).connect(this.master); osc.start(); osc.stop(t+duration);
  }
  event(type) {
    if(type==='line-release')this.tone(180,.18,'triangle',.035);
    if (type === 'bite') this.tone(880,.4,'sine',.3);
    if (type === 'hook') this.tone(330,.2,'triangle');
    if (type === 'splash') this.tone(110,.5,'triangle',.3);
    if (type === 'catch') { this.tone(660,.6); setTimeout(()=>this.tone(990,.6),160); }
  }
}
