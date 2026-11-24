import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir, access } from 'node:fs/promises';

const baseURL = process.env.ALBA_TEST_URL || 'http://127.0.0.1:5173';
const edge = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
let executablePath = process.env.ALBA_BROWSER_PATH;
if (!executablePath && process.platform === 'win32') {
  try { await access(edge); executablePath = edge; } catch { /* Use installed Playwright Chromium. */ }
}
await mkdir('test-results',{recursive:true});
const browser = await chromium.launch({ headless:true, executablePath, args:['--enable-webgl','--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport:{width:1440,height:960} });
const errors = [];
page.on('pageerror',err=>errors.push(err.message));
page.on('console',msg=>{ if(msg.type()==='error') errors.push(msg.text()); });
const snapshot = ()=>page.evaluate(()=>window.__alba.snapshot());
try {
  await page.goto(baseURL);
  await page.waitForFunction(()=>window.__alba && document.getElementById('loading').hidden,{},{timeout:30000});
  assert.equal(await page.locator('#fatal').isVisible(),false);
  assert.ok((await snapshot()).drawCalls>0,'scene must be rendered');
  await page.screenshot({path:'test-results/lake-desktop.png'});
  // Real keyboard input, followed by an actual timed fish encounter.
  console.log('Initial',await snapshot());
  // Software WebGL can run slowly; reduce pixel count after the first reference image.
  await page.locator('#quality').click();
  await page.setViewportSize({width:1100,height:760});
  await page.keyboard.down('Space'); await page.waitForTimeout(420); await page.keyboard.up('Space');
  console.log('Released',await snapshot());
  await page.waitForFunction(()=>window.__alba.snapshot().state==='waiting',null,{timeout:60000});
  console.log('Landed',await snapshot());
  await page.waitForFunction(()=>window.__alba.snapshot().state==='bite',null,{timeout:90000,polling:50});
  assert.equal(await page.locator('#bite-alert').isVisible(),true);
  await page.keyboard.down('Space');
  await page.waitForFunction(()=>window.__alba.snapshot().state==='fighting');
  await page.screenshot({path:'test-results/fighting.png'});
  let held=true; const started=Date.now();
  while(Date.now()-started<90000) {
    const s=await snapshot();
    if(s.state==='caught') break;
    assert.equal(s.state,'fighting','fish escaped while controlling tension');
    if(s.tension>.64 && held) {await page.keyboard.up('Space'); held=false;}
    if(s.tension<.28 && !held) {await page.keyboard.down('Space'); held=true;}
    await page.waitForTimeout(60);
  }
  await page.keyboard.up('Space');
  assert.equal((await snapshot()).catchCount,1,'must capture a fish using real controls');
  await page.screenshot({path:'test-results/capture.png'});
  await page.keyboard.press('KeyJ');
  assert.equal(await page.locator('#log-dialog').isVisible(),true);
  assert.equal(await page.locator('.log-entry').count(),1);
  await page.keyboard.press('Escape');
  await page.reload(); await page.waitForFunction(()=>window.__alba && document.getElementById('loading').hidden);
  assert.equal((await snapshot()).catchCount,1,'capture persists after reload');
  // Mouse launch, pause, cancel, then responsive layout.
  // The previous journal opener retains keyboard focus, so use the landscape.
  await page.mouse.move(700,460); await page.mouse.down(); await page.waitForTimeout(600); await page.mouse.up();
  assert.equal((await snapshot()).state,'casting');
  await page.keyboard.press('KeyP'); const paused=await snapshot();
  await page.waitForTimeout(300); assert.equal((await snapshot()).distance,paused.distance);
  await page.locator('#resume').click(); await page.keyboard.press('KeyR');
  assert.equal((await snapshot()).state,'ready');
  // Keep mobile references legible without transient notifications.
  await page.waitForTimeout(5100);
  await page.setViewportSize({width:390,height:844}); await page.waitForTimeout(500);
  await page.screenshot({path:'test-results/lake-mobile.png'});
  const panel=await page.locator('.fishing-panel').boundingBox(); assert.ok(panel.x>=0 && panel.x+panel.width<=390);
  assert.deepEqual(errors,[],'no JavaScript or WebGL errors');
  console.log('PASS: WebGL render, keyboard and mouse casts, bite, balanced reeling, capture, journal, persistence, pause, reset, responsive UI.');
} catch(error) {
  console.error('Browser state:',await snapshot().catch(()=>null),'Errors:',errors);
  await page.screenshot({path:'test-results/failure.png'}).catch(()=>{});
  throw error;
} finally { await browser.close(); }
