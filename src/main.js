import './style.css';
import './phase3.css';
import './phase4.css';
import './phase5.css';
import './mobile-hud.css';
import './exploration.css';
import './shop.css';
import './zone-map.css';
import './ui/dialogue-panel.css';
import {DialoguePanel} from './ui/dialogue-panel.js';
import {ManuelConversation,nearManuel} from './dialogues/manuel.js';
import {Conversation} from './dialogues/conversation.js';
import {SHOPKEEPER,SHOPKEEPER_NODES,nearShopkeeper} from './dialogues/shopkeeper.js';
import {renderZoneMap} from './zone-map.js';
import {VillageShop} from './shop.js';
import {ShopPanel} from './shop-panel.js';
import {Exploration,ExplorationControls,WALK,bindModeToggle} from './input/exploration.js';
import {walkHeight} from './input/shore-route.js';
import {villageWalkHeight,nearVillageShop} from './village-layout.js';
import {Environment,WEATHER,formatHour} from './simulation/environment.js';
import { LakeWorld } from './world.js';
import {ZoneManager} from './zones.js';
import { FishingGame, LURES, EQUIPMENT } from './fishing.js';
import {getLure} from './simulation/config.js';
import {migrateCatches,personalRecords,exportCatches,captureConditions} from './journal.js';
import {GameControls} from './input/controller.js';
import {InputMode} from './input/touch-mode.js';
import { LakeAudio } from './audio.js';

const $ = id => document.getElementById(id);
const number = (n, places = 0) => n.toLocaleString('es-ES',{ minimumFractionDigits: places, maximumFractionDigits: places });
const audio = new LakeAudio();
const storageKey = 'alba-catches-v1';
let world, game, input, inputMode, shop, shopPanel, touchMode=false, toastTimer, paused = false, highQuality = true, lastTime = performance.now();
const exploration=new Exploration();let walkControls,zones,travelButton,dialoguePanel,characters,activeCharacter,pendingDialogueMenu=null;
const zoneHeight=(id,x,z)=>id==='anglers-village'?villageWalkHeight(x,z):walkHeight(x,z,world.landscape.walkObstacles);
const atShop=()=>zones.zoneId==='anglers-village'&&exploration.mode==='exploring'&&nearVillageShop(exploration.x,exploration.z);
const atManuel=()=>nearManuel({zone:zones.zoneId,mode:exploration.mode,state:game.state,grounded:exploration.grounded,x:exploration.x,z:exploration.z});
const atShopkeeper=()=>nearShopkeeper({zone:zones.zoneId,mode:exploration.mode,state:game.state,grounded:exploration.grounded,x:exploration.x,z:exploration.z});
const nearbyCharacter=()=>characters.find(character=>character.isNear());
function renderConversation(){
  return dialoguePanel.show({speaker:activeCharacter.speaker,...activeCharacter.conversation.view()});
}
function talkToCharacter(character){
  if(paused||document.querySelector('dialog[open]')||!character?.isNear())return;
  clearHeld();paused=true;activeCharacter=character;activeCharacter.conversation.reset();
  if(!renderConversation()){paused=false;activeCharacter=null;}
}
function interact(){if(paused)return;const character=nearbyCharacter();if(character)talkToCharacter(character);else if(atShop())openDialog('shop-dialog');else travel();}
function travel(){
  if(paused||exploration.mode!=='exploring'||game.state!=='ready'||!exploration.grounded)return;
  const exit=zones.nearbyExit(exploration.x,exploration.z);if(!exit)return;
  const plan=zones.prepareExit(exit.id);
  // Build before committing the session transition; a construction error cannot strand the player.
  if(plan.to==='anglers-village'&&!world.village){
    try{world.setZone(plan.to);world.activeZone=zones.zoneId;}catch(error){console.error(error);toast('No se pudo abrir la aldea. Sigues en el lago.');return;}
  }
  const result=zones.travel(exit.id,{position:{x:exploration.x,y:world.camera.position.y,z:exploration.z},yaw:world.yaw,pitch:world.pitch},{mode:exploration.mode,state:game.state,heightAt:zoneHeight});
  if(!result)return;
  clearHeld();world.setZone(result.to);exploration.heightAt=(x,z)=>zoneHeight(zones.zoneId,x,z);
  exploration.x=result.spawn.position.x;exploration.z=result.spawn.position.z;
  world.yaw=result.spawn.yaw;world.pitch=result.spawn.pitch;world.viewPitchTarget=null;world.setView();
  world.camera.position.set(exploration.x,exploration.floor+WALK.eye,exploration.z);
  document.documentElement.dataset.zone=result.to;$('mode-toggle').hidden=result.to!=='lago-sereno';
  const zoneName=result.to==='anglers-village'?'ALDEA':'LAGO SERENO';$('location-name').textContent=zoneName;$('mobile-zone-name').textContent=zoneName;
  toast(result.to==='anglers-village'?'Aldea · Acércate a ARTES DE PESCA para preparar tu equipo.':'De vuelta en Lago Sereno.');
}
function toast(message) { $('toast').textContent = message; $('toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(()=>$('toast').classList.remove('visible'),5000); }
function fatal(error) { console.error(error); $('loading').hidden = true; $('fatal').hidden = false; $('fatal-message').textContent = `Este juego necesita un navegador con WebGL 2 y aceleración gráfica. ${error.message}`; }
function equipItem(id){
  if(!['ready','caught'].includes(game.state))return {ok:false,message:'Recupera el aparejo antes de cambiar tu equipo.'};
  const result=shop.equip(id);
  if(!result.ok){
    // Unreadable commerce data must not remove the legacy fishing experience.
    if(shop.blocked&&LURES.some(lure=>lure.id===id)&&game.selectLure(id))return {ok:true,message:'Señuelo seleccionado sólo para esta sesión; no se pudo guardar el progreso comercial.'};
    toast(result.message);return result;
  }
  if(LURES.some(lure=>lure.id===id))game.selectLure(id);
  else renderEquipment();
  return result;
}
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
    const conditions=document.createElement('small');conditions.className='capture-conditions';conditions.textContent=captureConditions(fish);info.append(conditions);
    if(records.get(fish.name)===fish){const badge=document.createElement('small');badge.className='record-badge';badge.textContent='★ RÉCORD PERSONAL';info.append(badge);}
    const weight = document.createElement('strong'); weight.textContent = `${number(fish.weight,2)} kg`; row.append(info,weight); $('log-list').append(row);
  }
}
function renderEquipment() {
  let inventory=$('inventory-summary');
  if(!inventory){inventory=document.createElement('p');inventory.id='inventory-summary';$('equipment-dialog').querySelector('.equipment-specs').after(inventory);}
  inventory.textContent=shop.blocked?'Tienda no disponible; tu equipo anterior sigue disponible.':`Saldo: ${shop.balance} créditos · Existencias guardadas; el equipo no se consume al pescar.`;
  $('hands-toggle').checked=world.hands.enabled;$('hands-toggle').disabled=!world.hands.available;
  $('hands-status').textContent=world.hands.available ? 'Modelo validado. Ajuste opcional.' : 'Sin modelo validado. Desactivado.';
  $('equipment-toggle').textContent=`${game.lureType.name} ▾`;
  $('rod-name').textContent=EQUIPMENT.rod;$('rod-action').textContent=EQUIPMENT.action;
  $('line-name').textContent=EQUIPMENT.line;$('line-strength').textContent=`Resistencia: ${number(EQUIPMENT.lineStrengthKg,1)} kg · Existencias: ${shop.count('line')} · Montado: unidad ${shop.equipment.lineUnit}`;
  let mount=$('mount-line');if(!mount){mount=document.createElement('button');mount.id='mount-line';mount.className='secondary-button';mount.textContent='Montar recambio de sedal';$('line-strength').after(mount);}
  mount.disabled=!!shop.blocked||!['ready','caught'].includes(game.state);mount.onclick=()=>{const result=equipItem('line');$('equipment-hint').textContent=result.message;};
  $('lure-options').replaceChildren();
  for(const lure of LURES) {
    const button=document.createElement('button');button.className='lure-option';button.dataset.lure=lure.id;
    button.setAttribute('aria-pressed',String(game.lureId===lure.id));button.disabled=!['ready','caught'].includes(game.state);
    const title=document.createElement('strong'),description=document.createElement('span'),details=document.createElement('small'),technique=document.createElement('em');
    title.textContent=lure.name;description.textContent=lure.description;details.textContent=`${number(lure.depth,1)} m aprox. · ${lure.targets} · Existencias: ${shop.count(lure.id)}`;technique.textContent=lure.technique;
    button.append(title,description,details,technique);button.onclick=()=>{const result=equipItem(lure.id);if(result.ok)$('lure-options').querySelector(`[data-lure="${lure.id}"]`)?.focus({preventScroll:true});$('equipment-hint').textContent=result.message;};$('lure-options').append(button);
  }
  $('equipment-hint').textContent=['ready','caught'].includes(game.state) ? 'El señuelo elegido se guarda para el próximo lanzamiento.' : 'Recupera el aparejo antes de cambiar de señuelo.';
  $('retrieve-rig').hidden=game.state==='ready'||game.state==='caught';
}
function event(e) {
  audio.event(e.type);
  if(e.type==='splash'||e.type==='pull'||e.type==='bite')world.effects.emit(game.lure,e.type==='bite' ? .25 : e.type==='pull' ? .4 : .45+game.power*.45);
  if(e.type==='pull')world.onPull(game);
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
let environmentUIAt=-1;
function updateUI() {
  if(game.time>=environmentUIAt){
    environmentUIAt=game.time+.5;const e=game.environment,w=e.weather;
    $('lake-time').textContent=formatHour(e.clock.hour);$('environment-time').textContent=formatHour(e.clock.hour);
    $('environment-icon').textContent=w.state==='clear'&&e.daylight<.2 ? '☾' : WEATHER[w.state].icon;
    $('environment-weather').textContent=w.name+(w.transition<1 ? ' · cambiando' : '');
    $('environment-water').textContent=`Agua ${number(e.water.surface,1)} °C`;
    $('environment-wind').textContent=`Viento ${w.windLabel} · ${number(w.wind*3.6,0)} km/h`;
    $('environment-period').textContent=e.clock.period;
    audio.update(e,game.time);
  }
  const s = game.state, fighting = s === 'fighting', values = [...messages[s]];
  if(document.documentElement.dataset.fishingState!==s)document.documentElement.dataset.fishingState=s;
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
function clearHeld() { input?.clear();walkControls?.clear();if(document.pointerLockElement)document.exitPointerLock(); }
function setPaused(value) {
  if (paused === value) return;
  clearHeld(); paused = value;
  if (value) $('pause-dialog').showModal(); else if ($('pause-dialog').open) $('pause-dialog').close();
  $('pause').textContent = value ? '▷' : 'Ⅱ';
}
function openDialog(id) { if(document.querySelector('dialog[open]'))return;clearHeld(); paused = true;if(id==='equipment-dialog')renderEquipment();if(id==='shop-dialog')shopPanel.render(); $(id).showModal(); }
function toggleMap(){
  if($('map-dialog').open){$('map-dialog').close();return;}
  if(paused||document.querySelector('dialog[open]'))return;
  openDialog('map-dialog');
  const data=renderZoneMap($('zone-map'),{zoneId:zones.zoneId,x:exploration.x,z:exploration.z,yaw:world.yaw,obstacles:world.landscape.waterObstacles});
  $('map-title').textContent=data.name;$('map-legend').replaceChildren();
  for(const point of data.points){const item=document.createElement('li');item.textContent=point.name;$('map-legend').append(item);}
  $('zone-map').setAttribute('aria-label',`Mapa de ${data.name}. Estás en ${exploration.x.toFixed(0)}, ${exploration.z.toFixed(0)}; la flecha indica tu orientación.`);
}
function showMobileInfo() {
  // Snapshot the existing HUD while paused; no second simulation or saved data.
  const text=ids=>ids.map(id=>$(id).textContent).join(' · ');
  $('mobile-info-state').textContent=text(['phase-label','action-title','action-hint']);
  $('mobile-info-fight').textContent=game.state==='fighting' ? `Distancia ${$('distance').textContent} · Resistencia ${$('stamina').textContent} · ${$('fish-mood').textContent}` : text(['distance','equipment-toggle']);
  $('mobile-info-environment').textContent=text(['environment-time','environment-weather','environment-period','environment-water','environment-wind']);
  $('mobile-info-catches').textContent=`${$('catch-count').textContent} capturas · ${text(['total-weight','last-catch'])}`;
  openDialog('mobile-hud-dialog');
}
function renderSound() {const label=audio.enabled ? 'Desactivar sonido' : 'Activar sonido';$('sound-status').textContent=audio.enabled ? 'ON' : 'OFF';$('sound').setAttribute('aria-label',label);$('sound').title=`${label} (N)`;}
function sound() { try { audio.toggle(); } catch { toast('El sonido no está disponible en este navegador.'); } finally {renderSound();} }
function fullscreen() { const promise = document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.(); promise?.catch(()=>toast('El navegador no permite pantalla completa.')); }
function controls() {
  renderSound();
  characters=[
    {id:'manuel',isNear:atManuel,location:'Banco de la plaza',speaker:{name:'Manuel',role:'Vecino de la aldea · Pescador de toda la vida',portrait:`${import.meta.env.BASE_URL}assets/dialogues/manuel-portrait.webp`,alt:'Manuel, pescador veterano de la aldea, en acuarela'},conversation:new ManuelConversation(game.environment)},
    {id:SHOPKEEPER.id,isNear:atShopkeeper,location:'',speaker:{name:SHOPKEEPER.name,role:SHOPKEEPER.role,portrait:`${import.meta.env.BASE_URL}assets/dialogues/${SHOPKEEPER.portrait}`,alt:`${SHOPKEEPER.name}, dueño de Artes de Pesca, en acuarela`},conversation:new Conversation(SHOPKEEPER_NODES,game.environment)}
  ];
  dialoguePanel=new DialoguePanel({parchment:`${import.meta.env.BASE_URL}assets/dialogues/dialogue-parchment.webp`,onChoice:choice=>{
    if(!dialoguePanel.dialog.open||!activeCharacter)return;
    const result=activeCharacter.conversation.choose(choice);
    if(result?.action==='shop'&&activeCharacter.id===SHOPKEEPER.id){pendingDialogueMenu='shop-dialog';dialoguePanel.close();}
    else if(result==='close')dialoguePanel.close();else if(result===true)renderConversation();
  },onClose:()=>{
    clearHeld();activeCharacter=null;paused=false;$('pause').textContent='Ⅱ';
    const menu=pendingDialogueMenu;pendingDialogueMenu=null;if(menu)openDialog(menu);
  }});
  // E retains equipment everywhere except this contextual encounter. Capture
  // prevents one press from both speaking and opening the equipment command.
  window.addEventListener('keydown',e=>{
    if(e.code==='KeyE'&&!paused&&!document.querySelector('dialog[open]')){
      const character=nearbyCharacter();if(!character)return;
      e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)talkToCharacter(character);
    }
  },{capture:true});
  const modeButton=document.createElement('button');modeButton.id='mode-toggle';modeButton.textContent='Explorar · V';modeButton.setAttribute('aria-pressed','false');document.body.append(modeButton);
  const walkHint=document.createElement('div');walkHint.id='exploration-hint';walkHint.hidden=true;document.body.append(walkHint);
  const joystick=document.createElement('div');joystick.id='walk-stick';joystick.setAttribute('role','group');joystick.setAttribute('aria-label','Joystick para caminar');joystick.append(document.createElement('span'));document.body.append(joystick);
  const lookJoystick=document.createElement('div');lookJoystick.id='look-stick';lookJoystick.setAttribute('role','group');lookJoystick.setAttribute('aria-label','Joystick para mirar');lookJoystick.append(document.createElement('span'));document.body.append(lookJoystick);
  const runButton=document.createElement('button');runButton.id='walk-run';runButton.textContent='CORRER';runButton.setAttribute('aria-label','Alternar carrera');runButton.setAttribute('aria-pressed','false');document.body.append(runButton);
  const toggleMode=()=>{
    if(paused||zones.zoneId!=='lago-sereno')return;
    const error=exploration.toggle(game.state,world.yaw,world.pitch,()=>[.08,.45,1].some(power=>world.canCastFromBank(exploration.x,exploration.z,world.yaw,power,game.environment.weather)));
    if(error){toast(error);return;}
    clearHeld();world.setExploring(exploration.mode==='exploring');
    if(!world.exploring){
      const spot=exploration.spot;
      world.fishingYaw=spot.yaw;world.fishingLook=spot.look;
      if(spot.id==='dock')game.setOrigin(spot.originX,spot.originZ);
      else game.setOrigin(exploration.x-3*Math.sin(world.yaw),exploration.z-3*Math.cos(world.yaw));
    }
    document.documentElement.dataset.playerMode=exploration.mode;
    modeButton.textContent=world.exploring ? 'Pescar · V' : 'Explorar · V';modeButton.setAttribute('aria-pressed',String(world.exploring));
    walkHint.hidden=!world.exploring;
    if(world.exploring)toast('Camina por la ribera y apunta hacia agua libre para pescar. Recupera el aparejo antes de explorar.');
  };
  document.documentElement.dataset.playerMode=exploration.mode;
  walkControls=new ExplorationControls({motion:exploration,world,canvas:$('scene'),joystick,lookJoystick,modeButton,runButton,toggle:toggleMode,isPaused:()=>paused,isTouch:()=>touchMode});
  travelButton=document.createElement('button');travelButton.id='zone-travel';travelButton.hidden=true;travelButton.setAttribute('aria-keyshortcuts','T');document.body.append(travelButton);
  // The context action opens on touch pointerup. Its later compatibility click
  // can be retargeted onto a dialogue choice beneath the old button position.
  // Consume only that opening click; a fresh pointerdown or keyboard action is
  // immediately usable, without a timer or blocking deliberate quick choices.
  let openingDialogueTap=false;
  document.addEventListener('pointerdown',()=>{openingDialogueTap=false;},{capture:true});
  travelButton.addEventListener('pointerup',e=>{if(e.pointerType==='touch'&&!paused&&nearbyCharacter())openingDialogueTap=true;},{capture:true});
  document.addEventListener('click',e=>{
    if(!openingDialogueTap||e.detail===0)return;openingDialogueTap=false;
    if(dialoguePanel.dialog.open){e.preventDefault();e.stopImmediatePropagation();}
  },{capture:true});
  bindModeToggle(travelButton,interact);
  window.addEventListener('keydown',e=>{if(e.code==='KeyT'&&!e.repeat&&!document.querySelector('dialog[open]')&&!atManuel()){e.preventDefault();if(atShop())openDialog('shop-dialog');else travel();}});
  const unlockAudio=e=>{
    // The mute control must toggle once without first starting default-on audio.
    if(!e.isTrusted||e.target?.closest?.('#sound')||e.code==='KeyN')return;
    try{audio.unlock();}catch{/* Audio is optional; a later gesture or the sound button can retry. */}
  };
  for(const type of ['pointerdown','pointerup','click','keydown'])document.addEventListener(type,unlockAudio,{capture:true});
  input=new GameControls({canvas:$('scene'),button:$('action'),game,world,isExploring:()=>world.exploring,isFishingReady:()=>world.equipment.ready,isPaused:()=>paused,onPause:setPaused,onCommand:command=>{
    if(dialoguePanel.dialog.open)return;
    if(command==='sound')sound();
    else if(command==='map')toggleMap();
    else if(command==='fullscreen')fullscreen();
    else openDialog({journal:'log-dialog',help:'help-dialog',equipment:'equipment-dialog'}[command]);
  }});
  $('pause').onclick = ()=>setPaused(!paused); $('resume').onclick = ()=>setPaused(false);
  $('help').onclick = ()=>openDialog('help-dialog'); $('open-log').onclick = ()=>openDialog('log-dialog');
  $('equipment-toggle').onclick=()=>openDialog('equipment-dialog');
  $('touch-equipment').onclick=()=>openDialog('equipment-dialog');$('touch-journal').onclick=()=>openDialog('log-dialog');
  $('touch-hud-info').onclick=showMobileInfo;
  $('retrieve-rig').onclick=()=>{clearHeld();game.reset();renderEquipment();};
  document.querySelectorAll('[data-close]').forEach(button=>button.onclick=()=>button.closest('dialog').close());
  document.querySelectorAll('dialog').forEach(dialog=>{if(dialog!==dialoguePanel.dialog)dialog.addEventListener('close',()=>{ paused = false; $('pause').textContent = 'Ⅱ'; });});
  $('sound').onclick = sound; $('fullscreen').onclick = fullscreen;
  bindModeToggle($('map-toggle'),toggleMap);
  $('quality').onclick = ()=>{ highQuality = !highQuality; world.setQuality(highQuality); $('quality').textContent = `GRÁFICOS: ${highQuality ? 'ALTO' : 'BAJO'}`;$('equipment-quality').textContent=`Gráficos: ${highQuality ? 'alto' : 'bajo'}`; };
  $('equipment-quality').onclick=()=>$('quality').click();
  $('hands-toggle').onchange=()=>{$('hands-toggle').checked=world.hands.setEnabled($('hands-toggle').checked);};
  inputMode=new InputMode(enabled=>{
    walkControls.clear();
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
  zones=new ZoneManager({scene:world.scene});
  exploration.obstacles=world.landscape.walkObstacles;
  const environmentOptions={};
  // Development-only observation links; ordinary play and production always use the normal clock.
  if(import.meta.env.DEV){
    const params=new URLSearchParams(location.search);
    const read=(key,min,max)=>{const v=params.get(key);return v!==null&&Number.isFinite(+v) ? Math.max(min,Math.min(max,+v)) : undefined;};
    const day=read('day',20,7200),hour=read('hour',0,23.999),transition=read('transition',2,120);
    if(day!==undefined)environmentOptions.dayDuration=day;if(hour!==undefined)environmentOptions.startHour=hour;if(transition!==undefined)environmentOptions.weatherTransition=transition;
  }
  const environment=new Environment(environmentOptions);
  if(import.meta.env.DEV){const weather=new URLSearchParams(location.search).get('weather');if(Object.hasOwn(WEATHER,weather))environment.weather.request(weather,{manual:true});}
  game = new FishingGame({ onEvent:event,environment,waterObstacles:world.landscape.waterObstacles });
  game.canCast=power=>{
    if(exploration.spot.id==='dock'){game.landingDistance=2.6;return true;}
    if(!world.canCastFromBank(exploration.x,exploration.z,world.yaw,power,game.environment.weather)){
      toast('Lanzamiento bloqueado por tierra u obstáculos. Apunta al agua o ajusta la potencia.');return false;
    }
    game.landingDistance=world.bankLandingDistance;
    game.setOrigin(exploration.x-3*Math.sin(world.yaw),exploration.z-3*Math.cos(world.yaw));return true;
  };
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
    game.catches=migrateCatches(saved);
    game.lureId=getLure(localStorage.getItem('alba-equipment-v1')).id;
  } catch { /* Private browsing and corrupt storage must not prevent playing. */ }
  try{shop=new VillageShop(localStorage);}catch{shop=new VillageShop(null);}
  game.lureId=shop.equipment.lureId;
  shopPanel=new ShopPanel({shop,game,dialog:$('shop-dialog'),onChange:renderEquipment,onEquip:equipItem});
  renderJournal();renderEquipment(); controls(); updateUI();
  $('scene').addEventListener('webglcontextlost',e=>{ e.preventDefault(); setPaused(true); toast('Se ha perdido la conexión con la GPU. Recarga para volver al lago.'); });
  function frame(now) {
    const dt = Math.min(.25,Math.max(0,(now-lastTime)/1000)); lastTime=now;
    if (!paused) {
      // Small simulation steps keep tension stable without slowing gameplay at low FPS.
      let remaining=dt;
      while (remaining>0) { const step=Math.min(remaining,1/60); if(zones.zoneId==='lago-sereno')game.update(step);else{game.time+=step;game.environment.update(step);} remaining-=step; }
      walkControls.update(dt);exploration.update(dt,world.yaw);
    }
    world.camera.position.x=exploration.x;world.camera.position.z=exploration.z;
    const eye=world.exploring||exploration.spot.id!=='dock' ? exploration.floor+WALK.eye+exploration.jumpHeight : 3;
    world.camera.position.y+=(eye-world.camera.position.y)*(1-Math.exp(-(paused ? 0 : dt)*10));
    if(world.exploring){
      const {spot,distance}=exploration.nearest;
      $('exploration-hint').textContent=`${touchMode ? 'Izquierdo: caminar · Derecho: mirar · MAPA' : 'WASD: caminar · Shift: correr · Espacio: saltar · M: mapa'} · ${zones.zoneId==='anglers-village'?'Aldea · Sendero sur: volver al lago':`${spot.name}: ${distance.toFixed(1)} m · Sendero hacia la aldea: tierra adentro · V: pescar`}`;
    }
    const exit=world.exploring?zones.nearbyExit(exploration.x,exploration.z):null,shopNearby=world.exploring&&atShop(),character=world.exploring&&nearbyCharacter();
    travelButton.hidden=(!exit&&!shopNearby&&!character)||paused;
    if(exit||shopNearby||character){const name=character?`Hablar con ${character.speaker.name}${character.location?` · ${character.location}`:''}`:shopNearby?'Abrir ARTES DE PESCA':exit.name,key=character?'E':'T',label=touchMode?name:`${key} · ${name}`;if(travelButton.textContent!==label)travelButton.textContent=label;travelButton.setAttribute('aria-keyshortcuts',key);}
    world.dialogueMarkersHidden=paused;
    world.update(paused ? 0 : dt,game); updateUI();
    requestAnimationFrame(frame);
  }
  world.update(0,game);
  $('loading').style.opacity = '0'; setTimeout(()=>$('loading').hidden=true,800);
  requestAnimationFrame(frame);
  // Expose read-only diagnostics in development, without gameplay shortcuts.
  if (import.meta.env.DEV) window.__alba = { snapshot:()=>({ zone:zones.zoneId,playerMode:exploration.mode,playerPosition:world.camera.position.toArray(),walkingKeys:exploration.keys.size,walkStick:{...exploration.stick},state:game.state,time:game.time,environment:game.environment.snapshot(),daylight:game.environment.daylight,rain:game.environment.weather.rain,cloud:game.environment.weather.cloud,tension:game.tension,distance:game.distance,catchCount:game.catches.length,paused,lureId:game.lureId,reeling:game.reeling,touchMode,heldInputs:input.actions.sources.size,casts:game.actionCounts.casts,hooks:game.actionCounts.hooks,cameraYaw:world.yaw,cameraPitch:world.pitch,webgl:world.renderer.capabilities.isWebGL2,...world.diagnostics() }) };
} catch(error) { fatal(error); }
