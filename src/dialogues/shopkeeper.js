import {nearEncounter} from './conversation.js';
import {nearVillageShop} from '../village-layout.js';
import {EQUIPMENT,LURES} from '../simulation/config.js';

// The provisional display name lives only here (panel, sign, prompt and greeting).
export const SHOPKEEPER={id:'shopkeeper',name:'Xosé',role:'Artes de Pesca · Equipo y buenos consejos',portrait:'shopkeeper-portrait.webp',aspect:1086/1448,x:-8.35,z:2.3,radius:2.1};
export const SHOPKEEPER_SIGN=Object.freeze({x:-9.85,z:1.15,yaw:0,width:.69,height:.95,center:1.26,iconHeight:2.12,range:15});
export const nearShopkeeper=context=>nearVillageShop(context.x,context.z)&&nearEncounter(SHOPKEEPER,context);
const choice=(id,label,next)=>({id,label,next});
const back=next=>choice('back','Volver.',next);
const bye=()=>choice('goodbye','Hasta luego.',null);
const catalog=()=>({id:'catalog',label:'Enséñame lo que tienes',action:'shop'});

export const SHOPKEEPER_NODES={
  welcome:{text:()=>`Bo día, soy ${SHOPKEEPER.name}. Pasa, aquí los consejos van de regalo. Lo demás tiene el precio puesto, que también hay que pagar la luz.\n\n¿Buscas equipo o vienes a contarme cómo está el lago?`,choices:[choice('tackle','Quería preguntarte por el equipo.','tackle'),choice('village','Cuéntame algo de la aldea.','village'),catalog(),bye()]},
  tackle:{text:'Antes de elegir aparejos, dime cómo quieres pescar. Un buen equipo ayuda, pero comprarlo todo no enseña al pez a colaborar.\n\nEmpecemos por la caña o por lo que va al otro extremo del sedal.',choices:[choice('rod','Háblame de la caña.','rod'),choice('lures','¿Qué señuelo me recomiendas?','lures'),back('welcome'),bye()]},
  rod:{text:()=>`Llevas la ${EQUIPMENT.rod}, ${EQUIPMENT.action.toLocaleLowerCase('es')}. Conoce cómo flexa antes de pedirle más.\n\nEn la lucha, vigila la tensión: recoge cuando el pez ceda y afloja si tira fuerte. La prisa vende muchos sedales; a mí me gusta más que vuelvas contento.`,choices:[choice('line','¿Y el sedal?','line'),back('tackle'),catalog(),bye()]},
  line:{text:()=>`${EQUIPMENT.line}: resistencia nominal de ${EQUIPMENT.lineStrengthKg.toLocaleString('es-ES')} kg. Eso no significa que aguante cualquier tirón. Si mantienes demasiada tensión, rompe; con mucha holgura, el pez puede soltarse.\n\nEn el catálogo hay recambio. El equipo comprado queda en tu inventario; puedes montarlo desde Equipo.`,choices:[back('rod'),catalog(),bye()]},
  lures:{text:()=>`${LURES[0].name} para destellos y recogidas suaves; ${LURES[1].name.toLocaleLowerCase('es')} cerca del fondo; ${LURES[2].name.toLocaleLowerCase('es')} para imitar un pececillo.\n\nTruchas y percas suelen interesarse por la cucharilla. Carpas y tencas, por la lombriz. La lubina puede seguir el artificial. No son promesas: también cuentan profundidad, luz y temperatura.`,choices:[choice('technique','¿Cómo los trabajo?','technique'),back('tackle'),catalog(),bye()]},
  technique:{text:'Con cucharilla, pulsaciones suaves. Con lombriz, paciencia cerca del fondo. Con el artificial, recogidas breves y pausas.\n\nSi algo no funciona, cambia una cosa cada vez. Así aprendes qué pasó. Si lo cambias todo, sólo aprendes a ordenar la caja otra vez.',choices:[choice('conditions','¿Y si cambia el tiempo?','conditions'),back('lures'),bye()]},
  conditions:{text:'Mira la hora, el viento y la temperatura del agua. Cada especie lleva el día a su manera; la lluvia no es una señal de salida para todos los peces.\n\nAnota las capturas en el cuaderno y compara sus condiciones. Un buen recuerdo ayuda; un dato apuntado no mejora el tamaño del pez con los años.',choices:[back('technique'),catalog(),bye()]},
  village:{text:'Esta tienda vive de preparar la bajada al lago y de escuchar la vuelta. Hay jornadas en que se vende más conversación que aparejos.\n\nManuel se sienta junto al banco de la plaza. Sabe mirar el agua. Si te cuenta una historia de su padre, quédate: merece más la pena que mirar otro escaparate.',choices:[choice('lake','¿Qué te gusta de Lago Sereno?','lake'),back('welcome'),catalog(),bye()]},
  lake:{text:'Que nunca lo ves dos veces igual. Cambia la luz, cambia el viento y hasta la vuelta por el sendero parece distinta.\n\nYo cierro la caja pensando en bajar un rato. Luego aparece alguien con una carpa de la que hablar… y se me hace tarde. El oficio tiene sus trampas.',choices:[back('village'),choice('tackle','Volvamos al equipo.','tackle'),bye()]}
};
