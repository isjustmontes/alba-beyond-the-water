import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
await mkdir('test-results',{recursive:true});const results=[];
const browser=await chromium.launch({headless:true,executablePath:process.env.ALBA_BROWSER_PATH||(process.platform==='win32'?'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe':undefined),args:['--enable-webgl','--enable-unsafe-swiftshader']});
try{
 for(const [name,width,height,mobile]of [['pc',1280,800,false],['phone',390,844,true],['landscape',844,390,true],['tablet',1024,768,true]]){
  const page=await browser.newPage({viewport:{width,height},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:1}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.route('**/m09-atmosphere',r=>r.fulfill({contentType:'text/html',body:`<style>body{margin:0}canvas{display:block}</style><canvas id="c"></canvas><script type="module">
    import {LakeWorld} from '/src/world.js';import {FishingGame} from '/src/fishing.js';
    window.world=new LakeWorld(document.getElementById('c'));window.game=new FishingGame();
    world.setZone('anglers-village');world.setExploring(true);world.touchMode=${mobile};world.setQuality(${!mobile});window.ready=true;</script>`}));
  await page.goto((process.env.ALBA_TEST_URL||'http://127.0.0.1:5175')+'/m09-atmosphere');await page.waitForFunction(()=>window.ready);
  const conditions=[];
  for(const [id,hour,state]of [['dawn',6.3,'clear'],['noon',12,'clear'],['night',23,'clear'],['rain',12,'heavyRain'],['drying',12,'clear']]){
   const result=await page.evaluate(async({hour,state})=>{
    const {villageHeight}=await import('/src/village-layout.js');const w=world,g=game,e=g.environment;
    e.weather.request(state,{manual:true});e.update(90);g.time+=90;e.clock.totalHours=hour;
    w.camera.position.set(0,villageHeight(0,17)+1.7,17);w.yaw=0;w.pitch=-.06;w.setView();
    const before=JSON.stringify(e.snapshot());w.update(0,g);const view=w.village;
    return {hour:e.clock.hour,weather:e.weather.state,unchanged:before===JSON.stringify(e.snapshot()),wet:view.wetness.value,fog:view.scene.fog.density,ambient:view.ambient.intensity,reflection:view.scene.environmentIntensity,shadow:view.sun.shadow.intensity,resources:{...w.renderer.info.memory}};
   },{hour,state});
   assert.equal(result.unchanged,true);assert.ok(Math.abs(result.hour-hour)<1e-10);assert.ok(result.fog<=.0058);assert.ok(result.ambient>=.5);assert.ok(result.wet>=0&&result.wet<=1);
   await page.screenshot({path:`test-results/m09-d-${name}-${id}.png`});conditions.push({id,...result});
   if(id==='noon'||id==='rain'){
    await page.evaluate(async()=>{const {villageHeight}=await import('/src/village-layout.js');world.camera.position.set(-6,villageHeight(-6,6.5)+1.7,6.5);world.yaw=.55;world.pitch=.12;world.setView();world.update(0,game);});
    await page.screenshot({path:`test-results/m09-d-${name}-${id}-materials.png`});
   }
  }
  assert.ok(conditions[3].wet>.98);assert.ok(conditions[4].wet<conditions[3].wet&&conditions[4].wet>0);
  assert.deepEqual(errors,[]);results.push({name,conditions,errors});console.log(`PASS ${name}: dawn/noon/night/rain/drying, climate preserved and no JS/shader errors`);await page.close();
 }
 await writeFile('test-results/m09-d-atmosphere.json',JSON.stringify(results,null,2));
}finally{await browser.close();}
