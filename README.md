# ALBA · Beyond the Water · Fishing experience

<p align="center">
  <img src="alba%20-%20banner.webp"
       alt="ALBA — Beyond the Water"
       width="900">
</p>

Simulador de pesca 3D para navegador, con simulación avanzada y controles táctiles de la **fase 3**, sobre los gráficos de la fase 2. Three.js, JavaScript modular, HTML y CSS. Los modelos, texturas y sonidos se generan por código; no necesita claves API, cuentas ni servicios de pago. Tras instalar las dependencias, funciona sin conexión a Internet.

## Fase 3: simulación y entrada compartida

La fase 2 ya estaba confirmada en **`6144732`**, destino de la etiqueta publicada `v0.1.0`. El trabajo de fase 3 parte de `4ab35e7` en `isjustmontes/wolffish`, con el worktree limpio. Se conserva ese punto de restauración sin duplicar commits, cambiar etiquetas, publicar ni modificar otros worktrees. `git diff 4ab35e7` permite revisar los cambios de esta fase.

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

### Probar desde un smartphone en la misma red

1. Conecta ordenador y teléfono a la misma red Wi-Fi.
2. En la terminal del worktree `wolffish`, ejecuta `npm.cmd run dev:lan` (o `npm run dev:lan` en macOS/Linux).
3. Abre en el teléfono la dirección **Network** que imprime Vite, por ejemplo `http://192.168.1.25:5173`. Usa el puerto que realmente indique; si está ocupado, Vite escogerá otro. `localhost` en el teléfono apunta al propio teléfono.
4. Si no hay conexión, comprueba la IP local con `ipconfig`, el acceso del servidor a la red privada en el firewall y que el Wi-Fi no aísle a sus clientes. No hace falta modificar el router ni publicar en GitHub.
5. Usa un navegador moderno con WebGL 2. Si el dispositivo se calienta o pierde fluidez, abre Equipo y cambia los gráficos a bajo.

Los datos se guardan por navegador y origen (dirección y puerto). Las capturas del ordenador no se sincronizan automáticamente con el teléfono ni con otra dirección de acceso.

### Pruebas de fase 3

Con el servidor de desarrollo en marcha:

```powershell
npm.cmd test
npm.cmd run test:browser
npm.cmd run test:mobile
npm.cmd run build
```

Si usas un puerto distinto, indica antes `$env:ALBA_TEST_URL='http://127.0.0.1:5174'`. Las pruebas usan Microsoft Edge instalado en Windows o Chromium de Playwright; se puede indicar otro ejecutable con `ALBA_BROWSER_PATH`.

Las 23 pruebas de simulación y lógica cubren IA espacial, afinidad de cebos, profundidad, combate, fatiga, cancelación de entradas, deduplicación, clasificación táctil/híbrida, migración y récords. La prueba de escritorio conserva lanzamientos con teclado/ratón, cámara y captura, y añade inventario y persistencia. La prueba móvil utiliza eventos táctiles de Chromium en smartphone 390×844, horizontal 844×390 y tablet 1024×768: verifica cámara, multitáctil, cancelación, menús, orientación y cambios de entrada; realiza una captura completa en el perfil de smartphone. Las imágenes quedan en `test-results/`.

La muestra de rendimiento de la fase 3 (`node tests/visual.mjs phase3`) registró una mediana de **16,7 ms** por fotograma en ambos perfiles a 1280×800 sobre Intel Iris Xe, con percentil 95 de 16,9 ms en alto y 16,8 ms en bajo y 15 texturas de GPU. Es una muestra de 120 fotogramas en la vista inicial, separada de las pruebas de captura; no es un benchmark de teléfonos físicos.

Estas son comprobaciones automatizadas en un equipo con Windows/Chromium. **Pendiente de validación física en Android y Safari/iOS**, incluyendo áreas seguras reales, avisos del sistema, consumo térmico y descarga de CSV.

### Limitaciones y siguientes mejoras

- La IA y la fatiga son aproximaciones jugables. Los peces no evitan todas las rocas mediante navegación ni simulan una ecología completa. El sedal y la caña usan un modelo simplificado.
- Hay una caña y un sedal consultables y tres cebos seleccionables; el inventario no incluye compras, desgaste persistente ni cambios de equipo.
- Los récords son locales. La sincronización entre dispositivos y copias de seguridad importables quedan pendientes; ya existe exportación CSV.
- Queda pendiente ajustar el equilibrio con sesiones de jugadores y teléfonos físicos, y probar Safari/WebKit de forma automatizada. El rendimiento medido en Iris Xe no garantiza el de todos los smartphones.
- Mensaje de commit propuesto: `feat: add advanced fishing simulation and adaptive touch controls`.

## Fase 2: mejoras visuales

El punto de restauración anterior a los cambios es el commit **`d98231d`** (`chore: checkpoint playable ALBA before phase 2 visual upgrades`). Puedes consultar esa versión con `git show d98231d:src/world.js` o compararla con `git diff d98231d` sin cambiar tu carpeta actual.

- **Agua:** tres ondas suaves con desplazamiento geométrico y normales analíticas, detalles de superficie, reflexión dinámica del escenario y ondas locales que modifican las normales alrededor de la boya. La transparencia depende de la profundidad aproximada del fondo y del ángulo de observación. El fondo y el shader utilizan la misma batimetría procedural; esta aproximación evita un pase adicional de profundidad. Los peces próximos siguen visibles.
- **Luz:** amanecer cálido, nubes procedurales, iluminación ambiental del cielo mediante PMREM, reflejos sobre los materiales y niebla atmosférica. Las sombras del escenario se calculan al inicio y al cambiar de calidad, ya que el sol y el muelle permanecen fijos.
- **Peces:** cuerpos perfilados por especie, escamas, manchas de trucha, franjas laterales, branquias, ojos, boca y aletas con radios. Hay variaciones de tamaño y tono; la cola y el cuerpo ondulan y los giros se interpolan. A partir de 22 metros se usa una geometría simplificada. Las capturas y los peces del lago comparten recursos de GPU.
- **Caña:** perfil continuo y afilado, acabado de carbono, empuñadura de corcho, anillas, bobina, aro de recogida y manivela. La tensión curva el cuerpo de la caña; las anillas y el punto de salida del sedal siguen esa curva. Al soltar, recupera progresivamente su forma.
- **Paisaje:** relieve continuo con normales suaves, textura de piedra proyectada en tres ejes, variación de vegetación, roca y nieve por altura e inclinación. Hay pinos, abetos y árboles de hoja ancha, con follaje recortado, variación y una brisa suave. Rocas, hierbas y juncos completan la orilla. Los árboles, rocas y hierbas utilizan instancing.

La fase 2 conservó la simulación, los controles y la clave de guardado. La fase 3 amplía la simulación y el cuaderno manteniendo la compatibilidad del guardado. No se han añadido dependencias.

Para comprobar las mejoras: observa los reflejos al mirar alrededor con el botón derecho; lanza cerca para ver peces y ondas junto a la boya; durante la lucha, alterna la recogida y observa cómo se flexionan la caña y el sedal. Abre el cuaderno con **J** y cambia entre gráficos altos y bajos para comparar el detalle.

## Iniciar desde ORCA

Abre la terminal del proyecto actual y ejecuta:

```powershell
npm.cmd install
npm.cmd run dev
```

Abre la dirección que muestra Vite, normalmente **http://127.0.0.1:5173**, en el navegador o en la vista previa de ORCA si está disponible. En Windows se usa `npm.cmd` para evitar restricciones de ejecución de scripts de PowerShell. En macOS/Linux puedes usar `npm`.

No abras `index.html` mediante `file://`: los módulos necesitan el servidor local. Requiere un navegador moderno con WebGL 2 y aceleración gráfica. Si el rendimiento es bajo, pulsa «GRÁFICOS: ALTO» para bajar resolución y desactivar sombras.

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

En pantallas táctiles, mantén pulsado el botón inferior. La jornada se pausa al cambiar de pestaña o perder el foco. El cuaderno persiste en `localStorage` del navegador, asociado a la dirección y al puerto; también puedes descargarlo como CSV. El botón del cuaderno muestra todas las capturas guardadas, incluidas jornadas anteriores.

## Comprobar y distribuir

```powershell
npm.cmd test
npm.cmd run build
npm.cmd run preview
```

`dist/` contiene el juego preparado para cualquier alojamiento estático. `preview` lo sirve normalmente en http://127.0.0.1:4173.

Prueba de navegador opcional (con el servidor de desarrollo en marcha):

```powershell
npx.cmd playwright install chromium
npm.cmd run test:browser
```

Esta prueba abre Chromium sin ventana (aprovecha Microsoft Edge si está instalado en Windows), comprueba el renderizado WebGL, efectúa lanzamientos con ratón y teclado, espera una picada real y captura un pez regulando la tensión. Guarda capturas de pantalla en `test-results/`. Puedes indicar otro navegador compatible mediante `ALBA_BROWSER_PATH` y otra dirección mediante `ALBA_TEST_URL`.

La batería incluye las ocho pruebas originales de pesca y dos comprobaciones del fondo y la orientación del relieve. La prueba de navegador también comprueba la flexión de la caña, la unión del sedal a su punta, las ondas de la boya y la lectura de un guardado de la fase 1.

Para revisar los gráficos por separado, con el servidor en marcha:

```powershell
node tests/visual.mjs phase2
node tests/models.mjs
```

La primera orden captura ambos perfiles gráficos y la orilla; registra el renderizador, 120 intervalos entre fotogramas por perfil y los recursos de GPU en `test-results/phase2-metrics.json`. La segunda genera una vista cercana de las tres especies y verifica que los modelos comparten texturas y geometrías y que la caña se flexiona y recupera su forma. Las mediciones son muestras locales a 1280×800; el rendimiento depende de la GPU, la resolución y el navegador.

El perfil alto usa reflejos de hasta 24 actualizaciones por segundo, sombras y relieve detallado. El perfil bajo reduce los reflejos a 12, la resolución de pantalla, el relieve y la densidad de vegetación, y desactiva las sombras. Los reflejos también se actualizan al mover la cámara para mantener su correspondencia con la vista.

Medición local de la fase 2 en Microsoft Edge, WebGL 2, Intel Iris Xe y 1280×800, con 120 intervalos entre fotogramas por perfil:

| Perfil | Mediana | Percentil 95 |
| --- | --- | --- |
| Alto | 16,7 ms (aprox. 60 FPS) | 16,8 ms |
| Bajo | 16,7 ms (aprox. 60 FPS) | 16,9 ms |

La escena inicial utiliza 15 texturas de GPU. La muestra inicial anterior a los cambios también registró una mediana de 16,7 ms en el mismo equipo. Estas medidas corresponden a una vista fija del lago y están limitadas por la frecuencia de presentación; no garantizan el mismo resultado en todos los equipos ni miden el margen de GPU disponible. La prueba integral de pesca se ejecuta por separado.

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
