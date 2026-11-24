export const SPECIES = [
  { name: 'Trucha arcoíris', short: 'Trucha', min: 0.45, max: 2.8, color: 0x8ca9a0, strength: 0.85 },
  { name: 'Carpa común', short: 'Carpa', min: 1.1, max: 6.5, color: 0xb39b59, strength: 1.15 },
  { name: 'Lubina', short: 'Lubina', min: 0.6, max: 3.6, color: 0x72916d, strength: 1 }
];

// Pure simulation: no renderer, DOM or wall-clock dependency.
export class FishingGame {
  constructor({ random = Math.random, onEvent = () => {} } = {}) {
    this.random = random;
    this.onEvent = onEvent;
    this.state = 'ready';
    this.time = 0;
    this.power = 0;
    this.tension = 0;
    this.distance = 0;
    this.reeling = false;
    this.catches = [];
  }
  emit(type, data = {}) { this.onEvent({ type, ...data }); }
  press() {
    if (this.state === 'ready') { this.state = 'charging'; this.power = 0.08; }
    else if (this.state === 'bite') {
      this.state = 'fighting'; this.tension = 0.28; this.stamina = 1;
      this.fightTime = 0; this.slackTime = 0; this.reeling = true;
      this.emit('hook', { fish: this.target });
    } else if (this.state === 'fighting') this.reeling = true;
  }
  release() {
    this.reeling = false;
    if (this.state !== 'charging') return;
    this.state = 'casting';
    this.distance = 9 + this.power * 31;
    this.castDistance = this.distance;
    this.castTime = 0;
    this.emit('cast', { distance: this.distance });
  }
  reset(message = 'Aparejo recuperado. Puedes volver a lanzar.') {
    this.state = 'ready'; this.power = 0; this.tension = 0; this.distance = 0; this.reeling = false;
    this.emit('reset', { message });
  }
  update(dt, fishNearby = []) {
    this.time += dt;
    if (this.state === 'charging') this.power = Math.min(1, this.power + dt * 0.58);
    if (this.state === 'casting') {
      this.castTime += dt;
      if (this.castTime >= 1.1) {
        this.state = 'waiting'; this.waitTime = 0;
        this.biteAt = 5 + this.random() * 8;
        this.emit('splash');
      }
    } else if (this.state === 'waiting') {
      this.waitTime += dt;
      // Nearby fish accelerate discovery; even quiet water eventually attracts one.
      this.waitTime += dt * Math.min(2, fishNearby.length * 0.25);
      if (this.waitTime >= this.biteAt) {
        const nearby = fishNearby[Math.floor(this.random() * fishNearby.length)];
        const speciesIndex = nearby?.speciesIndex ?? Math.floor(this.random() * SPECIES.length);
        const species = SPECIES[speciesIndex];
        this.target = { speciesIndex, name: species.name, weight: +(species.min + this.random() * (species.max - species.min)).toFixed(2) };
        this.state = 'bite'; this.biteTime = 0;
        this.emit('bite', { fish: this.target, fishId: nearby?.id });
      }
    } else if (this.state === 'bite') {
      this.biteTime += dt;
      if (this.biteTime > 3) this.reset('El pez soltó el cebo. Clava en cuanto se hunda la boya.');
    } else if (this.state === 'fighting') {
      this.fightTime += dt;
      const species = SPECIES[this.target.speciesIndex];
      this.surge = Math.sin(this.fightTime * 1.7) > 0.35;
      const force = species.strength * (0.8 + this.target.weight / 12);
      if (this.reeling) {
        this.tension += dt * (this.surge ? 0.28 : 0.105) * force;
        this.stamina = Math.max(0, this.stamina - dt * 0.045);
        this.distance -= dt * (this.surge ? 1.0 : 3.0) * (1.35 - this.stamina * 0.35);
      } else {
        this.tension -= dt * (this.surge ? 0.16 : 0.28);
        this.distance = Math.min(this.castDistance + 12, this.distance + dt * (this.surge ? 1.15 : 0.25) * this.stamina);
      }
      this.tension = Math.max(0, this.tension);
      this.slackTime = this.tension < 0.035 ? this.slackTime + dt : 0;
      if (this.tension >= 1) this.reset('El sedal se rompió. Suelta antes de llegar al límite.');
      else if (this.slackTime > 4) this.reset('Demasiada holgura: el pez se ha escapado.');
      else if (this.distance <= 2.6) {
        const caught = { ...this.target, length: Math.round(22 + Math.cbrt(this.target.weight) * 23), date: new Date().toISOString() };
        this.catches.push(caught); this.state = 'caught'; this.reeling = false; this.resultTime = 0;
        this.emit('catch', { fish: caught });
      }
    } else if (this.state === 'caught') {
      this.resultTime += dt;
      if (this.resultTime > 4.5) this.reset('Buen trabajo. El lago guarda más historias.');
    }
  }
}
