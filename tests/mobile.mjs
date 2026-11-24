import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {access,mkdir} from 'node:fs/promises';
let executablePath=process.env.ALBA_BROWSER_PATH;
if(!executablePath&&process.platform==='win32'){
  const edge='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';try{await access(edge);executablePath=edge;}catch{/* Chromium. */}
}
const browser=await chromium.launch({headless:true,executablePath,args:['--enable-webgl','--enable-unsafe-swiftshader']});
await mkdir('test-results',{recursive:true});
const errors=[];
async function profile({name,viewport,fullGame}) {
  const context=await browser.newContext({viewport,hasTouch:true,isMobile:true,deviceScaleFactor:1});
  const page=await context.newPage();
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  const cdp=await context.newCDPSession(page),points=new Map();
  async function touch(type,id,x,y){
    if(type==='touchStart'||type==='touchMove')points.set(id,{id,x,y,radiusX:6,radiusY:6,force:1});
    if(type==='touchEnd')points.delete(id);if(type==='touchCancel')points.clear();
    // CDP touchEnd ends the whole sequence. A move with one point removed
    // releases just that finger while preserving the remaining contacts.
    const eventType=type==='touchEnd'&&points.size ? 'touchMove' : type;
    await cdp.send('Input.dispatchTouchEvent',{type:eventType,touchPoints:[...points.values()]});
  }
  const snap=()=>page.evaluate(()=>window.__alba.snapshot());
  const center=async selector=>{const b=await page.locator(selector).boundingBox();assert.ok(b,selector+' is visible');return {x:b.x+b.width/2,y:b.y+b.height/2};};
  const tap=async selector=>{await page.locator(selector).scrollIntoViewIfNeeded();const p=await center(selector);await page.touchscreen.tap(p.x,p.y);};
  try{
    await page.goto(process.env.ALBA_TEST_URL||'http://127.0.0.1:5173');
    await page.waitForFunction(()=>window.__alba&&document.getElementById('loading').hidden,null,{timeout:60000});
    assert.equal((await snap()).touchMode,true);assert.equal(await page.locator('#touch-controls').isVisible(),true);
    await page.screenshot({path:`test-results/${name}-ready.png`});
    // Touching a menu must not move the camera or cast.
    const initial=await snap();await tap('#touch-equipment');
    assert.equal(await page.locator('#equipment-dialog').isVisible(),true);assert.equal((await snap()).cameraYaw,initial.cameraYaw);
    await tap('#equipment-quality');assert.equal((await snap()).quality,'low');
    await tap('[data-lure="worm"]');assert.equal((await snap()).lureId,'worm');
    // The panel scrolls normally; holding a fishing control captures gestures only there.
    await tap('[data-lure="spinner"]');await tap('#equipment-dialog .close');
    // A canceled hold never launches, even with lostpointercapture afterward.
    let action=await center('#action');await touch('touchStart',1,action.x,action.y);await page.waitForTimeout(150);
    assert.equal((await snap()).state,'charging');await touch('touchCancel');assert.equal((await snap()).state,'ready');assert.equal((await snap()).casts,0);
    // Simultaneously charge and look around using a second finger.
    await touch('touchStart',1,action.x,action.y);await touch('touchStart',2,viewport.width*.47,viewport.height*.45);
    await touch('touchMove',2,viewport.width*.47+30,viewport.height*.45-12);await touch('touchEnd',2);
    assert.equal((await snap()).state,'charging');assert.notEqual((await snap()).cameraYaw,initial.cameraYaw);
    await page.waitForTimeout(300);await touch('touchEnd',1);
    assert.equal((await snap()).casts,1,'one gesture produces one launch');
    await page.waitForFunction(()=>window.__alba.snapshot().state==='waiting',null,{timeout:15000});
    if(fullGame){
      await page.waitForFunction(()=>window.__alba.snapshot().state==='bite',null,{timeout:90000,polling:50});
      assert.ok((await page.locator('#action-text').textContent()).includes('CLAVAR'));
      action=await center('#action');await touch('touchStart',1,action.x,action.y);await touch('touchEnd',1);
      assert.equal((await snap()).hooks,1,'touch hook executes once');
      await page.waitForFunction(()=>window.__alba.snapshot().rodBend>.02);
      await page.screenshot({path:`test-results/${name}-fight.png`});
      let held=false;const started=Date.now();
      while(Date.now()-started<120000){
        const s=await snap();if(s.state==='caught')break;assert.equal(s.state,'fighting');
        if(s.tension>.65&&held){await touch('touchEnd',1);held=false;}
        if(s.tension<.28&&!held){action=await center('#action');await touch('touchStart',1,action.x,action.y);held=true;}
        await page.waitForTimeout(70);
      }
      if(held)await touch('touchEnd',1);
      assert.equal((await snap()).catchCount,1);await page.waitForTimeout(500);await page.screenshot({path:`test-results/${name}-catch.png`});
      await tap('#touch-journal');assert.equal(await page.locator('.log-entry').count(),1);assert.equal(await page.locator('.record-card').count(),1);
      await page.screenshot({path:`test-results/${name}-journal.png`});await tap('#log-dialog .close');
    }
    // Rotation/resize works, and touch menus remain reachable.
    await page.setViewportSize({width:844,height:390});await page.waitForTimeout(350);
    assert.equal((await snap()).touchMode,true);assert.equal((await snap()).heldInputs,0);
    await tap('#touch-equipment');await page.screenshot({path:`test-results/${name}-equipment-landscape.png`});
    await tap('#equipment-dialog .close');
    const panel=await page.locator('.fishing-panel').boundingBox();assert.ok(panel.x>=0&&panel.x+panel.width<=844);assert.ok(panel.y+panel.height<390);
    await page.screenshot({path:`test-results/${name}-landscape.png`});
    // Hybrid: mouse selects desktop mode, real touch restores touch mode.
    await page.locator('#equipment-toggle').click();assert.equal((await snap()).touchMode,false);assert.equal(await page.locator('#touch-controls').isVisible(),false);
    await page.locator('#equipment-dialog .close').click();
    await page.touchscreen.tap(400,170);assert.equal((await snap()).touchMode,true);
    assert.equal((await snap()).casts,1,'camera/menu touches do not launch');
    console.log(`PASS ${name}: touch camera, multi-touch charge, cancel, menus, equipment, orientation, hybrid switching${fullGame?', hook, fight and catch':''}`);
  }finally{await context.close();}
}
try{
  await profile({name:'phone',viewport:{width:390,height:844},fullGame:true});
  await profile({name:'tablet',viewport:{width:1024,height:768},fullGame:false});
  assert.deepEqual(errors,[],'no JavaScript or shader errors');
}finally{await browser.close();}
