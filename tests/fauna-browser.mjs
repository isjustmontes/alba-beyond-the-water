import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:process.env.ALBA_BROWSER_PATH||(process.platform==='win32'?'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe':undefined),args:['--enable-webgl','--enable-unsafe-swiftshader','--autoplay-policy=user-gesture-required']});
const visualOnly=process.argv.includes('--visual-only'),errors=[],report=[];await mkdir('test-results',{recursive:true});
try{
  for(const [profile,width,height,mobile]of [['desktop',1280,800,false],['portrait',390,844,true],['landscape',844,390,true]]){
    const context=await browser.newContext({viewport:{width,height},hasTouch:mobile,isMobile:mobile,deviceScaleFactor:1});
    await context.addInitScript(()=>{
      window.audioContexts=[];const Native=window.AudioContext;
      window.AudioContext=class extends Native{
        constructor(...args){super(...args);this.testGains=[];window.audioContexts.push(this);}
        createGain(){const gain=super.createGain();this.testGains.push(gain);return gain;}
      };
      window.audioRms=()=>{
        const ctx=window.audioContexts[0];if(!ctx)return 0;
        if(!ctx.testAnalyser){ctx.testAnalyser=ctx.createAnalyser();ctx.testAnalyser.fftSize=2048;ctx.testGains[0].connect(ctx.testAnalyser);}
        const data=new Float32Array(2048);ctx.testAnalyser.getFloatTimeDomainData(data);return Math.sqrt(data.reduce((s,x)=>s+x*x,0)/data.length);
      };
    });
    const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    const press=selector=>mobile?page.locator(selector).tap():page.locator(selector).click();
    for(const [condition,hour,weather]of [['dawn',6.4,'clear'],['noon',12,'clear'],['night',0,'clear'],['rain',12,'heavyRain']]){
      await page.goto(`${process.env.ALBA_TEST_URL||'http://127.0.0.1:5174'}/?hour=${hour}&weather=${weather}&transition=2`);
      await page.waitForFunction(()=>window.__alba&&document.getElementById('loading').hidden,null,{timeout:60000});
      assert.equal(await page.evaluate(()=>audioContexts.length),0,'no autoplay context before a gesture');
      if(!visualOnly){
        if(await page.locator('#sound-status').textContent()==='OFF')await press('#sound');
        else {await press('#help');await press('#help-dialog .close');}
        await page.waitForFunction(()=>audioContexts[0]?.state==='running');
      }
      await page.waitForFunction(()=>window.__alba.snapshot().time>3);
      let enabledRms=null,mutedRms=null;
      if(!visualOnly){
        await page.evaluate(()=>audioRms());await page.waitForTimeout(150);
        enabledRms=await page.evaluate(()=>audioRms());assert.ok(enabledRms>.00001,'ambient sound produces a nonzero signal');
      }
      const metrics=await page.evaluate(()=>new Promise(resolve=>{let last;const a=[];function tick(t){if(last!==undefined)a.push(t-last);last=t;if(a.length<60)requestAnimationFrame(tick);else{a.sort((x,y)=>x-y);resolve({medianMs:+a[30].toFixed(2),p95Ms:+a[57].toFixed(2),...window.__alba.snapshot()});}}requestAnimationFrame(tick);}));
      assert.equal(metrics.touchMode,mobile);assert.equal(metrics.environment.weather,weather);
      await page.screenshot({path:`test-results/fauna-${profile}-${condition}.png`});
      if(!visualOnly){
        await press('#sound');await page.waitForTimeout(1900);
        mutedRms=await page.evaluate(()=>audioRms());assert.ok(mutedRms<.00001,'mute silences all ambient layers');
        assert.equal(await page.evaluate(()=>localStorage.getItem('alba-audio-v1')),'false');
      }
      report.push({profile,condition,enabledRms,mutedRms,...metrics});
    }
    // Verify withheld visual fauna cannot allocate or render placeholder geometry.
    const fixture=await page.evaluate(async()=>{
      window.requestAnimationFrame=()=>0;
      const THREE=await import('/node_modules/.vite/deps/three.js'),{AmbientFauna}=await import('/src/visuals/fauna.js');
      const scene=new THREE.Scene();scene.background=new THREE.Color(0x536b57);scene.add(new THREE.HemisphereLight(0xe5edd8,0x283c26,2));
      const fauna=new AmbientFauna(scene),camera=new THREE.PerspectiveCamera(46,innerWidth/innerHeight,.1,300);
      camera.position.set(17,4,1);camera.lookAt(18,2.7,-18);
      const canvas=document.createElement('canvas');canvas.style.cssText='position:fixed;inset:0;z-index:9999';document.body.append(canvas);
      const renderer=new THREE.WebGLRenderer({canvas,antialias:true});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(1);
      const environment={clock:{hour:12},daylight:1,weather:{wind:1,rain:0}};
      fauna.update(environment,15);renderer.render(scene,camera);const memory={...renderer.info.memory},calls=renderer.info.render.calls;
      for(let i=0;i<300;i++){fauna.update(environment,15+i/60);renderer.render(scene,camera);}
      const stable=memory.geometries===renderer.info.memory.geometries&&memory.textures===renderer.info.memory.textures;
      fauna.update(environment,20,innerWidth<1000);renderer.render(scene,camera);
      return {stable,calls,memory,objects:scene.children.filter(o=>!o.isLight).length};
    });
    assert.equal(fixture.stable,true);assert.equal(fixture.calls,0);assert.equal(fixture.objects,0);assert.equal(fixture.memory.geometries,0);
    await context.close();
  }
  assert.deepEqual(errors,[],'no JavaScript, shader or Web Audio errors');
  await writeFile(`test-results/fauna${visualOnly?'-visual':''}-browser.json`,JSON.stringify(report,null,2));
  console.log(JSON.stringify(report.map(({profile,condition,medianMs,p95Ms,enabledRms,mutedRms})=>({profile,condition,medianMs,p95Ms,enabledRms,mutedRms})),null,2));
}finally{await browser.close();}
