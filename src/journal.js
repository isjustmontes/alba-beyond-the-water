import {getLure,LURES} from './simulation/config.js';
import {WEATHER,formatHour,dayPeriod} from './simulation/environment.js';
export function migrateEnvironment(value){
  if(!value||typeof value!=='object')return null;
  const finite=(n,a,b)=>Number.isFinite(n)&&n>=a&&n<=b ? n : null;
  const hour=finite(value.hour,0,24),weather=Object.hasOwn(WEATHER,value.weather) ? value.weather : null;
  return {hour,period:hour===null ? null : dayPeriod(hour),weather,weatherName:WEATHER[weather]?.name||null,temperature:finite(value.temperature,-2,40),surfaceTemperature:finite(value.surfaceTemperature,-2,40),depth:finite(value.depth,0,20),windSpeed:finite(value.windSpeed,0,30),windDirection:['N','NE','E','SE','S','SO','O','NO'].includes(value.windDirection) ? value.windDirection : null};
}
export function captureConditions(fish){const e=fish.environment;if(!e)return 'Condiciones: No registrado';return `${e.hour===null ? 'No registrado' : formatHour(e.hour)} · ${e.weatherName||'No registrado'} · ${e.temperature===null ? 'No registrado' : e.temperature.toFixed(1)+' °C'} · ${e.depth===null ? 'No registrado' : e.depth.toFixed(1)+' m'}`;}
export function migrateCatches(value) {
  if(!Array.isArray(value))return [];
  return value.filter(f=>f&&typeof f.name==='string'&&Number.isFinite(f.weight)&&f.weight>0&&Number.isFinite(f.length)&&f.length>0&&typeof f.date==='string'&&Number.isFinite(Date.parse(f.date))).map(f=>{
    const known=LURES.some(l=>l.id===f.lureId);
    return {...f,lureId:known ? f.lureId : null,lureName:known ? getLure(f.lureId).name : 'Sin registrar · captura anterior',environment:migrateEnvironment(f.environment)};
  });
}
export function personalRecords(catches) {
  const records=new Map();
  for(const fish of catches) {
    const previous=records.get(fish.name);
    if(!previous||fish.weight>previous.weight||(fish.weight===previous.weight&&fish.length>previous.length))records.set(fish.name,fish);
  }
  return records;
}
const csvCell=value=>`"${String(value).replaceAll('"','""')}"`;
export function exportCatches(catches) {
  const number=n=>n.toLocaleString('es-ES',{minimumFractionDigits:2,maximumFractionDigits:2});
  return '\uFEFF'+[['Especie','Peso (kg)','Longitud (cm)','Señuelo','Fecha','Hora del lago','Clima','Agua (°C)','Profundidad (m)'],...catches.map(f=>[f.name,number(f.weight),f.length,f.lureName||'Sin registrar',f.date,f.environment?.hour!=null ? formatHour(f.environment.hour) : 'No registrado',f.environment?.weatherName||'No registrado',f.environment?.temperature??'No registrado',f.environment?.depth??'No registrado'])].map(row=>row.map(csvCell).join(';')).join('\r\n');
}
