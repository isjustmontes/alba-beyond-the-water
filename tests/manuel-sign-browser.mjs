import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:process.env.ALBA_BROWSER_PATH||(process.platform==='win32'?'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe':undefined),args:['--enable-webgl','--enable-unsafe-swiftshader']});
const report=[];await mkdir('test-results',{recursive:true});
try{
 for(const [name,width,height,mobile]of [['pc',1280,800,false],['phone',390,844,true],['landscape',844,390,true],['tablet',1024,768,true]]){
  const page=await browser.newPage({viewport:{width,height},hasTouch:mobile,isMobile:mobile,deviceScaleFactor:1}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});await page.addInitScript(()=>localStorage.setItem('alba-audio-v1','false'));
  await page.route('**/src/main.js*',async route=>{const response=await route.fetch(),body=await response.text(),marker='// Expose read-only diagnostics in development, without gameplay shortcuts.';assert.ok(body.includes(marker));await route.fulfill({response,body:body.replace(marker,`window.__signWorld=world;window.__signPosition=(x,z,tx=6.03,tz=7)=>{clearHeld();exploration.x=x;exploration.z=z;world.camera.position.set(x,exploration.floor+WALK.eye,z);world.yaw=Math.atan2(x-tx,z-tz);world.pitch=-.09;world.setView();};\n`+marker)});});
  const tap=s=>mobile?page.locator(s).tap():page.locator(s).click();
  const move=async(x,z)=>{await page.evaluate(([x,z])=>window.__signPosition(x,z),[x,z]);await page.waitForTimeout(160);};
  const visible=()=>page.evaluate(()=>window.__signWorld.village.manuelSign.icon.visible);
  await page.goto(process.env.ALBA_TEST_URL||'http://127.0.0.1:5177');await page.waitForFunction(()=>window.__alba&&document.getElementById('loading').hidden);
  await tap('#mode-toggle');await move(6,72);await page.waitForFunction(()=>!document.getElementById('zone-travel').hidden);await tap('#zone-travel');await page.waitForFunction(()=>window.__alba.snapshot().zone==='anglers-village');
  await page.waitForFunction(()=>window.__signWorld.village.manuelSign.group.getObjectByName('manuel-sign-portrait-1').material.map.image?.complete);
  const saved=await page.evaluate(()=>JSON.stringify({...localStorage}));
  await move(0,17);assert.equal(await visible(),true);await page.screenshot({path:`test-results/manuel-sign-${name}-approach.png`});
  await move(2,10);assert.equal(await visible(),true);await page.screenshot({path:`test-results/manuel-sign-${name}-plaza.png`});
  const projection=await page.evaluate(()=>{const w=window.__signWorld,p=w.village.manuelSign.icon.position.clone().project(w.camera);return {x:(p.x+1)*innerWidth/2,y:(1-p.y)*innerHeight/2,z:p.z};});
  assert.ok(projection.x>=0&&projection.x<=width&&projection.y>=0&&projection.y<=height&&projection.z<1,'camera-facing icon projects inside plaza view');
  const budget=await page.evaluate(()=>{const w=window.__signWorld,s=w.village.manuelSign,render=()=>{w.renderer.info.reset();w.renderer.render(w.village.scene,w.camera);return w.renderer.info.render.calls;};const withSign=render();s.group.visible=false;s.icon.visible=false;const withoutSign=render();s.group.visible=true;s.icon.visible=true;render();return {withSign,withoutSign,delta:withSign-withoutSign,geometries:w.renderer.info.memory.geometries,textures:w.renderer.info.memory.textures};});
  assert.ok(budget.delta>0&&budget.delta<=7,'bounded additional draw calls, no extra scene passes');
  await move(0,0);assert.equal(await visible(),true);await page.screenshot({path:`test-results/manuel-sign-${name}-north.png`});
  await move(0,28);assert.equal(await visible(),false,'hidden beyond moderate range');
  await move(5,9);await page.waitForFunction(()=>document.getElementById('zone-travel').textContent.includes('Manuel'));
  if(mobile)await tap('#zone-travel');else await page.keyboard.press('e');await page.waitForFunction(()=>document.querySelector('.alba-dialogue').open);await page.waitForFunction(()=>!window.__signWorld.village.manuelSign.icon.visible);
  assert.ok((await page.locator('.alba-dialogue__text').textContent()).includes('Bo día'));await tap('.alba-dialogue__close');await page.waitForFunction(()=>!window.__alba.snapshot().paused&&window.__signWorld.village.manuelSign.icon.visible);
  await page.keyboard.press('m');await page.waitForFunction(()=>document.getElementById('map-dialog').open&&!window.__signWorld.village.manuelSign.icon.visible);await tap('#map-dialog .close');await page.waitForFunction(()=>!window.__alba.snapshot().paused);
  await page.keyboard.press('j');await page.waitForFunction(()=>document.getElementById('log-dialog').open&&!window.__signWorld.village.manuelSign.icon.visible);await tap('#log-dialog .close');await page.waitForFunction(()=>!window.__alba.snapshot().paused);
  assert.equal(await page.evaluate(()=>JSON.stringify({...localStorage})),saved);assert.deepEqual(errors,[]);
  report.push({name,result:'PASS',projection,budget});await page.close();console.log(`${name}: PASS sign/marker view, distance, menus and E/mobile dialogue; +${budget.delta} calls`);
 }
 await writeFile('test-results/manuel-sign-report.json',JSON.stringify(report,null,2));
}finally{await browser.close();}
