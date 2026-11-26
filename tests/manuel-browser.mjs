import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:process.env.ALBA_BROWSER_PATH||(process.platform==='win32'?'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe':undefined),args:['--enable-webgl','--enable-unsafe-swiftshader']});
const report=[];await mkdir('test-results',{recursive:true});
try{
 for(const [name,width,height,mobile]of [['pc',1280,800,false],['phone',390,844,true],['landscape',844,390,true],['tablet',1024,768,true]]){
  const only=process.argv.find(arg=>arg.startsWith('--profile='))?.split('=')[1];if(only&&only!==name)continue;
  const page=await browser.newPage({viewport:{width,height},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:1}),errors=[],art=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('request',r=>{if(r.url().includes('/assets/dialogues/'))art.push(r.url());});
  await page.addInitScript(()=>{localStorage.setItem('alba-audio-v1','false');});
  // Test-only positioning in the served response, never a runtime gameplay API.
  await page.route('**/src/main.js*',async route=>{const response=await route.fetch(),body=await response.text(),marker='// Expose read-only diagnostics in development, without gameplay shortcuts.';assert.ok(body.includes(marker));await route.fulfill({response,body:body.replace(marker,'window.__manuelPosition=(x,z)=>{clearHeld();exploration.x=x;exploration.z=z;};\n'+marker)});});
  const tap=selector=>mobile?page.locator(selector).tap():page.locator(selector).click();
  const snap=()=>page.evaluate(()=>window.__alba.snapshot());
  const move=async(x,z)=>{await page.evaluate(([x,z])=>window.__manuelPosition(x,z),[x,z]);await page.waitForTimeout(120);};
  const choose=async(label)=>{const choice=page.locator('.alba-dialogue__choice').filter({hasText:label});await choice.scrollIntoViewIfNeeded();const previous=await page.locator('.alba-dialogue__text').textContent();await (mobile?choice.tap():choice.click());try{await page.waitForFunction(text=>!document.querySelector('.alba-dialogue').open||document.querySelector('.alba-dialogue__text').textContent!==text,previous,{timeout:2000});}catch(error){console.log({name,label,text:await page.locator('.alba-dialogue__text').textContent(),trace:await page.evaluate(()=>window.__choiceTrace)});await page.screenshot({path:'test-results/manuel-choice-failure.png'});throw error;}};
  const open=async()=>{if(mobile)await tap('#zone-travel');else await page.keyboard.press('e');await page.waitForFunction(()=>document.querySelector('.alba-dialogue').open);assert.ok((await page.locator('.alba-dialogue__text').textContent()).includes('Bo día'),'opening gesture must never choose a response');};
  const closed=()=>page.waitForFunction(()=>!document.querySelector('.alba-dialogue').open&&!window.__alba.snapshot().paused);
  await page.goto(process.env.ALBA_TEST_URL||'http://127.0.0.1:5177');await page.waitForFunction(()=>window.__alba&&document.getElementById('loading').hidden);
  assert.equal(art.length,0,'no portrait during lake bootstrap');
  await page.keyboard.press('e');assert.equal(await page.locator('#equipment-dialog').isVisible(),true,'E equipment preserved on lake');await tap('#equipment-dialog .close');await page.waitForFunction(()=>!window.__alba.snapshot().paused);
  await tap('#mode-toggle');await move(6,72);await page.waitForFunction(()=>!document.getElementById('zone-travel').hidden);await tap('#zone-travel');await page.waitForFunction(()=>window.__alba.snapshot().zone==='anglers-village');
  const saved=await page.evaluate(()=>JSON.stringify({...localStorage}));
  await move(5,6);assert.equal(await page.locator('#zone-travel').isVisible(),false,'bench blocks interaction from opposite side');
  // Reach the encounter from the plaza using real movement, not a dialogue shortcut.
  await move(5,10.2);await page.keyboard.down('w');await page.waitForFunction(()=>!document.getElementById('zone-travel').hidden&&document.getElementById('zone-travel').textContent.includes('Manuel'));await page.keyboard.up('w');
  assert.equal(await page.locator('#zone-travel').getAttribute('aria-keyshortcuts'),'E');
  if(mobile){
   await page.touchscreen.tap(width/2,height/2);await page.waitForFunction(()=>window.__alba.snapshot().touchMode);
   const button=await page.locator('#zone-travel').boundingBox(),left=await page.locator('#walk-stick').boundingBox(),right=await page.locator('#look-stick').boundingBox();
   const overlap=(a,b)=>a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;
   assert.equal(overlap(button,left)||overlap(button,right),false,'context button avoids both joysticks');
   // Both independent touches remain down while a third finger opens Manuel.
   const cdp=await page.context().newCDPSession(page);
   const touches=[{id:1,x:left.x+left.width/2+8,y:left.y+left.height/2},{id:2,x:right.x+right.width/2+25,y:right.y+right.height/2}];
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:touches});
   assert.ok((await snap()).walkStick.x>0);
   const opener={id:3,x:button.x+button.width/2,y:button.y+button.height/2};
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[...touches,opener]});
   // CDP touchEnd carries the ended contact, not the remaining contacts.
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[opener]});
   await page.waitForFunction(()=>document.querySelector('.alba-dialogue').open);
   for(const touch of touches)await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[touch]});await cdp.detach();
  }else{await tap('#scene');await page.waitForFunction(()=>document.pointerLockElement===document.getElementById('scene'));await page.keyboard.down('w');await page.keyboard.down('Shift');await open();await page.keyboard.up('w');await page.keyboard.up('Shift');assert.equal(await page.evaluate(()=>document.pointerLockElement),null);}
  await page.waitForFunction(()=>document.querySelector('.alba-dialogue__image').naturalWidth>0);
  assert.ok((await page.locator('.alba-dialogue__text').textContent()).includes('Bo día'),'multi-touch opener must not fall through onto a choice');
  let s=await snap();assert.equal(s.paused,true);assert.equal(s.walkingKeys,0);assert.deepEqual(s.walkStick,{x:0,y:0});assert.equal(s.heldInputs,0);assert.equal(await page.locator('#equipment-dialog').isVisible(),false);assert.equal(await page.locator('dialog[open]').count(),1);
  const frozen=await snap();await page.keyboard.press('v');await page.keyboard.press('m');await page.keyboard.press('t');await page.keyboard.press('e');await page.keyboard.press('j');await page.keyboard.press('Space');await page.waitForTimeout(180);
  s=await snap();assert.equal(s.time,frozen.time);assert.deepEqual(s.playerPosition,frozen.playerPosition);assert.equal(s.cameraYaw,frozen.cameraYaw);assert.equal(s.cameraPitch,frozen.cameraPitch);assert.equal(s.casts,0);assert.equal(await page.locator('dialog[open]').count(),1);
  await page.locator('.alba-dialogue__name').scrollIntoViewIfNeeded();await page.screenshot({path:`test-results/manuel-${name}.png`});
  await page.evaluate(()=>{window.__choiceTrace=[];for(const type of ['pointerdown','pointerup','click'])document.addEventListener(type,e=>window.__choiceTrace.push([type,e.target.className,e.pointerType]),true);});
  const box=await page.locator('.alba-dialogue').boundingBox();assert.ok(box.x>=0&&box.y>=0&&box.x+box.width<=width+1&&box.y+box.height<=height+1);
  await choose('¿Qué me aconsejas');await choose('¿Qué peces');assert.ok((await page.locator('.alba-dialogue__text').textContent()).includes('tenca'));await choose('Carpas y tencas');await choose('¿Cómo leo');assert.ok((await page.locator('.alba-dialogue__text').textContent()).includes('°C'));await choose('¿Por qué importa');await choose('Volver.');await choose('Hasta luego');await closed();
  const after=await snap();await page.waitForTimeout(180);s=await snap();assert.ok(s.time>after.time);assert.deepEqual([s.playerPosition[0],s.playerPosition[2]],[after.playerPosition[0],after.playerPosition[2]]);assert.ok(Math.abs(s.playerPosition[1]-after.playerPosition[1])<.02,"eye height may finish its existing terrain smoothing after unpausing");assert.equal(s.cameraYaw,after.cameraYaw);assert.equal(s.casts,0);
  await open();assert.ok((await page.locator('.alba-dialogue__text').textContent()).includes('Bo día'));await choose('Cuéntame algo');await choose('¿Qué miraba');await choose('Volver.');await choose('¿Y la vida');await choose('Volvamos');await choose('¿Qué señuelo');await choose('¿Y cómo');await choose('Volver.');await choose('Volver.');await choose('¿Cómo llevo');await tap('.alba-dialogue__close');await closed();
  await open();await page.keyboard.press('Escape');await closed();assert.equal(await page.locator('.alba-dialogue').count(),1);assert.equal(new Set(art).size,3,'the two residents and shared parchment use three stable artwork URLs');
  // Leaving the encounter restores normal E; shop, map, travel and a cast still work.
  await move(0,12);assert.equal(await page.locator('#zone-travel').isVisible(),false);await page.keyboard.press('e');assert.equal(await page.locator('#equipment-dialog').isVisible(),true);await tap('#equipment-dialog .close');await page.waitForFunction(()=>!window.__alba.snapshot().paused);
  await page.keyboard.press('m');assert.equal(await page.locator('#map-dialog').isVisible(),true);await tap('#map-dialog .close');await page.waitForFunction(()=>!window.__alba.snapshot().paused);
  await move(-8.35,2.5);await page.keyboard.press('t');assert.equal(await page.locator('#shop-dialog').isVisible(),true);await tap('#shop-dialog .close');await page.waitForFunction(()=>!window.__alba.snapshot().paused);
  await move(0,29);await tap('#zone-travel');await page.waitForFunction(()=>window.__alba.snapshot().zone==='lago-sereno');await move(0,7);await tap('#mode-toggle');await page.waitForFunction(()=>window.__alba.snapshot().equipmentProgress===1);
  if(mobile)await tap('#action');else await page.keyboard.press('Space');await page.waitForFunction(()=>window.__alba.snapshot().casts===1);
  assert.equal(await page.evaluate(()=>JSON.stringify({...localStorage})),saved,'no dialogue, travel or cast save mutations');assert.deepEqual(errors,[]);
  report.push({name,result:'PASS',branches:'representative branches through UI; all graph edges in unit tests',pause:true,artworkRequests:art.length,errors});await page.close();console.log(`${name}: PASS Manuel proximity, branches, pause/input restoration, menu/travel/cast/save regression`);
 }
 await writeFile('test-results/manuel-browser.json',JSON.stringify(report,null,2));
}finally{await browser.close();}
