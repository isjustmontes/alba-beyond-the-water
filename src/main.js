import './style.css';
import './phase3.css';
import { LakeWorld } from './world.js';
import { FishingGame, LURES, EQUIPMENT } from './fishing.js';
import {getLure} from './simulation/config.js';
import {migrateCatches,personalRecords,exportCatches} from './journal.js';
import {GameControls} from './input/controller.js';
import {InputMode} from './input/touch-mode.js';
import { LakeAudio } from './audio.js';

const $ = id => document.getElementById(id);
const number = (n, places = 0) => n.toLocaleString('es-ES',{ minimumFractionDigits: places, maximumFractionDigits: places });
const audio = new LakeAudio();
const storageKey = 'alba-catches-v1';
let world, game, input, inputMode, touchMode=false, toastTimer, paused = false, highQuality = true, lastTime = performance.now();
function toast(message) { $('toast').textContent = message; $('toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(()=>$('toast').classList.remove('visible'),5000); }
function fatal(error) { console.error(error); $('loading').hidden = true; $('fatal').hidden = false; $('fatal-message').textContent = `Este juego necesita un navegador con WebGL 2 y aceleración gráfica. ${error.message}`; }
function renderJournal() {
  const catches = game.catches;
  const records=personalRecords(catches);
  $('records-summary').replaceChildren();
  for(const [species,fish]of records) {
    const card=document.createElement('div'),name=document.createElement('small'),value=document.createElement('strong');
    card.className='record-card';name.textContent=species;value.textContent=`${number(fish.weight,2)} kg`;
    card.append(name,value);$('records-summary').append(card);
  }
  $('catch-count').textContent = String(catches.length).padStart(2,'0');
  $('total-weight').textContent = `${number(catches.reduce((sum,f)=>sum+f.weight,0),2)} kg en total`;
  const last = catches.at(-1);
  $('last-catch').textContent = last ? `${last.name} · ${number(last.weight,2)} kg` : 'Tu historia empieza aquí';
  $('log-list').replaceChildren();
  if (!catches.length) { const empty = document.createElement('p'); empty.className = 'empty-log'; empty.textContent = 'Todavía no hay capturas. Lanza el anzuelo y escribe tu primera historia.'; $('log-list').append(empty); }
  for (const fish of [...catches].reverse()) {
    const row = document.createElement('div'); row.className = 'log-entry';
    const info = document.createElement('span'); info.textContent = fish.name;
    const date = document.createElement('small'); date.textContent = `${new Date(fish.date).toLocaleString('es-ES')} · ${fish.length} cm`; info.append(date);
    const lure=document.createElement('small');lure.textContent=fish.lureName||'Sin registrar · captura anterior';info.append(lure);
    if(records.get(fish.name)===fish){const badge=document.createElement('small');badge.className='record-badge';badge.textContent='★ RÉCORD PERSONAL';info.append(badge);}
    const weight = document.createElement('strong'); weight.textContent = `${number(fish.weight,2)} kg`; row.append(info,weight); $('log-list').append(row);
  }
}
function renderEquipment() {
  $('equipment-toggle').textContent=`${game.lureType.name} ▾`;
  $('rod-name').textContent=EQUIPMENT.rod;$('rod-action').textContent=EQUIPMENT.action;
  $('line-name').textContent=EQUIPMENT.line;$('line-strength').textContent=`Resistencia: ${number(EQUIPMENT.lineStrengthKg,1)} kg`;
  $('lure-options').replaceChildren();
  for(const lure of LURES) {
    const button=document.createElement('button');button.className='lure-option';button.dataset.lure=lure.id;
    button.setAttribute('aria-pressed',String(game.lureId===lure.id));button.disabled=!['ready','caught'].includes(game.state);
    const title=document.createElement('strong'),description=document.createElement('span'),details=document.createElement('small'),technique=document.createElement('em');
    title.textContent=lure.name;description.textContent=lure.description;details.textContent=`${number(lure.depth,1)} m aprox. · ${lure.targets}`;technique.textContent=lure.technique;
    button.append(title,description,details,technique);button.onclick=()=>{if(game.selectLure(lure.id))$('lure-options').querySelector(`[data-lure="${lure.id}"]`)?.focus({preventScroll:true});};$('lure-options').append(button);
  }
  $('equipment-hint').textContent=['ready','caught'].includes(game.state) ? 'El señuelo elegido se guarda para el próximo lanzamiento.' : 'Recupera el aparejo antes de cambiar de señuelo.';
  $('retrieve-rig').hidden=game.state==='ready'||game.state==='caught';
}
function event(e) {
  audio.event(e.type);
  if(e.type==='splash'||e.type==='pull')world.effects.emit(game.lure,e.type==='pull' ? .6 : 1);
  if(e.type==='equipment'){renderEquipment();try{localStorage.setItem('alba-equipment-v1',game.lureId);}catch{/* Session equipment still works. */}}
  if (e.type === 'cast') {world.cast();game.setAim(world.castDirection.x,world.castDirection.z);}
  if (e.type === 'bite') toast('¡La boya se ha hundido! Pulsa para clavar.');
  if (e.type === 'hook') { world.hookFish(e.fish.speciesIndex,e.fishId); toast('¡Enganchado! Recoge y suelta para controlar la tensión.'); }
  if (e.type === 'reset') toast(e.message);
  if (e.type === 'catch') {
    world.onCatch(e.fish); renderJournal();
    try { localStorage.setItem(storageKey,JSON.stringify(game.catches)); } catch { toast('Captura registrada en esta sesión. El navegador no permite guardarla.'); }
    $('catch-name').textContent = e.fish.name;
    $('catch-detail').textContent = `${number(e.fish.weight,2)} kg  ·  ${e.fish.length} cm`;
  }
}
const messages = {
  ready: ['TODO EMPIEZA CON UN LANZAMIENTO','El lago te espera.','Mantén pulsado y suelta para lanzar.','Mantén para lanzar'],
  charging: ['PREPARANDO EL LANZAMIENTO','Encuentra tu distancia.','Suelta para enviar el cebo al agua.','Suelta para lanzar'],
  casting: ['EL SEDAL ESTÁ EN EL AIRE','Un buen comienzo.','El anzuelo va de camino.','Lanzando…'],
  waiting: ['CEBO EN EL AGUA','Escucha el silencio.','Observa la boya o recoge suavemente.','Mantén para recoger'],
  bite: ['¡UN PEZ ESTÁ PROBANDO EL CEBO!','¡Ahora, clava!','Pulsa antes de que suelte el cebo.','¡Clavar anzuelo!'],
  fighting: ['EL PEZ ESTÁ ENGANCHADO','Cada metro cuenta.','Recoge. Suelta si la tensión sube.','Mantén para recoger'],
  caught: ['CAPTURA REGISTRADA','Un momento para recordar.','Tu captura se ha guardado en el cuaderno.','¡Buena captura!']
};
function updateUI() {
  const s = game.state, fighting = s === 'fighting', values = [...messages[s]];
  if(s==='waiting'&&game.school.approaching>0)values[2]='Un pez investiga el señuelo. Evita tirones bruscos.';
  if(touchMode)values[3]={ready:'LANZAR · MANTÉN',charging:'SUELTA PARA LANZAR',casting:'LANZANDO…',waiting:'RECOGER',bite:'¡CLAVAR!',fighting:'RECOGER · MANTÉN',caught:'¡CAPTURA!'}[s];
  ['phase-label','action-title','action-hint','action-text'].forEach((id,i)=>{ if ($(id).textContent !== values[i]) $(id).textContent = values[i]; });
  const value = fighting ? game.tension : game.power;
  $('meter-fill').style.width = `${Math.min(100,value*100)}%`;
  $('meter-fill').style.background = fighting && value>.78 ? '#ef8c71' : fighting ? '#aaca9e' : '#eed5a6';
  $('meter-label').textContent = fighting ? 'TENSIÓN DEL SEDAL' : 'FUERZA DE LANZAMIENTO';
  $('meter-value').textContent = `${Math.min(100,Math.round(value*100))}%`;
  $('meter-left').textContent = fighting ? 'HOLGURA' : 'CERCA';
  $('meter-right').textContent = fighting ? 'ROTURA' : 'LEJOS';
  $('safe-zone').hidden = !fighting;
  $('distance').textContent = game.distance > 0 ? `${number(game.distance,1)} m` : '— m';
  $('bite-alert').hidden = s !== 'bite'; $('catch-banner').hidden = s !== 'caught';
  $('fight-stats').hidden = !fighting;
  if (fighting) {
    $('fight-distance').textContent = `${number(game.distance,1)} m`;
    $('stamina').textContent = `${Math.round(game.stamina*100)}%`;
    $('fish-mood').textContent = game.tension>.92 ? '¡Suelta! Tensión crítica' : game.tension<.035 ? '¡Recoge! Hay demasiada holgura' : game.surge ? '↗ El pez tira fuerte: dale margen' : '↘ El pez cede: aprovecha';
  }
  $('action').disabled = ['casting','caught'].includes(s);
  $('action').style.opacity = $('action').disabled ? '.6' : '1';
}
function clearHeld() { input?.clear(); }
function setPaused(value) {
  if (paused === value) return;
  clearHeld(); paused = value;
  if (value) $('pause-dialog').showModal(); else if ($('pause-dialog').open) $('pause-dialog').close();
  $('pause').textContent = value ? '▷' : 'Ⅱ';
}
function openDialog(id) { if(document.querySelector('dialog[open]'))return;clearHeld(); paused = true;if(id==='equipment-dialog')renderEquipment(); $(id).showModal(); }
function sound() { try { const enabled = audio.toggle(); $('sound-status').textContent = enabled ? 'ON' : 'OFF'; $('sound').setAttribute('aria-label',enabled ? 'Desactivar sonido' : 'Activar sonido'); } catch { toast('El sonido no está disponible en este navegador.'); } }
function fullscreen() { const promise = document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.(); promise?.catch(()=>toast('El navegador no permite pantalla completa.')); }
function controls() {
  input=new GameControls({canvas:$('scene'),button:$('action'),game,world,isPaused:()=>paused,onPause:setPaused,onCommand:command=>{
    if(command==='sound')sound();
    else if(command==='fullscreen')fullscreen();
    else openDialog({journal:'log-dialog',help:'help-dialog',equipment:'equipment-dialog'}[command]);
  }});
  $('pause').onclick = ()=>setPaused(!paused); $('resume').onclick = ()=>setPaused(false);
  $('help').onclick = ()=>openDialog('help-dialog'); $('open-log').onclick = ()=>openDialog('log-dialog');
  $('equipment-toggle').onclick=()=>openDialog('equipment-dialog');
  $('touch-equipment').onclick=()=>openDialog('equipment-dialog');$('touch-journal').onclick=()=>openDialog('log-dialog');
  $('retrieve-rig').onclick=()=>{clearHeld();game.reset();renderEquipment();};
  document.querySelectorAll('[data-close]').forEach(button=>button.onclick=()=>button.closest('dialog').close());
  document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('close',()=>{ paused = false; $('pause').textContent = 'Ⅱ'; }));
  $('sound').onclick = sound; $('fullscreen').onclick = fullscreen;
  $('quality').onclick = ()=>{ highQuality = !highQuality; world.setQuality(highQuality); $('quality').textContent = `GRÁFICOS: ${highQuality ? 'ALTO' : 'BAJO'}`;$('equipment-quality').textContent=`Gráficos: ${highQuality ? 'alto' : 'bajo'}`; };
  $('equipment-quality').onclick=()=>$('quality').click();
  inputMode=new InputMode(enabled=>{
    touchMode=enabled;world.touchMode=enabled;document.documentElement.classList.toggle('touch-mode',enabled);
    $('touch-controls').hidden=!enabled;$('orientation-hint').hidden=!enabled;updateUI();
  });
  $('export-log').onclick = ()=>{
    const url = URL.createObjectURL(new Blob([exportCatches(game.catches)],{type:'text/csv;charset=utf-8'}));
    const a=document.createElement('a'); a.href=url; a.download='alba-capturas.csv'; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
}
try {
  world = new LakeWorld($('scene'));
  game = new FishingGame({ onEvent:event });
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
    game.catches=migrateCatches(saved);
    game.lureId=getLure(localStorage.getItem('alba-equipment-v1')).id;
  } catch { /* Private browsing and corrupt storage must not prevent playing. */ }
  renderJournal();renderEquipment(); controls(); updateUI();
  $('scene').addEventListener('webglcontextlost',e=>{ e.preventDefault(); setPaused(true); toast('Se ha perdido la conexión con la GPU. Recarga para volver al lago.'); });
  function frame(now) {
    const dt = Math.min(.25,Math.max(0,(now-lastTime)/1000)); lastTime=now;
    if (!paused) {
      // Small simulation steps keep tension stable without slowing gameplay at low FPS.
      let remaining=dt;
      while (remaining>0) { const step=Math.min(remaining,1/60); game.update(step); remaining-=step; }
    }
    world.update(paused ? 0 : dt,game); updateUI();
    requestAnimationFrame(frame);
  }
  world.update(0,game);
  $('loading').style.opacity = '0'; setTimeout(()=>$('loading').hidden=true,800);
  requestAnimationFrame(frame);
  // Expose read-only diagnostics in development, without gameplay shortcuts.
  if (import.meta.env.DEV) window.__alba = { snapshot:()=>({ state:game.state,time:game.time,tension:game.tension,distance:game.distance,catchCount:game.catches.length,paused,lureId:game.lureId,reeling:game.reeling,touchMode,heldInputs:input.actions.sources.size,casts:game.actionCounts.casts,hooks:game.actionCounts.hooks,cameraYaw:world.yaw,cameraPitch:world.pitch,webgl:world.renderer.capabilities.isWebGL2,...world.diagnostics() }) };
} catch(error) { fatal(error); }
