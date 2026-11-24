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
  assert.equal((await snapshot()).touchMode,false);assert.equal(await page.locator('#touch-controls').isVisible(),false);
  await page.keyboard.press('KeyE');
  assert.equal(await page.locator('#equipment-dialog').isVisible(),true);
  assert.equal(await page.locator('#hands-toggle').isDisabled(),true);assert.equal(await page.locator('#hands-toggle').isChecked(),false);
  await page.locator('[data-lure="worm"]').click();
  assert.ok((await page.locator('#equipment-toggle').textContent()).includes('Lombriz'));
  await page.locator('#equipment-dialog .close').click();await page.reload();
  await page.waitForFunction(()=>window.__alba&&document.getElementById('loading').hidden);
  assert.equal((await snapshot()).lureId,'worm','equipment survives reload');await page.keyboard.press('KeyE');
  await page.locator('[data-lure="spinner"]').click();
  await page.locator('#equipment-dialog .close').click();
  await page.screenshot({path:'test-results/lake-desktop.png'});
  await page.mouse.move(680,420);await page.mouse.down({button:'right'});await page.mouse.move(700,430,{steps:4});await page.mouse.up({button:'right'});
  assert.ok(Math.abs((await snapshot()).cameraYaw+.04)<.00001,'desktop camera keeps its original sensitivity');
  await page.mouse.down({button:'right'});await page.mouse.move(680,420,{steps:4});await page.mouse.up({button:'right'});
  await page.keyboard.down('Space');await page.waitForTimeout(100);await page.evaluate(()=>dispatchEvent(new Event('blur')));
  assert.equal((await snapshot()).paused,true);assert.equal((await snapshot()).heldInputs,0);assert.equal((await snapshot()).casts,0);
  await page.keyboard.up('Space');await page.locator('#resume').click();
  // Real keyboard input, followed by an actual timed fish encounter.
  console.log('Initial',await snapshot());
  // Software WebGL can run slowly; reduce pixel count after the first reference image.
  await page.locator('#quality').click();
  await page.setViewportSize({width:1100,height:760});
  await page.keyboard.down('Space'); await page.waitForTimeout(420); await page.keyboard.up('Space');
  console.log('Released',await snapshot());
  await page.waitForFunction(()=>window.__alba.snapshot().state==='waiting',null,{timeout:60000});
  assert.ok((await snapshot()).rippleStrength>0,'bobber should perturb the water');
  console.log('Landed',await snapshot());
  await page.waitForFunction(()=>window.__alba.snapshot().state==='bite',null,{timeout:90000,polling:50});
  assert.equal(await page.locator('#bite-alert').isVisible(),true);
  await page.keyboard.down('Space');
  await page.waitForFunction(()=>window.__alba.snapshot().state==='fighting');
  await page.waitForFunction(()=>window.__alba.snapshot().rodBend>.02);
  assert.ok((await snapshot()).lineTipError<.001,'line must remain attached to the flexing rod tip');
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
  assert.equal(await page.locator('.record-card').count(),1);
  assert.ok((await page.locator('.log-entry').textContent()).includes('Cucharilla'));
  assert.match(await page.locator('.capture-conditions').textContent(),/\d\d:\d\d.*°C.*m/);
  const savedEnvironment=await page.evaluate(()=>JSON.parse(localStorage.getItem('alba-catches-v1'))[0].environment);
  assert.ok(savedEnvironment.depth>0);assert.ok(Number.isFinite(savedEnvironment.temperature));
  await page.keyboard.press('Escape');
  await page.reload(); await page.waitForFunction(()=>window.__alba && document.getElementById('loading').hidden);
  assert.equal((await snapshot()).catchCount,1,'capture persists after reload');
  await page.keyboard.press('KeyJ');assert.match(await page.locator('.capture-conditions').textContent(),/°C/);await page.keyboard.press('Escape');
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
  assert.equal((await snapshot()).touchMode,false,'narrow desktop still has desktop input');
  // Load a phase-1 save verbatim; visual upgrades must not invalidate existing progress.
  await page.evaluate(()=>localStorage.setItem('alba-catches-v1',JSON.stringify([
    {speciesIndex:0,name:'Trucha arcoíris',weight:1.25,length:44,date:'2026-11-23T18:00:00.000Z'}
  ])));
  await page.reload();await page.waitForFunction(()=>window.__alba && document.getElementById('loading').hidden);
  assert.equal((await snapshot()).catchCount,1);
  assert.ok((await page.locator('#last-catch').textContent()).includes('Trucha arcoíris'));
  await page.keyboard.press('KeyJ');assert.ok((await page.locator('.log-entry').textContent()).includes('Sin registrar'));await page.keyboard.press('Escape');
  assert.deepEqual(errors,[],'no JavaScript or WebGL errors');
  console.log('PASS: WebGL, keyboard and mouse casts, bite, balanced reeling, capture, journal, persistence, phase-1 saves, pause, reset, responsive UI, water ripples, rod flex and attached line.');
} catch(error) {
  console.error('Browser state:',await snapshot().catch(()=>null),'Errors:',errors);
  await page.screenshot({path:'test-results/failure.png'}).catch(()=>{});
  throw error;
} finally { await browser.close(); }
