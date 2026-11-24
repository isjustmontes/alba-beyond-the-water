import * as THREE from 'three';
import { makeLakeWater, makeLakeBed } from './visuals/water.js';
import { FishModels } from './visuals/fish.js';
import { RodRig } from './visuals/rod.js';
import { makeLandscape } from './visuals/landscape.js';

function rng(seed) { return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; }
export class LakeWorld {
  constructor(canvas) {
    this.random = rng(72931);
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0xadbbb4, 0.0035);
    this.camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, 0.1, 900);
    this.camera.position.set(0, 3.0, 7);
    this.yaw = 0; this.pitch = -0.065;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.03;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.shadowMap.autoUpdate = false;
    this.renderer.shadowMap.needsUpdate = true;
    this.renderer.info.autoReset=false;
    this.highQuality=true;
    this.scratch={tip:new THREE.Vector3(),endpoint:new THREE.Vector3(),direction:new THREE.Vector3(),target:new THREE.Vector3(),delta:new THREE.Vector3()};
    this.scene.add(new THREE.HemisphereLight(0xd6e6ef, 0x33483a, 1.5));
    const sun = new THREE.DirectionalLight(0xffd5a0, 3.6);
    sun.position.set(-25, 70, -210); sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -35, right: 35, top: 35, bottom: -35, near: 1, far: 200 });
    sun.shadow.camera.far = 300;
    sun.shadow.bias = -0.0003; sun.shadow.normalBias=.025; sun.shadow.radius=3; this.scene.add(sun);
    this.sunDirection = sun.position.clone().normalize();
    this.makeSky();
    const environment=new THREE.PMREMGenerator(this.renderer);
    this.environmentTarget=environment.fromScene(this.scene,.04,.1,900);
    this.scene.environment=this.environmentTarget.texture; this.scene.environmentIntensity=.35;
    environment.dispose();
    this.makeLand(); this.makeWater(); this.makeDock(); this.makeFish(); this.makeRig(); this.makeBirds();
    this.scene.add(this.camera);
    this.setView();
    this.resize = () => { this.camera.aspect = innerWidth / innerHeight; this.camera.updateProjectionMatrix(); this.renderer.setSize(innerWidth, innerHeight); };
    addEventListener('resize', this.resize);
  }
  makeSky() {
    const sky = new THREE.Mesh(new THREE.SphereGeometry(600, 40, 24), new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false,
      uniforms: { sun: { value: this.sunDirection } },
      vertexShader: 'varying vec3 vWorld; void main(){vWorld=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader: `varying vec3 vWorld; uniform vec3 sun;
        float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
        float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1)),f.x),f.y);}
        float clouds(vec2 p){float n=0.;float a=.55;for(int i=0;i<4;i++){n+=noise(p)*a;p=p*2.04+3.7;a*=.48;}return n;}
        void main(){vec3 d=normalize(vWorld);float h=max(0.,d.y);vec3 col=mix(vec3(1.,.72,.43),vec3(.17,.35,.52),pow(h,.48));
        float cover=smoothstep(.50,.78,clouds(d.xz/max(.16,d.y+.16)*3.));cover*=smoothstep(.03,.22,h)*(1.-smoothstep(.7,.98,h));
        col=mix(col,vec3(.84,.82,.75),cover*.6);
        float glow=pow(max(0.,dot(d,sun)),32.);col+=vec3(.6,.29,.07)*glow;
        float disk=smoothstep(.99984,.99993,dot(d,sun));col=mix(col,vec3(3.5,2.6,1.35),disk);
        gl_FragColor=vec4(col,1.); #include <tonemapping_fragment> #include <colorspace_fragment> }`
    }));
    // Shader chunks need their own line for the GLSL preprocessor.
    sky.material.fragmentShader = sky.material.fragmentShader.replaceAll(' #include', '\n#include').replace('> }', '>\n}');
    sky.frustumCulled = false; this.scene.add(sky);
  }
  makeLand() {
    this.landscape=makeLandscape(this.random);
    this.scene.add(this.landscape.group);
  }
  makeWater() {
    this.water=makeLakeWater(this.sunDirection);
    this.scene.add(this.water,makeLakeBed());
  }
  makeDock() {
    const canvas = document.createElement('canvas'); canvas.width = 256; canvas.height = 512;
    const ctx = canvas.getContext('2d'); ctx.fillStyle = '#887454'; ctx.fillRect(0, 0, 256, 512);
    for (let i = 0; i < 950; i++) {
      const x = this.random() * 256; ctx.strokeStyle = `rgba(${this.random() > .5 ? '49,37,24' : '211,188,139'},${this.random() * .17})`; ctx.lineWidth = .3 + this.random() * 1.4; ctx.beginPath(); ctx.moveTo(x, 0); ctx.bezierCurveTo(x + 9, 160, x - 6, 300, x + 3, 512); ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    const wood = new THREE.MeshStandardMaterial({ map: tex, roughness: .88, color: 0xb4a07c });
    const darkWood = new THREE.MeshStandardMaterial({ color: 0x5c4c35, roughness: .95 });
    const nailMat = new THREE.MeshStandardMaterial({ color: 0x454d45, metalness: .75, roughness: .65 });
    for (let i = 0; i < 30; i++) {
      const board = new THREE.Mesh(new THREE.BoxGeometry(4.8, .18, .38), wood); board.position.set(0, .68 + this.random() * .018, 1.9 + i * .40); board.castShadow = true; board.receiveShadow = true; this.scene.add(board);
      for (const x of [-2.0, 2.0]) {
        const nail = new THREE.Mesh(new THREE.CylinderGeometry(.022, .022, .008, 6), nailMat); nail.position.set(x, .78, board.position.z); this.scene.add(nail);
      }
    }
    for (const x of [-1.8, 1.8]) {
      const support = new THREE.Mesh(new THREE.BoxGeometry(.18, .3, 13), darkWood); support.position.set(x, .4, 7.4); this.scene.add(support);
    }
    for (const x of [-2.45, 2.45]) for (const z of [2.3, 7.2, 12.4]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(.14, .18, 2.9, 10), wood); post.position.set(x, .4, z); post.castShadow = true; this.scene.add(post);
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(.18, .18, .07, 10), darkWood); cap.position.set(x, 1.88, z); this.scene.add(cap);
      for (let j = 0; j < 4; j++) {
        const rope = new THREE.Mesh(new THREE.TorusGeometry(.15, .018, 5, 18), new THREE.MeshStandardMaterial({ color: 0xb3a07b, roughness: 1 })); rope.rotation.x = Math.PI / 2; rope.position.set(x, 1.45 + j * .04, z); this.scene.add(rope);
      }
    }
    const ropeMat = new THREE.MeshStandardMaterial({ color: 0xb6aa84, roughness: 1 });
    for (const x of [-2.45, 2.45]) {
      const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(x,1.52,2.3),new THREE.Vector3(x,1.02,4.7),new THREE.Vector3(x,1.52,7.2),new THREE.Vector3(x,1.02,9.8),new THREE.Vector3(x,1.52,12.4)]);
      this.scene.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 40, .035, 6, false), ropeMat));
    }
  }
  createFish(speciesIndex) {
    return this.fishModels.create(speciesIndex, this.fishSerial++);
  }
  makeFish() {
    this.fishModels=new FishModels(); this.fishSerial=0;
    this.fish = [];
    for (let i = 0; i < 27; i++) {
      const speciesIndex = i % 3, mesh = this.createFish(speciesIndex);
      const home = new THREE.Vector3((this.random() - .5) * 60, -.5 - this.random() * 1.4, -5 - this.random() * 39);
      const scale = .7 + this.random() * .7; mesh.scale.setScalar(scale); mesh.position.copy(home); this.scene.add(mesh);
      this.fish.push({ id: i, speciesIndex, mesh, home, phase: this.random() * 6.28, speed: .18 + this.random() * .2 });
    }
  }
  makeRig() {
    this.rodRig=new RodRig(); this.rod=this.rodRig.root; this.camera.add(this.rod);
    this.tip=this.rodRig.tip;
    const graphite=this.rodRig.graphite;
    const handMaterial = new THREE.MeshStandardMaterial({ color: 0x9b7756, roughness: .9 });
    const hand = new THREE.Mesh(new THREE.CapsuleGeometry(.075,.20,5,10), handMaterial); hand.position.set(.07,-.14,.13); hand.rotation.z = -.25; this.rod.add(hand);
    const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(.11,.15,.48,12), new THREE.MeshStandardMaterial({ color: 0x3b4b39, roughness: 1 })); sleeve.position.set(.17,-.46,.25); sleeve.rotation.z = .3; this.rod.add(sleeve);
    this.bobber = new THREE.Group();
    const floatBody = new THREE.Mesh(new THREE.SphereGeometry(.135,14,10), new THREE.MeshStandardMaterial({ color: 0xf5ecce, roughness: .35 })); floatBody.scale.y = 1.7; this.bobber.add(floatBody);
    const floatTip = new THREE.Mesh(new THREE.CylinderGeometry(.055,.075,.30,10), new THREE.MeshStandardMaterial({ color: 0xe97337, emissive: 0x8a3312, emissiveIntensity: .3 })); floatTip.position.y = .26; this.bobber.add(floatTip);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,.35,6), graphite); stem.position.y = -.2; this.bobber.add(stem); this.scene.add(this.bobber); this.bobber.visible = false;
    this.linePositions = new Float32Array(61 * 3);
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(this.linePositions,3));
    this.line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xe3e7cf, transparent: true, opacity: .65 })); this.line.frustumCulled = false; this.line.renderOrder = 4; this.scene.add(this.line);
    this.castDirection = new THREE.Vector3(0,0,-1);
    this.catchFish = this.createFish(0); this.catchFish.visible = false; this.scene.add(this.catchFish);
  }
  makeBirds() {
    this.birds = [];
    const mat = new THREE.LineBasicMaterial({ color: 0x354a44 });
    for (let i = 0; i < 9; i++) {
      const bird = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-.7,.2,0),new THREE.Vector3(),new THREE.Vector3(.7,.2,0)]), mat);
      this.birds.push(bird); this.scene.add(bird);
    }
  }
  setView() { this.camera.rotation.order = 'YXZ'; this.camera.rotation.set(this.pitch,this.yaw,0); }
  look(dx, dy) { this.yaw = THREE.MathUtils.clamp(this.yaw - dx * .002,-.8,.8); this.pitch = THREE.MathUtils.clamp(this.pitch - dy*.002,-.48,.25); this.setView(); }
  cast() { this.camera.getWorldDirection(this.castDirection); this.castDirection.y = 0; this.castDirection.normalize(); }
  nearby() { return this.fish.filter(f => f.mesh.position.distanceTo(this.bobber.position) < 9); }
  hookFish(speciesIndex) {
    this.hookedFish = this.fish.filter(f=>f.speciesIndex===speciesIndex).sort((a,b)=>a.mesh.position.distanceTo(this.bobber.position)-b.mesh.position.distanceTo(this.bobber.position))[0];
  }
  onCatch(fish) {
    this.scene.remove(this.catchFish);
    // GPU assets are pooled across live fish and catch displays; do not dispose shared assets.
    this.catchFish = this.createFish(fish.speciesIndex); this.catchFish.scale.setScalar(.5 + Math.cbrt(fish.weight)*.1); this.scene.add(this.catchFish);
  }
  setQuality(high) {
    this.highQuality=high;
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,high ? 1.7 : 1));
    this.renderer.shadowMap.enabled=high; this.renderer.shadowMap.needsUpdate=true;
    this.water.material.uniforms.reflectionInterval.value=high ? 1/24 : 1/12;
    this.landscape.setQuality(high);
    this.resize();
  }
  diagnostics() {
    const tip=this.tip.getWorldPosition(new THREE.Vector3());
    const lineStart=new THREE.Vector3().fromArray(this.linePositions);
    return {
      quality:this.highQuality ? 'high' : 'low',
      drawCalls:this.renderer.info.render.calls,
      triangles:this.renderer.info.render.triangles,
      geometries:this.renderer.info.memory.geometries,
      textures:this.renderer.info.memory.textures,
      rodBend:this.rodRig.bend.value,
      lineTipError:this.line.visible ? lineStart.distanceTo(tip) : 0,
      rippleStrength:this.water.material.uniforms.rippleStrength.value,
      fishCount:this.fish.length,
      reflectionHz:Math.round(1/this.water.material.uniforms.reflectionInterval.value)
    };
  }
  update(dt, game) {
    const t = game.time;
    this.fishModels.clock.value=t;
    this.landscape.clock.value=t;
    this.water.material.uniforms.time.value = t;
    this.water.material.uniforms.rippleStrength.value=['waiting','bite','fighting'].includes(game.state) ? (game.state==='fighting' ? 1.5 : .7) : 0;
    const state = game.state;
    this.rod.rotation.x = THREE.MathUtils.damp(this.rod.rotation.x, state === 'charging' ? -.5 - game.power*.4 : state === 'fighting' ? -.13 + Math.sin(t*7)*.018 : state === 'casting' ? .25 : 0, 7, dt);
    this.rod.rotation.z = Math.sin(t*.9)*.009;
    this.rodRig.update(dt,state==='fighting' ? game.tension : 0,t,game.reeling);
    const active = ['casting','waiting','bite','fighting','caught'].includes(state);
    this.bobber.visible = active && state !== 'caught'; this.line.visible = active;
    if (active) {
      const dist = state === 'casting' ? game.distance * Math.min(1, game.castTime/1.1) : game.distance;
      this.bobber.position.copy(this.castDirection).multiplyScalar(dist).add(new THREE.Vector3(0,0,4));
      this.bobber.position.y = .12 + Math.sin(t*2.5)*.045;
      if (state === 'casting') this.bobber.position.y += Math.sin(Math.min(1,game.castTime/1.1)*Math.PI)*4;
      if (state === 'bite') this.bobber.position.y = -.18 + Math.sin(t*15)*.11;
      if (state === 'fighting') { this.bobber.position.x += Math.sin(t*2)*Math.min(1.5,game.distance*.05); this.bobber.position.y += Math.sin(t*13)*.06; }
      this.bobber.rotation.z = Math.sin(t*3)*.12;
    }
    this.camera.updateMatrixWorld();
    this.water.material.uniforms.bobberPosition.value.set(this.bobber.position.x,this.bobber.position.z);
    const tip = this.tip.getWorldPosition(this.scratch.tip);
    const endpoint = this.scratch.endpoint.copy(this.bobber.position);
    this.catchFish.visible = state === 'caught';
    if (state === 'caught') {
      const direction = this.scratch.direction; this.camera.getWorldDirection(direction);
      endpoint.copy(this.camera.position).addScaledVector(direction,3.9); endpoint.y = 2.7 + Math.sin(t*3)*.035;
      this.catchFish.position.copy(endpoint).add(new THREE.Vector3(0,-.45,0)); this.catchFish.rotation.set(0,Math.sin(t*.8)*.3,Math.PI/2 + Math.sin(t*7)*.045);
    }
    if (active) {
      const sag = state === 'fighting' ? .08 : Math.min(1.3, game.distance*.035);
      for (let i = 0; i <= 60; i++) {
        const f = i / 60;
        this.linePositions[i*3]=THREE.MathUtils.lerp(tip.x,endpoint.x,f);
        this.linePositions[i*3+1]=THREE.MathUtils.lerp(tip.y,endpoint.y,f)-Math.sin(f*Math.PI)*sag;
        this.linePositions[i*3+2]=THREE.MathUtils.lerp(tip.z,endpoint.z,f);
      }
      this.line.geometry.attributes.position.needsUpdate = true;
    }
    for (const fish of this.fish) {
      const a = t*fish.speed + fish.phase;
      const target = this.scratch.target.set(fish.home.x + Math.cos(a)*5, fish.home.y + Math.sin(a*1.3)*.16, fish.home.z + Math.sin(a)*4);
      if ((state === 'waiting' || state === 'bite') && fish.mesh.position.distanceTo(this.bobber.position) < 15) {
        target.copy(this.bobber.position);target.x+=Math.cos(a)*2;target.y+=-.65+Math.sin(a)*.2;target.z+=Math.sin(a)*2;
      }
      fish.mesh.visible = !(state === 'caught' && fish === this.hookedFish);
      if (state === 'fighting' && fish === this.hookedFish) {target.copy(this.bobber.position);target.x+=Math.sin(t*7)*.35;target.y-=.4;}
      const delta = this.scratch.delta.subVectors(target,fish.mesh.position);
      if (delta.lengthSq() > .01) {
        const desired=Math.atan2(-delta.z,delta.x);
        const turn=Math.atan2(Math.sin(desired-fish.mesh.rotation.y),Math.cos(desired-fish.mesh.rotation.y));
        fish.mesh.rotation.y+=turn*(1-Math.exp(-dt*2.5));
      }
      fish.mesh.position.lerp(target,1-Math.exp(-dt*.6)); this.fishModels.animate(fish.mesh,t,this.camera);
    }
    if(state==='caught') this.fishModels.animate(this.catchFish,t,this.camera);
    this.birds.forEach((bird,i) => { bird.position.set(Math.sin(t*.018+i*.4)*95,32+i*1.9,-115+Math.cos(t*.018+i*.4)*20); bird.rotation.z = Math.sin(t*3+i)*.1; });
    this.renderer.info.reset();
    this.renderer.render(this.scene,this.camera);
  }
}
