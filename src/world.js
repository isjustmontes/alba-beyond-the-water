import * as THREE from 'three';
import {EnvironmentalView,makeEnvironmentSky} from './visuals/environment.js';
import {FirstPersonHands} from './visuals/hands.js';
import {createFishMotion,updateFishMotion} from './animation/fish-motion.js';
import {CAST_TIMING,rodPose,castFlight,linePoint,smooth,canJump,jumpHeight} from './animation/fishing-motion.js';
import {SPECIES} from './simulation/config.js';
import { makeLakeWater, makeLakeBed, waterElevation } from './visuals/water.js';
import { FishModels } from './visuals/fish.js';
import { RodRig } from './visuals/rod.js';
import { makeLandscape } from './visuals/landscape.js';
import {FishingEffects} from './visuals/effects.js';

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
    this.ambient=new THREE.HemisphereLight(0xd6e6ef, 0x33483a, 1.5);this.scene.add(this.ambient);
    const sun = this.sun = new THREE.DirectionalLight(0xffd5a0, 3.6);
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
    this.effects=new FishingEffects(this.scene,this.random,this.water.material.uniforms.fishingRipples.value);
    this.environmentView=new EnvironmentalView(this);
    this.jumpStartedAt=-Infinity;this.jumpCount=0;this.jumpWasAbove=false;this.lastWakeTime=-Infinity;this.effectPoint=new THREE.Vector3();
    this.scene.add(this.camera);
    this.setView();
    this.resize = () => { this.camera.aspect = innerWidth / innerHeight; this.camera.updateProjectionMatrix(); this.renderer.setSize(innerWidth, innerHeight); };
    addEventListener('resize', this.resize);
  }
  makeSky() {
    this.sky=makeEnvironmentSky(this.sunDirection);this.scene.add(this.sky);
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
    const boards=new THREE.InstancedMesh(new THREE.BoxGeometry(4.8,.18,.38),wood,30);
    const nails=new THREE.InstancedMesh(new THREE.CylinderGeometry(.022,.022,.008,6),nailMat,60);
    const dockDummy=new THREE.Object3D();
    for (let i = 0; i < 30; i++) {
      const z=1.9+i*.40;dockDummy.position.set(0,.68+this.random()*.018,z);dockDummy.updateMatrix();boards.setMatrixAt(i,dockDummy.matrix);
      for(let side=0;side<2;side++){dockDummy.position.set(side ? 2 : -2,.78,z);dockDummy.updateMatrix();nails.setMatrixAt(i*2+side,dockDummy.matrix);}
    }
    boards.castShadow=true;boards.receiveShadow=true;this.scene.add(boards,nails);
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
  createFish(speciesIndex,slot=undefined) {
    return this.fishModels.create(speciesIndex,this.fishSerial++,slot);
  }
  makeFish() {
    this.fishModels=new FishModels(); this.fishSerial=0;
    this.fish = [];
    for (let i = 0; i < 27; i++) {
      const speciesIndex = i % SPECIES.length, mesh = this.createFish(speciesIndex);
      const home = new THREE.Vector3((this.random() - .5) * 60, -.5 - this.random() * 1.4, -5 - this.random() * 39);
      const scale = .7 + this.random() * .7; mesh.scale.setScalar(scale); mesh.position.copy(home); this.scene.add(mesh);
      this.fish.push({ id: i, speciesIndex, mesh, home, phase: this.random() * 6.28, speed: .18 + this.random() * .2 });
    }
  }
  makeRig() {
    this.rodRig=new RodRig(); this.rod=this.rodRig.root; this.camera.add(this.rod);
    this.tip=this.rodRig.tip;this.hands=new FirstPersonHands(this.camera,this.rodRig);
    this.pose={};this.flightOrigin=new THREE.Vector3();this.flightTarget=new THREE.Vector3();this.flightStartedAt=null;
    this.lineOptions={};this.linePoint=new THREE.Vector3();
    const graphite=this.rodRig.graphite;
    this.bobber = new THREE.Group();
    const floatBody = new THREE.Mesh(new THREE.SphereGeometry(.135,14,10), new THREE.MeshStandardMaterial({ color: 0xf5ecce, roughness: .35 })); floatBody.scale.y = 1.7; this.bobber.add(floatBody);
    const floatTip = new THREE.Mesh(new THREE.CylinderGeometry(.055,.075,.30,10), new THREE.MeshStandardMaterial({ color: 0xe97337, emissive: 0x8a3312, emissiveIntensity: .3 })); floatTip.position.y = .26; this.bobber.add(floatTip);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,.35,6), graphite); stem.position.y = -.2; this.bobber.add(stem); this.scene.add(this.bobber); this.bobber.visible = false;
    this.linePositions = new Float32Array(61 * 3);
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(this.linePositions,3));
    this.line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xe3e7cf, transparent: true, opacity: .65 })); this.line.frustumCulled = false; this.line.renderOrder = 4; this.scene.add(this.line);
    this.leaderPositions = new Float32Array(6);
    const leaderGeometry = new THREE.BufferGeometry(); leaderGeometry.setAttribute('position',new THREE.BufferAttribute(this.leaderPositions,3));
    this.leader = new THREE.Line(leaderGeometry,this.line.material); this.leader.frustumCulled=false; this.scene.add(this.leader);
    this.castDirection = new THREE.Vector3(0,0,-1);
    this.catchFish = this.createFish(0,32); this.catchFish.visible = false; this.scene.add(this.catchFish);
    this.lureVisuals=new THREE.Group();
    const spoon=new THREE.Mesh(new THREE.SphereGeometry(1,10,6),new THREE.MeshStandardMaterial({color:0xd5ba72,metalness:.9,roughness:.18}));spoon.scale.set(.055,.012,.13);
    const wormCurve=new THREE.CatmullRomCurve3([new THREE.Vector3(-.1,0,0),new THREE.Vector3(0,.03,.025),new THREE.Vector3(.11,0,-.025)]);
    const worm=new THREE.Mesh(new THREE.TubeGeometry(wormCurve,10,.018,6,false),new THREE.MeshStandardMaterial({color:0x8b5046,roughness:.65}));
    const minnow=this.createFish(2,33);minnow.scale.setScalar(.12);
    this.lureVisuals.add(spoon,worm,minnow);this.scene.add(this.lureVisuals);
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
  cast() { this.flightStartedAt=null;this.castStartPitch=this.rod.rotation.x;this.camera.getWorldDirection(this.castDirection); this.castDirection.y = 0; this.castDirection.normalize(); }
  nearby() { return this.fish.filter(f => f.mesh.position.distanceTo(this.bobber.position) < 9); }
  hookFish(speciesIndex,id) {
    this.hookedFish = this.fish.find(f=>f.id===id) || this.fish.filter(f=>f.speciesIndex===speciesIndex).sort((a,b)=>a.mesh.position.distanceTo(this.bobber.position)-b.mesh.position.distanceTo(this.bobber.position))[0];
  }
  onCatch(fish) {
    this.scene.remove(this.catchFish);
    // GPU assets are pooled across live fish and catch displays; do not dispose shared assets.
    this.catchFish = this.createFish(fish.speciesIndex,32);this.catchSize=.5 + Math.cbrt(fish.weight)*.1; this.catchFish.scale.setScalar(this.catchSize); this.scene.add(this.catchFish);
  }
  onPull(game) {
    if(canJump(game)&&game.time-this.jumpStartedAt>6){this.jumpStartedAt=game.time;this.jumpCount++;this.jumpWasAbove=false;}
  }
  updateFish(dt,game) {
    if(game.state!=='fighting'){this.jumpWasAbove=false;this.jumpStartedAt=-Infinity;}
    for(const fish of this.fish){
      const agent=game.school.fish[fish.id];if(!agent)continue;
      if(!fish.motion)fish.motion=createFishMotion(agent);
      const m=updateFishMotion(fish.motion,agent,dt),age=game.time-this.jumpStartedAt;
      const jumping=game.state==='fighting'&&fish.id===game.hookedId&&age>=0&&age<=1;
      const lift=jumping ? jumpHeight(age)*(1.05+Math.min(.15,agent.weight*.025)) : 0;
      if(fish.agentWeight!==agent.weight){fish.agentWeight=agent.weight;fish.mesh.scale.setScalar(.55+Math.cbrt(agent.weight)*.35);}
      fish.mesh.position.set(m.x,m.y+lift,m.z);fish.mesh.rotation.set(m.bank,m.heading,m.pitch+(jumping ? Math.sin(age*Math.PI*2)*.4 : 0),'YXZ');
      fish.mesh.visible=!(game.state==='caught'&&fish.id===game.hookedId);
      if(fish.id===game.hookedId){
        const above=fish.mesh.position.y>0;
        if(above!==this.jumpWasAbove&&(jumping||this.jumpWasAbove)){this.effectPoint.set(m.x,0,m.z);this.effects.emit(this.effectPoint,above ? .4 : .65);}
        this.jumpWasAbove=above;
      }
      this.fishModels.animate(fish.mesh,game.time,this.camera,m.phase,m.speed);
    }
  }
  setQuality(high) {
    this.highQuality=high;
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,high ? 1.7 : 1));
    this.renderer.shadowMap.enabled=high; this.renderer.shadowMap.needsUpdate=true;
    this.water.material.uniforms.reflectionInterval.value=high ? 1/24 : 1/12;
    this.landscape.setQuality(high);
    this.effects.high=high;
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
      handsAvailable:this.hands.available,handsEnabled:this.hands.enabled,rodBend:this.rodRig.bend.value,rodPitch:this.rod.rotation.x,castPhase:this.pose.phase,
      flightReleased:this.flightStartedAt!==null,flightOrigin:this.flightOrigin.toArray(),bobber:this.bobber.position.toArray(),
      rotorAngle:this.rodRig.rotor.rotation.z,reelRate:this.rodRig.reelRate,
      lineTipError:this.line.visible ? lineStart.distanceTo(tip) : 0,
      rippleStrength:this.water.material.uniforms.rippleStrength.value,rippleCount:this.effects.rippleCount,jumpCount:this.jumpCount,fishSwimPhase:this.fish[0]?.motion?.phase??0,fishSwimSpeed:this.fish[0]?.motion?.speed??0,
      fishCount:this.fish.length,
      reflectionHz:Math.round(1/this.water.material.uniforms.reflectionInterval.value)
    };
  }
  update(dt, game) {
    const t = game.time;
    this.environmentView.update(game.environment,t);
    this.fishModels.clock.value=t;
    this.landscape.clock.value=t;
    this.water.material.uniforms.time.value = t;
    this.water.material.uniforms.rippleStrength.value=['waiting','bite','fighting'].includes(game.state) ? (game.state==='fighting' ? 1.5 : .4+Math.min(1,game.school.nearLure*.2)) : 0;
    const state = game.state;
    this.updateFish(dt,game);
    const pose=rodPose(game,this.pose),casting=state==='casting';
    if(casting&&game.castTime<CAST_TIMING.loadEnd)pose.pitch=THREE.MathUtils.lerp(this.castStartPitch,1.28,smooth(game.castTime/CAST_TIMING.loadEnd));
    const blend=1-Math.exp(-dt*12);
    this.rod.rotation.x=casting ? pose.pitch : THREE.MathUtils.lerp(this.rod.rotation.x,pose.pitch,blend);
    this.rod.rotation.y=casting ? pose.yaw : THREE.MathUtils.lerp(this.rod.rotation.y,pose.yaw,blend);
    this.rod.rotation.z=casting ? pose.roll : THREE.MathUtils.lerp(this.rod.rotation.z,pose.roll,blend);
    const reelRate=game.reeling ? (state==='fighting' ? .65+.35*(1-game.stamina) : game.lureType.retrieveSpeed/1.4) : 0;
    const drag=state==='fighting'&&!game.reeling&&game.surge ? game.stamina : 0;
    this.rodRig.update(dt,state==='fighting' ? game.tension : 0,t,game.reeling,pose.load,reelRate,drag);
    this.hands.update(dt,game);
    this.camera.updateMatrixWorld();
    const tip=this.tip.getWorldPosition(this.scratch.tip);
    const active=['charging','casting','waiting','bite','fighting','caught'].includes(state);
    this.bobber.visible=active&&state!=='caught';this.line.visible=active;
    if(state==='charging'||(casting&&!game.lineReleased)){
      this.bobber.position.copy(tip);this.bobber.position.y-=.28;
    }else if(casting){
      if(this.flightStartedAt===null){this.flightOrigin.copy(tip);this.flightOrigin.y-=.28;this.flightStartedAt=game.castTime;}
      this.flightTarget.set(game.lure.x,.12,game.lure.z);
      castFlight(this.flightOrigin,this.flightTarget,(game.castTime-this.flightStartedAt)/Math.max(.01,CAST_TIMING.impact-this.flightStartedAt),game.power,this.bobber.position);
    }else if(active){
      this.bobber.position.set(game.lure.x,.12+waterElevation(game.lure.x,game.lure.z,t,game.environment.weather),game.lure.z);
      if(state==='bite')this.bobber.position.y=-.14+Math.sin(t*12)*.065;
      if(state==='fighting')this.bobber.position.y+=Math.sin(t*9)*.025;
    }
    this.bobber.rotation.z=Math.sin(t*2.1)*.07;
    this.water.material.uniforms.bobberPosition.value.set(this.bobber.position.x,this.bobber.position.z);
    const endpoint=this.scratch.endpoint.copy(this.bobber.position);
    if(state==='fighting'){
      const visual=this.hookedFish?.mesh;
      if(visual){visual.updateMatrixWorld();endpoint.set(.74,-.015,0).applyMatrix4(visual.matrixWorld);}
      else endpoint.set(game.lure.x,game.lure.y,game.lure.z);
    }
    this.catchFish.visible = state === 'caught';
    this.lureVisuals.visible=['charging','casting','waiting','bite','fighting'].includes(state);
    this.lureVisuals.position.set(game.lure.x,game.lure.y,game.lure.z);
    if(state==='charging'||casting){this.lureVisuals.position.copy(this.bobber.position);this.lureVisuals.position.y-=.25;}
    if(state==='fighting')this.lureVisuals.position.copy(endpoint);
    this.leader.visible=this.lureVisuals.visible&&state!=='fighting';
    if(this.leader.visible){
      this.bobber.position.toArray(this.leaderPositions,0);this.lureVisuals.position.toArray(this.leaderPositions,3);
      this.leader.geometry.attributes.position.needsUpdate=true;
    }
    this.lureVisuals.rotation.y=t*(game.reeling ? 5 : 1.2);
    this.fishModels.animate(this.lureVisuals.children[2],t,this.camera,undefined,game.lureSpeed);
    const lureIndex=['spinner','worm','minnow'].indexOf(game.lureId);
    this.lureVisuals.children.forEach((child,i)=>{child.visible=i===lureIndex;});
    if (state === 'caught') {
      const entry=Math.min(1,game.resultTime/.4);this.catchFish.scale.setScalar(this.catchSize*(entry+Math.sin(entry*Math.PI)*.08));
      const direction = this.scratch.direction; this.camera.getWorldDirection(direction);
      endpoint.copy(this.camera.position).addScaledVector(direction,3.9); endpoint.y = 2.7 + Math.sin(t*3)*.035;
      if(this.touchMode&&innerWidth>innerHeight&&innerHeight<600){
        const halfHeight=3.9*Math.tan(this.camera.fov*Math.PI/360);
        endpoint.set(-.52*halfHeight*this.camera.aspect,.46*halfHeight,-3.9).applyMatrix4(this.camera.matrixWorld);
      }
      this.catchFish.position.copy(endpoint);this.catchFish.position.y-=.45;this.catchFish.rotation.set(0,Math.sin(t*.8)*.3,Math.PI/2 + Math.sin(t*7)*.045);
    }
    if (active) {
      const weather=game.environment.weather,options=this.lineOptions;
      options.tension=state==='fighting' ? game.tension : game.reeling ? .35 : 0;
      options.windX=weather.windX;options.windZ=weather.windZ;options.time=t;options.casting=casting;
      for(let i=0;i<=60;i++){
        const p=linePoint(tip,endpoint,i/60,options,this.linePoint),k=i*3;
        this.linePositions[k]=p.x;this.linePositions[k+1]=p.y;this.linePositions[k+2]=p.z;
      }
      this.line.geometry.attributes.position.needsUpdate=true;
    }
    if(state==='caught') this.fishModels.animate(this.catchFish,t,this.camera);
    if(game.reeling&&['waiting','fighting'].includes(state)&&t-this.lastWakeTime>.32){this.effects.ripple(this.bobber.position,state==='fighting' ? .25 : .12);this.lastWakeTime=t;}
    this.effects.update(dt);
    this.birds.forEach((bird,i) => { bird.position.set(Math.sin(t*.018+i*.4)*95,32+i*1.9,-115+Math.cos(t*.018+i*.4)*20); bird.rotation.z = Math.sin(t*3+i)*.1; });
    this.renderer.info.reset();
    this.renderer.render(this.scene,this.camera);
  }
}
