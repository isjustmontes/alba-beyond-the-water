import {InstancedBufferAttribute} from 'three';
// Small, bounded vertex deformation. All instances share time/flow uniforms;
// spatial phases and species profiles prevent a forest-wide metronome.
export const VEGETATION_PROFILES=Object.freeze({
  pine:Object.freeze({root:0,height:1,bend:.045,flutter:.005,frequency:.9}),
  spruce:Object.freeze({root:0,height:1,bend:.032,flutter:.004,frequency:.75}),
  birch:Object.freeze({root:0,height:1,bend:.065,flutter:.009,frequency:1.05}),
  grass:Object.freeze({root:0,height:.9,bend:.19,flutter:.025,frequency:1.7}),
  reed:Object.freeze({root:0,height:1.13,bend:.16,flutter:.01,frequency:1.3})
});

// CPU reference for tests/tools only; the scene never loops over vertices on CPU.
export function sampleVegetationWind(x,y,anchorX,anchorZ,time,windX,windZ,p,detail=1,out={}){
  const u=Math.max(0,Math.min(1,(y-p.root)/p.height)),du=y>=p.root&&y<=p.root+p.height ? 1/p.height : 0;
  const phase=anchorX*.173+anchorZ*.317+Math.sin(anchorX*1.31+anchorZ*1.79)*2;
  const f=p.frequency*(.85+.15*Math.sin(phase*1.7));
  const gust=.78+.22*Math.sin(time*.43+anchorX*.067-anchorZ*.049);
  const sway=.55+.35*Math.sin(time*f+phase)+.1*Math.sin(time*f*1.83+phase*.7);
  const a=Math.min(6,Math.hypot(windX,windZ))/6*p.height*gust;
  const angle=time*f*2.5+phase+x*9+u*8,flutter=detail>.5 ? p.flutter : 0;
  out.offset=a*(p.bend*u*u*sway+flutter*u*u*u*Math.sin(angle));
  out.dx=a*flutter*u*u*u*Math.cos(angle)*9;
  out.dy=a*du*(2*p.bend*u*sway+flutter*(3*u*u*Math.sin(angle)+8*u*u*u*Math.cos(angle)));
  return out;
}

export function vegetationMaterial(material,uniforms,profile){
  const n=v=>Number(v).toFixed(6);
  const code=/* glsl */`
    uniform float vegetationTime, vegetationDetail;
    uniform vec2 vegetationFlow;
    attribute vec3 vegetationPhase;
    attribute vec3 vegetationLocalX, vegetationLocalZ;
    void albaVegetation(vec3 p, out vec3 offset, out vec3 gradient, out vec3 direction){
      offset=vec3(0.);gradient=vec3(0.);direction=vec3(0.);
      #ifdef USE_INSTANCING
        float strength=length(vegetationFlow);
        vec2 flow=vegetationFlow/max(strength,.0001);
        direction=vegetationLocalX*flow.x+vegetationLocalZ*flow.y;
        float u=clamp((p.y-${n(profile.root)})/${n(profile.height)},0.,1.);
        float du=step(${n(profile.root)},p.y)*step(p.y,${n(profile.root+profile.height)})/${n(profile.height)};
        float phase=vegetationPhase.x,f=vegetationPhase.y;
        float gust=.78+.22*sin(vegetationTime*.43+vegetationPhase.z);
        float sway=.55+.35*sin(vegetationTime*f+phase)+.1*sin(vegetationTime*f*1.83+phase*.7);
        float a=min(strength,6.)/6.*${n(profile.height)}*gust;
        float s=a*${n(profile.bend)}*u*u*sway;
        float gx=0.,gy=a*du*2.*${n(profile.bend)}*u*sway;
        if(vegetationDetail>.5){
          float angle=vegetationTime*f*2.5+phase+p.x*9.+u*8.;
          float sn=sin(angle),cs=cos(angle);
          s+=a*${n(profile.flutter)}*u*u*u*sn;
          gx=a*${n(profile.flutter)}*u*u*u*cs*9.;
          gy+=a*du*${n(profile.flutter)}*(3.*u*u*sn+8.*u*u*u*cs);
        }
        offset=direction*s;gradient=vec3(gx,gy,0.);
      #endif
    }
  `;
  material.onBeforeCompile=shader=>{
    shader.uniforms.vegetationTime=uniforms.time;shader.uniforms.vegetationFlow=uniforms.flow;shader.uniforms.vegetationDetail=uniforms.detail;
    shader.vertexShader=code+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <beginnormal_vertex>',`#include <beginnormal_vertex>
      vec3 vegetationOffset, vegetationGradient, vegetationDirection;
      albaVegetation(position,vegetationOffset,vegetationGradient,vegetationDirection);
      objectNormal-=vegetationGradient*dot(vegetationDirection,objectNormal)/max(.5,1.+dot(vegetationGradient,vegetationDirection));`);
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed+=vegetationOffset;');
  };
  material.customProgramCacheKey=()=>`alba-vegetation-v2-${Object.values(profile).join('-')}`;
  material.userData.vegetationProfile=profile;
  return material;
}

export function padVegetationBounds(mesh,profile,maxHeightScale){
  mesh.computeBoundingSphere();
  mesh.boundingSphere.radius+=profile.height*(profile.bend+profile.flutter)*maxHeightScale+.02;
}

// Static per-instance phases: never recalculate hashes/frequencies per vertex/frame.
export function seedVegetationPhases(mesh,profile){
  const data=new Float32Array(mesh.instanceMatrix.count*3),localX=new Float32Array(data.length),localZ=new Float32Array(data.length),matrices=mesh.instanceMatrix.array;
  for(let i=0;i<mesh.instanceMatrix.count;i++){
    const x=matrices[i*16+12],z=matrices[i*16+14],phase=x*.173+z*.317+Math.sin(x*1.31+z*1.79)*2;
    data[i*3]=phase;data[i*3+1]=profile.frequency*(.85+.15*Math.sin(phase*1.7));data[i*3+2]=x*.067-z*.049;
    // Lago Sereno's vegetation group is fixed in world space. Cache inverse
    // instance bases once, so wind stays horizontal through yaw/tilt/scale.
    const k=i*16,h=Math.hypot(matrices[k+4],matrices[k+5],matrices[k+6]);
    for(let axis=0;axis<3;axis++){
      const b=k+axis*4,n=matrices[b]**2+matrices[b+1]**2+matrices[b+2]**2;
      localX[i*3+axis]=matrices[b]*h/n;localZ[i*3+axis]=matrices[b+2]*h/n;
    }
  }
  mesh.geometry.setAttribute('vegetationPhase',new InstancedBufferAttribute(data,3));
  mesh.geometry.setAttribute('vegetationLocalX',new InstancedBufferAttribute(localX,3));
  mesh.geometry.setAttribute('vegetationLocalZ',new InstancedBufferAttribute(localZ,3));
}
