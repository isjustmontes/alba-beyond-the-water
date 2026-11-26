import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:process.env.ALBA_BROWSER_PATH||(process.platform==='win32'?'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe':undefined),args:['--enable-webgl','--enable-unsafe-swiftshader']});
await mkdir('test-results',{recursive:true});const report=[];
try{
 for(const [name,width,height,mobile]of [['pc',1280,800,false],['phone',390,844,true],['small-phone',320,568,true],['landscape',844,390,true],['compact-landscape',568,320,true],['tablet',1024,768,true]]){
  const only=process.argv.find(arg=>arg.startsWith('--profile='))?.split('=')[1];if(only&&only!==name)continue;
  const context=await browser.newContext({viewport:{width,height},hasTouch:mobile,isMobile:mobile,deviceScaleFactor:1}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.addInitScript(()=>localStorage.setItem('alba-audio-v1','false'));
  // Reach the existing exit without adding development shortcuts to the game.
  await page.route('**/src/main.js*',async route=>{
   const response=await route.fetch(),body=await response.text(),needle='// Expose read-only diagnostics in development, without gameplay shortcuts.';
   assert.ok(body.includes(needle));await route.fulfill({response,body:body.replace(needle,'window.__cameraPosition=(x,z)=>{clearHeld();exploration.x=x;exploration.z=z;world.yaw=0;world.pitch=0;world.setView();};\n'+needle)});
  });
  const snap=()=>page.evaluate(()=>window.__alba.snapshot()),tap=selector=>mobile?page.locator(selector).tap():page.locator(selector).click();
  await page.goto(process.env.ALBA_TEST_URL||'http://127.0.0.1:5176');await page.waitForFunction(()=>window.__alba&&document.getElementById('loading').hidden);
  if(!mobile){
   assert.equal(await page.locator('#look-stick').isVisible(),false);await page.keyboard.press('v');
   assert.equal(await page.locator('#look-stick').isVisible(),false);const start=await snap();
   await page.keyboard.down('s');await page.waitForTimeout(250);await page.keyboard.up('s');assert.ok((await snap()).playerPosition[2]>start.playerPosition[2]+.1);
   await page.mouse.move(600,350);await page.mouse.down({button:'right'});await page.mouse.move(630,350);await page.mouse.up({button:'right'});assert.ok(Math.abs((await snap()).cameraYaw-start.cameraYaw)>.01);
  }else{
   const cdp=await context.newCDPSession(page),points=new Map();
   async function touch(type,id,x,y){
    const ended=points.get(id);
    if(type==='touchStart'||type==='touchMove')points.set(id,{id,x,y,radiusX:5,radiusY:5,force:1});else points.delete(id);
    // CDP ends the listed contact; omitting it in touchMove does not release it.
    await cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[ended]:[...points.values()]});
   }
   const pad=async selector=>{const r=await page.locator(selector).boundingBox();assert.ok(r,selector);return {x:r.x+r.width/2,y:r.y+r.height/2};};
   const angle=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
   const distance=(a,b)=>Math.hypot(a.playerPosition[0]-b.playerPosition[0],a.playerPosition[2]-b.playerPosition[2]);
   async function layout(){
    const stick=await page.locator('#look-stick').boundingBox();assert.ok(stick&&stick.x>=0&&stick.y>=0&&stick.x+stick.width<=width+1&&stick.y+stick.height<=height+1,`${name}: right stick fits ${JSON.stringify(stick)} ${await page.evaluate(()=>JSON.stringify({innerWidth,innerHeight,view:visualViewport.width,mode:document.documentElement.className}))}`);
    const p=await pad('#look-stick');assert.equal(await page.evaluate(({x,y})=>document.elementFromPoint(x,y)?.closest('#look-stick')?.id,p),'look-stick');
    for(const selector of ['#walk-stick','#walk-run','#mode-toggle','#zone-travel','.environment-hud','#exploration-hint','.fishing-panel','#touch-controls']){
     if(!await page.locator(selector).isVisible())continue;const r=await page.locator(selector).boundingBox();
     const overlap=Math.min(stick.x+stick.width,r.x+r.width)-Math.max(stick.x,r.x)>1&&Math.min(stick.y+stick.height,r.y+r.height)-Math.max(stick.y,r.y)>1;
     assert.equal(overlap,false,`${name}: right stick overlaps ${selector}`);
    }
   }
   await layout();assert.equal(await page.locator('#walk-stick').isVisible(),false);
   await tap('#mode-toggle');await page.waitForTimeout(300);await layout();
   let left=await pad('#walk-stick'),right=await pad('#look-stick'),start=await snap();
   await touch('touchStart',11,left.x,left.y-28);await touch('touchStart',22,right.x+28,right.y-20);await page.waitForTimeout(350);
   let current=await snap();assert.ok(distance(start,current)>.1,'left finger moves');assert.ok(Math.abs(angle(current.cameraYaw,start.cameraYaw))>.03,'right finger turns');assert.ok(current.cameraPitch>start.cameraPitch+.02,'vertical look works');assert.equal(current.heldInputs,0);
   await touch('touchEnd',11);start=await snap();await page.waitForTimeout(220);current=await snap();assert.ok(distance(start,current)<.02,'left released independently');assert.ok(Math.abs(angle(current.cameraYaw,start.cameraYaw))>.02,'right keeps turning without moving finger');
   await touch('touchStart',12,left.x,left.y-28);await touch('touchEnd',22);start=await snap();await page.waitForTimeout(220);current=await snap();assert.ok(distance(start,current)>.1,'left stays active when right ends');assert.ok(Math.abs(angle(current.cameraYaw,start.cameraYaw))<1e-7,'right release stops immediately');await touch('touchEnd',12);
   right=await pad('#look-stick');start=await snap();await touch('touchStart',23,right.x+2,right.y+1);await page.waitForTimeout(180);assert.ok(Math.abs(angle((await snap()).cameraYaw,start.cameraYaw))<1e-7,'dead zone');await touch('touchEnd',23);
   // Open map with a third independent touch while both controls are held.
   await touch('touchStart',13,left.x,left.y-28);await touch('touchStart',24,right.x+28,right.y);const map=await pad('#map-toggle');
   await touch('touchStart',33,map.x,map.y);await touch('touchEnd',33);await page.waitForFunction(()=>document.getElementById('map-dialog').open);
   start=await snap();await page.waitForTimeout(150);current=await snap();assert.equal(current.paused,true);assert.deepEqual(current.playerPosition,start.playerPosition);assert.equal(current.cameraYaw,start.cameraYaw);assert.deepEqual(current.walkStick,{x:0,y:0});
   await touch('touchEnd',13);await touch('touchEnd',24);await tap('#map-dialog .close');start=await snap();await page.waitForTimeout(150);assert.equal((await snap()).cameraYaw,start.cameraYaw,'no residual turn after map');
   await page.evaluate(()=>window.__cameraPosition(6,72));await page.waitForFunction(()=>!document.getElementById('zone-travel').hidden);await layout();
   await page.screenshot({path:`test-results/camera-stick-${name}-lake.png`});await tap('#zone-travel');await page.waitForFunction(()=>window.__alba.snapshot().zone==='anglers-village');await layout();
   await page.screenshot({path:`test-results/camera-stick-${name}-village.png`});
   await page.evaluate(()=>window.__cameraPosition(-8.35,2.5));await page.waitForFunction(()=>document.getElementById('zone-travel').textContent.includes('ARTES DE PESCA'));await tap('#zone-travel');
   assert.equal((await snap()).paused,true);await tap('#shop-dialog .close');
   await page.evaluate(()=>window.__cameraPosition(0,29));await page.waitForFunction(()=>document.getElementById('zone-travel').textContent.includes('Lago Sereno'));await tap('#zone-travel');await page.waitForFunction(()=>window.__alba.snapshot().zone==='lago-sereno');
   await page.evaluate(()=>window.__cameraPosition(0,7));await tap('#mode-toggle');await page.waitForFunction(()=>window.__alba.snapshot().equipmentProgress>=.999);await layout();
   right=await pad('#look-stick');const action=await pad('#action'),casts=(await snap()).casts;
   await touch('touchStart',25,right.x+28,right.y);await touch('touchStart',14,action.x,action.y);await page.waitForTimeout(200);await touch('touchEnd',14);
   assert.equal((await snap()).casts,casts+1,'fish action and camera do not duplicate casting');start=await snap();await page.waitForTimeout(150);assert.ok(Math.abs(angle((await snap()).cameraYaw,start.cameraYaw))>.015,'camera continues when cast finger releases');await touch('touchEnd',25);
   assert.equal((await snap()).heldInputs,0);
  }
  assert.deepEqual(errors,[]);report.push({name,width,height,result:'PASS',errors});console.log(`${name}: PASS`);await context.close();
 }
 await writeFile('test-results/camera-stick-report.json',JSON.stringify(report,null,2));
}finally{await browser.close();}
