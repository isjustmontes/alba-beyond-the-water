import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:process.env.ALBA_BROWSER_PATH||(process.platform==='win32'?'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe':undefined),args:['--enable-webgl','--enable-unsafe-swiftshader']});
const errors=[],report=[];await mkdir('test-results',{recursive:true});
try{
  for(const [name,width,height,mobile]of [['desktop',1280,800,false],['phone',390,844,true],['landscape',844,390,true],['tablet',1024,768,true]]){
    const context=await browser.newContext({viewport:{width,height},hasTouch:mobile,isMobile:mobile,deviceScaleFactor:1});
    const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    const snap=()=>page.evaluate(()=>window.__alba.snapshot());
    const tap=selector=>mobile?page.locator(selector).tap():page.locator(selector).click();
    const cdp=await context.newCDPSession(page),points=new Map();
    async function touch(type,id,x,y){
      if(type==='touchStart'||type==='touchMove')points.set(id,{id,x,y,radiusX:5,radiusY:5,force:1});
      else if(type==='touchCancel')points.clear();else points.delete(id);
      await cdp.send('Input.dispatchTouchEvent',{type,touchPoints:[...points.values()]});
    }
    await page.goto(process.env.ALBA_TEST_URL||'http://127.0.0.1:5174');
    await page.waitForFunction(()=>window.__alba&&document.getElementById('loading').hidden);
    assert.equal((await snap()).playerMode,'fishing');assert.equal((await snap()).touchMode,mobile);
    assert.equal(await page.locator('#walk-stick').isVisible(),false);
    if(mobile)await tap('#mode-toggle');else await page.keyboard.press('v');
    await page.waitForTimeout(350);assert.equal((await snap()).playerMode,'exploring');
    assert.equal(await page.locator('.fishing-panel').isVisible(),false);
    assert.equal(await page.locator('#walk-stick').isVisible(),mobile);
    let start=await snap();assert.ok(start.playerPosition[1]>2.4&&start.playerPosition[1]<2.6);
    if(mobile){
      const box=await page.locator('#walk-stick').boundingBox(),x=box.x+box.width/2,y=box.y+box.height/2;
      assert.equal(await page.evaluate(({x,y})=>document.elementFromPoint(x,y)?.closest('#walk-stick')?.id,{x,y}),'walk-stick');
      await touch('touchStart',1,x,y-32);await page.waitForTimeout(500);await touch('touchCancel');
      let moved=await snap();assert.ok(moved.playerPosition[2]<start.playerPosition[2]-.2);assert.deepEqual(moved.walkStick,{x:0,y:0});
      const stopped=moved.playerPosition[2];await page.waitForTimeout(250);assert.ok(Math.abs((await snap()).playerPosition[2]-stopped)<.02);
      await tap('#mode-toggle');assert.equal((await snap()).playerMode,'exploring','cannot fish away from the original post');
      // Return using the same actual touch joystick, with slow feedback near the post.
      for(let i=0;i<16&&Math.abs((await snap()).playerPosition[2]-7)>.14;i++){
        const z=(await snap()).playerPosition[2],direction=z<7?1:-1;
        await touch('touchStart',1,x,y+direction*18);await page.waitForTimeout(100);await touch('touchCancel');
      }
      // Look gestures may run independently of the joystick and never cast.
      await touch('touchStart',2,width*.55,height*.45);await touch('touchMove',2,width*.55+30,height*.45-10);await touch('touchEnd',2);
      assert.notEqual((await snap()).cameraYaw,start.cameraYaw);
      await touch('touchStart',2,width*.55+30,height*.45-10);await touch('touchMove',2,width*.55,height*.45);await touch('touchEnd',2);
      await page.screenshot({path:`test-results/first-steps-${name}-explore.png`});
      // Resize/orientation changes must clear held movement.
      await touch('touchStart',1,x,y-20);await page.setViewportSize({width:width+1,height});await touch('touchCancel');
      assert.deepEqual((await snap()).walkStick,{x:0,y:0});
    }else{
      await page.keyboard.down('w');await page.waitForTimeout(500);await page.keyboard.up('w');await page.waitForTimeout(400);
      assert.ok((await snap()).playerPosition[2]<start.playerPosition[2]-.4);
      await page.keyboard.press('v');assert.equal((await snap()).playerMode,'exploring');
      await page.keyboard.down('s');await page.waitForTimeout(500);await page.keyboard.up('s');await page.waitForTimeout(400);
      // Exploration supports mouse drag even when Pointer Lock is unavailable.
      await page.mouse.move(600,350);await page.mouse.down({button:'right'});await page.mouse.move(630,340);await page.mouse.move(600,350);await page.mouse.up({button:'right'});
      assert.ok(Math.abs((await snap()).cameraYaw-start.cameraYaw)<.01);
      await page.mouse.click(600,350);
      await page.waitForFunction(()=>document.pointerLockElement===document.getElementById('scene'));
      const beforeLock=await snap();await page.mouse.move(625,340);
      assert.ok(Math.abs((await snap()).cameraYaw-beforeLock.cameraYaw)>.01,'captured mouse looks around');
      await page.mouse.move(600,350);await page.keyboard.press('Escape');
      await page.waitForFunction(()=>!document.pointerLockElement);
      assert.equal((await snap()).walkingKeys,0);
      await page.screenshot({path:`test-results/first-steps-${name}-explore.png`});
    }
    assert.equal((await snap()).casts,0,'exploration touches and keys never cast');
    await tap('#mode-toggle');assert.equal((await snap()).playerMode,'fishing');
    await page.waitForTimeout(400);assert.equal(await page.locator('.fishing-panel').isVisible(),true);assert.equal(await page.locator('#walk-stick').isVisible(),false);
    assert.ok(Math.abs((await snap()).playerPosition[1]-3)<.03);
    // Same fishing inputs after switching modes; mode change blocked with tackle out.
    if(mobile){const b=await page.locator('#action').boundingBox();await touch('touchStart',3,b.x+b.width/2,b.y+b.height/2);await page.waitForTimeout(250);await touch('touchEnd',3);}
    else{await page.keyboard.down('Space');await page.waitForTimeout(250);await page.keyboard.up('Space');}
    await page.waitForFunction(()=>window.__alba.snapshot().state==='waiting');
    assert.equal((await snap()).casts,1);await tap('#mode-toggle');assert.equal((await snap()).playerMode,'fishing');
    await page.screenshot({path:`test-results/first-steps-${name}-fishing.png`});report.push({profile:name,...await snap()});
    await context.close();
  }
  assert.deepEqual(errors,[]);await writeFile('test-results/first-steps-browser.json',JSON.stringify(report,null,2));
  console.log('PASS exploration and fishing: desktop, portrait, landscape and tablet; movement, return, camera, joystick cancel, resize, single cast and tackle guard.');
}finally{await browser.close();}
