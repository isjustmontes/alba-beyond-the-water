import { chromium } from '@playwright/test';
import { access, mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';

let executablePath=process.env.ALBA_BROWSER_PATH;
if(!executablePath && process.platform==='win32') {
  const edge='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
  try { await access(edge); executablePath=edge; } catch { /* Playwright Chromium. */ }
}
const browser=await chromium.launch({headless:true,executablePath,args:['--enable-webgl','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1200,height:900}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await mkdir('test-results',{recursive:true});
try {
  await page.goto(process.env.ALBA_TEST_URL || 'http://127.0.0.1:5173');
  await page.waitForFunction(()=>window.__alba,null,{timeout:60000});
  await page.keyboard.press('KeyP');
  const stats=await page.evaluate(async()=>{
    const THREE=await import('/node_modules/.vite/deps/three.js');
    const {FishModels}=await import('/src/visuals/fish.js');
    const {RodRig}=await import('/src/visuals/rod.js');
    const scene=new THREE.Scene(); scene.background=new THREE.Color(0x203934);
    const camera=new THREE.PerspectiveCamera(42,1200/900,.1,30);camera.position.set(.5,.2,7.6);camera.lookAt(0,0,0);
    const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(1200,900);renderer.setPixelRatio(1);
    renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;
    renderer.domElement.style.cssText='position:fixed;inset:0;z-index:100;width:100%;height:100%';document.body.append(renderer.domElement);
    // Close the modal after pausing: the overlay is a test-only isolated asset view.
    document.getElementById('pause-dialog').close();
    scene.add(new THREE.HemisphereLight(0xd9eaff,0x67704a,2.6));
    const sun=new THREE.DirectionalLight(0xffe2b5,3);sun.position.set(1,3,5);scene.add(sun);
    const models=new FishModels();models.clock.value=1.6;
    for(let i=0;i<5;i++) {
      const fish=models.create(i,i+1);fish.position.set(0,2.08-i*1.04,0);fish.scale.setScalar(1.2);fish.rotation.y=-.14;scene.add(fish);
    }
    renderer.render(scene,camera);
    const before={calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,textures:renderer.info.memory.textures,geometries:renderer.info.memory.geometries};
    const clones=[];
    for(let i=0;i<15;i++){const fish=models.create(i%5,i);scene.add(fish);clones.push(fish);}
    renderer.render(scene,camera);
    const pooled={textures:renderer.info.memory.textures,geometries:renderer.info.memory.geometries};
    clones.forEach(f=>scene.remove(f));renderer.render(scene,camera);
    const rod=new RodRig(),rest=rod.tip.position.y;
    for(let i=0;i<60;i++)rod.update(1/60,.7,1,false);
    const deflection=rest-rod.tip.position.y;
    for(let i=0;i<60;i++)rod.update(1/60,0,1,false);
    return {...before,pooled,deflection,recoveredBend:rod.bend.value};
  });
  await page.screenshot({path:'test-results/fish-detail.png'});
  assert.ok(stats.triangles>1000);assert.ok(stats.calls<=40,'five detailed fish use at most eight draws each');assert.deepEqual(errors,[]);
  assert.equal(stats.pooled.textures,stats.textures,'fish variants share GPU textures');
  assert.equal(stats.pooled.geometries,stats.geometries,'fish models reuse GPU geometry');
  assert.ok(stats.deflection>.25);assert.ok(stats.recoveredBend<.001);
  console.log('Fish detail, shared materials and shader compilation:',stats);
} finally {await browser.close();}
