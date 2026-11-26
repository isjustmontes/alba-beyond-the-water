import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const stage=process.argv[2]||'candidate',results=[];
await mkdir('test-results',{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',args:['--enable-webgl','--enable-unsafe-swiftshader']});
try{
for(const [name,width,height,mobile]of [['pc',1280,800,false],['phone',390,844,true],['landscape',844,390,true]]){
 const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1,isMobile:mobile,hasTouch:mobile}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.route('**/m09-scene',r=>r.fulfill({contentType:'text/html',body:'<style>body{margin:0}canvas{display:block}</style><canvas id="c"></canvas><script type="module">import {LakeWorld} from "/src/world.js";import {FishingGame} from "/src/fishing.js";window.world=new LakeWorld(document.getElementById("c"));window.game=new FishingGame();world.setZone("anglers-village");world.setExploring(true);world.touchMode='+mobile+';world.setQuality('+!mobile+');window.ready=true;</script>'}));
 await page.goto((process.env.ALBA_TEST_URL||'http://127.0.0.1:5175')+'/m09-scene');await page.waitForFunction(()=>window.ready);
 const stats=await page.evaluate(async()=>{
  const {villageHeight}=await import('/src/village-layout.js');const w=window.world,g=window.game;
  g.environment.clock.totalHours=9;w.pitch=-.06;
  const pose=(x,z,yaw)=>{w.camera.position.set(x,villageHeight(x,z)+1.7,z);w.yaw=yaw;w.setView();};
  pose(0,17,0);for(let i=0;i<30;i++){g.time=i/60;w.update(1/60,g);await new Promise(requestAnimationFrame);}
  const samples=[],cpu=[];
  for(let i=0;i<120;i++){
   const start=performance.now();g.time=(i+30)/60;w.update(1/60,g);cpu.push(performance.now()-start);
   await new Promise(requestAnimationFrame);samples.push(performance.now()-start);
  }
  samples.sort((a,b)=>a-b);cpu.sort((a,b)=>a-b);const diag=w.diagnostics();
  const resources=[];for(let i=0;i<5;i++){w.setZone('lago-sereno');w.update(0,g);w.setZone('anglers-village');w.update(0,g);resources.push({...w.renderer.info.memory});}
  pose(0,17,0);w.update(0,g);window.m09Pose=pose;
  const source=w.landscape.group.getObjectByName('vegetation-tree-2-near');
  const treeAtlas=w.village.scene.children.filter(o=>o.name==='village-oaks'||o.name==='village-chestnuts').map(o=>({count:o.count,frames:[...new Set(o.geometry.attributes.villageTreeFrame.array)],size:[o.material.map.image.width,o.material.map.image.height],isolated:o.geometry!==source.geometry&&o.material!==source.material&&o.material.map!==source.material.map}));
  return {median:samples[60],p95:samples[114],cpuMedian:cpu[60],cpuP95:cpu[114],drawCalls:diag.drawCalls,triangles:diag.triangles,resources,treeAtlas,lakeIsolated:!source.geometry.attributes.villageTreeFrame&&!source.material.customProgramCacheKey().includes('village-crowns')};
 });
 await page.screenshot({path:`test-results/m09-${stage}-${name}.png`});
 if(stage==='candidate'){
  await page.evaluate(()=>{m09Pose(-3,12,-.8);world.update(0,game);});await page.screenshot({path:`test-results/m09-${stage}-${name}-edge.png`});
  await page.evaluate(()=>{world.pitch=.12;m09Pose(-6,6.5,.55);world.update(0,game);});await page.screenshot({path:`test-results/m09-${stage}-${name}-materials.png`});
  for(const [direction,yaw]of [['east',-Math.PI/2],['south',Math.PI],['west',Math.PI/2]]){
   await page.evaluate(yaw=>{world.pitch=-.015;m09Pose(0,12,yaw);world.update(0,game);},yaw);await page.screenshot({path:`test-results/m09-${stage}-${name}-${direction}.png`});
  }
 }
 assert.deepEqual(errors,[]);assert.deepEqual(stats.resources[4],stats.resources[1]);
 assert.equal(stats.lakeIsolated,true);assert.equal(stats.treeAtlas.reduce((n,t)=>n+t.count,0),38);
 for(const trees of stats.treeAtlas){assert.equal(trees.isolated,true);assert.equal(trees.frames.length,2);assert.deepEqual(trees.size,[512,1024]);}
 results.push({name,width,height,quality:mobile?'low':'high',...stats,errors});console.log(stage,name,JSON.stringify(stats));await page.close();
}
await mkdir('test-results',{recursive:true});await writeFile(`test-results/m09-${stage}.json`,JSON.stringify(results,null,2));
}finally{await browser.close();}
