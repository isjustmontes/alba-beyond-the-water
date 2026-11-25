// Presentation only: consumes Living Waters conditions without changing simulation.
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t);};
export function atmosphere(hour,day,weather,out={}) {
  const elevation=Math.sin((hour-6)/24*Math.PI*2);
  const dawnDistance=Math.abs(((hour-6.2+36)%24)-12);
  const dawn=Math.exp(-Math.pow(dawnDistance/1.65,2));
  out.warm=(1-smooth(.05,.7,Math.abs(elevation)))*(1-weather.cloud*.65)*day;
  // Wind disperses morning mist; rain haze is broader, but never hides nearby tackle.
  out.mist=dawn*(.65+weather.cloud*.35)*(1-clamp(weather.wind/8,0,.75));
  out.fogDensity=.0026+weather.cloud*.0009+weather.rain*.0017+out.mist*.0018;
  out.sun=day*3.15*(1-weather.cloud*.72)*(.45+.55*smooth(-.04,.28,elevation));
  out.ambient=.56+day*(.88+weather.cloud*.12);
  out.reflection=.08+day*(.27-weather.cloud*.035);
  return out;
}

// CPU reference for the shoreline shader; height is world height, water level is zero.
export function shoreWetness(height,rain=0,variation=.5) {
  return Math.max((1-smooth(.02,.72, height+(variation-.5)*.16))*.85,rain*.32);
}

// Wraps existing material hooks (including terrain triplanar mapping).
// No new textures, geometry, passes or per-object frame updates.
export function shorelineMaterial(material,rain) {
  const compile=material.onBeforeCompile.bind(material),key=material.customProgramCacheKey();
  material.onBeforeCompile=shader=>{
    compile(shader);shader.uniforms.shoreRain=rain;
    shader.vertexShader='varying vec3 vShorePosition;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>',`#include <project_vertex>
      vec4 shorePosition=vec4(transformed,1.);
      #ifdef USE_INSTANCING
        shorePosition=instanceMatrix*shorePosition;
      #endif
      vShorePosition=(modelMatrix*shorePosition).xyz;`);
    shader.fragmentShader='varying vec3 vShorePosition;uniform float shoreRain;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
      float shoreGrain=.5+.5*sin(vShorePosition.x*2.7+sin(vShorePosition.z*3.1))*sin(vShorePosition.z*4.3);
      float shoreBand=1.-smoothstep(.02,.72,vShorePosition.y+(shoreGrain-.5)*.16);
      float shoreWet=max(shoreBand*.85,shoreRain*.32);
      // Broken mineral fringe merges existing mossy banks and stones at the waterline.
      diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(1.09,1.02,.88),shoreBand*.24);
      diffuseColor.rgb*=1.-shoreWet*.24;`);
    shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
      roughnessFactor=mix(roughnessFactor,.57,shoreWet);`);
  };
  material.customProgramCacheKey=()=>`${key}-shore-v1`;
  return material;
}
