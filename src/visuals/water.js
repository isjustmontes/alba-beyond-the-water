import * as THREE from 'three';
import { Water } from 'three/addons/objects/Water.js';

import {lakeDepth} from '../simulation/lake.js';
export {lakeDepth} from '../simulation/lake.js';

const waveFunctions = /* glsl */`
  float albaWave(vec2 p, float t) {
    return sin(dot(p,vec2(.72,.25))-t*1.1)*.032
      + sin(dot(p,vec2(-.32,.51))-t*.79)*.024
      + sin(dot(p,vec2(.16,.12))-t*.43)*.028;
  }
  vec2 albaSlope(vec2 p, float t) {
    return cos(dot(p,vec2(.72,.25))-t*1.1)*.032*vec2(.72,.25)
      + cos(dot(p,vec2(-.32,.51))-t*.79)*.024*vec2(-.32,.51)
      + cos(dot(p,vec2(.16,.12))-t*.43)*.028*vec2(.16,.12);
  }
`;

export function makeLakeWater(sunDirection) {
  const size = 128, data = new Uint8Array(size * size * 4);
  // Periodic normals have no seam and combine ripples on three spatial scales.
  for (let y=0;y<size;y++) for (let x=0;x<size;x++) {
    const a=x/size*Math.PI*2, b=y/size*Math.PI*2, i=(y*size+x)*4;
    data[i]=128+Math.sin(a*9+b*4)*18+Math.cos(a*17-b*11)*7;
    data[i+1]=128+Math.cos(b*7-a*3)*16+Math.sin(b*19+a*13)*6;
    data[i+2]=250; data[i+3]=255;
  }
  const normals=new THREE.DataTexture(data,size,size);
  normals.wrapS=normals.wrapT=THREE.RepeatWrapping;
  normals.magFilter=THREE.LinearFilter; normals.minFilter=THREE.LinearFilter; normals.needsUpdate=true;
  const water=new Water(new THREE.PlaneGeometry(650,650,128,128), {
    textureWidth:512,textureHeight:512,waterNormals:normals,sunDirection,
    sunColor:0xffdfb3,waterColor:0x155b53,distortionScale:.65,fog:true
  });
  water.rotation.x=-Math.PI/2;
  water.material.transparent=true; water.material.depthWrite=false; water.renderOrder=2;
  const mat=water.material;
  Object.assign(mat.uniforms, {
    bobberPosition:{value:new THREE.Vector2()}, rippleStrength:{value:0},
    reflectionInterval:{value:1/24}
  });
  mat.vertexShader=mat.vertexShader
    .replace('void main() {',`${waveFunctions}\nvoid main() {`)
    .replace('mirrorCoord = modelMatrix * vec4( position, 1.0 );',
      'mirrorCoord = modelMatrix * vec4(position,1.0); mirrorCoord.y += albaWave(mirrorCoord.xz,time);')
    .replace('modelViewMatrix * vec4( position, 1.0 )','viewMatrix * worldPosition');
  mat.fragmentShader=mat.fragmentShader
    .replace('void main() {', /* glsl */`
      uniform vec2 bobberPosition;
      uniform float rippleStrength;
      ${waveFunctions}
      float albaDepth(vec2 p) {
        float basin=smoothstep(0.,.22,1.-length(vec2(p.x/82.,(p.y+42.)/108.)));
        float offshore=smoothstep(0.,45.,length(vec2(p.x*.8,p.y-7.)));
        return .18+basin*(.65+offshore*4.5);
      }
      void main() {`)
    .replace('vec3 surfaceNormal = normalize( noise.xzy * vec3( 1.5, 1.0, 1.5 ) );', /* glsl */`
      vec2 offset=worldPosition.xz-bobberPosition;
      float radius=length(offset);
      float envelope=exp(-radius*1.15)*smoothstep(.1,.32,radius)*rippleStrength;
      float ripple=sin(radius*16.-time*5.5)*envelope;
      vec2 slope=albaSlope(worldPosition.xz,time)+noise.xy*.045;
      slope+=offset/max(radius,.01)*cos(radius*16.-time*5.5)*envelope*.075;
      vec3 surfaceNormal=normalize(vec3(-slope.x,1.,-slope.y));`)
    .replace('float rf0 = 0.3;', 'float rf0 = 0.025;')
    .replace('gl_FragColor = vec4( outgoingLight, alpha );', /* glsl */`
      float opticalDepth=albaDepth(worldPosition.xz)/max(theta,.16);
      float absorption=1.-exp(-opticalDepth*.15);
      float opacity=clamp(mix(.12,.92,absorption)+reflectance*.25,.16,.97);
      outgoingLight+=sunColor*max(0.,ripple)*.07;
      gl_FragColor=vec4(outgoingLight,opacity);`);
  // Reuse Three.js's planar reflection instead of adding another render pass.
  const reflect=water.onBeforeRender;
  let lastTime=-Infinity;
  const lastRotation=new THREE.Quaternion();
  water.onBeforeRender=function(renderer,scene,camera) {
    const time=mat.uniforms.time.value;
    if (time-lastTime<mat.uniforms.reflectionInterval.value && camera.quaternion.angleTo(lastRotation)<.006) return;
    reflect.call(this,renderer,scene,camera);
    lastTime=time; lastRotation.copy(camera.quaternion);
  };
  return water;
}

export function makeLakeBed() {
  const geo=new THREE.PlaneGeometry(650,650,110,110); geo.rotateX(-Math.PI/2);
  const positions=geo.attributes.position, colors=[];
  const sand=new THREE.Color(0xa29e73), deep=new THREE.Color(0x31594e);
  for(let i=0;i<positions.count;i++) {
    const x=positions.getX(i), z=positions.getZ(i), depth=lakeDepth(x,z);
    positions.setY(i,-depth);
    const color=sand.clone().lerp(deep,THREE.MathUtils.smoothstep(depth,.5,4));
    color.multiplyScalar(.92+Math.sin(x*2+z)*Math.sin(z*3)*.08);
    colors.push(color.r,color.g,color.b);
  }
  geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3)); geo.computeVertexNormals();
  return new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1}));
}
