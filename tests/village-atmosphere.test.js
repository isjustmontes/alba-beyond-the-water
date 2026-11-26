import {test} from 'node:test';
import assert from 'node:assert/strict';
import {MeshStandardMaterial,Texture,ShaderLib} from 'three';
import {Environment,WEATHER} from '../src/simulation/environment.js';
import {atmosphere} from '../src/visuals/atmosphere.js';
import {villageSurfaceMaterial} from '../src/visuals/village-materials.js';
import {villageAtmosphere,advanceVillageWetness,villageRainMaterial} from '../src/visuals/village-atmosphere.js';
const sample=(hour,weather=WEATHER.clear)=>{
  const e=new Environment({startHour:hour});return villageAtmosphere(atmosphere(hour,e.daylight,weather),e.daylight,weather);
};
test('village fog follows dawn, wind and rain while routes remain visible and night has fill light',()=>{
  assert.ok(sample(6).fogDensity>sample(12).fogDensity);
  assert.ok(sample(6,WEATHER.windy).fogDensity<sample(6).fogDensity);
  assert.ok(sample(12,WEATHER.heavyRain).fogDensity>sample(12).fogDensity);
  assert.ok(sample(23).ambientScale>sample(12).ambientScale,'night retains extra diffuse fill for navigation');
  for(const weather of Object.values(WEATHER))for(let hour=0;hour<24;hour+=.1){
    const a=sample(hour,weather);
    assert.ok(Math.exp(-((a.fogDensity*60)**2))>.88,'signs and village routes stay visible');
    assert.ok(a.reflection>=.16&&a.ambientScale>=1&&a.shadowStrength>=.6&&a.shadowStrength<.8);
  }
  for(let hour=0;hour<24;hour+=.01){
    const a=sample(hour),b=sample((hour+.001)%24);
    for(const key of Object.keys(a))assert.ok(Math.abs(a[key]-b[key])<.001);
  }
});
test('wetting and drying are bounded, gradual and frame-rate independent without changing climate',()=>{
  const integrate=(hz,rain,initial=0)=>{let w=initial;for(let i=0;i<hz*30;i++)w=advanceVillageWetness(w,rain,1/hz);return w;};
  assert.ok(Math.abs(integrate(20,1)-integrate(60,1))<1e-10);
  assert.ok(advanceVillageWetness(0,1,1/60)<.004);
  assert.ok(integrate(60,0,1)>integrate(60,1)*.4,'ground remains damp briefly after rain');
  assert.equal(advanceVillageWetness(.4,1,0),.4);assert.equal(advanceVillageWetness(.4,1,NaN),.4);
  for(const rain of [-5,0,.32,1,6])assert.ok(integrate(20,rain)>=0&&integrate(20,rain)<=1);
  const e=new Environment(),before=e.snapshot(),out={};
  assert.equal(villageAtmosphere(atmosphere(e.clock.hour,e.daylight,e.weather),e.daylight,e.weather,out),out);
  assert.deepEqual(e.snapshot(),before);
});
test('rain shares one uniform and preserves surface projection, bump, maps and renderer cache identity',()=>{
  const wet={value:0},keys=[];
  for(const kind of ['granite','trim','wood','tile','path']){
    const map=new Texture(),m=new MeshStandardMaterial({map,bumpMap:map});
    if(kind!=='path')villageSurfaceMaterial(m,kind);
    villageRainMaterial(m,wet);
    const shader={uniforms:{},vertexShader:ShaderLib.standard.vertexShader,fragmentShader:ShaderLib.standard.fragmentShader};m.onBeforeCompile(shader);
    assert.equal(shader.uniforms.villageWetness,wet);assert.equal(m.map,map);assert.equal(m.bumpMap,map);assert.equal(m.transparent,false);
    if(kind==='granite')assert.ok(shader.fragmentShader.includes('texture2D( map, albaVillageUv() )'));
    assert.ok(shader.vertexShader.includes('instanceMatrix*albaRainPoint'));
    assert.ok(shader.fragmentShader.includes('max(.76,roughnessFactor-.14)'));
    keys.push(m.customProgramCacheKey());m.dispose();map.dispose();
  }
  assert.equal(new Set(keys).size,5);
});
