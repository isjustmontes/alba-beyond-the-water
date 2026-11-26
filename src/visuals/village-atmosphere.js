// Rural presentation of Living Waters, not a second environmental simulation.
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function villageAtmosphere(base,day,weather,out={}){
  out.sunScale=.98-weather.cloud*.12;
  out.ambientScale=1.01+(1-day)*.22+weather.cloud*.075;
  out.groundLift=.025+(1-day)*.04+day*.006+weather.cloud*.012;
  out.reflection=Math.max(.16,base.reflection*.92);
  out.fogDensity=clamp(base.fogDensity*.82+base.mist*.0012,.0023,.0058);
  out.shadowStrength=.74-weather.cloud*.14;
  return out;
}

export function advanceVillageWetness(current,rain,dt){
  const target=clamp(rain,0,1),wet=clamp(current,0,1);
  if(!Number.isFinite(dt)||dt<=0)return wet;
  return wet+(target-wet)*(1-Math.exp(-dt/(target>wet?6:45)));
}

// Preserve the C projection/bump hooks. One shared uniform, no new maps, passes
// or meshes. Dry surfaces are unchanged; even fully wet stone stays rough.
export function villageRainMaterial(material,wetness){
  const compile=material.onBeforeCompile.bind(material),key=material.customProgramCacheKey();
  material.onBeforeCompile=shader=>{
    compile(shader);shader.uniforms.villageWetness=wetness;
    shader.vertexShader='varying vec3 albaRainPosition;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>',`#include <project_vertex>
      vec4 albaRainPoint=vec4(transformed,1.);
      #ifdef USE_INSTANCING
        albaRainPoint=instanceMatrix*albaRainPoint;
      #endif
      albaRainPosition=(modelMatrix*albaRainPoint).xyz;`);
    shader.fragmentShader='varying vec3 albaRainPosition;uniform float villageWetness;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
      vec3 albaRainNormal=normalize(cross(dFdx(albaRainPosition),dFdy(albaRainPosition)));
      float albaExposure=.28+.72*abs(albaRainNormal.y);
      float albaRainPatch=.74+.20*sin(albaRainPosition.x*.93+sin(albaRainPosition.z*1.27))+.06*sin(albaRainPosition.x*.29-albaRainPosition.z*.47);
      float albaRainWet=clamp(villageWetness,0.,1.)*albaExposure*albaRainPatch;
      diffuseColor.rgb*=1.-albaRainWet*.13;`);
    shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
      roughnessFactor=mix(roughnessFactor,max(.76,roughnessFactor-.14),albaRainWet);`);
  };
  material.customProgramCacheKey=()=>`${key}-village-rain-v1`;
  return material;
}
