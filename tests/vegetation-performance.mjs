// Paired, serialized GPU/CPU render measurements of vegetation/terrain only.
// A one-pixel readback drains the GPU queue. These costs are NOT gameplay FPS.
import {execFileSync} from 'node:child_process';
import {chromium} from '@playwright/test';
import {access,mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
await mkdir('test-results',{recursive:true});
await writeFile('test-results/vegetation-v042.js',execFileSync('git',['show','v0.4.2:src/visuals/landscape.js']));
let executablePath=process.env.ALBA_BROWSER_PATH;
if(!executablePath&&process.platform==='win32'){const edge='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';try{await access(edge);executablePath=edge;}catch{/* Configured Chromium. */}}
const browser=await chromium.launch({headless:true,executablePath,args:['--enable-webgl','--enable-unsafe-swiftshader']}),report=[],errors=[];
try{
  for(const [name,width,height,mobile]of [['desktop',1280,800,false],['mobile',390,844,true]]){
    const context=await browser.newContext({viewport:{width,height},hasTouch:mobile,isMobile:mobile,deviceScaleFactor:1}),page=await context.newPage();
    page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
    await page.goto(process.env.ALBA_TEST_URL||'http://127.0.0.1:5173');await page.waitForFunction(()=>window.__alba&&document.getElementById('loading').hidden,null,{polling:100,timeout:60000});
    const rows=await page.evaluate(async()=>{
      const THREE=await import('/node_modules/.vite/deps/three.js'),base=await import('/test-results/vegetation-v042.js'),candidate=await import('/src/visuals/landscape.js'),rows=[];
      for(const version of ['base','candidate','candidate','base']){
        let seed=72931;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
        const land=(version==='base'?base:candidate).makeLandscape(rand),scene=new THREE.Scene();scene.background=new THREE.Color(0xadbbb4);scene.fog=new THREE.FogExp2(0xadbbb4,.0035);scene.add(land.group);
        scene.add(new THREE.HemisphereLight(0xc5ddde,0x344833,1.5));const sun=new THREE.DirectionalLight(0xffdfb3,2.5);sun.position.set(-30,40,-20);scene.add(sun);
        const camera=new THREE.PerspectiveCamera(58,innerWidth/innerHeight,.1,900);camera.position.set(0,3,7);camera.rotation.x=-.065;
        const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(1);renderer.toneMapping=THREE.ACESFilmicToneMapping;
        if(version==='base')land.wind.value=.45+1.1*.35;else land.wind.value.set(1.1,0);
        const gl=renderer.getContext(),times=[],pixel=new Uint8Array(4);
        for(let i=0;i<70;i++){land.clock.value=2+i/60;const start=performance.now();renderer.render(scene,camera);gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,pixel);if(i>=10)times.push(performance.now()-start);}
        times.sort((a,b)=>a-b);rows.push({version,medianRenderMs:+times[30].toFixed(2),p95RenderMs:+times[57].toFixed(2),calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,...renderer.info.memory});
        const geos=new Set(),mats=new Set(),maps=new Set();scene.traverse(o=>{if(o.geometry)geos.add(o.geometry);if(o.material){mats.add(o.material);for(const value of Object.values(o.material))if(value?.isTexture)maps.add(value);}});
        for(const g of geos)g.dispose();for(const m of mats)m.dispose();for(const t of maps)t.dispose();renderer.dispose();renderer.forceContextLoss();
      }
      return rows;
    });
    report.push({name,viewport:{width,height},rows});await context.close();
  }
  assert.deepEqual(errors,[]);await writeFile('test-results/vegetation-performance.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{await browser.close();}
