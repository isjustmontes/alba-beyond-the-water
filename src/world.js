import * as THREE from 'three';
import { Water } from 'three/addons/objects/Water.js';
import { SPECIES } from './fishing.js';

const UP = new THREE.Vector3(0, 1, 0);
function rng(seed) { return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; }
function cylinderBetween(a, b, r1, r2, material, segments = 8) {
  const direction = b.clone().sub(a);
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r2, r1, direction.length(), segments), material);
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(UP, direction.normalize());
  return mesh;
}
export class LakeWorld {
  constructor(canvas) {
    this.random = rng(72931);
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0xb6c4b1, 0.0038);
    this.camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, 0.1, 900);
    this.camera.position.set(0, 3.0, 7);
    this.yaw = 0; this.pitch = -0.065;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.scene.add(new THREE.HemisphereLight(0xe1e7d7, 0x34483c, 2.4));
    const sun = new THREE.DirectionalLight(0xffddaa, 3.3);
    sun.position.set(-50, 60, -180); sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -35, right: 35, top: 35, bottom: -35, near: 1, far: 200 });
    sun.shadow.camera.far = 300;
    sun.shadow.bias = -0.0005; this.scene.add(sun);
    this.sunDirection = sun.position.clone().normalize();
    this.makeSky(); this.makeLand(); this.makeWater(); this.makeDock(); this.makeFish(); this.makeRig(); this.makeBirds();
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
        void main(){vec3 d=normalize(vWorld);float h=max(0.,d.y);vec3 col=mix(vec3(1.,.77,.49),vec3(.29,.48,.59),pow(h,.48));
        float glow=pow(max(0.,dot(d,sun)),24.);col+=vec3(.55,.28,.09)*glow;
        float disk=smoothstep(.99955,.9998,dot(d,sun));col=mix(col,vec3(2.5,2.,1.25),disk);
        gl_FragColor=vec4(col,1.); #include <tonemapping_fragment> #include <colorspace_fragment> }`
    }));
    // Shader chunks need their own line for the GLSL preprocessor.
    sky.material.fragmentShader = sky.material.fragmentShader.replaceAll(' #include', '\n#include').replace('> }', '>\n}');
    sky.frustumCulled = false; this.scene.add(sky);
    const cloudMat = new THREE.MeshBasicMaterial({ color: 0xf1e3c9, transparent: true, opacity: 0.11, depthWrite: false });
    for (let i = 0; i < 25; i++) {
      const cloud = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 6), cloudMat);
      cloud.position.set((this.random() - .5) * 550, 65 + this.random() * 45, -180 - this.random() * 100);
      cloud.scale.set(20 + this.random() * 30, 1 + this.random() * 2, 7); this.scene.add(cloud);
    }
  }
  makeLand() {
    const rand = this.random;
    const bank = new THREE.Mesh(new THREE.RingGeometry(1, 2.4, 100, 8), new THREE.MeshStandardMaterial({ color: 0x536447, roughness: 1 }));
    bank.rotation.x = -Math.PI / 2; bank.scale.set(82, 108, 1); bank.position.set(0, -.12, -42); bank.receiveShadow = true; this.scene.add(bank);
    const sand = new THREE.Mesh(new THREE.RingGeometry(1, 1.035, 100, 1), new THREE.MeshStandardMaterial({ color: 0x8c8867, roughness: 1 }));
    sand.rotation.x = -Math.PI / 2; sand.scale.set(81, 107, 1); sand.position.set(0, -.06, -42); this.scene.add(sand);
    // Multi-ring irregular peaks, colored by altitude for stone and snow.
    for (let i = 0; i < 38; i++) {
      const angle = i / 38 * Math.PI * 2;
      const radius = 163 + rand() * 48;
      const height = 25 + rand() * 51;
      const width = 30 + rand() * 25;
      const positions = [], colors = [];
      const rings = 13, sides = 24;
      const verts = [];
      for (let ring = 0; ring <= rings; ring++) {
        const f = ring / rings;
        for (let j = 0; j <= sides; j++) {
          const a = (j % sides) / sides * Math.PI * 2;
          const ridge = 1 + Math.sin(a*3+i)*.14 + Math.cos(a*5+i)*.08;
          const rr = width * Math.pow(1 - f,.9) * ridge;
          verts.push(new THREE.Vector3(Math.cos(a) * rr + f * 7, f * height + (ring === 0 || ring === rings ? 0 : Math.sin(a*4+ring*.8+i)*2.4), Math.sin(a) * rr));
        }
      }
      const rock = new THREE.Color().setHSL(.32, .09, .27 + rand() * .09);
      for (let ring = 0; ring < rings; ring++) for (let j = 0; j < sides; j++) {
        const a = ring * (sides + 1) + j, b = a + sides + 1;
        for (const index of [a, b, a + 1, a + 1, b, b + 1]) {
          const v = verts[index]; positions.push(v.x, v.y, v.z);
          const c = v.y > height * .73 && height > 52 ? new THREE.Color(0xd0d4c9) : rock.clone().multiplyScalar(.85 + rand() * .25);
          colors.push(c.r, c.g, c.b);
        }
      }
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3)); geo.computeVertexNormals();
      const mountain = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, flatShading: true, side: THREE.DoubleSide }));
      mountain.position.set(Math.cos(angle) * radius, -1, -42 + Math.sin(angle) * radius * .86); this.scene.add(mountain);
    }
    const count = 700;
    const pineGeometry = new THREE.ConeGeometry(1, 1, 9, 6);
    const pinePositions = pineGeometry.attributes.position;
    for (let i=0;i<pinePositions.count;i++) {
      const y=pinePositions.getY(i), angle=Math.atan2(pinePositions.getZ(i),pinePositions.getX(i));
      const roughness=1 + Math.sin(y*53+angle*9)*.11 + Math.cos(angle*13-y*27)*.08;
      pinePositions.setXYZ(i,pinePositions.getX(i)*roughness,y,pinePositions.getZ(i)*roughness);
    }
    pineGeometry.computeVertexNormals();
    const foliage = new THREE.InstancedMesh(pineGeometry, new THREE.MeshStandardMaterial({ color: 0x345343, roughness: .95 }), count * 3);
    const trunks = new THREE.InstancedMesh(new THREE.CylinderGeometry(.13, .23, 1, 6), new THREE.MeshStandardMaterial({ color: 0x5b4c37, roughness: 1 }), count);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const a = rand() * Math.PI * 2, radius = 1.035 + rand() * .49;
      const x = Math.cos(a) * 82 * radius, z = -42 + Math.sin(a) * 108 * radius;
      const height = 4 + rand() * 10, w = height * (.19 + rand() * .09);
      dummy.position.set(x, height * .35, z); dummy.scale.set(1, height * .7, 1); dummy.rotation.set(0, 0, 0); dummy.updateMatrix(); trunks.setMatrixAt(i, dummy.matrix);
      const color = new THREE.Color().setHSL(.34 + rand() * .045, .17 + rand() * .13, .15 + rand() * .13);
      for (let layer = 0; layer < 3; layer++) {
        dummy.position.set(x, height * (.45 + layer * .2), z); dummy.scale.set(w * (1 - layer * .23), height * .55, w * (1 - layer * .23)); dummy.rotation.y = rand() * 6.28; dummy.updateMatrix(); foliage.setMatrixAt(i * 3 + layer, dummy.matrix); foliage.setColorAt(i * 3 + layer, color);
      }
    }
    foliage.castShadow = true; foliage.receiveShadow = true; trunks.castShadow = true; this.scene.add(foliage, trunks);
    // Near banks frame the dock, without blocking the casting corridor.
    const rockGeo = new THREE.DodecahedronGeometry(1, 1);
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x777c67, roughness: 1, flatShading: true });
    for (let i = 0; i < 40; i++) {
      const side = i % 2 ? 1 : -1;
      const rock = new THREE.Mesh(rockGeo, rockMat); rock.position.set(side * (17 + rand() * 35), -.4, 14 + rand() * 28); rock.scale.set(2 + rand() * 5, .6 + rand() * 2, 2 + rand() * 4); rock.rotation.y = rand() * 6; rock.receiveShadow = true; this.scene.add(rock);
    }
  }
  makeWater() {
    const size = 128, data = new Uint8Array(size * size * 4);
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      data[i] = 128 + Math.sin(x * .39 + Math.sin(y * .25)) * 16;
      data[i + 1] = 128 + Math.cos(y * .39 + Math.sin(x * .3)) * 16;
      data[i + 2] = 245; data[i + 3] = 255;
    }
    const normals = new THREE.DataTexture(data, size, size); normals.wrapS = normals.wrapT = THREE.RepeatWrapping; normals.needsUpdate = true;
    this.water = new Water(new THREE.PlaneGeometry(650, 650), { textureWidth: 512, textureHeight: 512, waterNormals: normals, sunDirection: this.sunDirection, sunColor: 0xffd995, waterColor: 0x185d54, distortionScale: 1.1, alpha: .79, fog: true });
    this.water.material.uniforms.size.value = 2.5;
    this.water.rotation.x = -Math.PI / 2; this.water.material.transparent = true; this.water.material.depthWrite = false; this.water.renderOrder = 2; this.scene.add(this.water);
    const bottom = new THREE.Mesh(new THREE.PlaneGeometry(650, 650), new THREE.MeshStandardMaterial({ color: 0x38675e, roughness: 1 })); bottom.rotation.x = -Math.PI / 2; bottom.position.y = -4.5; this.scene.add(bottom);
    this.ripples = [];
    for (let i = 0; i < 5; i++) {
      const ring = new THREE.Mesh(new THREE.RingGeometry(.95, 1, 64), new THREE.MeshBasicMaterial({ color: 0xd5e5c8, transparent: true, opacity: .25, side: THREE.DoubleSide, depthWrite: false }));
      ring.rotation.x = -Math.PI / 2; ring.renderOrder = 3; ring.visible = false; this.ripples.push(ring); this.scene.add(ring);
    }
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
    const group = new THREE.Group();
    const species = SPECIES[speciesIndex];
    const mat = new THREE.MeshStandardMaterial({ color: species.color, roughness: .4, metalness: .25 });
    const body = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10), mat); body.scale.set(.65, .19 + (speciesIndex === 1 ? .07 : 0), .17); group.add(body);
    const belly = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), new THREE.MeshStandardMaterial({ color: 0xc0c3a5, roughness: .6 })); belly.scale.set(.51, .10, .145); belly.position.y = -.1; group.add(belly);
    const tail = new THREE.Mesh(new THREE.ConeGeometry(.26, .43, 3), mat); tail.rotation.z = Math.PI / 2; tail.scale.z = .3; tail.position.x = -.73; group.add(tail); group.userData.tail = tail;
    const fin = new THREE.Mesh(new THREE.ConeGeometry(.16,.3,3), mat); fin.scale.z = .22; fin.position.set(-.1,.21,0); group.add(fin);
    for (const z of [-.15, .15]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(.035, 6, 6), new THREE.MeshBasicMaterial({ color: 0x152927 })); eye.position.set(.43,.05,z); group.add(eye);
    }
    if (speciesIndex === 0) {
      const stripe = new THREE.Mesh(new THREE.SphereGeometry(1,12,6), new THREE.MeshStandardMaterial({ color: 0xb78e8d, roughness: .4 })); stripe.scale.set(.5,.04,.174); group.add(stripe);
    }
    return group;
  }
  makeFish() {
    this.fish = [];
    for (let i = 0; i < 27; i++) {
      const speciesIndex = i % 3, mesh = this.createFish(speciesIndex);
      const home = new THREE.Vector3((this.random() - .5) * 60, -.5 - this.random() * 1.4, -5 - this.random() * 39);
      const scale = .7 + this.random() * .7; mesh.scale.setScalar(scale); mesh.position.copy(home); this.scene.add(mesh);
      this.fish.push({ id: i, speciesIndex, mesh, home, phase: this.random() * 6.28, speed: .18 + this.random() * .2 });
    }
  }
  makeRig() {
    this.rod = new THREE.Group(); this.camera.add(this.rod);
    this.rod.position.set(.65,-.68,-.65);
    const graphite = new THREE.MeshStandardMaterial({ color: 0x203b39, metalness: .55, roughness: .3 });
    const cork = new THREE.MeshStandardMaterial({ color: 0xa18759, roughness: .94 });
    const silver = new THREE.MeshStandardMaterial({ color: 0x969d94, metalness: .8, roughness: .25 });
    const points = [new THREE.Vector3(.1,-.3,.25),new THREE.Vector3(0,0,0),new THREE.Vector3(-.15,.45,-.55),new THREE.Vector3(-.36,.88,-1.25),new THREE.Vector3(-.61,1.15,-2.15),new THREE.Vector3(-.83,1.23,-2.9)];
    for (let i = 0; i < points.length - 1; i++) this.rod.add(cylinderBetween(points[i], points[i + 1], .032 - i * .006, .026 - i * .005, i < 2 ? cork : graphite));
    for (let i = 2; i < points.length; i++) {
      const guide = new THREE.Mesh(new THREE.TorusGeometry(.034 - i*.003,.005,5,12), silver); guide.position.copy(points[i]); guide.position.y -= .025; this.rod.add(guide);
    }
    const reel = new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,.15,20), graphite); reel.rotation.x = Math.PI / 2; reel.position.set(.015,-.14,-.12); this.rod.add(reel);
    const spool = new THREE.Mesh(new THREE.CylinderGeometry(.085,.085,.18,18), silver); spool.rotation.x = Math.PI / 2; spool.position.copy(reel.position); this.rod.add(spool);
    this.handle = new THREE.Group(); this.handle.position.copy(reel.position); this.handle.position.z += .1;
    this.handle.add(cylinderBetween(new THREE.Vector3(),new THREE.Vector3(.18,0,0),.015,.015,silver));
    const grip = new THREE.Mesh(new THREE.SphereGeometry(.045,10,8), cork); grip.position.x = .18; grip.scale.z = 1.7; this.handle.add(grip); this.rod.add(this.handle);
    this.tip = new THREE.Object3D(); this.tip.position.copy(points.at(-1)); this.rod.add(this.tip);
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
    this.catchFish.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
    this.catchFish = this.createFish(fish.speciesIndex); this.catchFish.scale.setScalar(.65 + Math.cbrt(fish.weight)*.25); this.scene.add(this.catchFish);
  }
  setQuality(high) { this.renderer.setPixelRatio(Math.min(devicePixelRatio,high ? 1.7 : 1)); this.renderer.shadowMap.enabled = high; this.resize(); }
  update(dt, game) {
    const t = game.time;
    this.water.material.uniforms.time.value = t * .38;
    const state = game.state;
    this.rod.rotation.x = THREE.MathUtils.damp(this.rod.rotation.x, state === 'charging' ? -.5 - game.power*.4 : state === 'fighting' ? -.13 + Math.sin(t*7)*.018 : state === 'casting' ? .25 : 0, 7, dt);
    this.rod.rotation.z = Math.sin(t*.9)*.009;
    if (game.reeling) this.handle.rotation.z -= dt*13;
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
    const tip = this.tip.getWorldPosition(new THREE.Vector3());
    let endpoint = this.bobber.position.clone();
    this.catchFish.visible = state === 'caught';
    if (state === 'caught') {
      const direction = new THREE.Vector3(); this.camera.getWorldDirection(direction);
      endpoint.copy(this.camera.position).addScaledVector(direction,3.6); endpoint.y = 3.3 + Math.sin(t*3)*.12;
      this.catchFish.position.copy(endpoint).add(new THREE.Vector3(0,-.45,0)); this.catchFish.rotation.set(0,t*.6,Math.PI/2 + Math.sin(t*7)*.08);
    }
    if (active) {
      const sag = state === 'fighting' ? .08 : Math.min(1.3, game.distance*.035);
      for (let i = 0; i <= 60; i++) {
        const f = i / 60;
        const p = tip.clone().lerp(endpoint,f); p.y -= Math.sin(f*Math.PI)*sag;
        this.linePositions.set([p.x,p.y,p.z],i*3);
      }
      this.line.geometry.attributes.position.needsUpdate = true;
    }
    for (let i = 0; i < this.ripples.length; i++) {
      const ring = this.ripples[i]; ring.visible = active && state !== 'casting' && state !== 'caught';
      const phase = (t*.38 + i/5)%1;
      ring.position.set(this.bobber.position.x,.025 + i*.001,this.bobber.position.z); ring.scale.setScalar(.25+phase*(state === 'fighting' ? 2.6 : 1.65)); ring.material.opacity = (1-phase)*.24;
    }
    for (const fish of this.fish) {
      const a = t*fish.speed + fish.phase;
      let target = new THREE.Vector3(fish.home.x + Math.cos(a)*5, fish.home.y + Math.sin(a*1.3)*.16, fish.home.z + Math.sin(a)*4);
      if ((state === 'waiting' || state === 'bite') && fish.mesh.position.distanceTo(this.bobber.position) < 15) {
        target = this.bobber.position.clone().add(new THREE.Vector3(Math.cos(a)*2,-.65 + Math.sin(a)*.2,Math.sin(a)*2));
      }
      fish.mesh.visible = !(state === 'caught' && fish === this.hookedFish);
      if (state === 'fighting' && fish === this.hookedFish) target = this.bobber.position.clone().add(new THREE.Vector3(Math.sin(t*7)*.35,-.4,0));
      const delta = target.clone().sub(fish.mesh.position);
      if (delta.lengthSq() > .01) fish.mesh.rotation.y = Math.atan2(-delta.z,delta.x);
      fish.mesh.position.lerp(target,1-Math.exp(-dt*.6)); fish.mesh.userData.tail.rotation.y = Math.sin(t*9+fish.phase)*.4;
    }
    this.birds.forEach((bird,i) => { bird.position.set(Math.sin(t*.018+i*.4)*95,32+i*1.9,-115+Math.cos(t*.018+i*.4)*20); bird.rotation.z = Math.sin(t*3+i)*.1; });
    this.renderer.render(this.scene,this.camera);
  }
}
