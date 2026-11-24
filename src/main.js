import './style.css';
import { LakeWorld } from './world.js';
import { FishingGame } from './fishing.js';
import { LakeAudio } from './audio.js';

const $ = id => document.getElementById(id);
const number = (n, places = 0) => n.toLocaleString('es-ES',{ minimumFractionDigits: places, maximumFractionDigits: places });
const audio = new LakeAudio();
const storageKey = 'alba-catches-v1';
let world, game, toastTimer, paused = false, highQuality = true, pointerHeld = false, keyHeld = false, lastTime = performance.now();
function toast(message) { $('toast').textContent = message; $('toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(()=>$('toast').classList.remove('visible'),5000); }
function fatal(error) { console.error(error); $('loading').hidden = true; $('fatal').hidden = false; $('fatal-message').textContent = `Este juego necesita un navegador con WebGL 2 y aceleración gráfica. ${error.message}`; }
function renderJournal() {
  const catches = game.catches;
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
    const weight = document.createElement('strong'); weight.textContent = `${number(fish.weight,2)} kg`; row.append(info,weight); $('log-list').append(row);
  }
}
function event(e) {
  audio.event(e.type);
  if (e.type === 'cast') world.cast();
  if (e.type === 'bite') toast('¡La boya se ha hundido! Pulsa para clavar.');
  if (e.type === 'hook') { world.hookFish(e.fish.speciesIndex); toast('¡Enganchado! Recoge y suelta para controlar la tensión.'); }
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
  waiting: ['CEBO EN EL AGUA','Escucha el silencio.','Observa la boya. La picada llegará.','Esperando picada…'],
  bite: ['¡UN PEZ ESTÁ PROBANDO EL CEBO!','¡Ahora, clava!','Pulsa antes de que suelte el cebo.','¡Clavar anzuelo!'],
  fighting: ['EL PEZ ESTÁ ENGANCHADO','Cada metro cuenta.','Recoge. Suelta si la tensión sube.','Mantén para recoger'],
  caught: ['CAPTURA REGISTRADA','Un momento para recordar.','Tu captura se ha guardado en el cuaderno.','¡Buena captura!']
};
function updateUI() {
  const s = game.state, fighting = s === 'fighting', values = messages[s];
  ['phase-label','action-title','action-hint','action-text'].forEach((id,i)=>{ if ($(id).textContent !== values[i]) $(id).textContent = values[i]; });
  const value = fighting ? game.tension : game.power;
  $('meter-fill').style.width = `${Math.min(100,value*100)}%`;
  $('meter-fill').style.background = fighting && value>.78 ? '#ef8c71' : fighting ? '#aaca9e' : '#eed5a6';
  $('meter-label').textContent = fighting ? 'TENSIÓN DEL SEDAL' : 'FUERZA DE LANZAMIENTO';
  $('meter-value').textContent = `${Math.round(value*100)}%`;
  $('meter-left').textContent = fighting ? 'HOLGURA' : 'CERCA';
  $('meter-right').textContent = fighting ? 'ROTURA' : 'LEJOS';
  $('safe-zone').hidden = !fighting;
  $('distance').textContent = game.distance > 0 ? `${number(game.distance,1)} m` : '— m';
  $('bite-alert').hidden = s !== 'bite'; $('catch-banner').hidden = s !== 'caught';
  $('fight-stats').hidden = !fighting;
  if (fighting) {
    $('fight-distance').textContent = `${number(game.distance,1)} m`;
    $('stamina').textContent = `${Math.round(game.stamina*100)}%`;
    $('fish-mood').textContent = game.tension<.035 ? '¡Recoge! Hay demasiada holgura' : game.surge ? '↗ El pez tira fuerte: dale margen' : '↘ El pez cede: aprovecha';
  }
  $('action').disabled = ['casting','waiting','caught'].includes(s);
  $('action').style.opacity = $('action').disabled ? '.6' : '1';
}
function press() { if (!paused) game.press(); }
function release() { if (!pointerHeld && !keyHeld) game.release(); }
function clearHeld() { pointerHeld = false; keyHeld = false; game.release(); }
function setPaused(value) {
  if (paused === value) return;
  clearHeld(); paused = value;
  if (value) $('pause-dialog').showModal(); else if ($('pause-dialog').open) $('pause-dialog').close();
  $('pause').textContent = value ? '▷' : 'Ⅱ';
}
function openDialog(id) { clearHeld(); paused = true; $(id).showModal(); }
function sound() { try { const enabled = audio.toggle(); $('sound-status').textContent = enabled ? 'ON' : 'OFF'; $('sound').setAttribute('aria-label',enabled ? 'Desactivar sonido' : 'Activar sonido'); } catch { toast('El sonido no está disponible en este navegador.'); } }
function fullscreen() { const promise = document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.(); promise?.catch(()=>toast('El navegador no permite pantalla completa.')); }
function controls() {
  let looking = false, prevX = 0, prevY = 0;
  for (const el of [$('scene'),$('action')]) {
    el.addEventListener('pointerdown',e=>{
      if (e.button === 2 && el === $('scene')) { looking = true; prevX = e.clientX; prevY = e.clientY; el.setPointerCapture(e.pointerId); e.preventDefault(); return; }
      if (e.button !== 0 || paused) return;
      e.preventDefault(); el.setPointerCapture(e.pointerId); pointerHeld = true; press();
    });
    el.addEventListener('pointerup',e=>{ if (e.button===2) looking=false; else { pointerHeld = false; release(); } });
    el.addEventListener('pointercancel',()=>{ pointerHeld = false; looking = false; release(); });
    el.addEventListener('lostpointercapture',()=>{ pointerHeld = false; looking = false; release(); });
    el.addEventListener('contextmenu',e=>e.preventDefault());
  }
  $('scene').addEventListener('pointermove',e=>{ if (looking && !paused) { world.look(e.clientX-prevX,e.clientY-prevY); prevX=e.clientX; prevY=e.clientY; } });
  // Keyboard activation for the on-screen control, without double-triggering Space.
  $('action').addEventListener('keydown',e=>{ if (e.code==='Enter' && !e.repeat) { e.preventDefault(); pointerHeld=true; press(); } });
  $('action').addEventListener('keyup',e=>{ if (e.code==='Enter') { pointerHeld=false; release(); } });
  addEventListener('keydown',e=>{
    if (e.code === 'Space') { e.preventDefault(); if (!e.repeat) { keyHeld = true; press(); } return; }
    if (e.repeat) return;
    if (e.code === 'KeyP' && !document.querySelector('dialog[open]:not(#pause-dialog)')) setPaused(!paused);
    if (e.code === 'KeyR' && !paused) { clearHeld(); game.reset(); }
    if (e.code === 'KeyM') sound();
    if (e.code === 'KeyF') fullscreen();
    if (e.code === 'KeyJ' && !paused) openDialog('log-dialog');
    if (e.code === 'KeyH' && !paused) openDialog('help-dialog');
  });
  addEventListener('keyup',e=>{ if (e.code==='Space') { keyHeld = false; release(); } });
  addEventListener('blur',()=>{ clearHeld(); if (!paused) setPaused(true); });
  document.addEventListener('visibilitychange',()=>{ if (document.hidden && !paused) setPaused(true); });
  $('pause').onclick = ()=>setPaused(!paused); $('resume').onclick = ()=>setPaused(false);
  $('help').onclick = ()=>openDialog('help-dialog'); $('open-log').onclick = ()=>openDialog('log-dialog');
  document.querySelectorAll('[data-close]').forEach(button=>button.onclick=()=>button.closest('dialog').close());
  document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('close',()=>{ paused = false; $('pause').textContent = 'Ⅱ'; }));
  $('sound').onclick = sound; $('fullscreen').onclick = fullscreen;
  $('quality').onclick = ()=>{ highQuality = !highQuality; world.setQuality(highQuality); $('quality').textContent = `GRÁFICOS: ${highQuality ? 'ALTO' : 'BAJO'}`; };
  $('export-log').onclick = ()=>{
    const rows = ['Especie;Peso (kg);Longitud (cm);Fecha',...game.catches.map(f=>`${f.name};${number(f.weight,2)};${f.length};${f.date}`)];
    const url = URL.createObjectURL(new Blob(['\uFEFF'+rows.join('\r\n')],{type:'text/csv;charset=utf-8'}));
    const a=document.createElement('a'); a.href=url; a.download='alba-capturas.csv'; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
}
try {
  world = new LakeWorld($('scene'));
  game = new FishingGame({ onEvent:event });
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (Array.isArray(saved)) game.catches = saved.filter(f=>Number.isFinite(f.weight) && f.weight>0 && Number.isFinite(f.length) && typeof f.name==='string' && typeof f.date==='string' && Number.isFinite(Date.parse(f.date))).slice(-1000);
  } catch { /* Private browsing and corrupt storage must not prevent playing. */ }
  renderJournal(); controls(); updateUI();
  $('scene').addEventListener('webglcontextlost',e=>{ e.preventDefault(); setPaused(true); toast('Se ha perdido la conexión con la GPU. Recarga para volver al lago.'); });
  function frame(now) {
    const dt = Math.min(.25,Math.max(0,(now-lastTime)/1000)); lastTime=now;
    if (!paused) {
      const nearby = world.nearby();
      // Small simulation steps keep tension stable without slowing gameplay at low FPS.
      let remaining=dt;
      while (remaining>0) { const step=Math.min(remaining,1/60); game.update(step,nearby); remaining-=step; }
    }
    world.update(paused ? 0 : dt,game); updateUI();
    requestAnimationFrame(frame);
  }
  world.update(0,game);
  $('loading').style.opacity = '0'; setTimeout(()=>$('loading').hidden=true,800);
  requestAnimationFrame(frame);
  // Expose read-only diagnostics in development, without gameplay shortcuts.
  if (import.meta.env.DEV) window.__alba = { snapshot:()=>({ state:game.state,time:game.time,tension:game.tension,distance:game.distance,catchCount:game.catches.length,paused,webgl:world.renderer.capabilities.isWebGL2,drawCalls:world.renderer.info.render.calls }) };
} catch(error) { fatal(error); }
