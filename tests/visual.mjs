import { chromium } from '@playwright/test';
import { access, mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const stage = (process.argv[2] || 'phase2').replace(/[^a-z0-9-]/gi, '');
const edge = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
let executablePath = process.env.ALBA_BROWSER_PATH;
if (!executablePath && process.platform === 'win32') {
  try { await access(edge); executablePath = edge; } catch { /* Playwright Chromium. */ }
}
const browser = await chromium.launch({ headless: true, executablePath, args: ['--enable-webgl', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
await mkdir('test-results', { recursive: true });
try {
  await page.goto(process.env.ALBA_TEST_URL || 'http://127.0.0.1:5173');
  await page.waitForFunction(() => window.__alba && document.getElementById('loading').hidden, null, { timeout: 60000 });
  const gpu = await page.evaluate(() => {
    const gl = document.getElementById('scene').getContext('webgl2');
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
  });
  const results = { stage, gpu, viewport: '1280x800', profiles: {} };
  for (const quality of ['high', 'low']) {
    if (quality === 'low') await page.locator('#quality').click();
    await page.waitForTimeout(1000);
    const timings = await page.evaluate(() => new Promise(resolve => {
      const intervals = []; let prev;
      function tick(time) {
        if (prev !== undefined) intervals.push(time - prev);
        prev = time;
        if (intervals.length < 120) requestAnimationFrame(tick); else resolve(intervals);
      }
      requestAnimationFrame(tick);
    }));
    timings.sort((a,b) => a-b);
    const state = await page.evaluate(() => window.__alba.snapshot());
    assert.equal(state.state, 'ready');
    assert.ok(state.drawCalls > 0);
    results.profiles[quality] = { medianFrameMs: +timings[60].toFixed(2), p95FrameMs: +timings[114].toFixed(2), ...state };
    await page.screenshot({ path: `test-results/${stage}-${quality}.png` });
  }
  await page.mouse.move(600,400); await page.mouse.down({button:'right'});
  await page.mouse.move(340,440,{steps:8}); await page.mouse.up({button:'right'});
  await page.waitForTimeout(300);
  await page.screenshot({path:`test-results/${stage}-shore.png`});
  assert.deepEqual(errors, [], 'no JavaScript or shader errors in either quality mode');
  await writeFile(`test-results/${stage}-metrics.json`,JSON.stringify(results,null,2));
  console.log(JSON.stringify(results,null,2));
} finally { await browser.close(); }
