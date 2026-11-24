// Entirely synthesized: no audio downloads or third-party services.
export const AUDIO_STORAGE_KEY='alba-audio-v1';
export class LakeAudio {
  constructor({storage}={}) {
    this.enabled=true;
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
      const insects=this.ctx.createOscillator();insects.frequency.value=3600;insects.type='sine';
      this.insectGain=this.ctx.createGain();this.insectGain.gain.value=0;insects.connect(this.insectGain).connect(this.master);insects.start();
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
    if(!this.enabled||!this.ctx)return;
    const w=environment.weather,t=this.ctx.currentTime,day=environment.daylight;
    this.windGain.gain.setTargetAtTime(.15+w.wind*.025,t,1);
    this.windFilter.frequency.setTargetAtTime(400+w.wind*100,t,1);
    this.rainGain.gain.setTargetAtTime(w.rain*1.2,t,1);
    this.insectGain.gain.setTargetAtTime((1-day)*(1-w.rain)*(.002+.001*Math.sin(time*15)),t,.3);
    if(day>.5&&w.rain<.4&&time>=(this.nextBird||0)){this.tone(1900+Math.sin(time)*350,.14,'sine',.018);this.nextBird=time+9+Math.random()*8;}
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
