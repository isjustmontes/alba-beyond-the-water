import {DialoguePanel} from '../ui/dialogue-panel.js';
import '../ui/dialogue-panel.css';

// An isolated development entry: never imported by the game or production entry.
const open=document.getElementById('preview-open'),status=document.getElementById('preview-status');
if(!import.meta.env.DEV){open.hidden=true;status.textContent='Esta vista está disponible sólo en el servidor de desarrollo.';}
else{
  const panel=new DialoguePanel({
    parchment:`${import.meta.env.BASE_URL}assets/dialogues/dialogue-parchment.webp`,
    onChoice:choice=>{
      status.textContent=`Opción de muestra: ${choice.label}`;
      if(choice.id==='goodbye')panel.close();
      else panel.setStatus(`Vista previa: «${choice.label}». El diálogo se añadirá en otra etapa.`);
    },
    onClose:()=>{if(!status.textContent)status.textContent='Vista cerrada. Puedes volver a abrirla.';}
  });
  const sample={
    speaker:{id:'manuel',name:'Manuel',role:'Vecino de la aldea · Pescador de toda la vida',portrait:`${import.meta.env.BASE_URL}assets/dialogues/manuel-portrait.webp`,alt:'Manuel, vecino de la aldea, retratado en acuarela con gorra y chaqueta verde.'},
    text:'Bo día. Acércate un momento.\n\nEl lago tiene una historia distinta cada mañana. Hay que aprender a escucharlo.',
    choices:[{id:'lake',label:'Cuéntame de Lago Sereno.'},{id:'fishing',label:'Me gustaría hablar de pesca.'},{id:'goodbye',label:'Hasta luego, Manuel.'}]
  };
  open.onclick=()=>panel.show(sample);
}
