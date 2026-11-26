import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:process.env.ALBA_BROWSER_PATH||(process.platform==='win32'?'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe':undefined),args:['--enable-webgl','--enable-unsafe-swiftshader']});
const errors=[],report=[];await mkdir('test-results',{recursive:true});
try{
  for(const [profile,width,height,mobile]of [['desktop',1280,800,false],['portrait',390,844,true],['landscape',844,390,true],['tablet',1024,768,true]]){
    const page=await browser.newPage({viewport:{width,height},hasTouch:mobile,isMobile:mobile,deviceScaleFactor:1});
    page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;});
    await page.goto(process.env.ALBA_TEST_URL||'http://127.0.0.1:5174');
    await page.waitForFunction(()=>window.__alba&&document.getElementById('loading').hidden,null,{polling:100});
    await page.evaluate(async mobile=>{
      const {LakeWorld}=await import('/src/world.js'),{FishingGame}=await import('/src/fishing.js');
      const {Exploration,ExplorationControls}=await import('/src/input/exploration.js'),route=await import('/src/input/shore-route.js');
      const THREE=await import('/node_modules/.vite/deps/three.js');
      const canvas=document.createElement('canvas');canvas.style.cssText='position:fixed;inset:0;z-index:9999';document.body.append(canvas);
      const world=new LakeWorld(canvas);world.touchMode=mobile;world.renderer.setPixelRatio(1);if(mobile)world.setQuality(false);
      const game=new FishingGame({random:()=>.5,onEvent:e=>{if(e.type==='cast'){world.cast();game.setAim(world.castDirection.x,world.castDirection.z);}}});
      const motion=new Exploration();motion.obstacles=world.landscape.walkObstacles;motion.toggle('ready',0,0);world.exploring=true;world.rod.visible=false;
      const stick=document.createElement('div');stick.style.cssText='position:fixed;left:20px;bottom:80px;width:114px;height:114px;z-index:10000;touch-action:none';document.body.append(stick);
      new ExplorationControls({motion,world,canvas,joystick:stick,toggle:()=>{},isPaused:()=>false});
      const render=()=>{world.camera.position.set(motion.x,motion.floor+1.7,motion.z);world.setView();world.update(1/60,game);};
      const ray=new THREE.Raycaster(),down=new THREE.Vector3(0,-1,0),top=new THREE.Vector3();
      const go=(x,z)=>{
        let steps=0;while(Math.hypot(motion.x-x,motion.z-z)>.05&&steps++<2000){
          world.yaw=Math.atan2(-(x-motion.x),-(z-motion.z));motion.update(1/60,world.yaw);
          if(route.walkHeight(motion.x,motion.z)===null)throw new Error('left walkable surface');
        }
        if(steps>=2000)throw new Error(`blocked at ${x},${z}`);render();
        ray.set(top.set(motion.x,200,motion.z),down);
        const surfaces=world.landscape.group.children.filter(m=>m.isMesh&&!m.isInstancedMesh&&m.visible&&m.geometry.type==='BufferGeometry');
        surfaces.push(...world.scene.children.filter(m=>m.isInstancedMesh&&m.geometry.parameters.width===4.8));
        const ground=ray.intersectObjects(surfaces)[0];
        if(!ground||Math.abs(ground.point.y-motion.floor)>.2)throw new Error(`ground mismatch at ${x},${z}: ${ground?.point.y} vs ${motion.floor}`);
        return {x:motion.x,z:motion.z,floor:motion.floor,ground:ground.point.y,steps};
      };
      render();
      // Actual instance bases must stay outside the route (important obstacle collision).
      const matrix=new THREE.Matrix4(),p=new THREE.Vector3(),scale=new THREE.Vector3(),q=new THREE.Quaternion();
      for(const mesh of world.landscape.group.children.filter(m=>m.isInstancedMesh&&(m.name.startsWith('vegetation-tree')||m.count===130))){
        for(let i=0;i<mesh.count;i++){
          mesh.getMatrixAt(i,matrix);matrix.decompose(p,q,scale);
          if(p.z<12.8||p.z>77.3)continue;
          const radius=mesh.name.startsWith('vegetation-tree')?.4:Math.max(scale.x,scale.z)*1.15;
          if(route.pathDistance(p.x,p.z)<1.35+radius)throw new Error(`obstacle intrudes on trail at ${p.x},${p.z}`);
        }
      }
      const castChecks=[];
      for(const [x,yaw]of [[-7,-.2],[7,.2]]){
        motion.x=x;motion.z=20;world.yaw=yaw;world.pitch=-.065;render();
        const valid=world.canCastFromBank(x,20,yaw,.4,game.environment.weather);
        const land=world.canCastFromBank(x,20,Math.PI,.4,game.environment.weather);
        castChecks.push({x,yaw,valid,land});
        if(!valid||land)throw new Error(`geometry guard ${JSON.stringify(castChecks)}`);
      }
      motion.x=0;motion.z=7;world.yaw=0;render();
      window.shoreFixture={world,game,motion,route,render,go,canvas,castChecks};
    },mobile);
    const cdp=await page.context().newCDPSession(page);
    const hold=async()=>{if(mobile)await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:77,y:height-80-57-42,radiusX:5,radiusY:5,force:1}]});else await page.keyboard.down('w');};
    const release=async()=>{if(mobile)await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});else await page.keyboard.up('w');};
    // Deterministic motion fixture: actual WASD/joystick adapter, fixed simulation steps,
    // camera heading steered by the test, render only on arrival to keep GPU work bounded.
    const legs=[];
    for(let i=0;i<9;i++){
      await hold();const leg=await page.evaluate(i=>{const f=window.shoreFixture;return f.go(...f.route.SHORE_PATH[i]);},i);await release();legs.push(leg);
      await page.evaluate(()=>shoreFixture.motion.clear());
      if([2,4,8].includes(i)){
        await page.evaluate(i=>{const f=shoreFixture;f.world.yaw=i===2?.65:i===4?-.65:0;f.render();},i);
        await page.screenshot({path:`test-results/shore-${profile}-stop-${i}.png`});
      }
    }
    for(let i=7;i>=0;i--){await hold();await page.evaluate(i=>shoreFixture.go(...shoreFixture.route.SHORE_PATH[i]),i);await release();await page.evaluate(()=>shoreFixture.motion.clear());}
    await hold();await page.evaluate(()=>shoreFixture.go(0,7));await release();
    // Exercise the actual production fishing origin, line rendering and reel at all posts.
    const posts=[];
    for(let i=0;i<3;i++){
      const result=await page.evaluate(i=>{
        const f=shoreFixture,s=f.route.FISHING_SPOTS[i];f.motion.clear();f.motion.mode='exploring';f.motion.x=s.x;f.motion.z=s.z;
        const error=f.motion.toggle('ready',s.yaw,0);if(error)throw new Error(error);
        f.game.reset();f.game.setOrigin(s.originX,s.originZ);f.world.exploring=false;f.world.rod.visible=true;f.world.yaw=s.yaw;f.world.pitch=-.065;
        f.game.press();f.game.update(.4);f.game.release();
        for(let j=0;j<80;j++){f.game.update(1/60);f.render();}
        const distance=f.game.distance;f.game.press();for(let j=0;j<20;j++){f.game.update(1/60);f.render();}
        return {id:s.id,state:f.game.state,origin:{...f.game.origin},lure:{...f.game.lure},distance:f.game.distance,retrieved:f.game.distance<distance,...f.world.diagnostics()};
      },i);
      assert.ok(result.retrieved);assert.ok(result.lineTipError<.001);assert.ok(result.reelRate>0);
      await page.screenshot({path:`test-results/shore-${profile}-fishing-${i}.png`});posts.push(result);
    }
    const resources=await page.evaluate(()=>{const w=shoreFixture.world;return {...w.renderer.info.memory,drawCalls:w.renderer.info.render.calls,triangles:w.renderer.info.render.triangles};});
    report.push({profile,mobile,legs,posts,resources});await page.close();
  }
  assert.deepEqual(errors,[]);await writeFile('test-results/shore-browser.json',JSON.stringify(report,null,2));console.log('PASS shore route: actual WASD/touch adapter, fixed-step outbound/return, mainland connection, three fishing origins and retrieval; four emulated profiles, no JS/shader errors.');
}finally{await browser.close();}
