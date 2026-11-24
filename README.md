# ALBA · Beyond the Water · Fishing experience

<p align="center">
  <img src="alba%20-%20banner.webp"
       alt="ALBA — Beyond the Water"
       width="900">
</p>

Simulador de pesca 3D para navegador, ahora con las mejoras visuales de la **fase 2**. Three.js, JavaScript modular, HTML y CSS. Los modelos, texturas y sonidos se generan por código; no necesita claves API, cuentas ni servicios de pago. Tras instalar las dependencias, funciona sin conexión a Internet.

## Fase 2: mejoras visuales

- **Agua:** tres ondas suaves con desplazamiento geométrico y normales analíticas, detalles de superficie, reflexión dinámica del escenario y ondas locales que modifican las normales alrededor de la boya. La transparencia depende de la profundidad aproximada del fondo y del ángulo de observación. El fondo y el shader utilizan la misma batimetría procedural; esta aproximación evita un pase adicional de profundidad. Los peces próximos siguen visibles.
- **Luz:** amanecer cálido, nubes procedurales, iluminación ambiental del cielo mediante PMREM, reflejos sobre los materiales y niebla atmosférica. Las sombras del escenario se calculan al inicio y al cambiar de calidad, ya que el sol y el muelle permanecen fijos.
- **Peces:** cuerpos perfilados por especie, escamas, manchas de trucha, franjas laterales, branquias, ojos, boca y aletas con radios. Hay variaciones de tamaño y tono; la cola y el cuerpo ondulan y los giros se interpolan. A partir de 22 metros se usa una geometría simplificada. Las capturas y los peces del lago comparten recursos de GPU.
- **Caña:** perfil continuo y afilado, acabado de carbono, empuñadura de corcho, anillas, bobina, aro de recogida y manivela. La tensión curva el cuerpo de la caña; las anillas y el punto de salida del sedal siguen esa curva. Al soltar, recupera progresivamente su forma.
- **Paisaje:** relieve continuo con normales suaves, textura de piedra proyectada en tres ejes, variación de vegetación, roca y nieve por altura e inclinación. Hay pinos, abetos y árboles de hoja ancha, con follaje recortado, variación y una brisa suave. Rocas, hierbas y juncos completan la orilla. Los árboles, rocas y hierbas utilizan instancing.


## Archivos

- `src/fishing.js`: simulación independiente, especies y estados de pesca.
- `src/world.js`: paisaje, agua con reflexión planar, peces, muelle y aparejo procedural.
- `src/visuals/water.js`: ondas, reflejos, batimetría y fondo.
- `src/visuals/fish.js`: modelos, materiales compartidos, animación y LOD de peces.
- `src/visuals/rod.js`: caña flexible y carrete detallado.
- `src/visuals/landscape.js`: relieve, texturas, árboles y vegetación con instancing.
- `src/main.js`: controles, interfaz, pausa y persistencia.
- `src/audio.js`: ambiente y señales mediante Web Audio.
- `src/style.css`, `index.html`: interfaz adaptable.
- `tests/`: pruebas de simulación y navegador.

## Alcance del prototipo

Hay truchas arcoíris, carpas y lubinas, con peso, fuerza y tamaño variables. Los peces nadan y se aproximan al cebo; su proximidad afecta al tiempo de picada y a la especie seleccionada. La tensión y la resistencia son una aproximación jugable, no una simulación física del sedal. La cámara permanece en el muelle. Los gráficos usan recursos procedurales: el follaje a distancia utiliza tarjetas cruzadas con recorte alfa y las reflexiones del agua son planas. El amanecer permanece fijo; el alcance sigue siendo una jornada de pesca desde el muelle.
