export const SPECIES = [
  {name:'Trucha arcoíris',short:'Trucha',min:.45,max:2.8,color:0x8ca9a0,strength:.85,speed:1.5,aggression:.85,endurance:.85,depth:1.0,biteRate:.9,biteProbability:.85,caution:.65},
  {name:'Carpa común',short:'Carpa',min:1.1,max:6.5,color:0xb39b59,strength:1.15,speed:.95,aggression:.4,endurance:1.3,depth:2.8,biteRate:.55,biteProbability:.72,caution:1.2},
  {name:'Lubina',short:'Lubina',min:.6,max:3.6,color:0x72916d,strength:1,speed:1.8,aggression:1.1,endurance:1.05,depth:1.5,biteRate:1.0,biteProbability:.95,caution:.4}
];
export const LURES = [
  {id:'spinner',name:'Cucharilla',depth:.75,motion:.18,attraction:16,retrieveSpeed:1.4,affinity:[1.25,.32,1.0],description:'Destellos y vibración suave. Ideal para truchas y depredadores.',technique:'Pausa o recoge con pulsaciones suaves.',targets:'Trucha · Lubina'},
  {id:'worm',name:'Lombriz',depth:2.8,motion:.035,attraction:15,retrieveSpeed:.75,affinity:[.45,1.65,.55],description:'Cebo natural de fondo. Hundimiento lento y gran afinidad con carpas.',technique:'Deja reposar el cebo cerca del fondo.',targets:'Carpa'},
  {id:'minnow',name:'Señuelo artificial',depth:1.4,motion:.3,attraction:18,retrieveSpeed:2.2,affinity:[.85,.2,1.6],description:'Imita un pez pequeño. Despierta el instinto de los depredadores grandes.',technique:'Alterna recogida breve y pausas.',targets:'Lubina · Truchas grandes'}
];
export const EQUIPMENT={rod:'ALBA Creek · 2,40 m',action:'Acción media · 10–30 g',line:'Monofilamento · 0,28 mm',lineStrengthKg:7.5};
export const getLure=id=>LURES.find(l=>l.id===id)||LURES[0];
