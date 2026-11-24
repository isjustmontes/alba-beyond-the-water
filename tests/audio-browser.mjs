import {chromium} from '@playwright/test';
import {access} from 'node:fs/promises';
import assert from 'node:assert/strict';

let executablePath=process.env.ALBA_BROWSER_PATH;
if(!executablePath&&process.platform==='win32'){
  const edge='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
  try{await access(edge);executablePath=edge;}catch{/* Use configured Playwright Chromium. */}
}
const browser=await chromium.launch({headless:true,executablePath,args:['--enable-webgl','--enable-unsafe-swiftshader','--autoplay-policy=user-gesture-required']}),errors=[];
try{
  for(const mobile of [false,true]){
    const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1280,height:800},isMobile:mobile,hasTouch:mobile});
    await context.addInitScript(()=>{
      window.__audioContexts=[];
      const Native=window.AudioContext;
      window.AudioContext=class extends Native{constructor(...args){super(...args);window.__audioContexts.push(this);}};
    });
    const page=await context.newPage();
    page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    const ready=()=>page.waitForFunction(()=>document.getElementById('loading').hidden,null,{timeout:60000});
    const status=()=>page.locator('#sound-status').textContent();
    const count=()=>page.evaluate(()=>window.__audioContexts.length);
    const press=async selector=>{if(mobile)await page.locator(selector).tap();else await page.locator(selector).click();};
    await page.goto(process.env.ALBA_PRODUCTION_URL||'http://127.0.0.1:5175');await ready();
    assert.equal(await status(),'ON');assert.equal(await count(),0,'no context or autoplay before interaction');
    await page.evaluate(()=>document.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true})));
    assert.equal(await count(),0,'synthetic input does not unlock audio');
    await press('#sound');assert.equal(await status(),'OFF');assert.equal(await count(),0,'first mute does not start audio');
    assert.equal(await page.evaluate(()=>localStorage.getItem('alba-audio-v1')),'false');
    await page.reload();await ready();assert.equal(await status(),'OFF');assert.equal(await count(),0);
    await press('#help');assert.equal(await count(),0,'ordinary gestures respect saved mute');
    await press('#help-dialog .close');
    if(mobile)await press('#sound');else await page.keyboard.press('KeyM');
    await page.waitForFunction(()=>window.__audioContexts[0]?.state==='running');
    assert.equal(await status(),'ON');assert.equal(await count(),1);
    assert.equal(await page.evaluate(()=>localStorage.getItem('alba-audio-v1')),'true');
    await page.reload();await ready();assert.equal(await status(),'ON');assert.equal(await count(),0,'saved enable still defers creation');
    await press('#help');await page.waitForFunction(()=>window.__audioContexts[0]?.state==='running');
    assert.equal(await count(),1);assert.equal(await status(),'ON');
    await press('#help-dialog .close');
    if(mobile)await press('#sound');else await page.keyboard.press('KeyM');
    assert.equal(await status(),'OFF');assert.equal(await count(),1,'mute reuses existing context');
    await context.close();
  }
  assert.deepEqual(errors,[]);
  console.log('PASS audio desktop/mobile emulation: deferred autoplay, trusted gesture unlock, first-action mute, saved ON/OFF, reload and M/button controls.');
}finally{await browser.close();}
