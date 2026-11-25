import {test} from 'node:test';
import assert from 'node:assert/strict';
import {MeshStandardMaterial} from 'three';
import {atmosphere,shoreWetness,shorelineMaterial} from '../src/visuals/atmosphere.js';
import {Environment,WEATHER} from '../src/simulation/environment.js';

function sample(hour,weather=WEATHER.clear){const e=new Environment({startHour:hour});return atmosphere(hour,e.daylight,weather);}
test('morning mist follows the clock, moisture and wind dispersion',()=>{
  assert.ok(sample(6).mist>sample(12).mist+.4);
  assert.ok(sample(6,{...WEATHER.clear,wind:0}).mist>sample(6,WEATHER.windy).mist);
  assert.ok(sample(6,{...WEATHER.clear,cloud:1}).mist>sample(6).mist);
  assert.ok(sample(12,WEATHER.heavyRain).fogDensity>sample(12).fogDensity);
});
test('haze stays light at fishing distances across all hours and weather',()=>{
  for(const weather of Object.values(WEATHER))for(let hour=0;hour<24;hour+=.1){
    const a=sample(hour,weather);
    assert.ok(a.fogDensity>=.0026&&a.fogDensity<.0065);
    const transmission=Math.exp(-Math.pow(a.fogDensity*40,2));
    assert.ok(transmission>.93,'nearby lure and fish remain visible');
    assert.ok(a.ambient>=.56&&a.sun>=0&&a.reflection>=.08,'night visibility floor');
  }
});
test('lighting and haze are continuous at dawn, dusk, midnight and weather transitions',()=>{
  for(let h=0;h<24;h+=.01){
    const a=sample(h),b=sample((h+.001)%24);
    for(const k of Object.keys(a))assert.ok(Math.abs(a[k]-b[k])<.004,`${k} jumps at ${h}`);
  }
  const weather={...WEATHER.clear},a=sample(6,weather);weather.cloud+=.0001;weather.rain+=.0001;weather.wind+=.0001;
  const b=sample(6,weather);for(const k of Object.keys(a))assert.ok(Math.abs(a[k]-b[k])<.001);
  const out={};assert.equal(atmosphere(6,.5,weather,out),out,'reuse output without frame allocations');
});
test('shore wetness fades gradually above the waterline and responds to rain',()=>{
  assert.equal(shoreWetness(-.1),.85);assert.equal(shoreWetness(1),0);
  let previous=shoreWetness(-.1);
  for(let y=-.1;y<=1;y+=.01){const wet=shoreWetness(y);assert.ok(wet<=previous&&previous-wet<.03);previous=wet;}
  assert.ok(shoreWetness(2,1)>shoreWetness(2,0));
  assert.notEqual(shoreWetness(.35,0,0),shoreWetness(.35,0,1),'irregular mineral fringe');
});
test('shore material preserves existing hooks and shares rain without new resources',()=>{
  const material=new MeshStandardMaterial(),rain={value:0};let called=false;
  material.onBeforeCompile=shader=>{called=true;shader.uniforms.existing={value:42};};
  material.customProgramCacheKey=()=> 'existing-terrain';shorelineMaterial(material,rain);
  const shader={uniforms:{},vertexShader:'#include <project_vertex>',fragmentShader:'#include <color_fragment>\n#include <roughnessmap_fragment>'};
  material.onBeforeCompile(shader);
  assert.equal(called,true);assert.equal(shader.uniforms.existing.value,42);assert.equal(shader.uniforms.shoreRain,rain);
  assert.match(material.customProgramCacheKey(),/^existing-terrain-shore/);
  assert.equal(material.map,null);assert.equal(material.transparent,false);material.dispose();
});
