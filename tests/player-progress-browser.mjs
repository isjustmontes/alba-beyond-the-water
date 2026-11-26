import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:process.env.ALBA_BROWSER_PATH||(process.platform==='win32'?'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe':undefined),args:['--enable-webgl','--enable-unsafe-swiftshader']});
const base=process.env.ALBA_TEST_URL||'http://127.0.0.1:5181';
const report=[];await mkdir('test-results',{recursive:true});
try{
  for(const [name,width,height,mobile,reduced]of [['reload-during',1280,800,false,false],['pc-skip',1280,800,false,false],['phone-skip',390,844,true,false],['tablet-reduced',1024,768,true,true],['natural',1280,800,false,false]]){
    const context=await browser.newContext({viewport:{width,height},hasTouch:mobile,isMobile:mobile,deviceScaleFactor:1,reducedMotion:reduced?'reduce':'no-preference'}),page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    await page.route('**/src/main.js*',async route=>{
      const response=await route.fetch(),body=await response.text(),marker='// Expose read-only diagnostics in development, without gameplay shortcuts.';
      assert.ok(body.includes(marker));await route.fulfill({response,body:body.replace(marker,'window.__progressMove=(x,z,yaw=0,pitch=-.08)=>{clearHeld();exploration.x=x;exploration.z=z;world.yaw=yaw;world.pitch=pitch;world.setView();world.camera.position.set(x,exploration.floor+WALK.eye,z);savePlayerLocation();};\n'+marker)});
    });
    const ready=()=>page.waitForFunction(()=>window.__alba&&document.getElementById('loading').hidden);
    const snapshot=()=>page.evaluate(()=>window.__alba.snapshot());
    const checkPlaza=async()=>{const s=await snapshot();assert.equal(s.zone,'anglers-village');assert.equal(s.playerMode,'exploring');assert.ok(Math.abs(s.playerPosition[0])<.001&&Math.abs(s.playerPosition[2]-11)<.001);assert.ok(Math.abs(s.cameraPitch+.055)<.001);assert.equal(s.casts,0);assert.equal(s.walkingKeys,0);};
    await page.goto(base);await ready();
    assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('alba-player-v1')).introSeen),true,'intro consumed before its first visible frame');
    const commerce=await page.evaluate(()=>localStorage.getItem('alba-village-progress-v1'));
    if(name==='reload-during'){
      assert.equal(await page.locator('html').evaluate(el=>el.classList.contains('intro-active')),true);
      await page.reload();await ready();assert.equal(await page.locator('.first-morning').count(),0);assert.equal(await page.locator('.first-morning-objective').count(),0);await checkPlaza();
    }else{
      if(!reduced&&name!=='natural'){
        if(mobile)await page.locator('.first-morning__skip').tap();else await page.keyboard.press('Space');
      }
      await page.waitForFunction(()=>!document.documentElement.classList.contains('intro-active'),{},{timeout:20000});await checkPlaza();
      assert.equal(await page.locator('.first-morning-objective').textContent(),'Explora la aldea');
      const box=await page.locator('.first-morning-objective').boundingBox();assert.ok(box.x>=0&&box.y>=0&&box.x+box.width<=width&&box.y+box.height<=height);
      await page.screenshot({path:`test-results/player-progress-${name}.png`});
      // Ordinary movement changes the saved location; visibility/reload flushes it.
      if(!mobile){await page.keyboard.down('w');await page.waitForTimeout(250);await page.keyboard.up('w');}
      else{
        const b=await page.locator('#walk-stick').boundingBox(),c=await context.newCDPSession(page);
        await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:b.x+b.width/2,y:b.y+b.height/2}]});
        await c.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{id:1,x:b.x+b.width/2,y:b.y+b.height/2-28}]});
        await page.waitForTimeout(300);await c.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await c.detach();
      }
      const moved=await snapshot();assert.ok(moved.playerPosition[2]<10.9,'control works after every exit path');
      await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange'))); // pagehide below performs the actual flush.
      await page.reload();await ready();const restored=await snapshot();
      assert.equal(await page.locator('.first-morning').count(),0);assert.equal(await page.locator('.first-morning-objective').count(),0);
      assert.ok(Math.abs(restored.playerPosition[2]-moved.playerPosition[2])<.12,'reload preserves actual position');
      if(name==='pc-skip'){
        await page.evaluate(()=>window.__progressMove(0,29,.23,-.12));await page.keyboard.press('t');
        await page.waitForFunction(()=>window.__alba.snapshot().zone==='lago-sereno');
        assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('alba-player-v1')).location.zoneId),'lago-sereno');
        await page.reload();await ready();assert.equal((await snapshot()).zone,'lago-sereno');assert.equal(await page.locator('.first-morning').count(),0);
        await page.evaluate(()=>window.__progressMove(6,74,Math.PI,0));await page.keyboard.press('t');await page.waitForFunction(()=>window.__alba.snapshot().zone==='anglers-village');
        assert.equal(await page.locator('.first-morning').count(),0);
      }
    }
    assert.equal(await page.evaluate(()=>localStorage.getItem('alba-village-progress-v1')),commerce,'intro/reload/travel cannot reset or duplicate funds/items');
    assert.deepEqual(errors,[]);report.push({name,result:'PASS',errors});await context.close();
  }
  for(const kind of ['legacy-no-location','legacy-location','corrupt-location','storage-denied']){
    const context=await browser.newContext(),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.addInitScript(kind=>{
      if(kind==='storage-denied'){Object.defineProperty(window,'localStorage',{get(){throw Error('denied');}});return;}
      // Only seed once: a reload must exercise real saved state, not reset it.
      if(sessionStorage.getItem('fixture'))return;sessionStorage.setItem('fixture','1');
      localStorage.setItem('alba-catches-v1','[]');localStorage.setItem('alba-audio-v1','false');localStorage.setItem('alba-equipment-v1','worm');
      if(kind==='legacy-location')localStorage.setItem('alba-player-v1',JSON.stringify({version:1,location:{zoneId:'anglers-village',position:{x:-5,y:2.8,z:5},yaw:.64,pitch:-.22,mode:'exploring'}}));
      if(kind==='corrupt-location')localStorage.setItem('alba-player-v1','corrupt but preserve');
    },kind);
    await page.goto(base);await page.waitForFunction(()=>window.__alba&&document.getElementById('loading').hidden);
    assert.equal(await page.locator('.first-morning').count(),0);
    const s=await page.evaluate(()=>window.__alba.snapshot());
    if(kind==='legacy-location'){assert.equal(s.zone,'anglers-village');assert.equal(s.playerPosition[0],-5);assert.equal(s.playerPosition[2],5);assert.ok(Math.abs(s.cameraYaw-.64)<.001);assert.ok(Math.abs(s.cameraPitch+.22)<.001);}
    else{assert.equal(s.zone,'lago-sereno');assert.deepEqual(s.playerPosition,[0,3,7]);}
    if(kind!=='storage-denied'){
      assert.equal(await page.evaluate(()=>localStorage.getItem('alba-catches-v1')),'[]');assert.equal(await page.evaluate(()=>localStorage.getItem('alba-equipment-v1')),'worm');
      if(kind==='corrupt-location')assert.equal(await page.evaluate(()=>localStorage.getItem('alba-player-v1')),'corrupt but preserve');
    }
    assert.deepEqual(errors,[]);report.push({name:kind,result:'PASS',errors});await context.close();
  }
  await writeFile('test-results/player-progress-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{await browser.close();}
