import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:process.env.ALBA_BROWSER_PATH||(process.platform==='win32'?'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe':undefined),args:['--enable-webgl','--enable-unsafe-swiftshader']});
const base=process.env.ALBA_TEST_URL||'http://127.0.0.1:5177';
const report=[];await mkdir('test-results',{recursive:true});
try{
  for(const [name,width,height,mobile,reduced]of [['pc',1280,800,false,false],['phone',390,844,true,false],['landscape',844,390,true,false],['tablet-reduced',1024,768,true,true]]){
    const context=await browser.newContext({viewport:{width,height},hasTouch:mobile,isMobile:mobile,deviceScaleFactor:1,reducedMotion:reduced?'reduce':'no-preference'});
    const page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    await page.addInitScript(()=>{localStorage.setItem('alba-audio-v1','false');localStorage.setItem('alba-catches-v1','[]');});
    await page.goto(`${base}/?intro=1`);await page.waitForFunction(()=>window.__alba&&document.getElementById('loading').hidden);
    const saved=await page.evaluate(()=>JSON.stringify({...localStorage}));
    const snap=()=>page.evaluate(()=>window.__alba.snapshot());
    if(!reduced){
      assert.equal(await page.locator('.first-morning__skip').isVisible(),true);
      const button=await page.locator('.first-morning__skip').boundingBox();assert.ok(button.height>=44&&button.x>=0&&button.y>=0&&button.x+button.width<=width&&button.y+button.height<=height);
      await page.keyboard.press('m');assert.equal(await page.locator('dialog[open]').count(),0);
      await page.keyboard.press('e');assert.equal(await page.locator('dialog[open]').count(),0);
      if(name==='pc'){
        await page.evaluate(()=>window.dispatchEvent(new Event('blur')));
        const frozen=(await snap()).playerPosition;await page.waitForTimeout(180);
        assert.deepEqual((await snap()).playerPosition,frozen);assert.equal(await page.locator('dialog[open]').count(),0);
        await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
      }
      await page.screenshot({path:`test-results/first-morning-${name}-start.png`});
      if(name==='pc'){
        await page.waitForTimeout(4900);await page.screenshot({path:'test-results/first-morning-pc-middle.png'});
        const before=(await snap()).playerPosition;
        await page.keyboard.down('w');await page.keyboard.down('Space');
        await page.waitForTimeout(850);assert.equal(await page.locator('html').evaluate(el=>el.classList.contains('intro-active')),true,'held key keeps input blocked');
        await page.keyboard.up('Space');await page.keyboard.up('w');
        assert.notDeepEqual((await snap()).playerPosition,before);
      }else if(name==='phone')await page.locator('.first-morning__skip').tap();
      else await page.keyboard.press('Escape');
      await page.waitForFunction(()=>!document.documentElement.classList.contains('intro-active'));
    }else assert.equal(await page.locator('html').evaluate(el=>el.classList.contains('intro-active')),false);
    const after=await snap();assert.equal(after.zone,'anglers-village');assert.equal(after.playerMode,'exploring');
    assert.ok(Math.abs(after.playerPosition[0])<.001&&Math.abs(after.playerPosition[2]-11)<.001);
    assert.ok(Math.abs(after.playerPosition[1]-2.788)<.005);assert.equal(after.casts,0);assert.equal(after.walkingKeys,0);
    assert.equal(await page.evaluate(()=>JSON.stringify({...localStorage})),saved,'presentation never writes storage');
    if(!mobile){await page.keyboard.down('w');await page.waitForTimeout(250);await page.keyboard.up('w');assert.ok((await snap()).playerPosition[2]<10.9);}
    if(mobile){
      const left=await page.locator('#walk-stick').boundingBox(),right=await page.locator('#look-stick').boundingBox();
      assert.ok(left&&right,'both mobile sticks available after handoff');
      const cdp=await context.newCDPSession(page),before=await snap();
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:left.x+left.width/2,y:left.y+left.height/2},{id:2,x:right.x+right.width/2,y:right.y+right.height/2}]});
      await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{id:1,x:left.x+left.width/2,y:left.y+left.height/2-28},{id:2,x:right.x+right.width/2+28,y:right.y+right.height/2}]});
      await page.waitForTimeout(300);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();
      const moved=await snap();assert.ok(moved.playerPosition[2]<before.playerPosition[2]);assert.ok(Math.abs(moved.cameraYaw-before.cameraYaw)>.01);
    }
    await page.screenshot({path:`test-results/first-morning-${name}-play.png`});
    assert.deepEqual(errors,[]);report.push({name,result:'PASS',errors});await context.close();
  }
  // Natural completion, changing motion preference, and unchanged ordinary startup.
  const page=await browser.newPage();await page.goto(`${base}/?intro=1`);
  await page.waitForFunction(()=>window.__alba&&document.documentElement.classList.contains('intro-active'));
  const start=Date.now();await page.waitForFunction(()=>!document.documentElement.classList.contains('intro-active'),{},{timeout:18000});
  assert.ok(Date.now()-start>=11000,'natural completion is about 12 visible seconds');
  await page.goto(`${base}/?intro=1`);await page.waitForFunction(()=>document.documentElement.classList.contains('intro-active'));
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>!document.documentElement.classList.contains('intro-active'));
  await page.goto(base);await page.waitForFunction(()=>window.__alba&&document.getElementById('loading').hidden);
  const ordinary=await page.evaluate(()=>window.__alba.snapshot());assert.equal(ordinary.zone,'lago-sereno');assert.equal(ordinary.playerMode,'fishing');assert.deepEqual(ordinary.playerPosition,[0,3,7]);assert.equal(await page.locator('.first-morning').count(),0);
  report.push({name:'natural completion / motion change / ordinary startup',result:'PASS'});
  await writeFile('test-results/first-morning-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{await browser.close();}
