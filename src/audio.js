// Entirely synthesized: no audio downloads or third-party services.
export class LakeAudio {
  constructor() { this.enabled = false; }
  toggle() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.master = this.ctx.createGain(); this.master.gain.value = 0; this.master.connect(this.ctx.destination);
      const buffer = this.ctx.createBuffer(1,this.ctx.sampleRate*4,this.ctx.sampleRate);
      const data = buffer.getChannelData(0); let last = 0;
      for (let i = 0; i < data.length; i++) { last = (last + (Math.random()*2-1)*.025)/1.025; data[i] = last*2; }
      const noise = this.ctx.createBufferSource(); noise.buffer = buffer; noise.loop = true;
      const filter = this.ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 700;
      const gain = this.ctx.createGain(); gain.gain.value = .25; noise.connect(filter).connect(gain).connect(this.master); noise.start();
    }
    this.ctx.resume(); this.enabled = !this.enabled; this.master.gain.setTargetAtTime(this.enabled ? .5 : 0,this.ctx.currentTime,.2); return this.enabled;
  }
  tone(frequency,duration = .15,type = 'sine',volume = .15) {
    if (!this.enabled) return;
    const osc = this.ctx.createOscillator(), gain = this.ctx.createGain(), t = this.ctx.currentTime;
    osc.type = type; osc.frequency.setValueAtTime(frequency,t); osc.frequency.exponentialRampToValueAtTime(frequency*.65,t+duration);
    gain.gain.setValueAtTime(volume,t); gain.gain.exponentialRampToValueAtTime(.001,t+duration);
    osc.connect(gain).connect(this.master); osc.start(); osc.stop(t+duration);
  }
  event(type) {
    if (type === 'bite') this.tone(880,.4,'sine',.3);
    if (type === 'hook') this.tone(330,.2,'triangle');
    if (type === 'splash') this.tone(110,.5,'triangle',.3);
    if (type === 'catch') { this.tone(660,.6); setTimeout(()=>this.tone(990,.6),160); }
  }
}
