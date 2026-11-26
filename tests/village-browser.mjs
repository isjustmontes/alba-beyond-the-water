// Deterministic live-app controls. Rendering is skipped only while advancing the
// walking clock; every checkpoint is rendered. Not a real-time FPS benchmark.
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:process.env.ALBA_BROWSER_PATH||(process.platform==='win32'?'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe':undefined),args:['--enable-webgl','--enable-unsafe-swiftshader']});
const errors=[],report=[];await mkdir('test-results',{recursive:true});
try{
  for(const [profile,width,height,mobile]of [['desktop',1280,800,false],['phone',390,844,true],['landscape',844,390,true],['tablet',1024,768,true]]){
    const page=await browser.newPage({viewport:{width,height},hasTouch:mobile,isMobile:mobile,deviceScaleFactor:1});
    page.on('pageerror',e=>errors.push(`${profile}: ${e.message}`));page.on('console',m=>{if(m.type()==='error')errors.push(`${profile}: ${m.text()}`);});
    // Test-only response instrumentation exposes the renderer instance (Three.js
    // defines render on the instance, not its prototype). No gameplay edits.
    await page.route('**/src/world.js*',async route=>{
      const response=await route.fetch(),body=await response.text(),needle='this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));';
      assert.ok(body.includes(needle));
      await route.fulfill({response,body:body.replace(needle,`window.__fixtureRenderer=this.renderer;${needle}`)});
    });
    await page.addInitScript(()=>{localStorage.setItem('alba-audio-v1','false');window.requestAnimationFrame=fn=>{window.__frame=fn;return 1;};});
    await page.goto(process.env.ALBA_TEST_URL||'http://127.0.0.1:5174');
    await page.waitForFunction(()=>window.__alba&&document.getElementById('loading').hidden,null,{polling:100});
    await page.evaluate(()=>{
      const renderer=window.__fixtureRenderer,render=renderer.render.bind(renderer);
      renderer.render=(...args)=>{if(!window.__skipRender){window.__renderedScene=args[0];return render(...args);}};
      let now=performance.now();window.__advance=n=>{for(let i=0;i<n;i++){now+=1000/60;window.__frame(now);}};
    });
    const step=(n=1,render=false)=>page.evaluate(({n,render})=>{window.__skipRender=!render;window.__advance(n);window.__skipRender=false;},{n,render});
    const snap=()=>page.evaluate(()=>window.__alba.snapshot());
    const tap=s=>mobile?page.locator(s).tap():page.locator(s).click();
    const cdp=await page.context().newCDPSession(page);let active=false,keys=[];
    const end=async()=>{
      if(mobile){if(active)await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});active=false;}
      else{for(const key of keys)await page.keyboard.up(key);keys=[];}
    };
    const go=async(x,z)=>{
      let tries=0;
      while(tries++<240){
        const s=await snap(),dx=x-s.playerPosition[0],dz=z-s.playerPosition[2],d=Math.hypot(dx,dz);if(d<.12)break;
        assert.equal(s.cameraYaw,0,'walking fixture uses unrotated camera');
        if(mobile){
          const b=await page.locator('#walk-stick').boundingBox(),r=b.width*.32*Math.min(1,d*2);
          await cdp.send('Input.dispatchTouchEvent',{type:active?'touchMove':'touchStart',touchPoints:[{id:1,x:b.x+b.width/2+dx/d*r,y:b.y+b.height/2+dz/d*r,radiusX:4,radiusY:4,force:1}]});active=true;
        }else{
          const next=[];if(Math.abs(dx)>.07)next.push(dx>0?'d':'a');if(Math.abs(dz)>.07)next.push(dz>0?'s':'w');
          for(const k of keys)if(!next.includes(k))await page.keyboard.up(k);
          for(const k of next)if(!keys.includes(k))await page.keyboard.down(k);keys=next;
        }
        await step(d<.5?2:Math.min(30,Math.max(2,Math.floor(d*16))));
      }
      await end();await step(16);assert.ok(tries<240,`blocked ${profile} towards ${x},${z}: ${JSON.stringify(await snap())}`);
    };
    await step(2,true);const initial=await snap();
    await page.evaluate(()=>{window.__lakeScene=window.__renderedScene;const tree=window.__lakeScene.getObjectByName('vegetation-tree-2-near');window.__lakeTreePhase=Array.from(tree.geometry.attributes.vegetationPhase.array);});
    await tap('#mode-toggle');await step(30);
    // Actual keyboard / joystick inputs all the way from the dock to the exit.
    for(const [x,z]of [[0,13],[0,17],[0,23],[3,32],[4,48],[5,66],[6,74]])await go(x,z);
    const before=await snap();assert.ok(await page.locator('#zone-travel').isVisible());
    await tap('#zone-travel');await step(2,true);assert.equal((await snap()).zone,'anglers-village');
    assert.ok(await page.evaluate(()=>{
      const source=window.__lakeScene.getObjectByName('vegetation-tree-2-near');
      return JSON.stringify(Array.from(source.geometry.attributes.vegetationPhase.array))===JSON.stringify(window.__lakeTreePhase);
    }),'visiting village preserves lake vegetation instance attributes');
    assert.equal(await page.locator('#mode-toggle').isVisible(),false);
    await page.keyboard.press('v');await step(1);assert.equal((await snap()).playerMode,'exploring','cannot equip/cast in village');
    if(mobile)await page.locator('#scene').tap({position:{x:width*.65,y:height*.4}});
    if(mobile)assert.ok(await page.locator('#walk-stick').isVisible());
    await go(0,12);await step(2,true);await page.screenshot({path:`test-results/village-${profile}-arrival.png`});
    await go(-6,5);await go(-8,4);await step(2,true);await page.screenshot({path:`test-results/village-${profile}-shop.png`});
    // The building is solid: repeated forward input cannot enter the shop.
    if(mobile){const b=await page.locator('#walk-stick').boundingBox();await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:b.x+b.width/2,y:b.y+b.height*.18,radiusX:4,radiusY:4}]});active=true;}
    else{await page.keyboard.down('w');keys=['w'];}
    await step(150);await end();await step(15);assert.ok((await snap()).playerPosition[2]>1.3);
    await go(-6,5);await go(0,12);await go(0,29);await step(2,true);
    const village=await snap();assert.ok(village.drawCalls<100,'bounded village draw calls');
    const resources=[];
    for(let i=0;i<5;i++){
      await tap('#zone-travel');await step(2,true);const back=await snap();assert.equal(back.zone,'lago-sereno');
      assert.ok(Math.hypot(back.playerPosition[0]-before.playerPosition[0],back.playerPosition[2]-before.playerPosition[2])<.001);
      assert.equal(back.cameraYaw,before.cameraYaw);assert.equal(back.cameraPitch,before.cameraPitch);
      await tap('#zone-travel');await step(2,true);const again=await snap();assert.equal(again.zone,'anglers-village');
      assert.ok(Math.hypot(again.playerPosition[0]-village.playerPosition[0],again.playerPosition[2]-village.playerPosition[2])<.001);
      resources.push({geometries:again.geometries,textures:again.textures});
    }
    assert.deepEqual(resources.at(-1),resources[0],'revisits do not allocate more GPU resources');
    await tap('#zone-travel');await step(2,true);
    for(const [x,z]of [[5,66],[4,48],[3,32],[0,23],[0,17],[0,13],[0,7]])await go(x,z);
    await tap('#mode-toggle');await step(40,true);assert.equal((await snap()).playerMode,'fishing');
    if(mobile){const b=await page.locator('#action').boundingBox();await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:2,x:b.x+b.width/2,y:b.y+b.height/2,radiusX:4,radiusY:4}]});await step(20);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
    else{await page.keyboard.down('Space');await step(20);await page.keyboard.up('Space');}
    await step(80,true);const final=await snap();assert.equal(final.casts,1);assert.ok(['waiting','bite'].includes(final.state));
    assert.equal(final.catchCount,initial.catchCount);assert.equal(final.handsEnabled,false);
    report.push({profile,before,village,resources,final});await page.close();
  }
  assert.deepEqual(errors,[]);await writeFile('test-results/village-browser.json',JSON.stringify(report,null,2));
  console.log('PASS four live-app profiles: dock/shore/village/shop/return/cast, five round trips, stable resources, no JS/shader errors. Accelerated walking with checkpoint rendering, not physical devices or FPS measurement.');
}finally{await browser.close();}
