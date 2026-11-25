// Real game captures and frame intervals; mobile devices are emulated, not physical.
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:process.env.ALBA_BROWSER_PATH||(process.platform==='win32'?'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe':undefined),args:['--enable-webgl','--enable-unsafe-swiftshader']});
const stage=process.argv[2]==='baseline'?'baseline':'candidate',errors=[],report=[];
await mkdir('test-results',{recursive:true});
try{
  for(const [profile,width,height,mobile]of [['desktop',1280,800,false],['portrait',390,844,true],['landscape',844,390,true]]){
    const context=await browser.newContext({viewport:{width,height},hasTouch:mobile,isMobile:mobile,deviceScaleFactor:1}),page=await context.newPage();
    page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    for(const [condition,hour,weather]of [['dawn',6.4,'clear'],['noon',12,'clear'],['rain',12,'heavyRain'],['mist',6,'cloudy']]){
      await page.goto(`${process.env.ALBA_TEST_URL||'http://127.0.0.1:5174'}/?hour=${hour}&weather=${weather}&transition=2`);
      await page.waitForFunction(()=>window.__alba&&document.getElementById('loading').hidden,null,{timeout:60000});
      await page.waitForFunction(()=>window.__alba.snapshot().time>3);
      const metrics=await page.evaluate(()=>new Promise(resolve=>{const times=[];let last;function tick(t){if(last!==undefined)times.push(t-last);last=t;if(times.length<60)requestAnimationFrame(tick);else{times.sort((a,b)=>a-b);resolve({medianMs:+times[30].toFixed(2),p95Ms:+times[57].toFixed(2),...window.__alba.snapshot()});}}requestAnimationFrame(tick);}));
      assert.equal(metrics.touchMode,mobile);assert.equal(metrics.environment.weather,weather);assert.equal(metrics.state,'ready');
      await page.screenshot({path:`test-results/atmosphere-${stage}-${profile}-${condition}.png`});
      report.push({profile,condition,...metrics});
    }
    await context.close();
  }
  assert.deepEqual(errors,[],'no JavaScript or shader errors');
  await writeFile(`test-results/atmosphere-${stage}.json`,JSON.stringify(report,null,2));
  console.log(JSON.stringify(report.map(({profile,condition,medianMs,p95Ms,drawCalls,triangles})=>({profile,condition,medianMs,p95Ms,drawCalls,triangles})),null,2));
}finally{await browser.close();}
