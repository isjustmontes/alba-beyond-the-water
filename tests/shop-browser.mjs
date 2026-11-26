import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:process.env.ALBA_BROWSER_PATH||(process.platform==='win32'?'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe':undefined),args:['--enable-webgl','--enable-unsafe-swiftshader']});
await mkdir('test-results',{recursive:true});const report=[];
try{
 for(const [name,width,height,mobile]of [['pc',1280,800,false],['phone',390,844,true],['landscape',844,390,true]]){
  const only=process.argv.find(arg=>arg.startsWith('--profile='))?.split('=')[1];if(only&&only!==name)continue;
  const page=await browser.newPage({viewport:{width,height},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:1}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.addInitScript(()=>{
   if(!localStorage.getItem('shop-test-seeded')){
    localStorage.setItem('shop-test-seeded','1');localStorage.setItem('alba-audio-v1','false');localStorage.setItem('alba-equipment-v1','worm');
    localStorage.setItem('alba-catches-v1',JSON.stringify([{name:'Carpa',weight:1.5,length:28,date:'2026-11-26T07:00:00.000Z',lureId:'worm'}]));
    localStorage.setItem('alba-village-progress-v1',JSON.stringify({version:1,balance:100,items:{spinner:1,worm:1,minnow:1,line:1},receipts:[]}));
   }
  });
  // Position-only fixture in served response; movement already covered in B.
  await page.route('**/src/main.js*',async route=>{
   const response=await route.fetch(),body=await response.text(),needle='// Expose read-only diagnostics in development, without gameplay shortcuts.';
   assert.ok(body.includes(needle));await route.fulfill({response,body:body.replace(needle,'window.__shopPosition=(x,z)=>{clearHeld();exploration.x=x;exploration.z=z;};\n'+needle)});
  });
  const ready=async()=>{await page.goto(process.env.ALBA_TEST_URL||'http://127.0.0.1:5174');await page.waitForFunction(()=>window.__alba&&document.getElementById('loading').hidden);};
  const tap=selector=>mobile?page.locator(selector).tap():page.locator(selector).click();
  const snap=()=>page.evaluate(()=>window.__alba.snapshot());
  const move=async(x,z)=>{await page.evaluate(([x,z])=>window.__shopPosition(x,z),[x,z]);await page.waitForTimeout(100);};
  const interact=async()=>{if(mobile)await tap('#zone-travel');else await page.keyboard.press('t');};
  const arrive=async()=>{
   await tap('#mode-toggle');await move(6,72);await page.waitForFunction(()=>!document.getElementById('zone-travel').hidden);await interact();
   await page.waitForFunction(()=>window.__alba.snapshot().zone==='anglers-village');
   assert.equal(await page.locator('#location-name').textContent(),'ALDEA');assert.equal(await page.locator('#mobile-zone-name').textContent(),'ALDEA');
   if(mobile)assert.ok(await page.locator('#mobile-zone-name').isVisible());
  };
  const openShop=async()=>{
   await move(-8.35,2.5);await page.waitForFunction(()=>document.getElementById('zone-travel').textContent.includes('ARTES DE PESCA'));
   await interact();await page.waitForFunction(()=>document.getElementById('shop-dialog').open);assert.equal((await snap()).walkingKeys,0);
  };
  await ready();const original=await page.evaluate(()=>({catches:localStorage.getItem('alba-catches-v1'),audio:localStorage.getItem('alba-audio-v1')}));
  assert.equal((await snap()).lureId,'worm','old commerce save keeps the legacy equipped lure');
  assert.equal(await page.locator('#location-name').textContent(),'LAGO SERENO');await arrive();
  await move(0,10);assert.equal(await page.locator('#zone-travel').isVisible(),false);
  if(!mobile){await page.keyboard.press('t');assert.equal(await page.locator('#shop-dialog').isVisible(),false);}
  await openShop();assert.equal(await page.locator('#shop-balance').textContent(),'100 créditos');assert.equal(await page.locator('.shop-item').count(),4);
  const buy=page.locator('[data-buy="spinner"]');await buy.scrollIntoViewIfNeeded();const b=await buy.boundingBox();
  if(mobile){await page.touchscreen.tap(b.x+b.width/2,b.y+b.height/2);await page.touchscreen.tap(b.x+b.width/2,b.y+b.height/2);}
  else await page.mouse.dblclick(b.x+b.width/2,b.y+b.height/2,{delay:30});
  assert.equal(await page.locator('#shop-balance').textContent(),'80 créditos');
  let progress=await page.evaluate(()=>JSON.parse(localStorage.getItem('alba-village-progress-v1')));assert.equal(progress.items.spinner,2);assert.equal(progress.receipts.length,1);assert.equal(progress.version,2);assert.equal(progress.equipment.lureId,'worm');
  for(const id of ['worm','minnow','line'])await tap(`[data-buy="${id}"]`);
  assert.equal(await page.locator('#shop-balance').textContent(),'5 créditos');
  for(const id of ['spinner','worm','minnow','line'])assert.ok(await page.locator(`[data-buy="${id}"]`).isDisabled());
  if(!mobile){
   await page.evaluate(()=>{window.__originalSet=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(key==='alba-village-progress-v1')throw Error('fixture quota');return window.__originalSet.call(this,key,value);};});
   await tap('[data-equip="minnow"]');assert.equal((await snap()).lureId,'worm','failed equipment write cannot change the fishing lure');
   await page.evaluate(()=>{Storage.prototype.setItem=window.__originalSet;});
  }
  await tap('[data-equip="line"]');await tap('[data-equip="minnow"]');assert.equal((await snap()).lureId,'minnow');
  progress=await page.evaluate(()=>JSON.parse(localStorage.getItem('alba-village-progress-v1')));assert.deepEqual(progress.equipment,{lureId:'minnow',lineId:'line',lineUnit:2});assert.equal(progress.balance,5);assert.equal(progress.receipts.length,4);
  await page.screenshot({path:`test-results/shop-${name}.png`});
  const geometry=await page.locator('#shop-dialog').evaluate(el=>{const r=el.getBoundingClientRect();return {onScreen:r.x>=0&&r.y>=0&&r.right<=innerWidth&&r.bottom<=innerHeight,scrolls:el.scrollHeight>el.clientHeight};});assert.ok(geometry.onScreen);
  await tap('#shop-dialog .close');await page.waitForFunction(()=>!document.getElementById('shop-dialog').open&&!window.__alba.snapshot().paused);
  if(mobile)await tap('#touch-equipment');else await page.keyboard.press('e');
  assert.ok((await page.locator('#inventory-summary').textContent()).includes('5 créditos'));assert.ok((await page.locator('#line-strength').textContent()).includes('Existencias: 2'));assert.ok((await page.locator('#line-strength').textContent()).includes('Montado: unidad 2'));
  await tap('#mount-line');await tap('[data-lure="worm"]');assert.equal((await snap()).lureId,'worm');await tap('[data-lure="minnow"]');assert.equal((await snap()).lureId,'minnow');
  await tap('#equipment-dialog .close');
  // Deliberately stale compatibility mirror must not override saved active gear.
  await page.evaluate(()=>localStorage.setItem('alba-equipment-v1','spinner'));
  await ready();progress=await page.evaluate(()=>JSON.parse(localStorage.getItem('alba-village-progress-v1')));assert.equal(progress.balance,5);assert.equal(progress.items.spinner,2);
  assert.deepEqual(progress.equipment,{lureId:'minnow',lineId:'line',lineUnit:2});
  assert.deepEqual(await page.evaluate(()=>({catches:localStorage.getItem('alba-catches-v1'),audio:localStorage.getItem('alba-audio-v1')})),original);
  assert.equal((await snap()).lureId,'minnow');await arrive();await openShop();assert.equal(await page.locator('#shop-balance').textContent(),'5 créditos');
  await tap('#shop-dialog .close');await move(0,29);await page.waitForFunction(()=>!document.getElementById('zone-travel').hidden);await interact();
  await page.waitForFunction(()=>window.__alba.snapshot().zone==='lago-sereno');assert.equal(await page.locator('#location-name').textContent(),'LAGO SERENO');
  assert.equal(await page.locator('#mobile-zone-name').textContent(),'LAGO SERENO');
  await move(0,7);await tap('#mode-toggle');await page.waitForFunction(()=>window.__alba.snapshot().equipmentProgress===1);
  if(mobile){const r=await page.locator('#action').boundingBox();await page.touchscreen.tap(r.x+r.width/2,r.y+r.height/2);}else await page.keyboard.press('Space');
  await page.waitForFunction(()=>window.__alba.snapshot().casts===1);assert.equal((await snap()).lureId,'minnow');
  assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('alba-village-progress-v1'))),progress,'travel and fishing cannot consume, duplicate or reset saved purchases/equipment');
  assert.deepEqual(errors,[]);report.push({profile:name,balance:progress.balance,items:progress.items,equipment:progress.equipment,dialog:geometry,casts:(await snap()).casts});await page.close();
  console.log(`PASS ${name}: shop/gear use, mounted purchased line, old-save upgrade, duplicate suppression, reload/travel without lost gear or currency, return cast`);
 }
 await writeFile('test-results/shop-browser.json',JSON.stringify(report,null,2));
}finally{await browser.close();}
