import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {access,mkdir,writeFile} from 'node:fs/promises';
let executablePath=process.env.ALBA_BROWSER_PATH;
if(!executablePath&&process.platform==='win32'){const edge='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';try{await access(edge);executablePath=edge;}catch{/* Configured Chromium. */}}
const browser=await chromium.launch({headless:true,executablePath,args:['--enable-webgl','--enable-unsafe-swiftshader']}),errors=[],report=[];
const url=process.env.ALBA_TEST_URL||'http://127.0.0.1:5173';
await mkdir('test-results',{recursive:true});
try{
  for(const [name,viewport,mobile]of [['desktop',{width:1280,height:800},false],['mobile',{width:390,height:844},true]]){
    const context=await browser.newContext({viewport,hasTouch:mobile,isMobile:mobile,deviceScaleFactor:1}),page=await context.newPage();
    page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    await page.goto(url);await page.waitForFunction(()=>window.__alba&&document.getElementById('loading').hidden,null,{timeout:60000});
    const times=await page.evaluate(()=>new Promise(resolve=>{let last;const a=[];function f(t){if(last!==undefined)a.push(t-last);last=t;if(a.length<120)requestAnimationFrame(f);else resolve(a.sort((x,y)=>x-y));}requestAnimationFrame(f);}));
    const metrics={median:+times[60].toFixed(2),p95:+times[114].toFixed(2),...await page.evaluate(()=>window.__alba.snapshot())};
    await page.goto(`${url}/?weather=windy&transition=2`);await page.waitForFunction(()=>window.__alba?.snapshot().environment.windSpeed>4.5,null,{timeout:60000});
    await page.screenshot({path:`test-results/vegetation-${name}-lake-windy.png`});
    // Isolate the existing production plant meshes for deterministic pixel tests.
    // This fixture does not add observation hooks or alter the production game.
    const checks=await page.evaluate(async()=>{
      window.requestAnimationFrame=()=>0;
      const THREE=await import('/node_modules/.vite/deps/three.js'),{makeLandscape}=await import('/src/visuals/landscape.js'),{seedVegetationPhases}=await import('/src/visuals/vegetation-wind.js');
      let seed=72931;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
      const land=makeLandscape(rand),scene=new THREE.Scene();scene.background=new THREE.Color(0x263f3c);
      scene.add(new THREE.HemisphereLight(0xf5edda,0x425342,2));const sun=new THREE.DirectionalLight(0xffedcc,2);sun.position.set(-4,8,5);scene.add(sun);
      const floor=new THREE.Mesh(new THREE.PlaneGeometry(60,60),new THREE.MeshStandardMaterial({color:0x496247,roughness:1}));floor.rotation.x=-Math.PI/2;scene.add(floor);
      const camera=new THREE.PerspectiveCamera(40,innerWidth/innerHeight,.1,150);camera.position.set(11,7,21).multiplyScalar(Math.max(1,.85/camera.aspect));camera.lookAt(0,3,0);
      const canvas=document.createElement('canvas');canvas.style.cssText='position:fixed;inset:0;z-index:9999';document.body.append(canvas);
      const renderer=new THREE.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(1);
      renderer.toneMapping=THREE.ACESFilmicToneMapping;
      const plants=[];
      for(const [kind,sourceName,count]of [['pine','vegetation-tree-0-near',1],['spruce','vegetation-tree-1-near',1],['birch','vegetation-tree-2-near',1],['grass','vegetation-grass',45],['reed','vegetation-reeds',32]]){
        const source=land.group.getObjectByName(sourceName),mesh=new THREE.InstancedMesh(source.geometry.clone(),source.material,count),dummy=new THREE.Object3D();
        for(let i=0;i<count;i++){
          if(count===1){dummy.position.set((plants.length-1)*5,0,-4);dummy.scale.setScalar(7);dummy.rotation.set(0,.7,0);}
          else {dummy.position.set((kind==='grass'?-2:2)+rand()*3,0,2+rand()*3);dummy.scale.setScalar(1+rand()*.4);dummy.rotation.set(0,rand()*Math.PI,0);}
          dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);
        }
        seedVegetationPhases(mesh,source.material.userData.vegetationProfile);mesh.frustumCulled=false;scene.add(mesh);plants.push({kind,mesh});
      }
      const target=new THREE.WebGLRenderTarget(640,480),pixelsA=new Uint8Array(640*480*4),pixelsB=new Uint8Array(pixelsA.length),results=[];
      const read=(time,flow,into)=>{land.clock.value=time;land.wind.value.set(...flow);renderer.setRenderTarget(target);renderer.render(scene,camera);renderer.readRenderTargetPixels(target,0,0,640,480,into);renderer.setRenderTarget(null);};
      const changed=()=>{let n=0;for(let i=0;i<pixelsA.length;i+=4)if(Math.abs(pixelsA[i]-pixelsB[i])+Math.abs(pixelsA[i+1]-pixelsB[i+1])+Math.abs(pixelsA[i+2]-pixelsB[i+2])>3)n++;return n;};
      for(const plant of plants){
        for(const p of plants)p.mesh.visible=p===plant;
        read(2,[0,0],pixelsA);read(5,[0,0],pixelsB);const calmPixels=changed();
        read(2,[4.8,0],pixelsA);let windPixels=0;for(const t of [2.7,4.1,5]){read(t,[4.8,0],pixelsB);windPixels=Math.max(windPixels,changed());}
        read(2,[4.8,0],pixelsA);read(2,[-4.8,0],pixelsB);const directionPixels=changed();
        results.push({kind:plant.kind,calmPixels,windPixels,directionPixels});
      }
      for(const p of plants)p.mesh.visible=true;
      const render=time=>{land.clock.value=time;land.wind.value.set(4.8,0);renderer.render(scene,camera);};
      render(2);const memory={...renderer.info.memory},calls=renderer.info.render.calls;
      for(let i=0;i<200;i++)render(2+i/60);
      const stable=memory.geometries===renderer.info.memory.geometries&&memory.textures===renderer.info.memory.textures&&calls===renderer.info.render.calls;
      land.setQuality(false);render(5);const lowCalls=renderer.info.render.calls;
      window.vegetationFixture={render,land,renderer,scene,camera};
      return {results,stable,calls,lowCalls,memory};
    });
    await page.screenshot({path:`test-results/vegetation-${name}-patch-low.png`});
    console.log(name,JSON.stringify(checks));assert.equal(checks.stable,true,'no growing geometry/texture pools or extra draw calls');
    for(const r of checks.results){assert.equal(r.calmPixels,0,`${r.kind}: still without wind`);assert.ok(r.windPixels>10,`${r.kind}: movement is visible`);assert.ok(r.directionPixels>10,`${r.kind}: follows changing wind direction`);}
    await page.evaluate(()=>{window.vegetationFixture.land.setQuality(true);window.vegetationFixture.render(2);});
    await page.screenshot({path:`test-results/vegetation-${name}-patch-2.png`});
    await page.evaluate(()=>window.vegetationFixture.render(5));await page.screenshot({path:`test-results/vegetation-${name}-patch-5.png`});
    report.push({name,viewport,metrics,checks});await context.close();
  }
  assert.deepEqual(errors,[]);await writeFile('test-results/vegetation-browser.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{await browser.close();}
