import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {access,mkdir,writeFile} from 'node:fs/promises';
let executablePath=process.env.ALBA_BROWSER_PATH;
if(!executablePath&&process.platform==='win32'){const edge='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';try{await access(edge);executablePath=edge;}catch{/* Installed Chromium. */}}
const browser=await chromium.launch({headless:true,executablePath,args:['--enable-webgl','--enable-unsafe-swiftshader']}),errors=[],report=[];
await mkdir('test-results',{recursive:true});
try{
  for(const [name,viewport]of [['desktop',{width:1280,height:800}],['portrait',{width:390,height:844}],['landscape',{width:844,height:390}]]){
    const page=await browser.newPage({viewport,deviceScaleFactor:1});
    page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    // Deterministic visual fixture: suppress only the original game's RAF, then
    // drive the production renderer and simulation at fixed steps on another canvas.
    await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;});
    await page.goto(process.env.ALBA_TEST_URL||'http://127.0.0.1:5173');
    await page.waitForFunction(()=>window.__alba&&document.getElementById('loading').hidden,null,{polling:100,timeout:60000});
    await page.evaluate(async()=>{
      const {LakeWorld}=await import('/src/world.js'),{FishingGame}=await import('/src/fishing.js');
      const canvas=document.createElement('canvas');canvas.style.cssText='position:fixed;inset:0;z-index:9999';document.body.append(canvas);
      const world=new LakeWorld(canvas);world.touchMode=innerWidth<1000;world.renderer.setPixelRatio(1);
      const events=[],game=new FishingGame({random:()=>.5,onEvent:e=>{events.push(e.type);if(e.type==='cast'){world.cast();game.setAim(world.castDirection.x,world.castDirection.z);}if(e.type==='splash')world.effects.emit(game.lure);if(e.type==='hook')world.hookFish(e.fish.speciesIndex,e.fishId);}});
      const step=seconds=>{let left=seconds;while(left>1e-8){const dt=Math.min(1/60,left);game.update(dt);world.update(dt,game);left-=dt;}};
      window.motionFixture={world,game,step,events};world.update(0,game);
    });
    const snapshot=()=>page.evaluate(()=>{const {world:w,game:g,events}=window.motionFixture;const p=w.tip.getWorldPosition(w.scratch.tip);return {...w.diagnostics(),state:g.state,castTime:g.castTime,tip:p.toArray(),distance:g.distance,power:g.power,events:[...events]};});
    const frame=async(label,seconds)=>{await page.evaluate(dt=>window.motionFixture.step(dt),seconds);const s=await snapshot();await page.screenshot({path:`test-results/art-${name}-${label}.png`});report.push({profile:name,label,...s});return s;};
    const rest=await frame('idle',.3);await page.evaluate(()=>window.motionFixture.game.press());const prepared=await frame('prepare',1);
    assert.ok(prepared.rodPitch>1.1);assert.ok(prepared.tip[1]>rest.tip[1]+1);assert.ok(prepared.tip[2]>rest.tip[2],'backswing raises the tip and moves it rearwards');
    await page.evaluate(()=>{window.motionFixture.game.release();window.motionFixture.world.update(0,window.motionFixture.game);});
    const loaded=await frame('loaded',.12);assert.equal(loaded.flightReleased,false);
    const release=await frame('release',.22);assert.equal(release.flightReleased,true);assert.ok(release.flightOrigin[1]>3);assert.ok(release.flightOrigin[2]<6);assert.ok(release.rodPitch<loaded.rodPitch);assert.ok(release.lineTipError<.001);
    const forward=await frame('follow',.22);assert.ok(forward.rodPitch<0);assert.ok(forward.tip[2]<prepared.tip[2]);
    const flight=await frame('flight',.25);assert.ok(flight.bobber[1]>.12);assert.ok(flight.bobber[2]<release.flightOrigin[2]);
    assert.ok(await page.evaluate(()=>{const w=window.motionFixture.world;return w.lureVisuals.visible&&w.leader.visible&&Math.abs(w.leaderPositions[4]-w.lureVisuals.position.y)<.001;}),'terminal leader follows the visible lure in flight');
    const impact=await frame('impact',.31);assert.equal(impact.state,'waiting');assert.equal(impact.events.filter(e=>e==='splash').length,1);
    assert.ok(impact.rippleCount>0,'impact produces a pooled water disturbance');
    const settled=await frame('settled',.8);assert.ok(Math.abs(settled.rodPitch-.04)<.03);assert.ok(settled.lineTipError<.001);
    await page.evaluate(()=>window.motionFixture.game.press());const reel=await frame('reel',.45);assert.ok(reel.reelRate>.7);assert.ok(reel.rotorAngle<settled.rotorAngle-1);
    assert.ok(reel.rippleCount>settled.rippleCount,'retrieval leaves a wake');assert.ok(reel.fishSwimPhase!==rest.fishSwimPhase);
    await page.evaluate(()=>{const {world:w,game:g}=window.motionFixture;g.reset();g.state='bite';g.hookedId=0;const f=g.school.fish[0];g.target={speciesIndex:0,name:'Trucha arcoíris',weight:f.weight,length:f.length};g.distance=18;g.castDistance=18;g.press();});
    const fight=await frame('fight',.7);assert.ok(fight.rodBend>settled.rodBend+.02);assert.ok(fight.lineTipError<.001);
    await page.evaluate(()=>{const {world:w,game:g}=window.motionFixture;g.release();g.tension=.5;g.fightTime=8;g.pullCount=3;g.stamina=.7;w.onPull(g);});
    const jump=await frame('jump',.5);assert.equal(jump.jumpCount,1);
    const jumpingY=await page.evaluate(()=>window.motionFixture.world.hookedFish.mesh.position.y);assert.ok(jumpingY>0,'eligible fish breaches the surface');
    const landing=await frame('landing',.55);assert.ok(landing.rippleCount>jump.rippleCount,'landing produces another surface disturbance');
    await page.close();
  }
  assert.deepEqual(errors,[]);await writeFile('test-results/art-animation-frames.json',JSON.stringify(report,null,2));console.log('PASS animation: overhead load, forward acceleration, elevated release, flight, impact, settle, reel and rod flex in three viewports.');
}finally{await browser.close();}
