import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {access,mkdir,writeFile} from 'node:fs/promises';
let executablePath=process.env.ALBA_BROWSER_PATH;
if(!executablePath&&process.platform==='win32'){const edge='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';try{await access(edge);executablePath=edge;}catch{/* Installed Playwright Chromium. */}}
const browser=await chromium.launch({headless:true,executablePath,args:['--enable-webgl','--enable-unsafe-swiftshader']});
const url=process.env.ALBA_TEST_URL||'http://127.0.0.1:5173',errors=[],report={weather:[],profiles:[]};
await mkdir('test-results',{recursive:true});
function watch(page){page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});}
async function load(page,query){await page.goto(`${url}/${query}`);await page.waitForFunction(()=>window.__alba&&document.getElementById('loading').hidden,null,{timeout:60000});}
const snap=page=>page.evaluate(()=>window.__alba.snapshot());
async function checkHUD(page){
  const bounds=await page.evaluate(()=>{const rect=id=>{const b=document.querySelector(id).getBoundingClientRect();return {x:b.x,y:b.y,right:b.right,bottom:b.bottom};};return {hud:rect('.environment-hud'),fishing:rect('.fishing-panel'),session:rect('.session-card'),intro:rect('.place-intro'),width:innerWidth,height:innerHeight,time:document.getElementById('environment-time').textContent};});
  const overlaps=(a,b)=>a.x<b.right&&a.right>b.x&&a.y<b.bottom&&a.bottom>b.y;
  assert.ok(bounds.hud.x>=0&&bounds.hud.right<=bounds.width&&bounds.hud.bottom<=bounds.height,'environment fits viewport');
  assert.equal(overlaps(bounds.hud,bounds.fishing),false,'environment leaves fishing controls free');
  assert.equal(overlaps(bounds.hud,bounds.session),false,'environment leaves the catch counter free');
  assert.match(bounds.time,/^\d\d:\d\d$/);
}
try{
  const page=await browser.newPage({viewport:{width:1440,height:960}});watch(page);
  await load(page,'?day=20&hour=4');
  report.periods=await page.evaluate(()=>new Promise(resolve=>{
    const periods=new Set(),start=window.__alba.snapshot().time;let lastHour=window.__alba.snapshot().environment.hour,wraps=0;
    function tick(){const s=window.__alba.snapshot();periods.add(s.environment.period);if(s.environment.hour<lastHour)wraps++;lastHour=s.environment.hour;if(s.time-start>=21)resolve({seen:[...periods],wraps});else requestAnimationFrame(tick);}tick();
  }));
  assert.equal(report.periods.seen.length,6);assert.ok(report.periods.wraps>=1);
  await page.keyboard.press('KeyP');const frozen=(await snap(page)).environment.hour;await page.waitForTimeout(350);assert.equal((await snap(page)).environment.hour,frozen);await page.locator('#resume').click();
  for(const weather of ['clear','partly','cloudy','lightRain','heavyRain','windy']){
    await load(page,`?hour=12&weather=${weather}&transition=2`);
    await page.waitForFunction(()=>window.__alba.snapshot().time>2.5);
    const s=await snap(page);assert.equal(s.environment.weather,weather);assert.ok(s.environment.windSpeed<=6);
    if(weather==='heavyRain')assert.ok(s.rain>.95);if(weather==='clear')assert.equal(s.rain,0);
    await checkHUD(page);report.weather.push({weather,rain:s.rain,wind:s.environment.windSpeed});
    await page.screenshot({path:`test-results/living-waters-${weather}.png`});
  }
  await load(page,'?hour=0&weather=clear');assert.ok((await snap(page)).daylight<.01);await page.screenshot({path:'test-results/living-waters-night.png'});
  await page.locator('#sound').click();assert.equal(await page.locator('#sound-status').textContent(),'ON');await page.waitForTimeout(700);await page.locator('#sound').click();assert.equal(await page.locator('#sound-status').textContent(),'OFF');
  await page.close();
  for(const [name,viewport]of [['phone-portrait',{width:390,height:844}],['phone-landscape',{width:844,height:390}],['tablet',{width:1024,height:768}]]){
    const context=await browser.newContext({viewport,hasTouch:true,isMobile:true,deviceScaleFactor:1}),mobile=await context.newPage();watch(mobile);
    await load(mobile,'?hour=19&weather=heavyRain&transition=2');await mobile.waitForFunction(()=>window.__alba.snapshot().rain>.9);assert.equal((await snap(mobile)).touchMode,true);await checkHUD(mobile);
    await mobile.locator('#touch-equipment').tap();assert.equal(await mobile.locator('#equipment-dialog').isVisible(),true);await mobile.locator('#equipment-dialog .close').tap();
    await mobile.screenshot({path:`test-results/living-waters-${name}.png`});report.profiles.push({name,viewport,environment:(await snap(mobile)).environment});await context.close();
  }
  assert.deepEqual(errors,[],'no JavaScript, WebGL or audio errors');
  await writeFile('test-results/living-waters-browser.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{await browser.close();}
