import {openContextualShop} from './context-shop.mjs';
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:process.env.ALBA_BROWSER_PATH||(process.platform==='win32'?'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe':undefined),args:['--enable-webgl','--enable-unsafe-swiftshader']});
const report=[];await mkdir('test-results',{recursive:true});
try{
 for(const [name,width,height,mobile]of [['pc',1280,800,false],['phone',390,844,true],['landscape',844,390,true],['tablet',1024,768,true]]){
  const page=await browser.newPage({viewport:{width,height},hasTouch:mobile,isMobile:mobile,deviceScaleFactor:1}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});await page.addInitScript(()=>localStorage.setItem('alba-audio-v1','false'));
  await page.route('**/src/main.js*',async route=>{const response=await route.fetch(),body=await response.text(),marker='// Expose read-only diagnostics in development, without gameplay shortcuts.';assert.ok(body.includes(marker));await route.fulfill({response,body:body.replace(marker,`window.__residentWorld=world;window.__residentMove=(x,z)=>{clearHeld();exploration.x=x;exploration.z=z;world.camera.position.set(x,exploration.floor+WALK.eye,z);world.yaw=Math.atan2(x+9.85,z-1.15);world.pitch=-.08;world.setView();};\n`+marker)});});
  const tap=s=>mobile?page.locator(s).tap():page.locator(s).click();
  const move=async(x,z)=>{await page.evaluate(([x,z])=>window.__residentMove(x,z),[x,z]);await page.waitForTimeout(160);};
  const snap=()=>page.evaluate(()=>window.__alba.snapshot());
  const choose=async(label)=>{const button=page.locator('.alba-dialogue__choice').filter({hasText:label});await button.scrollIntoViewIfNeeded();await (mobile?button.tap():button.click());};
  const close=async()=>{await tap('.alba-dialogue__close');await page.waitForFunction(()=>!window.__alba.snapshot().paused);};
  const open=async(expected='Xosé')=>{if(mobile)await tap('#zone-travel');else await page.keyboard.press('e');await page.waitForFunction(()=>document.querySelector('.alba-dialogue').open);assert.equal(await page.locator('.alba-dialogue__name').textContent(),expected);assert.ok((await page.locator('.alba-dialogue__text').textContent()).includes('Bo día'));assert.equal(await page.locator('dialog[open]').count(),1);assert.equal(await page.locator('#equipment-dialog').isVisible(),false);};
  await page.goto(process.env.ALBA_TEST_URL||'http://127.0.0.1:5177');await page.waitForFunction(()=>window.__alba&&document.getElementById('loading').hidden);
  await tap('#mode-toggle');await move(6,72);await page.waitForFunction(()=>!document.getElementById('zone-travel').hidden);await tap('#zone-travel');await page.waitForFunction(()=>window.__alba.snapshot().zone==='anglers-village');
  await page.waitForFunction(()=>window.__residentWorld.village.shopkeeperSign.group.getObjectByName('shopkeeper-sign-portrait-1').material.map.image?.complete);
  const art=await page.evaluate(()=>{const a=window.__residentWorld.village.shopkeeperSign.group.getObjectByName('shopkeeper-sign-portrait-1').material.map.image,c=document.createElement('canvas');c.width=a.naturalWidth;c.height=a.naturalHeight;const ctx=c.getContext('2d');ctx.drawImage(a,0,0);return {width:a.naturalWidth,height:a.naturalHeight,alpha:ctx.getImageData(0,0,1,1).data[3]};});assert.deepEqual(art,{width:1086,height:1448,alpha:0});
  await move(-5,6);await page.screenshot({path:`test-results/shopkeeper-${name}-sign.png`});
  const saved=await page.evaluate(()=>JSON.stringify({...localStorage}));await move(-8.35,2.5);
  assert.ok((await page.locator('#zone-travel').textContent()).includes('Xosé'));assert.equal(await page.locator('#zone-travel').getAttribute('aria-keyshortcuts'),'E');
  if(!mobile){await page.keyboard.down('Shift');await page.keyboard.down('w');await open();await page.keyboard.up('w');await page.keyboard.up('Shift');}
  else{
   const left=await page.locator('#walk-stick').boundingBox(),right=await page.locator('#look-stick').boundingBox(),button=await page.locator('#zone-travel').boundingBox(),cdp=await page.context().newCDPSession(page);
   const held=[{id:1,x:left.x+left.width/2+5,y:left.y+left.height/2},{id:2,x:right.x+right.width/2+20,y:right.y+right.height/2}],opener={id:3,x:button.x+button.width/2,y:button.y+button.height/2};
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:held});await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[...held,opener]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[opener]});await page.waitForFunction(()=>document.querySelector('.alba-dialogue').open);for(const point of held)await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[point]});await cdp.detach();assert.equal(await page.locator('.alba-dialogue__name').textContent(),'Xosé');assert.ok((await page.locator('.alba-dialogue__text').textContent()).includes('Bo día'));
  }
  const frozen=await snap();assert.equal(frozen.paused,true);assert.equal(frozen.walkingKeys,0);assert.deepEqual(frozen.walkStick,{x:0,y:0});await page.waitForTimeout(100);assert.equal((await snap()).time,frozen.time);
  assert.equal(await page.locator('.alba-dialogue').count(),1);await page.screenshot({path:`test-results/shopkeeper-${name}-dialogue.png`});
  await choose('Quería preguntarte');await choose('Háblame de la caña');assert.ok((await page.locator('.alba-dialogue__text').textContent()).includes('ALBA Creek'));await choose('¿Y el sedal');await choose('Volver.');await choose('Volver.');await choose('¿Qué señuelo');await choose('¿Cómo los trabajo');await choose('¿Y si cambia');await choose('Volver.');await choose('Volver.');
  assert.equal(await page.evaluate(()=>JSON.stringify({...localStorage})),saved,'conversation cannot alter saved progress');
  await choose('Enséñame lo que tienes');await page.waitForFunction(()=>document.getElementById('shop-dialog').open&&window.__alba.snapshot().paused&&!document.querySelector('.alba-dialogue').open);assert.equal(await page.locator('dialog[open]').count(),1);assert.equal(await page.locator('.shop-item').count(),4);assert.equal((await snap()).time,frozen.time,'handoff never advances simulation');
  const progress=await page.evaluate(()=>JSON.parse(localStorage.getItem('alba-village-progress-v1')));const buy=page.locator('[data-buy="spinner"]');await buy.scrollIntoViewIfNeeded();const b=await buy.boundingBox();
  if(mobile){await page.touchscreen.tap(b.x+b.width/2,b.y+b.height/2);await page.touchscreen.tap(b.x+b.width/2,b.y+b.height/2);}else await page.mouse.dblclick(b.x+b.width/2,b.y+b.height/2,{delay:30});
  const bought=await page.evaluate(()=>JSON.parse(localStorage.getItem('alba-village-progress-v1')));assert.equal(bought.balance,progress.balance-20);assert.equal(bought.items.spinner,progress.items.spinner+1);assert.equal(bought.receipts.length,progress.receipts.length+1);
  await tap('#shop-dialog .close');await page.waitForFunction(()=>!window.__alba.snapshot().paused);
  await openContextualShop(page,mobile);await tap('#shop-dialog .close');await page.waitForFunction(()=>!window.__alba.snapshot().paused);
  await open();await choose('Cuéntame algo');await choose('¿Qué te gusta');await choose('Volver.');await choose('Volver.');await choose('Hasta luego.');await page.waitForFunction(()=>!window.__alba.snapshot().paused);
  await open();await page.keyboard.press('Escape');await page.waitForFunction(()=>!window.__alba.snapshot().paused);
  await move(5,9);await open('Manuel');await choose('Cuéntame algo de Lago');assert.ok((await page.locator('.alba-dialogue__text').textContent()).includes('Mi padre'));await close();assert.equal(await page.locator('.alba-dialogue').count(),1);
  const current=await snap();await page.waitForTimeout(120);assert.ok((await snap()).time>current.time);assert.equal((await snap()).casts,0);assert.equal((await snap()).walkingKeys,0);
  assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('alba-village-progress-v1'))),bought);assert.equal(await page.evaluate(()=>localStorage.getItem('alba-audio-v1')),'false');assert.deepEqual(errors,[]);
  report.push({name,result:'PASS',art,dialogueToShop:'single paused modal',purchase:'one debit/receipt',manuel:'unchanged'});await page.close();console.log(`${name}: PASS shared dialogue/sign, E/mobile, paused catalog handoff, single purchase and Manuel regression`);
 }
 await writeFile('test-results/shopkeeper-browser.json',JSON.stringify(report,null,2));
}finally{await browser.close();}
