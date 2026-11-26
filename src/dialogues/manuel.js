import {SPECIES,LURES} from '../simulation/config.js';
import {formatHour} from '../simulation/environment.js';
import {Conversation,nearEncounter} from './conversation.js';

// An existing plaza bench, not a new character, collider or saved location.
export const MANUEL={x:5,z:8.2,radius:2.2};
export const nearManuel=context=>nearEncounter(MANUEL,context);
const choice=(id,label,next)=>({id,label,next});
const back=next=>choice('back','Volver.',next);
const farewell=()=>choice('goodbye','Hasta luego, Manuel.',null);
const speciesName=index=>SPECIES[index].name.toLocaleLowerCase('es');

// Local narrative only: no rewards, equipment mutations, probabilities or save keys.
export const MANUEL_NODES={
  welcome:{text:'Bo día. Siéntate un momento, que el lago no se va a marchar.\n\nSoy Manuel. Llevo media vida pescando ahí abajo; la otra media, explicando en casa por qué volví tarde.',choices:[choice('fishing','¿Qué me aconsejas para pescar?','fishing'),choice('lake','Cuéntame algo de Lago Sereno.','lake'),farewell()]},
  fishing:{text:'Primero mira el agua. Después elige qué ofrecer y a qué profundidad. Lanzar más lejos no siempre es pescar mejor; eso me costó unos cuantos paseos admitirlo.',choices:[choice('species','¿Qué peces viven en el lago?','species'),choice('lures','¿Qué señuelo escogerías?','lures'),choice('fight','¿Cómo llevo la picada y la lucha?','fight'),back('welcome')]},
  species:{text:()=>`Aquí encontrarás ${SPECIES.map(s=>s.name.toLocaleLowerCase('es')).join(', ')}.\n\nNo comen todas igual ni en el mismo sitio. Algunas buscan el fondo; otras siguen algo que se mueve. ¿Por cuáles tienes curiosidad?`,choices:[choice('predators','Truchas, lubinas y percas.','predators'),choice('bottom','Carpas y tencas.','bottom'),back('fishing'),farewell()]},
  predators:{text:()=>`La ${speciesName(0)} agradece agua fresca; con calor puede buscar más profundidad. La ${speciesName(2)} y la ${speciesName(3)} se interesan por presas en movimiento.\n\nPrueba recogidas breves y pausas. Un pez curioso no está obligado a morder; tampoco nosotros entramos en todas las tiendas.`,choices:[choice('lures','Hablemos de señuelos.','lures'),back('species'),farewell()]},
  bottom:{text:()=>`La ${speciesName(1)} y la ${speciesName(4)} suelen buscar comida cerca del fondo. La lombriz es una buena opción; déjala trabajar sin sacudirla.\n\nA la tenca le sientan bien las horas de poca luz. Pero manda también la temperatura: cada día tiene su carácter.`,choices:[choice('conditions','¿Cómo leo las condiciones?','conditions'),back('species'),farewell()]},
  lures:{text:()=>`${LURES[0].name}: destellos para truchas y depredadores. ${LURES[1].name}: cerca del fondo para carpas y tencas. ${LURES[2].name}: imita un pececillo; alterna recogidas y pausas.\n\nLa profundidad y el movimiento importan tanto como el nombre. Ningún aparejo hace milagros, aunque algún vendedor se emocione.`,choices:[choice('technique','¿Y cómo los muevo?','technique'),back('fishing'),farewell()]},
  technique:{text:'Con cucharilla, recoge con pulsaciones suaves. Con lombriz, deja reposar el cebo cerca del fondo. Con el artificial, alterna recogidas breves y pausas.\n\nSi un pez investiga, no le tires el plato de la mesa: los movimientos bruscos pueden espantarlo. Dale tiempo.',choices:[choice('conditions','¿Influyen el tiempo y la hora?','conditions'),back('lures'),farewell()]},
  fight:{text:'Cuando la boya se hunda y avise de picada, pulsa para clavar. En la lucha, recoge y suelta según la tensión. Si aprietas demasiado tiempo, rompe; si dejas mucha holgura, puede soltarse.\n\nEl pez se cansa. Tú procura no cansarte antes mirando sólo el carrete.',choices:[back('fishing'),farewell()]},
  lake:{text:'Mi padre me traía antes de amanecer. Compartíamos pan y silencio; él decía que las historias buenas no necesitan levantar la voz.\n\nAhora, cuando la bruma baja sobre Lago Sereno, aún espero oírle quejarse del frío. Siempre venía sin chaqueta, el muy terco.',choices:[choice('morning','¿Qué miraba tu padre al llegar?','morning'),choice('village','¿Y la vida en la aldea?','village'),back('welcome'),farewell()]},
  morning:{text:'Miraba la luz, el viento y los movimientos del agua. Al amanecer y al caer la tarde cambian las ganas de comer, pero cada especie lleva su horario.\n\nUn día nublado no es una promesa. Y con lluvia no pican todos más: hay que mirar qué pez buscas y dónde está.',choices:[choice('conditions','¿Cómo está el lago ahora?','conditions'),back('lake'),farewell()]},
  village:{text:'En ARTES DE PESCA puedes preparar el equipo antes de bajar por el sendero. Yo aún repaso el bolsillo por si llevo el viejo aparejo de mi padre. Costumbre, nada más.\n\nLa aldea parece pequeña, pero entre dos bancos caben muchos recuerdos. Y alguna exageración sobre el tamaño de una carpa.',choices:[back('lake'),choice('fishing','Volvamos a la pesca.','fishing'),farewell()]},
  conditions:{text:environment=>{
    const e=environment.snapshot();
    const light=environment.daylight<.3?'Con esta poca luz, unas especies se animan y otras descansan.':'La luz invita a observar también las zonas más profundas.';
    const rain=environment.weather.rain>.15?'La lluvia cambia la visibilidad; no beneficia a todas las especies por igual.':'La nubosidad y el viento también cambian dónde buscan comida.';
    return `El reloj del lago marca ${formatHour(e.hour)}. ${e.weatherName}; agua superficial a ${e.surfaceTemperature.toLocaleString('es-ES')} °C, viento ${e.windDirection}.\n\n${light} ${rain} Son pistas, no garantías. Prueba y anota lo que observes.`;
  },choices:[choice('temperature','¿Por qué importa la temperatura?','temperature'),back('fishing'),farewell()]},
  temperature:{text:'La superficie cambia de temperatura poco a poco; el agua profunda cambia menos. Con calor, la trucha puede bajar buscando frescor. Carpas y tencas prefieren aguas más templadas.\n\nEn el cuaderno quedan las condiciones de tus capturas. Compara jornadas; la memoria ayuda, pero el papel discute menos.',choices:[back('conditions'),farewell()]}
};

export class ManuelConversation extends Conversation {
  constructor(environment){super(MANUEL_NODES,environment);}
}
