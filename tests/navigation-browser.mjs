import {openContextualShop} from './context-shop.mjs';
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:process.env.ALBA_BROWSER_PATH||(process.platform==='win32'?'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe':undefined),args:['--enable-webgl','--enable-unsafe-swiftshader']});
await mkdir('test-results',{recursive:true});const report=[];
try{
  for(const [name,width,height,mobile]of [['pc',1280,800,false],['phone',390,844,true],['landscape',844,390,true],['tablet',1024,768,true]]){
    const context=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:1}),page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    await page.addInitScript(()=>localStorage.setItem('alba-audio-v1','false'));
    // Position-only fixture for an existing distant exit, never shipped in game code.
    await page.route('**/src/main.js*',async route=>{
      const response=await route.fetch(),body=await response.text(),needle='// Expose read-only diagnostics in development, without gameplay shortcuts.';
      assert.ok(body.includes(needle));await route.fulfill({response,body:body.replace(needle,'window.__navigationPosition=(x,z)=>{clearHeld();exploration.x=x;exploration.z=z;world.yaw=0;world.pitch=0;world.setView();};\n'+needle)});
    });
    const snap=()=>page.evaluate(()=>window.__alba.snapshot()),tap=selector=>mobile?page.locator(selector).tap():page.locator(selector).click();
    await page.goto(process.env.ALBA_TEST_URL||'http://127.0.0.1:5176');
    await page.waitForFunction(()=>window.__alba&&document.getElementById('loading').hidden);
    const saved=await page.evaluate(()=>JSON.stringify({...localStorage}));
    assert.equal((await snap()).touchMode,mobile);
    const showMap=async()=>{
      if(mobile)await tap('#map-toggle');else await page.keyboard.press('m');
      await page.waitForFunction(()=>document.getElementById('map-dialog').open);
      assert.equal((await snap()).paused,true);
      const r=await page.locator('#map-dialog').boundingBox(),close=await page.locator('#map-dialog .close').boundingBox();
      assert.ok(r.x>=0&&r.y>=0&&r.x+r.width<=width+1&&r.y+r.height<=height+1,`${name}: map stays in viewport`);
      assert.ok(close.y>=0&&close.y+close.height<=height,'close remains reachable');
      const frozen=await snap();await page.waitForTimeout(100);const still=await snap();
      assert.equal(still.time,frozen.time);assert.deepEqual(still.playerPosition,frozen.playerPosition);
      assert.equal(still.heldInputs,0);assert.equal(still.walkingKeys,0);
    };
    const closeMap=async()=>{if(mobile)await tap('#map-dialog .close');else await page.keyboard.press('m');await page.waitForFunction(()=>!document.getElementById('map-dialog').open);assert.equal((await snap()).paused,false);};
    await showMap();assert.equal(await page.locator('#map-title').textContent(),'Lago Sereno');assert.equal(await page.locator('#map-legend li').count(),4);
    await page.screenshot({path:`test-results/navigation-${name}-lake.png`});await closeMap();
    if(!mobile){
      await page.keyboard.press('Space',{delay:160});assert.equal((await snap()).casts,1,'Space still casts while fishing');await page.keyboard.press('r');
    }
    await tap('#mode-toggle');await page.waitForTimeout(450);assert.equal((await snap()).playerMode,'exploring');
    if(!mobile){
      const ground=(await snap()).playerPosition[1],casts=(await snap()).casts;
      await page.keyboard.down('Space');await page.waitForTimeout(180);
      assert.ok((await snap()).playerPosition[1]>ground+.08,'camera follows jump');
      await showMap();await page.keyboard.down('Space');assert.equal((await snap()).casts,casts);await closeMap();await page.keyboard.up('Space');
      await page.waitForTimeout(1100);assert.ok(Math.abs((await snap()).playerPosition[1]-ground)<.08,'jump lands without automatic bouncing');await page.keyboard.up('Space');
      await page.keyboard.down('s');await page.waitForTimeout(140);await showMap();await closeMap();await page.keyboard.up('s');
      assert.equal((await snap()).walkingKeys,0);
      await page.keyboard.press('n');assert.equal(await page.locator('#sound-status').textContent(),'ON');await page.keyboard.press('n');assert.equal(await page.locator('#sound-status').textContent(),'OFF');
    }else{
      const cdp=await context.newCDPSession(page),b=await page.locator('#walk-stick').boundingBox(),start=await snap();
      await tap('#walk-run');assert.equal(await page.locator('#walk-run').getAttribute('aria-pressed'),'true');
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:b.x+b.width/2,y:b.y+b.height/2+32,radiusX:5,radiusY:5,force:1}]});
      await page.waitForTimeout(230);await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
      assert.ok((await snap()).playerPosition[2]>start.playerPosition[2]+.12,'touch movement still works');
      assert.equal(await page.locator('#walk-run').getAttribute('aria-pressed'),'false');
    }
    await page.evaluate(()=>window.__navigationPosition(6,72));
    await page.waitForFunction(()=>!document.getElementById('zone-travel').hidden);
    if(mobile)await tap('#zone-travel');else await page.keyboard.press('t');
    await page.waitForFunction(()=>window.__alba.snapshot().zone==='anglers-village');
    await showMap();assert.equal(await page.locator('#map-title').textContent(),'Aldea de Lago Sereno');assert.equal(await page.locator('#map-legend li').count(),3);
    await page.screenshot({path:`test-results/navigation-${name}-village.png`});await closeMap();
    await page.evaluate(()=>window.__navigationPosition(-8.35,2.5));await page.waitForFunction(()=>document.getElementById('zone-travel').getAttribute('aria-keyshortcuts')==='E');
    await openContextualShop(page,mobile);
    if(!mobile){await page.keyboard.press('m');assert.equal(await page.locator('#map-dialog').evaluate(el=>el.open),false,'map does not replace shop');}
    await tap('#shop-dialog .close');
    await page.evaluate(()=>window.__navigationPosition(0,29));await page.waitForFunction(()=>document.getElementById('zone-travel').textContent.includes('Lago Sereno'));
    if(mobile)await tap('#zone-travel');else await page.keyboard.press('t');await page.waitForFunction(()=>window.__alba.snapshot().zone==='lago-sereno');
    assert.equal(await page.evaluate(()=>JSON.stringify({...localStorage})),saved,'map/movement do not change saved progress or mute preference');
    assert.deepEqual(errors,[]);report.push({name,width,height,result:'PASS',errors});await context.close();
  }
  await writeFile('test-results/navigation-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{await browser.close();}
