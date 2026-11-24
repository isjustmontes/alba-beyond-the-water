import {getLure,LURES} from './simulation/config.js';
export function migrateCatches(value) {
  if(!Array.isArray(value))return [];
  return value.filter(f=>f&&typeof f.name==='string'&&Number.isFinite(f.weight)&&f.weight>0&&Number.isFinite(f.length)&&f.length>0&&typeof f.date==='string'&&Number.isFinite(Date.parse(f.date))).map(f=>{
    const known=LURES.some(l=>l.id===f.lureId);
    return {...f,lureId:known ? f.lureId : null,lureName:known ? getLure(f.lureId).name : 'Sin registrar · captura anterior'};
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
  return '\uFEFF'+[['Especie','Peso (kg)','Longitud (cm)','Señuelo','Fecha'],...catches.map(f=>[f.name,number(f.weight),f.length,f.lureName||'Sin registrar',f.date])].map(row=>row.map(csvCell).join(';')).join('\r\n');
}
