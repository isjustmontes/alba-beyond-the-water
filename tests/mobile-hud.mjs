import {chromium} from '@playwright/test';
import {access,mkdir,readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
let executablePath=process.env.ALBA_BROWSER_PATH;
if(!executablePath&&process.platform==='win32'){const edge='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';try{await access(edge);executablePath=edge;}catch{/* Configured Chromium. */}}
const browser=await chromium.launch({headless:true,executablePath,args:['--enable-webgl','--enable-unsafe-swiftshader']}),errors=[],report=[];
const url=process.env.ALBA_TEST_URL||'http://127.0.0.1:5173';
await mkdir('test-results',{recursive:true});
const desktopSnapshot=()=>Object.fromEntries(['.topbar','.place-intro','.session-card','.fishing-panel','.action-copy','.meter-block','#action','#equipment-toggle','footer','.environment-hud'].map(s=>{const e=document.querySelector(s),r=e.getBoundingClientRect(),c=getComputedStyle(e);return[s,{bounds:[r.x,r.y,r.width,r.height],style:Object.fromEntries(['display','fontSize','padding','background','border','gap'].map(k=>[k,c[k]]))}];}));
try{
  for(const [name,width,height,mobile,safe]of [['pc',1440,960,false],['small-portrait',320,568,true],['portrait',390,844,true],['landscape',844,390,true],['small-landscape',568,320,true],['tablet',1024,768,true],['tablet-portrait',768,1024,true],['safe-landscape',844,390,true,{top:0,left:44,right:44,bottom:21}],['safe-portrait',390,844,true,{top:44,left:0,right:0,bottom:34}]]){
    const context=await browser.newContext({viewport:{width,height},hasTouch:mobile,isMobile:mobile,deviceScaleFactor:1});
    const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    // Presentation-only fixture: freeze the ordinary RAF to capture every HUD state
    // deterministically. Actual touch fishing is tested separately by mobile.mjs.
    await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
    await page.goto(url);await page.waitForFunction(()=>window.__alba&&document.getElementById('loading').hidden,null,{polling:100,timeout:60000});
    // Reserve representative notch/home-bar areas via the HUD variables. This is
    // a synthetic inset layout check, not physical-device or native env() validation.
    if(safe)await page.evaluate(safe=>{for(const [side,value]of Object.entries(safe))document.documentElement.style.setProperty(`--hud-safe-${side}`,`${value}px`);},safe);
    if(!mobile){
      const snapshot=await page.evaluate(desktopSnapshot);
      try{assert.deepEqual(snapshot,JSON.parse(await readFile('test-results/hud-desktop-baseline.json','utf8')),'desktop layout and computed styles must remain identical');}catch(error){if(error.code!=='ENOENT')throw error;}
      assert.equal(await page.locator('#touch-hud-info').isVisible(),false);
      await page.screenshot({path:'test-results/hud-after-pc.png'});await context.close();continue;
    }
    for(const state of ['ready','charging','casting','waiting','bite','fighting','caught']){
      await page.evaluate(state=>{
        document.documentElement.dataset.fishingState=state;
        document.getElementById('action-text').textContent=({ready:'LANZAR · MANTÉN',charging:'SUELTA PARA LANZAR',casting:'LANZANDO…',waiting:'RECOGER',bite:'¡CLAVAR!',fighting:'RECOGER · MANTÉN',caught:'¡CAPTURA!'})[state];
        document.getElementById('action-title').textContent=state==='bite'?'¡Ahora, clava!':'El lago te espera.';
        document.getElementById('meter-label').textContent=state==='fighting'?'TENSIÓN DEL SEDAL':'FUERZA DE LANZAMIENTO';
        document.getElementById('meter-value').textContent='62%';document.getElementById('meter-fill').style.width='62%';
        document.getElementById('safe-zone').hidden=state!=='fighting';document.getElementById('fight-stats').hidden=state!=='fighting';
        document.getElementById('distance').textContent='24,5 m';document.getElementById('stamina').textContent='76%';
        document.getElementById('bite-alert').hidden=state!=='bite';document.getElementById('catch-banner').hidden=state!=='caught';
        document.getElementById('catch-name').textContent='Trucha arcoíris';document.getElementById('catch-detail').textContent='1,42 kg · 45 cm';
      },state);
      assert.equal(await page.locator('.meter-block').isVisible(),['charging','casting','fighting'].includes(state));
      const boxes=await page.evaluate(()=>{
        const selectors=['.topbar','.environment-hud','.fishing-panel','#touch-controls'];
        const center={x:innerWidth*.5,y:innerHeight*.5};
        const rect=e=>{const b=e.getBoundingClientRect();return {x:b.x,y:b.y,w:b.width,h:b.height};};
        const panels=selectors.map(s=>({s,...rect(document.querySelector(s))}));
        const buttons=['#action','#touch-equipment','#touch-hud-info','#touch-journal','#sound','#help','#pause'].map(s=>{
          const e=document.querySelector(s),b=rect(e),hit=document.elementFromPoint(b.x+b.w/2,b.y+b.h/2);
          return {s,...b,reachable:e===hit||e.contains(hit)};
        });
        return {panels,buttons,center,overflow:document.documentElement.scrollWidth>innerWidth};
      });
      assert.equal(boxes.overflow,false);
      for(const b of boxes.buttons){assert.ok(b.w>=44&&b.h>=44,`${name} ${state} ${b.s}: touch target`);assert.ok(b.x>=0&&b.y>=0&&b.x+b.w<=width+1&&b.y+b.h<=height+1,`${name} ${b.s}: within viewport`);assert.ok(b.reachable,`${name} ${state} ${b.s}: reachable`);}
      if(safe)for(const b of boxes.buttons)assert.ok(b.x>=safe.left&&b.y>=safe.top&&b.x+b.w<=width-safe.right+1&&b.y+b.h<=height-safe.bottom+1,`${name} ${b.s}: respects reserved safe area`);
      for(const p of boxes.panels)assert.ok(!(boxes.center.x>=p.x&&boxes.center.x<=p.x+p.w&&boxes.center.y>=p.y&&boxes.center.y<=p.y+p.h),`${name} ${state}: ${p.s} clears screen center`);
      for(let i=0;i<boxes.buttons.length;i++)for(let j=i+1;j<boxes.buttons.length;j++){
        const a=boxes.buttons[i],b=boxes.buttons[j];assert.ok(a.x+a.w<=b.x+.5||b.x+b.w<=a.x+.5||a.y+a.h<=b.y+.5||b.y+b.h<=a.y+.5,`${name}: ${a.s} overlaps ${b.s}`);
      }
      report.push({name,state,...boxes});
      if(['ready','charging','fighting','caught'].includes(state))await page.screenshot({path:`test-results/hud-after-${name}-${state}.png`});
    }
    // A real touch opens the secondary information panel without casting/moving.
    const before=await page.evaluate(()=>window.__alba.snapshot());
    await page.locator('#touch-hud-info').tap();assert.equal(await page.locator('#mobile-hud-dialog').isVisible(),true);
    assert.match(await page.locator('#mobile-info-environment').textContent(),/°C.*km\/h/);
    assert.match(await page.locator('#mobile-info-catches').textContent(),/capturas/);
    assert.equal((await page.evaluate(()=>window.__alba.snapshot())).paused,true);
    assert.equal((await page.evaluate(()=>window.__alba.snapshot())).casts,before.casts);
    assert.equal((await page.evaluate(()=>window.__alba.snapshot())).cameraYaw,before.cameraYaw);
    await page.screenshot({path:`test-results/hud-after-${name}-info.png`});
    const returnButton=page.locator('#mobile-hud-dialog .secondary-button');await returnButton.scrollIntoViewIfNeeded();await returnButton.tap();
    await page.waitForFunction(()=>!window.__alba.snapshot().paused,null,{polling:100});
    assert.equal((await page.evaluate(()=>window.__alba.snapshot())).paused,false);
    await context.close();
  }
  assert.deepEqual(errors,[]);await writeFile('test-results/mobile-hud-layout.json',JSON.stringify(report,null,2));
  console.log('PASS mobile HUD: contextual meters, center clear, reachable touch targets, no control overlap, INFO pause/resume, 6 touch viewports, 2 synthetic safe-inset profiles and unchanged desktop baseline when available.');
}finally{await browser.close();}
