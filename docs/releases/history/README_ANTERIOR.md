# ALBA · Beyond the Water · Fishing experience

**v0.4.0 — The Art of Fishing (en desarrollo, Pre-Alpha).** Lanzamiento overhead sincronizado, flexión amortiguada, carrete y sedal mejorados, nado progresivo y nuevas interacciones con el agua. [Guía de la fase 5, arquitectura, pruebas y limitaciones](PHASE_05_THE_ART_OF_FISHING.md).

La base publicada **v0.3.0 — Living Waters** incorpora ciclo de día/noche, clima y viento progresivos, temperatura por profundidad, actividad y memoria de los peces, perca y tenca, condiciones en el cuaderno y ambiente sonoro procedural. [Guía de la fase 4](PHASE_04_LIVING_WATERS.md).

<p align="center">
  <img src="../../../alba%20-%20banner.webp"
       alt="ALBA — Beyond the Water"
       width="900">
</p>

Simulador de pesca 3D para navegador, con animaciones de la **fase 5** y ambiente dinámico de Living Waters, conservando la simulación avanzada, los controles táctiles y los gráficos anteriores. Three.js, JavaScript modular, HTML y CSS. Los modelos, texturas y sonidos se generan por código; no necesita claves API, cuentas ni servicios de pago. Tras instalar las dependencias, funciona sin conexión a Internet.

## Fase 3: simulación y entrada compartida

- Cada pez tiene posición, peso y una máquina de estados: nadar, buscar alimento, investigar, atacar, huir, resistir y recuperarse. La velocidad, agresividad, resistencia, profundidad y probabilidad de ataque varían por especie. Un pez debe alcanzar el señuelo para producir una picada; el paso del tiempo por sí solo no genera capturas.
- El combate alterna tirones de duración e intensidad variables, cambios de dirección y fatiga. La caña se curva con la tensión y el extremo del sedal sigue al pez enganchado. Hay un breve margen para recuperar tensión crítica y se mantiene el riesgo de escape tras cuatro segundos de holgura.
- Equipo permite elegir **cucharilla**, **lombriz** o **señuelo artificial**, ver sus características, consultar la caña y la resistencia del monofilamento (7,5 kg). También permite recuperar el aparejo y cambiar la calidad gráfica. Se puede cambiar de señuelo antes de lanzar o después de capturar; durante el lanzamiento o combate hay que recuperar primero el aparejo.
- El cuaderno guarda especie, peso, longitud, señuelo y fecha, y calcula el récord de peso por especie. Las capturas antiguas conservan sus datos y muestran «Sin registrar · captura anterior» para el señuelo. Se conserva `alba-catches-v1`; la selección de equipo usa `alba-equipment-v1`.
- Los efectos incluyen ondas de aproximación, salpicaduras con partículas reutilizadas, vibración de picada, carrete animado y una breve presentación de la captura. Tablas y clavos del muelle se agrupan mediante instancing para reducir llamadas de dibujo.

### Equipo y técnica

| Señuelo | Profundidad nominal, limitada por el fondo | Técnica y especies |
| --- | --- | --- |
| Cucharilla | 0,75 m | Pausas o recogida suave; truchas y lubinas |
| Lombriz | 2,8 m | Reposo y recogida lenta; carpas de fondo |
| Artificial | 1,4 m | Pulsaciones de recogida y pausas; depredadores grandes |

El señuelo se mueve de verdad al recoger. Los tirones bruscos de un artificial pueden ahuyentar peces cautelosos próximos. La afinidad modifica la atracción y la posibilidad de ataque, sin garantizar una especie concreta. Si no encuentras actividad, recupera y prueba otra distancia o señuelo.

### Controles de PC

Se conservan el botón izquierdo y Espacio para cargar/soltar un lanzamiento, clavar y mantener la recogida. Con el señuelo en el agua también permiten animarlo recogiendo suavemente. El botón derecho + arrastrar conserva la sensibilidad y los límites de cámara originales.

| Control | Acción |
| --- | --- |
| Botón izquierdo / Espacio | Mantener y soltar para lanzar; pulsar para clavar; mantener para recoger |
| Botón derecho + arrastrar | Mirar |
| R | Recuperar aparejo |
| E / selector del panel | Equipo y señuelos |
| J | Cuaderno y récords |
| P / H / M / F | Pausa / ayuda / sonido / pantalla completa |

En escritorio, los menús táctiles permanecen ocultos, incluso al estrechar la ventana. No se utiliza Pointer Lock.

### Controles móviles

La activación combina capacidades táctiles, `pointer`, `hover`, tamaño y la última entrada utilizada. En un dispositivo híbrido, usar ratón o teclado devuelve la interfaz de escritorio; utilizar el táctil en una interfaz móvil activa su capa de controles.

- Arrastra un dedo sobre una zona libre del paisaje para mirar. Los botones y paneles quedan fuera del gesto de cámara.
- Mantén **LANZAR** y suelta para elegir fuerza. El mismo botón pasa a **CLAVAR** con una picada y a **RECOGER** durante la espera o el combate. Alterna mantener y soltar para controlar la tensión.
- **EQUIPO** permite seleccionar cebo, recuperar el aparejo y bajar los gráficos. **CUADERNO** muestra capturas, récords y exportación CSV.
- Puedes mirar con un dedo mientras mantienes el control de pesca con otro. Cancelar un gesto, perder el foco, ocultar la página o redimensionar libera las entradas mantenidas sin lanzar accidentalmente.
- La interfaz respeta áreas seguras, admite desplazamiento en los menús y se adapta a orientación horizontal y vertical. El aviso de giro es una recomendación; no se bloquea la orientación.

El jugador permanece en el muelle, por lo que no hay joystick de desplazamiento.

### Limitaciones y siguientes mejoras

- La IA y la fatiga son aproximaciones jugables. Los peces no evitan todas las rocas mediante navegación ni simulan una ecología completa. El sedal y la caña usan un modelo simplificado.
- Hay una caña y un sedal consultables y tres cebos seleccionables; el inventario no incluye compras, desgaste persistente ni cambios de equipo.
- Los récords son locales. La sincronización entre dispositivos y copias de seguridad importables quedan pendientes; ya existe exportación CSV.
- Queda pendiente ajustar el equilibrio con sesiones de jugadores y teléfonos físicos, y probar Safari/WebKit de forma automatizada. El rendimiento medido en Iris Xe no garantiza el de todos los smartphones.
- Mensaje de commit propuesto: `feat: add advanced fishing simulation and adaptive touch controls`.

## Fase 2: mejoras visuales

- **Agua:** tres ondas suaves con desplazamiento geométrico y normales analíticas, detalles de superficie, reflexión dinámica del escenario y ondas locales que modifican las normales alrededor de la boya. La transparencia depende de la profundidad aproximada del fondo y del ángulo de observación. El fondo y el shader utilizan la misma batimetría procedural; esta aproximación evita un pase adicional de profundidad. Los peces próximos siguen visibles.
- **Luz:** amanecer cálido, nubes procedurales, iluminación ambiental del cielo mediante PMREM, reflejos sobre los materiales y niebla atmosférica. Las sombras del escenario se calculan al inicio y al cambiar de calidad, ya que el sol y el muelle permanecen fijos.
- **Peces:** cuerpos perfilados por especie, escamas, manchas de trucha, franjas laterales, branquias, ojos, boca y aletas con radios. Hay variaciones de tamaño y tono; la cola y el cuerpo ondulan y los giros se interpolan. A partir de 22 metros se usa una geometría simplificada. Las capturas y los peces del lago comparten recursos de GPU.
- **Caña:** perfil continuo y afilado, acabado de carbono, empuñadura de corcho, anillas, bobina, aro de recogida y manivela. La tensión curva el cuerpo de la caña; las anillas y el punto de salida del sedal siguen esa curva. Al soltar, recupera progresivamente su forma.
- **Paisaje:** relieve continuo con normales suaves, textura de piedra proyectada en tres ejes, variación de vegetación, roca y nieve por altura e inclinación. Hay pinos, abetos y árboles de hoja ancha, con follaje recortado, variación y una brisa suave. Rocas, hierbas y juncos completan la orilla. Los árboles, rocas y hierbas utilizan instancing.

La fase 2 conservó la simulación, los controles y la clave de guardado. La fase 3 amplía la simulación y el cuaderno manteniendo la compatibilidad del guardado. No se han añadido dependencias.

## Pescar

1. Mantén pulsado el botón izquierdo sobre el paisaje, Espacio o el botón inferior. La fuerza aumenta hasta el 100%; suelta para lanzar entre 9 y 40 metros.
2. Espera a que un pez encuentre el cebo o anímalo con una recogida suave. Debe acercarse y atacarlo; la espera depende del señuelo, la profundidad y los peces presentes. Observa las ondas y las oscilaciones de la boya.
3. Cuando se hunda y aparezca **¡PICADA!**, pulsa antes de 3 segundos para clavar.
4. Mantén pulsado para recoger. La tensión aumenta más durante los tirones; **suelta para bajarla** y vuelve a recoger alrededor del 30%. Alterna para mantenerla aproximadamente entre el 25% y el 70%.
5. Al acercar el pez a menos de 2,6 metros, se registra la captura. Mantener la tensión al límite rompe el sedal. Mantener holgura durante más de 4 segundos también permite escapar al pez.

Controles adicionales:

| Control | Acción |
| --- | --- |
| Botón derecho + arrastrar | Mirar alrededor y apuntar el próximo lanzamiento |
| R | Recuperar aparejo / cancelar lanzamiento |
| P | Pausa |
| H / ? | Instrucciones |
| J | Cuaderno de capturas |
| M / ♪ | Ambiente y avisos sintetizados (apagado inicialmente) |
| F / ⛶ | Pantalla completa |

## Archivos

- `src/fishing.js`: simulación independiente, especies y estados de pesca.
- `src/simulation/`: comportamiento espacial de peces, especies, cebos y fondo compartido.
- `src/input/`: acciones compartidas, ratón/teclado, cámara táctil y detección de interfaz.
- `src/journal.js`: migración compatible, récords y CSV.
- `src/phase3.css`: inventario y capa adaptable de interfaz táctil.
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
