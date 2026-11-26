import {ShaderChunk} from 'three';
import {noise} from '../terrain-height.js';

// Own, deterministic surface samples. Output is reused while baking the maps;
// no pixel generation or new resources in the render loop.
export function villageSurfaceTexel(kind,x,y,out={}){
  const n=noise(x*.035,y*.035),grain=noise(x*1.73+17,y*1.73+3);
  if(kind==='granite'||kind==='trim'){
    const warped=y+Math.sin(x*Math.PI/256)*1.5,row=Math.floor(warped/64);
    const u=((x+(row%2)*85+Math.sin(y*Math.PI/64)*1.3)%512+512)%512;
    const width=512/3,column=Math.floor(u/width),local=u%width,fy=((warped%64)+64)%64;
    const edge=Math.min(local,width-local,fy,64-fy),joint=1.1+noise(x*.09,y*.09)*1.2;
    const stone=noise(column*9,row*7)*18-9;
    const fleck=grain>.76?24:grain<.24?-23:(grain-.5)*22;
    const v=kind==='granite'&&edge<joint?91+n*13:146+stone+n*20+fleck;
    out.r=v-2;out.g=v;out.b=v-5;
  }else if(kind==='wood'){
    const warp=Math.sin(y*.018)*.5+Math.sin(y*.006)*.8;
    const fibres=Math.sin(x*.32+warp)+Math.sin(x*1.45+warp*2)*.22;
    const knot=Math.exp(-((x-167)**2/650+(y-283)**2/2100));
    const ring=Math.sin(Math.hypot((x-167)*.8,(y-283)*.28)*.7)*knot;
    const worn=noise(x*.012+8,y*.012+3);
    const v=92+fibres*4+n*18+grain*9-knot*17+ring*5;
    out.r=v+worn*9;out.g=v*.79+worn*14;out.b=v*.59+worn*19;
  }else{
    const patina=noise(x*.012+5,y*.012+9),overlap=Math.exp(-y/38);
    const mineral=Math.max(0,patina-.57)*36;
    out.r=137+n*34+grain*11-overlap*22-mineral*.4;
    out.g=65+n*23+grain*9-overlap*13+mineral;
    out.b=41+n*17+grain*7-overlap*7+mineral*1.2;
  }
  return out;
}

// World projection gives masonry/wood a consistent scale across scaled boxes
// and gables. Color and bump use identical coordinates. Roof UVs stay local to
// each existing curved tile. Static stains are presentation, not new weather.
export function villageSurfaceMaterial(material,kind){
  const projected=kind!=='tile',scale=kind==='wood'?.65:.62;
  material.onBeforeCompile=shader=>{
    shader.vertexShader='varying vec3 albaVillagePosition;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>',`#include <project_vertex>
      vec4 albaPosition=vec4(transformed,1.);
      #ifdef USE_INSTANCING
        albaPosition=instanceMatrix*albaPosition;
      #endif
      albaVillagePosition=(modelMatrix*albaPosition).xyz;`);
    shader.fragmentShader=`varying vec3 albaVillagePosition;
      vec2 albaVillageUv(){
        vec3 n=abs(normalize(cross(dFdx(albaVillagePosition),dFdy(albaVillagePosition))));
        vec2 uv=n.y>.65?albaVillagePosition.${kind==='wood'?'zx':'xz'}:(n.x>n.z?albaVillagePosition.zy:albaVillagePosition.xy);
        return uv*${scale.toFixed(3)};
      }\n`+shader.fragmentShader;
    if(projected){
      shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',ShaderChunk.map_fragment.replaceAll('vMapUv','albaVillageUv()'));
      shader.fragmentShader=shader.fragmentShader.replace('#include <bumpmap_pars_fragment>',ShaderChunk.bumpmap_pars_fragment.replaceAll('vBumpMapUv','albaVillageUv()'));
    }
    const stone=kind==='granite'||kind==='trim';
    shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
      vec3 albaP=albaVillagePosition;
      float albaPatch=.5+.25*sin(albaP.x*.83+albaP.z*.71)+.25*sin(albaP.z*.57-albaP.y*.67);
      float albaGround=1.+.008*albaP.z+.07*sin(albaP.x*.17)*sin(albaP.z*.13);
      float albaDamp=(1.-smoothstep(.08,1.05,albaP.y-albaGround))*smoothstep(.28,.82,albaPatch);
      diffuseColor.rgb*=1.-albaDamp*${stone?'.16':'.10'};
      diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(.68,.80,.54),${stone?'albaDamp*.22':'albaPatch*.05'});
      diffuseColor.rgb*=.96+albaPatch*.065;`);
    shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
      roughnessFactor=clamp(roughnessFactor+(albaPatch-.5)*.07-albaDamp*.06,.72,.99);`);
  };
  material.customProgramCacheKey=()=>`alba-village-surface-v1-${kind}`;
  return material;
}
