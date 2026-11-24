import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {access} from 'node:fs/promises';
let executablePath=process.env.ALBA_BROWSER_PATH;
if(!executablePath&&process.platform==='win32'){const edge='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';try{await access(edge);executablePath=edge;}catch{/* Installed Chromium. */}}
const browser=await chromium.launch({headless:true,executablePath,args:['--enable-webgl','--enable-unsafe-swiftshader']}),errors=[];
try{
  for(const mobile of [false,true]){
    const context=await browser.newContext({viewport:mobile ? {width:390,height:844} : {width:1440,height:960},hasTouch:mobile,isMobile:mobile});
    const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    await page.goto(`${process.env.ALBA_PRODUCTION_URL||'http://127.0.0.1:5175'}/?hour=0&day=20&weather=heavyRain&transition=2`);
    await page.waitForFunction(()=>document.getElementById('loading').hidden,null,{timeout:60000});
    assert.equal(await page.locator('#fatal').isVisible(),false);assert.equal(await page.evaluate(()=>typeof window.__alba),'undefined');
    assert.equal(await page.locator('#touch-controls').isVisible(),mobile);
    assert.match(await page.locator('#lake-time').textContent(),/^06:/,'production ignores observation parameters');
    assert.equal(await page.locator('#environment-weather').textContent(),'Despejado');
    assert.ok(await page.evaluate(()=>!document.getElementById('scene').getContext('webgl2').isContextLost()));
    if(mobile)await page.locator('#touch-equipment').tap();else await page.keyboard.press('KeyE');
    assert.equal(await page.locator('#equipment-dialog').isVisible(),true);
    await page.locator('#equipment-dialog .close').click();
    await page.locator('#sound').click();assert.equal(await page.locator('#sound-status').textContent(),'ON');
    await context.close();
  }
  assert.deepEqual(errors,[]);console.log('PASS production: WebGL, environment, PC/mobile UI, equipment, audio and observation parameters excluded.');
}finally{await browser.close();}
