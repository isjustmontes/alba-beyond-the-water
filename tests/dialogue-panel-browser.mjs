import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile,stat,readFile} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:process.env.ALBA_BROWSER_PATH||(process.platform==='win32'?'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe':undefined)});
await mkdir('test-results',{recursive:true});const report=[];
try{
 for(const [name,width,height,mobile]of [['pc',1280,800,false],['phone',390,844,true],['small-phone',320,568,true],['landscape',844,390,true],['compact-landscape',568,320,true],['tablet',1024,768,true]]){
  const context=await browser.newContext({viewport:{width,height},hasTouch:mobile,isMobile:mobile,deviceScaleFactor:1}),page=await context.newPage(),errors=[],requests=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  page.on('request',r=>requests.push(r.url()));
  await page.addInitScript(()=>{localStorage.setItem('alba-catches-v1','[{"name":"Carpa","weight":1.4}]');localStorage.setItem('alba-audio-v1','false');localStorage.setItem('alba-village-progress-v1','{"version":2,"balance":70}');});
  const tap=selector=>mobile?page.locator(selector).tap():page.locator(selector).click();
  await page.goto(`${process.env.ALBA_TEST_URL||'http://127.0.0.1:5177'}/dialogue-preview.html`);
  await page.waitForFunction(()=>document.querySelector('.alba-dialogue'));
  const saved=await page.evaluate(()=>JSON.stringify({...localStorage}));
  assert.equal(requests.filter(u=>u.includes('/assets/dialogues/')).length,0,'no artwork fetched before explicit preview');
  await tap('#preview-open');await page.waitForFunction(()=>document.querySelector('.alba-dialogue__image')?.naturalWidth>0);
  await page.waitForFunction(()=>performance.getEntriesByType('resource').some(e=>e.name.includes('dialogue-parchment.webp')&&e.responseEnd>0));
  assert.equal(await page.locator('.alba-dialogue__name').textContent(),'Manuel');assert.equal(await page.locator('.alba-dialogue__choice').count(),3);
  assert.equal(await page.locator('.alba-dialogue__choices button').count(),3);
  const box=await page.locator('.alba-dialogue').boundingBox(),close=await page.locator('.alba-dialogue__close').boundingBox();
  assert.ok(box.x>=0&&box.y>=0&&box.x+box.width<=width+1&&box.y+box.height<=height+1,`${name}: dialog fits viewport ${JSON.stringify(box)}`);
  assert.ok(close.width>=44&&close.height>=44&&close.y>=0&&close.y+close.height<=height,'close accessible');
  const portrait=await page.locator('.alba-dialogue__portrait').boundingBox(),content=await page.locator('.alba-dialogue__content').boundingBox();
  if(width>620||width>height)assert.ok(portrait.x+portrait.width<=content.x+1,'portrait stays to the left');
  else assert.ok(portrait.y+portrait.height<=content.y+1,'portrait stacks above copy in narrow portrait');
  const image=await page.locator('.alba-dialogue__image').evaluate(el=>({width:el.naturalWidth,height:el.naturalHeight,fit:getComputedStyle(el).objectFit}));
  assert.deepEqual(image,{width:760,height:1013,fit:'contain'});
  for(const choice of await page.locator('.alba-dialogue__choice').all())assert.ok((await choice.boundingBox()).height>=44,'all choices are finger-sized');
  assert.ok((await page.locator('.alba-dialogue__text').evaluate(el=>parseFloat(getComputedStyle(el).fontSize)))>=16);
  assert.equal(await page.locator('.alba-dialogue__name').evaluate(el=>document.activeElement===el),true,'initial focus stays on the visible speaker, not an offscreen choice');
  if(width>height&&height<=500)assert.equal(await page.locator('.alba-dialogue__scroll-hint').isVisible(),true,'short landscape explains that choices are below');
  await page.screenshot({path:`test-results/dialogue-${name}.png`});
  await tap('.alba-dialogue__choice:nth-child(1)');assert.equal(await page.locator('.alba-dialogue__status').isVisible(),true);assert.ok((await page.locator('#preview-status').textContent()).includes('Lago Sereno'));
  await tap('.alba-dialogue__close');await page.waitForFunction(()=>!document.querySelector('.alba-dialogue').open);
  assert.equal(await page.evaluate(()=>document.activeElement.id),'preview-open','focus returns to opener');
  await tap('#preview-open');await tap('.alba-dialogue__choice:nth-child(3)');await page.waitForFunction(()=>!document.querySelector('.alba-dialogue').open);
  await tap('#preview-open');await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('.alba-dialogue').open);
  assert.equal(await page.locator('.alba-dialogue').count(),1,'reopening reuses one dialog');
  assert.equal(await page.evaluate(()=>JSON.stringify({...localStorage})),saved,'preview never changes progress/preferences');
  assert.equal(await page.evaluate(()=>typeof window.__alba),'undefined','isolated preview never starts the game');
  assert.equal(requests.some(u=>/\/src\/(main|world)\.js/.test(u)),false,'no game module loaded');
  assert.deepEqual(errors,[]);report.push({name,width,height,result:'PASS',image,assets:requests.filter(u=>u.includes('/assets/dialogues/')).length});
  if(!mobile){
   const result=await page.evaluate(async()=>{
    const {DialoguePanel}=await import('/src/ui/dialogue-panel.js');let calls=0,closed=0;
    const panel=new DialoguePanel({onChoice:()=>calls++,onClose:()=>closed++});
    const data={speaker:{name:'<img src=x onerror=alert(1)>',role:'Otra identidad',portrait:'/assets/dialogues/manuel-portrait.webp'},text:'<b>Texto literal</b>',choices:[{id:'one',label:'<script>literal</script>'},{id:'off',label:'No disponible',disabled:true}]};
    panel.show(data);panel.choices.querySelector('button').click();const safe=!panel.name.querySelector('img')&&!panel.text.querySelector('b')&&!panel.choices.querySelector('script');
    const disabled=panel.choices.querySelectorAll('button')[1].disabled;const third=new DialoguePanel();const nested=third.show(data);third.dispose();
    panel.close();await new Promise(resolve=>setTimeout(resolve,20));panel.show(data);const count=panel.choices.children.length;panel.dispose();await new Promise(resolve=>setTimeout(resolve,20));
    return {calls,closed,safe,disabled,nested,count,remaining:document.querySelectorAll('.alba-dialogue').length};
   });
   assert.deepEqual(result,{calls:1,closed:2,safe:true,disabled:true,nested:false,count:2,remaining:1},'component supports other identities safely and without nested dialogs/listener accumulation');
  }
  await context.close();console.log(`${name}: PASS`);
 }
 // Missing artwork must leave real text/buttons and close usable, including reopen.
 const page=await browser.newPage();await page.route('**/manuel-portrait.webp',route=>route.fulfill({status:404,body:''}));
 await page.goto(`${process.env.ALBA_TEST_URL||'http://127.0.0.1:5177'}/dialogue-preview.html`);await page.locator('#preview-open').click();await page.waitForFunction(()=>!document.querySelector('.alba-dialogue__image-error').hidden);
 await page.locator('.alba-dialogue__close').click();await page.locator('#preview-open').click();assert.equal(await page.locator('.alba-dialogue__image-error').isVisible(),true);assert.equal(await page.locator('.alba-dialogue__choice').count(),3);await page.locator('.alba-dialogue__close').click();await page.close();
 const assets={};for(const file of ['manuel-portrait.webp','dialogue-parchment.webp'])assets[file]=(await stat(`public/assets/dialogues/${file}`)).size;
 assert.equal((await readFile('src/main.js','utf8')).includes('previews/dialogue-preview'),false);
 await writeFile('test-results/dialogue-report.json',JSON.stringify({profiles:report,reuse:'PASS',missingImage:'PASS (deliberate 404)',assets},null,2));
}finally{await browser.close();}
