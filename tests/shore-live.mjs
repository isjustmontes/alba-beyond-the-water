// Live application smoke: no simulation shortcuts or teleports.
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:process.env.ALBA_BROWSER_PATH||(process.platform==='win32'?'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe':undefined),args:['--enable-webgl','--enable-unsafe-swiftshader']});
await mkdir('test-results',{recursive:true});const errors=[],report=[];
try{
  for(const [profile,width,height,mobile]of [['desktop',1280,800,false],['phone',390,844,true]]){
    if(process.argv.includes('--phone')&&!mobile)continue;
    const page=await browser.newPage({viewport:{width,height},hasTouch:mobile,isMobile:mobile,deviceScaleFactor:1});
    page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    await page.goto(process.env.ALBA_TEST_URL||'http://127.0.0.1:5174');await page.waitForFunction(()=>window.__alba&&document.getElementById('loading').hidden);
    const snap=()=>page.evaluate(()=>window.__alba.snapshot());
    const tap=s=>mobile?page.locator(s).tap():page.locator(s).click();
    const cdp=await page.context().newCDPSession(page);let active=false,keys=[];
    const end=async()=>{if(mobile){if(active)await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});active=false;}else{for(const key of keys)await page.keyboard.up(key);keys=[];}};
    const go=async(x,z)=>{
      const stick=mobile?await page.locator('#walk-stick').boundingBox():null;let tries=0;
      while(tries++<150){
        const current=await snap(),dx=x-current.playerPosition[0],dz=z-current.playerPosition[2],distance=Math.hypot(dx,dz);
        if(distance<.05)break;
        if(mobile){
          const radius=stick.width*.32*Math.min(1,distance*3);await cdp.send('Input.dispatchTouchEvent',{type:active?'touchMove':'touchStart',touchPoints:[{id:1,x:stick.x+stick.width/2+dx/distance*radius,y:stick.y+stick.height/2+dz/distance*radius,radiusX:5,radiusY:5,force:1}]});active=true;
        }else{
          const next=[];if(Math.abs(dx)>.025)next.push(dx>0?'d':'a');if(Math.abs(dz)>.025)next.push(dz>0?'s':'w');
          for(const key of keys)if(!next.includes(key))await page.keyboard.up(key);
          for(const key of next)if(!keys.includes(key))await page.keyboard.down(key);keys=next;
        }
        await page.waitForTimeout(distance<.5?25:130);
        if(!mobile&&distance<.5){await end();await page.waitForTimeout(200);}
      }
      await end();assert.ok(tries<150,`live route blocked at ${x},${z}`);await page.waitForTimeout(mobile?30:180);
      const s=await snap();assert.equal(s.playerMode,'exploring');assert.equal(s.touchMode,mobile);return s;
    };
    const look=async target=>{
    const yaw=(await snap()).cameraYaw,delta=(yaw-target)/.002;
    if(!mobile){await page.mouse.move(width*.55,height*.45);await page.mouse.down({button:'right'});await page.mouse.move(width*.55+delta,height*.45);await page.mouse.up({button:'right'});}
    else{
      let left=delta/.8;
      while(Math.abs(left)>1){
        let x=width*.78;const y=height*.45;await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:2,x,y,radiusX:5,radiusY:5}]});
        for(let i=0;i<4&&Math.abs(left)>1;i++){const step=Math.max(-35,Math.min(35,left));x+=step;left-=step;await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{id:2,x,y,radiusX:5,radiusY:5}]});}
        await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
      }
    }
    };
    const cast=async()=>{
      if(mobile){const b=await page.locator('#action').boundingBox();await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:3,x:b.x+b.width/2,y:b.y+b.height/2,radiusX:5,radiusY:5}]});await page.waitForTimeout(300);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
      else{await page.keyboard.down('Space');await page.waitForTimeout(300);await page.keyboard.up('Space');}
    };
    await tap('#mode-toggle');const legs=[],casts=[];
    for(const point of [[0,13],[0,17],[-7,20],[-11,24]])legs.push(await go(...point));
    for(const [x,yaw]of [[-11,Math.PI/2],[11,-Math.PI/2]]){
    if(x>0){await look(0);for(const point of [[0,23],[11,24]])legs.push(await go(...point));}
    await look(yaw);
    await page.evaluate(()=>{window.modeTrace=[];const b=document.getElementById('mode-toggle');for(const type of ['pointerdown','pointerup','click','pointercancel'])b.addEventListener(type,e=>modeTrace.push({type,pointer:e.pointerType,detail:e.detail,mode:__alba.snapshot().playerMode}));});
    await tap('#mode-toggle');
    try{await page.waitForFunction(()=>window.__alba.snapshot().playerMode==='fishing',null,{timeout:5000});}catch(error){
      await page.screenshot({path:`test-results/shore-live-${profile}-failure.png`});console.log(JSON.stringify(await page.evaluate(()=>({trace:window.modeTrace,mode:__alba.snapshot(),toast:document.getElementById('toast').textContent})),null,2));throw error;
    }
    assert.equal(await page.locator('#walk-stick').isVisible(),false);
    await page.waitForFunction(()=>window.__alba.snapshot().equipmentProgress===1);
    assert.ok(Math.abs((await snap()).cameraYaw-yaw)<.003,'equip preserves heading');
    assert.ok(Math.abs((await snap()).playerPosition[0]-x)<.4);
    const before=(await snap()).casts;
    // Landward casting must be refused even after entering fishing mode.
    await look(Math.PI-.1);await cast();await page.waitForTimeout(150);
    assert.equal((await snap()).state,'ready');assert.equal((await snap()).casts,before);
    await look(yaw);await cast();
    await page.waitForFunction(()=>['waiting','bite'].includes(window.__alba.snapshot().state));
    const result=await snap();assert.equal(result.casts,before+1);assert.ok(Math.abs(result.bobber[0])>20&&result.bobber[2]>15,'lure reaches lateral lake water away from the dock');assert.ok(result.lineTipError<.001);casts.push(result);
    await page.screenshot({path:`test-results/shore-live-${profile}-${x<0?'west':'east'}.png`});
    if(mobile){await tap('#touch-equipment');await tap('#retrieve-rig');await tap('#equipment-dialog .close');}else await page.keyboard.press('r');
    await tap('#mode-toggle');await page.waitForFunction(()=>window.__alba.snapshot().playerMode==='exploring');
    await page.waitForFunction(()=>!window.__alba.snapshot().rodVisible);
    }
    await look(0);for(const point of [[0,20],[0,17],[0,13],[0,7]])legs.push(await go(...point));
    await tap('#mode-toggle');assert.equal((await snap()).playerMode,'fishing');
    assert.equal((await snap()).casts,2);
    await page.waitForFunction(()=>window.__alba.snapshot().equipmentProgress===1);
    await cast();await page.waitForFunction(()=>['waiting','bite'].includes(window.__alba.snapshot().state));
    assert.equal((await snap()).casts,3,'dock casting remains functional');
    if(mobile){await tap('#touch-equipment');await tap('#retrieve-rig');await tap('#equipment-dialog .close');}else await page.keyboard.press('r');
    await tap('#mode-toggle');await page.waitForFunction(()=>!window.__alba.snapshot().rodVisible);
    report.push({profile,legs,casts,returned:await snap()});await page.close();
  }
  assert.deepEqual(errors,[]);await writeFile('test-results/shore-live.json',JSON.stringify(report,null,2));console.log(`PASS live app (${report.map(r=>r.profile).join(', ')}): both coves outside former radii, equip/stow, landward cast refusal, two shore casts, return and dock cast; actual controls, no shortcuts or JS/shader errors.`);
}finally{await browser.close();}
