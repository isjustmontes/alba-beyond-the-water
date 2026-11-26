# Cierre técnico de entrega v0.6.0 · 26/11/2026

Base funcional final: `be1430a` (D), precedida por C `b7ae025`, B `00208d9` y A `4b23cdcc`. Publicación autorizada por el propietario; aceptación humana D y final M07 no confirmadas. El commit documental de preparación y el tag v0.6.0 identificarán la entrega sin reescribir estos commits.

En wolffish, Windows/Node 24.20.0: `npm.cmd test` **115/115**, cero fallos/omisiones; `npm.cmd run build` correcto, 43 módulos, JS 640,16 kB (gzip 175,51 kB), CSS 29,94 kB. Persiste aviso de chunk >500 kB. Revisión del diff: D sólo añade registro/planificación y conexión con escena existente; esta preparación sólo actualiza documentación/README. Sin prototipos, recursos temporales ni cambios de dependencias. No se repiten recorridos visuales ya registrados; no se afirma hardware físico ni rendimiento sostenido. A/B/C aceptadas por el propietario. D permanece IMPLEMENTED_UNVERIFIED por aceptación pendiente.

---

# Evidencia · First Steps · Etapa A

## D · zonas conectadas, preparación · 26/11/2026

Tras revisar sólo cambios C y excluir `test-results/`/prototipos, commit local `b7ae02500a0cebbd978644a9ac153e2c30c195ce`, `feat: add free shoreline fishing and exploration sprint`; Git limpio antes de D. Rama `feature/v0.6.0-first-steps`, `wolffish`; `dartfish` intacto en `7ecc8f7`.

D modifica sólo integración de `ZoneManager` en `main.js`, añade `zones.js`, sus pruebas y documentación. Se asocia `world.scene` existente, sin aplicar aparición ni reconstruir recursos. Lago Sereno tiene entrada `dock`, aparición histórica y salidas vacías. `prepareExit` devuelve un plan independiente validado sin ejecutarlo; zonas adicionales sólo existen como fixtures de pruebas. No hay carga/descarga, transición visual, triggers, UI, persistencia de zona ni destinos nuevos jugables.

Windows/PowerShell, Node 24.20.0, Vite 7.3.8: `node --test tests/zones.test.js tests/exploration.test.js tests/shore-stage-c.test.js tests/fishing.test.js tests/input.test.js` **27/27**. Incluye contrato de zonas, scene por identidad, aparición original, planes sin mutación, IDs/entradas/datos no finitos inválidos, pesca/captura, entradas y carrera. `npm.cmd run build` correcto, 43 módulos, JS 640,16 kB / gzip 175,51 kB; CSS 29,94 kB / gzip 6,76 kB. Aviso >500 kB preexistente; +1,24 kB JS respecto al ajuste C. Sin dependencias, assets, mallas ni trabajo por frame nuevos.

No se repite suite completa, pruebas gráficas o dispositivos físicos para esta preparación sin cambios visuales. Los tests de zonas son puros y usan una escena de prueba por referencia; el diff de arranque conserva constructor/posiciones/actualizaciones reales de LakeWorld. Revisar `src/zones.js` y ejecutar `node --test tests/zones.test.js`; el juego debe verse/funcionar igual. **D pendiente de aceptación humana**, sin commit D, push, tags ni releases.

**Aceptación posterior C · 26/11/2026:** el propietario declara validada C y autoriza guardarla en un commit local antes de preparar D. Se conservan los resultados/limitaciones históricos; no se atribuyen nuevas pruebas ni publicación a esta aceptación.

## C · carrera y auditoría de picadas alejadas · 26/11/2026

Comprobación focalizada DOM/entrada (`node test-results/check-run-controls.mjs`): PASS con Edge/Playwright en PC 1280×800 y móvil emulado 390×844 → 844×390. Shift llega al controlador; CORRER alterna una sola vez, no solapa joystick, permanece dentro de pantalla y se oculta/limpia al pescar o redimensionar. Sin errores JavaScript. Bucle de render desactivado para comprobar sólo entrada/layout, no gráficos ni dispositivos físicos. La primera aserción de resize se adelantó al evento; el guion se corrigió esperando el cambio de estado, sin modificar el juego por ese resultado. Artefacto local ignorado.

Mismo HEAD `00208d9`, rama/worktree conservados y cambios C anteriores preservados. Auditoría de `FishingGame.update`, percepción/interés/picada de `FishSchool`, profundidad y entorno: no queda restricción fija al muelle en ese flujo. No se modifican IA ni probabilidades. Prueba controlada con un pez real próximo, sin forzar estado/ataque, en ambas riberas (±32,24) e interior (0,−85), 8 semillas por lugar; agua vacía sin picadas durante 60 s simulados.

Carrera: objetivo 1,5× (3,30 m/s), amortiguación/subpasos existentes, Shift izquierdo/derecho o botón CORRER alternable junto al joystick; sólo exploración. Limpieza por foco, cancelación, resize, pausa y cambio de modo existentes. Sin nuevos assets/dependencias; otros sistemas intactos.

`node --test tests/shore-stage-c.test.js tests/exploration.test.js tests/input.test.js tests/fish-attention.test.js tests/shore-habitat.test.js tests/fishing.test.js`: **38/38**, con carrera a 20/60/120 fps, frenado progresivo, límites/limpieza y pesca lejana natural. `npm.cmd run build`: correcto, JS 638,92 kB / gzip 175,05 kB; CSS 29,94 kB / gzip 6,76 kB, aviso existente >500 kB. No se repite la suite completa ni la validación gráfica general. C queda pendiente de aceptación; sin commit/publicación.

## C · corrección posterior a prueba real · 26/11/2026 · aceptación PENDIENTE

**Base y seguridad:** mismo HEAD local B `00208d9f6781e5663b0939db3593f1a14d87e79e`, rama `feature/v0.6.0-first-steps`, worktree `wolffish`; se conservan todos los cambios C previos. No se confirma ni publica esta corrección. `dartfish` continúa en `7ecc8f7`. El propietario confirma exploración/equipar/lanzar operativos, pero reporta hábitat vacío y lances restringidos; no acepta C todavía.

**Causas reproducidas antes de editar:** el constructor de `FishSchool` situaba hogares en una banda x≈±9,5, z≈−3…−25,5, con patrullas de 2,5–4 m y recorte z≤8; no podían llegar a las nuevas riberas positivas en z. El origen/orientación de C ya dependían del jugador, sin referencia fija al muelle. La guarda exigía agua desde 5,6 m exactos: en (−18,40), yaw=0, potencia=0,5, rechazaba suelo a y≈0,47 m aunque el destino (−18,12,5) era agua y el arco pasaba por encima. El sondeo también confirmó salidas laterales ya válidas y obstáculos auténticos en los promontorios; no se atribuye cada rechazo a un bug. Procedimiento local de diagnóstico: `test-results/probe-shore-c.mjs`; su JSON se sobrescribe al repetirlo, no se presenta como archivo histórico anterior a la corrección.

**Corrección espacial:** se detecta el primer tramo húmedo en vez de exigirlo a distancia fija. Se admite sobrevolar la pendiente inicial si el arco no toca geometría; se rechazan barreras después del acceso al agua, destinos secos/someros y obstáculos reales. El final de recogida/captura se ajusta al tramo húmedo y evita arrastrar el pez por esa pendiente. El muelle conserva su umbral histórico. No cambian potencia/distancia, tensiones, cansancio, señuelos, especies o guardados.

**Hábitat:** `lake-habitat.js` combina profundidad y altura de ribera con huellas conservadoras de las 130 rocas y 2 promontorios ya existentes. Los mismos **27** agentes tienen hogares variados en ambas riberas e interior, además del entorno del muelle; se rechazan puntos secos/alojados en rocas. Semillas 1/42/73 sin obstáculos produjeron 6 hogares por ribera, 6 interiores y 9 en aguas cercanas al muelle. Patrullas con frecuencia individual, margen al fondo y pasos que se rechazan/deslizan ante tierra/roca, también durante combate. Se mantienen atención, competencia, memoria, horarios, clima y especies; no hay teletransporte hacia el señuelo ni nuevos meshes.

**Incidencias de validación y rendimiento:** la primera suite mostró 103/104 por una aserción que imponía la antigua elipse de movimiento; se sustituyó por agua/hábitat/fondo reales, conservando comprobaciones ambientales. El recorrido táctil reprodujo `pointerup → fishing → click → exploring`: una validación síncrona larga agotaba los 700 ms de supresión. Se renueva el instante al terminar la acción y se añade regresión con 1.100 ms de coste simulado. Para reducir ese coste, las 65 muestras de corredor usan altura analítica: sólo se consulta geometría exacta al localizar el borde, en destino, dos niveles del corredor y 20 segmentos del arco. Sin raycasts por frame, nuevas entidades, materiales o dependencias. No se atribuye una mejora de FPS físicos a esta reducción por construcción.

**Pruebas reales, entorno y comandos:** Windows, Node 24.20.0, Vite 7.3.8, Edge/Playwright headless con SwiftShader; servidor `http://127.0.0.1:5174/`.

```powershell
node --test tests/shore-habitat.test.js tests/environment.test.js tests/fish-attention.test.js tests/shore-route.test.js tests/fishing.test.js
npm.cmd test
npm.cmd run build
node tests/shore-live.mjs
node tests/shore-browser.mjs
```

41/41 relevantes en el grupo de hábitat/entorno/IA/pesca; 15/15 al añadir comprobación de toque lento al grupo exploración/hábitat. Suite final **107/107**, build correcto: 42 módulos, JS **638,27 kB / gzip 174,84 kB**, CSS 29,48 kB / gzip 6,68 kB. Permanece el aviso conocido >500 kB.

- 7 regresiones nuevas de hábitat: 27 agentes repartidos con varias semillas; agua/rocas; cinco minutos **simulados** de patrulla; interés local sin teletransporte; recogida en borde húmedo; persecución sin cruzar tierra; combate y captura de orilla con datos conservados. Las pruebas existentes de atención individual, picada ambiental y captura siguen pasando.
- Aplicación completa final PC 1280×800 y teléfono táctil emulado 390×844: recorrido desde muelle a ambas calas, lances laterales hacia x≈−31 y +31, z≈24 (fuera de la zona del muelle), rechazo hacia tierra, recuperación, regreso y lance desde muelle. Tres lances válidos por perfil; 27 peces; error del sedal <0,000001 m. Teclado/ratón y joystick/gesto reales del guion, sin escribir en estado ni teletransportar. La repetición final pasó tras corregir el toque lento, sin errores JavaScript/shaders.
- Fixture geométrico final: PASS en 1280×800, 390×844, 844×390 y 1024×768. Valida suelo y rocas reales, hogares válidos de 27 peces, lances laterales y el caso de pendiente (−18,40), además de tres orígenes, recogida y regreso. Ceros errores JavaScript/shaders. Medianas locales de validación por acción (6 casos): 74,5 / 46,8 / 23,4 / 21,9 ms respectivamente; máximo observado 90 ms. Estas consultas ocurren al cambiar de modo/soltar, no por frame. Es un fixture Chromium/SwiftShader con distintas calidades y cámaras, no una comparación de FPS ni un benchmark físico.

Se revisaron capturas reales: la cala este muestra agua lateral libre y HUD táctil accesible; en el punto oeste elegido la vegetación preexistente puede tapar la vista al girar. No se modifica esa vegetación dentro de esta tarea: el jugador puede variar su posición. Artefactos ignorados: `shore-live.json`, `shore-browser.json`, `shore-live-*-{west,east}.png` y `probe-shore-c.json` en `test-results/`.

**Revisión manual:** explorar hasta las calas, orientar hacia el agua lateral exterior (oeste desde la izquierda, este desde la derecha), equipar, lanzar con varias potencias y recuperar. Probar también distintos tramos secos mirando al lago y un intento hacia una roca visible/tierra. Buscar peces a distintas profundidades y horas: población limitada y condiciones no garantizan picadas. Guardar, volver al muelle y lanzar allí.

**Límites:** huellas elípticas conservadoras y muestreo del arco, sin navegación compleja de rutas; distribución y movimientos válidos no garantizan densidad en cada lance. Sin Android/iOS físico, WebKit, captura completa nueva en navegador ni benchmark térmico. Captura/combate están cubiertos en dominio. C pendiente de aceptación humana, sin commit/push/tag/release.

## C · implementación inicial histórica · 26/11/2026 · anterior a BUG-004/005

**Base:** B aceptada por el propietario incluidas BUG-002/003. Tras revisar cambios y excluir artefactos/prototipos se creó únicamente el commit local `00208d9f6781e5663b0939db3593f1a14d87e79e`, `feat: add explorable lake shoreline`; Git quedó limpio antes de C. No se publica ni modifica `dartfish`. Implementación C y este registro quedan sin commit.

**Diagnóstico y alcance:** B seguía restringiendo `atSpot` a radios de 4 m. `main.js` alternaba `rod.visible` instantáneamente. La cámara de exploración admitía pitch ±1,15, pero al primer gesto en pesca lo recortaba directamente a −0,48…0,25. El yaw de las calas se detenía en ±π. Se corrigen estos puntos reales sin modificar modelos, pesca, IA, clima, audio, HUD o guardados.

**Cambios:** selección libre sobre suelo transitable de la ribera existente; destino, cuenca y corredor de recogida húmedo, además de trayectoria y obstáculos B. Equipar/guardar rig en 0,38 s, conservando carrete y pivotes, bloqueo de entrada durante equipamiento, orientación preservada y pitch amortiguado. El puesto del muelle conserva su origen y tolerancias históricas.

**Entorno:** Windows, PowerShell, Node 24.20.0, Vite 7.3.8, Playwright/Edge Chromium headless con SwiftShader. Aplicación completa en escritorio 1280×800 y teléfono táctil emulado 390×844. Fixture adicional en esos tamaños, móvil horizontal 844×390 y tablet 1024×768, calidad baja en perfiles móviles. No son dispositivos físicos.

**Comandos y resultados reales:**

```powershell
node --test tests/shore-free.test.js tests/shore-route.test.js tests/exploration.test.js tests/input.test.js tests/fishing.test.js
npm.cmd test
npm.cmd run build
node tests/shore-live.mjs
node tests/shore-browser.mjs
```

29/29 relevantes y **99/99** suite completa. Build correcto: 41 módulos, JS **636,54 kB / gzip 174,23 kB**, CSS 29,48 kB / gzip 6,68 kB. Persiste el aviso previo >500 kB; aumento JS frente a B: 1,51 kB. Sin dependencias, geometrías/materiales nuevos ni consultas geométricas por frame. No es una medición de FPS sostenidos.

- `shore-free.test.js`: posiciones fuera de radios (−11,24), (11,24), (4,32), rechazo si no hay acceso/obstáculo, conservación de coordenadas; equipar/guardar reversible a 20/60/120 fps; pulsación durante equipamiento no se convierte en lance posterior y cancelar no lanza; pitch fuera de límites no salta al primer gesto y yaw cruza ±π.
- `shore-live.mjs`: aplicación completa con entradas reales WASD/ratón o joystick/gestos CDP. Muelle → margen oeste aprox. (−11,24), margen este aprox. (11,24) → muelle, sin teletransporte ni escritura en estado. En ambos márgenes: equipar, conservar yaw ±0,35, esperar equipamiento, rechazar intento hacia tierra, lanzar, recuperar y guardar hasta que el rig desaparece. Regreso a (0,7), lance desde muelle y vuelta a explorar. **Tres lances válidos por perfil**, sedal conectado con error <0,000001 m, sin errores JavaScript/shaders.
- `shore-browser.mjs`: fixture de tiempo controlado y dirección guiada, adaptadores reales WASD/joystick, recorrido y regreso, tres orígenes y recogida. Guardas geométricas válidas en las dos calas B y fuera de sus radios; rechazo por tierra, rocas y destinos/corredores fuera de agua accesible en los cuatro perfiles. Sin errores JavaScript/shaders. No se presenta como partida manual.

Artefactos locales ignorados: `test-results/shore-live.json`, `shore-browser.json`, `shore-live-{desktop,phone}-{west,east}.png` y capturas de cuatro perfiles. Se revisó la captura táctil oeste con caña, carrete y HUD accesibles; las capturas adicionales permiten revisar ambas márgenes. URL local comprobada: `http://127.0.0.1:5174/`.

**Revisión del propietario:** V / botón para explorar, salir por detrás del muelle, caminar hacia el borde seco de ambas calas y otros tramos de ribera. Mirar al agua, V / Pescar, esperar a equipar y mantener/soltar Espacio o LANZAR. Recuperar con R / Equipo y V / Explorar. Probar orientación después de equipar, guardar/equipar de nuevo y un intento hacia tierra. La ribera interior, agua somera/fuera de cuenca o corredores secos se rechazan: no toda posición permite cualquier dirección/potencia.

**Limitaciones:** colisión aproximada por muestras, troncos simplificados, sin física continua; puede exigir acercarse al borde o ajustar potencia. Sin nueva captura completa en navegador (combate/capturas cubiertos en dominio), Android/iOS físico, WebKit o benchmark térmico. No se añaden zonas ni persistencia de posición. **Etapa C pendiente de aceptación humana. Sin commit C, push, tags o release.**

**Aceptación posterior B · 26/11/2026:** el propietario confirma validada la Etapa B, incluidas navegación y lanzamiento corregidos, y autoriza conservarla en commit local antes de Etapa C. Se mantienen los registros técnicos e incidencias históricos; no se atribuyen pruebas físicas nuevas.

**SHA y fecha** — Registro del 25 de noviembre de 2026 (Europe/Madrid). Implementación validada: `4b23cdcc2c6e3d1d804ab1ea54a9698c95f16147`. Integración SDD: `6c46e22fa38dac0cffcc02697b5656ceb9ca8862`, padres `4b23cdcc` y `81faadf`. La documentación posterior queda sin commit en esta tarea.

**Equipo, navegador y perfil** — Windows, PowerShell, Node.js v24.20.0 y Vite 7.3.8. Comprobación previa con Playwright/Edge Chromium headless (Edge instalado 158.0.4370.33), WebGL con SwiftShader: escritorio 1280×800, teléfono 390×844 y 844×390, tablet 1024×768. Los tres perfiles móviles usan `hasTouch` e `isMobile`. No son dispositivos físicos ni mediciones de rendimiento móvil.

**Comando y datos** — Tras el merge se ejecutaron:

```powershell
git diff --exit-code 4b23cdcc HEAD -- src tests index.html package.json package-lock.json
node --test tests/exploration.test.js tests/input.test.js tests/motion.test.js tests/fishing.test.js
npm.cmd run build
```

El diff terminó con código 0: el merge no cambió código, controles, pruebas ni dependencias de la etapa validada. Unitarias: **24/24 correctas**, incluidas 6 de exploración, 3 de entrada, 7 de animación y 8 de pesca. Build correcto: JS 627,98 kB / gzip 171,02 kB; CSS 29,48 kB / gzip 6,68 kB. Persiste el aviso previo de chunk mayor de 500 kB; no se altera la configuración para ocultarlo.

El recorrido de navegador ya ejecutado antes del commit se reproduce con servidor de desarrollo:

```powershell
npm.cmd run dev -- --port 5174
# En otra terminal:
$env:ALBA_TEST_URL='http://127.0.0.1:5174'
node tests/exploration-browser.mjs
```

Resultado previo: PASS en los cuatro perfiles, sin errores JavaScript/shaders reportados. Se comprobó movimiento, retorno al puesto, cámara, captura/liberación del ratón, joystick, cancelación, resize, lanzamiento único y bloqueo con aparejo activo. La primera revisión detectó un aviso sobre el joystick y una liberación de Pointer Lock no reproducible con Esc sintético; ambos se corrigieron y la ejecución final pasó. Esa corrección ya pertenece a `4b23cdcc`. El guion no se ha repetido tras un merge que conserva exactamente su código.

**Resultado, métricas e incidencias** — La confirmación humana de la Etapa A figura en el encargo de incorporación SDD. Las capturas `first-steps-*-explore.png`, `first-steps-*-fishing.png` y `first-steps-browser.json` se generan en `test-results/`, ignorado por Git; son artefactos locales, no una evidencia binaria distribuida. Este registro conserva el procedimiento y el resultado textual. No se atribuye un SHA al informe previo que no lo registró: la equivalencia del código se comprobó con el diff anterior.

Límites: muelle sin acceso a la orilla; pesca únicamente desde el puesto original; sin posición persistente, nuevas zonas ni manos. No se repitió toda la suite histórica ni una captura de navegador después del merge. La captura y los escapes sí pasaron en las pruebas de dominio. No hay pruebas físicas Android/iOS, WebKit, sesión térmica de 30 minutos ni nuevo benchmark. No hubo push, tags, release ni Etapa B.

## Etapa B · 26 de noviembre de 2026 · pendiente de aceptación

**Registro inicial histórico:** las comprobaciones de esta sección preceden la prueba del propietario que reveló BUG-002/003. No certificaron la hierba fuera del eje ni la aproximación libre a ambas calas. El registro de corrección al final sustituye sus límites y resultados actuales; no se considera aceptada B.

**SHA y fecha** — Base local `596e9460e8e9bf94a3c22178d57776e6a1f1292c` (`docs: document first steps stage A`); la implementación B y este registro quedan como cambios sin commit. No se atribuye un SHA publicado a B. La especificación, diseño, tareas y aceptación B se ampliaron antes de programar, conservando los IDs y la evidencia histórica A.

**Equipo, navegador y perfil** — Windows, Node.js 24.20.0, Vite 7.3.8; Playwright con Edge Chromium headless y WebGL/SwiftShader. Perfiles de escena: escritorio 1280×800, teléfono 390×844 y 844×390, tablet 1024×768; los tres últimos usan entrada táctil emulada y calidad baja en el fixture. Prueba de aplicación completa: escritorio 1280×800 y teléfono 390×844, calidad normal del juego. No son dispositivos físicos.

**Comando y datos** — Sobre servidor de desarrollo `http://127.0.0.1:5174/`:

```powershell
npm.cmd test
npm.cmd run build
$env:ALBA_TEST_URL='http://127.0.0.1:5174'
node tests/exploration-browser.mjs
node tests/shore-live.mjs
node tests/shore-browser.mjs
```

**Resultado, métricas e incidencias** — Suite completa **93/93**, incluidas 5 pruebas de ribera y una nueva regresión de toque del botón de modo. Build correcto: JS 631,50 kB / gzip 172,54 kB, CSS 29,48 kB / gzip 6,68 kB. Permanece el aviso previo de chunk mayor de 500 kB. El incremento de JS frente a la Etapa A medida (627,98 kB) es aproximadamente 3,52 kB; no equivale a medir tiempo de frame ni rendimiento térmico.

- `shore-route.test.js`: recorrido completo de ida y vuelta a 20/60/120 fps, continuidad, unión con terreno original, normales de la malla, origen de tres puestos, recogida, traslación de objetivos de combate y destinos en agua en los límites de mirada. La colisión de ruta y los puestos se prueban sin renderer; no se cambia IA.
- `exploration-browser.mjs`: recorrido de regresión A correcto en cuatro perfiles después de incorporar conexión y puestos: mirada, WASD/joystick, cambio de modo, cancelación/resize y un único lanzamiento desde el muelle. Esa ejecución precede la corrección adicional del toque tras un gesto de cámara; la prueba específica y la aplicación completa comprueban dicha corrección.
- `shore-browser.mjs`: adaptadores WASD/joystick reales en un fixture con pasos de tiempo controlados y dirección guiada por el test. Muelle → ambos puestos → tierra firme → regreso, render en llegadas, raycasts contra las mallas visibles (incluidas tablas del muelle), exclusión de bases reales de árboles/rocas del sendero, y lanzamiento/recogida con sedal conectado desde tres puestos. No se confunde este recorrido guiado con una partida manual. Cuatro perfiles correctos, sin errores JavaScript/shaders. Desajuste de suelo observado en paradas: hasta 0,015 m en alta y 0,053 m en baja, por la triangulación del relieve original.
- `shore-live.mjs`: aplicación completa, sin acceso de escritura al estado del juego ni teletransporte. Teclado en PC y Pointer Events táctiles vía CDP recorren muelle → cala oeste; cámara mediante arrastre, cambio de modo y lanzamiento de orilla. Comprueba posición del jugador, origen efectivo por posición de boya y conexión del sedal. No completa una captura nueva; el combate y captura siguen cubiertos por la suite de dominio.

La revisión inicial detectó un puesto este demasiado retirado del agua: se ubicó en (6,20), simétrico a la cala oeste, y se añadió la prueba de destinos húmedos al recuperar y combatir. Otra primera aserción de raycast omitía las tablas instanciadas del muelle; se corrigió el guion para incluirlas, sin modificar geometría del muelle. La aplicación táctil detectó `pointerdown`/`pointerup` sin `click` tras arrastrar la cámara. `bindModeToggle` activa el toque completado y suprime el clic de compatibilidad posterior; la regresión verifica una sola activación, teclado/ratón, cancelación y rechazo de arrastre. No cambió el diseño del HUD de pesca.

La revisión visual posterior mostró lances laterales sobre los promontorios preexistentes. Ambas calas quedaron orientadas al norte con puntería ±0,10 rad hacia el pasillo de agua abierto. En exploración se puede seguir mirando libremente; no se modifican el puesto original, la geometría de los promontorios ni la IA. La prueba de destinos húmedos cubre la lengua de tierra nueva y los límites de puntería, no es una prueba universal de navegación o colisión de peces con todas las rocas históricas.

Coste acotado por construcción: una malla estática de tierra, 5.945 vértices y 11.520 triángulos, con material y textura existentes; sin aumentar recuentos de árboles/hierba, sin dependencias y sin raycasts durante juego. Las mediciones de llamadas/triángulos del fixture son locales y varían por cámara/calidad; no se presentan como benchmark equivalente a hardware móvil.

Artefactos locales, ignorados por Git: `test-results/shore-browser.json`, `shore-live.json`, `shore-*-stop-*.png`, `shore-*-fishing-*.png`, `shore-live-*.png`. No se incorporan prototipos, manos ni recursos temporales. Procedimientos y resultados quedan registrados aquí para reproducirlos.

**Limitaciones y decisión** — Sólo el corredor definido y tres puestos, sin exploración libre del mapa, navegación genérica de obstáculos, salto ni posición persistente. La frecuencia de peces sigue dependiendo de la IA y condiciones existentes; las calas no garantizan picadas ni añaden peces. Sin Android/iOS físico, WebKit, captura completa nueva en móvil o sesión larga térmica. **Pendiente de validación visual y funcional del propietario.** No se confirma B, publica ni inicia otra etapa.

## Corrección B tras prueba real · 26/11/2026 · aceptación PENDIENTE

**Base y alcance:** mismo HEAD `596e9460e8e9bf94a3c22178d57776e6a1f1292c`, rama `feature/v0.6.0-first-steps`, worktree `wolffish`. Se conservan todos los cambios B sin commit; no se modifica `dartfish`. Sistemas de IA, clima, audio, inventario, HUD de pesca y persistencia intactos.

**Diagnóstico previo a editar:** BUG-002: en (0,20), `shoreHeight=0,8058` pero `walkHeight=null`, por la distancia máxima de 1,35 m al eje del sendero. BUG-003: (−7,20) era suelo transitable pero quedaba fuera del radio 0,80 m del puesto (−6,20); incluso en su centro, yaw=−0,20 rad hacia el lago se rechazaba por el cono ±0,10. No eran fallos de teclas o joystick. Reproducción inicial guardada localmente en `test-results/reproduce-shore-blocks.mjs`.

**Corrección:** superficie seca de la conexión caminable con margen corporal/agua y colisiones de árboles/rocas visibles; zonas de pesca de 4 m sobre suelo seco. Dirección libre en las calas, con validación geométrica del destino y trayectoria al entrar en pesca y al soltar. Origen recalculado desde posición y orientación actuales al liberar, sin cambiar el puesto original. Los lances bloqueados vuelven a `ready` sin aumentar el contador.

**Validación ejecutada:** `node --test tests/exploration.test.js tests/shore-route.test.js` **14/14**; `npm.cmd test` **95/95**; `npm.cmd run build` correcto, 40 módulos, JS **635,03 kB / gzip 173,79 kB**, CSS 29,48 kB / gzip 6,68 kB. Continúa el aviso conocido de chunk >500 kB. No hay dependencias, mallas ni partículas nuevas respecto de B; las consultas geométricas se hacen por acción, no en cada frame. Sin medición nueva de FPS sostenidos ni hardware móvil.

- `node tests/shore-browser.mjs`: correcto en escritorio 1280×800, teléfono 390×844 y 844×390, tablet 1024×768; fixture guiado con WASD/joystick, obstáculos reales, ida/vuelta y recogida en los tres puestos. Añade guardas contra geometría real: desde (−7,20) yaw=−0,20 y (7,20) yaw=0,20 se permite lanzar; hacia tierra (π) se rechaza en las cuatro calidades/perfiles.
- `node tests/shore-live.mjs`: aplicación completa en PC 1280×800 y teléfono táctil emulado 390×844, sin teletransporte ni escritura en estado. Recorre muelle → (−7,20) → hierba central (0,20) → (7,20) → muelle. En ambas calas cambia de modo, rechaza un intento hacia tierra, lanza hacia el lago con yaw ±0,20, recupera el aparejo y continúa. Dos lances válidos por perfil; regreso a modo pesca en (0,7), sin errores JavaScript/shaders. Error máximo observado de unión del sedal <0,000001 m. La primera ejecución alcanzó ambas calas, pero el guion frenó fuera de 0,18 m del puesto original al regresar; se refinó su aproximación con pulsos, sin cambiar la tolerancia ni la inercia del juego. La ejecución completa posterior pasó.

Se inspeccionaron las capturas de la aplicación en cala este PC y teléfono: lago visible, caña y sedal presentes, HUD y botones accesibles. Artefactos ignorados: `test-results/shore-browser.json`, `shore-live.json`, `shore-live-{desktop,phone}-{west,east}.png` y capturas de los cuatro perfiles. Servidor local: `http://127.0.0.1:5174/`.

**Revisión manual propuesta:** V / botón para explorar, salir por detrás del muelle, cruzar la hierba además del sendero, visitar ambas calas, orientar hacia agua libre y pescar con V / botón. Mantener/soltar Espacio o LANZAR; probar también hacia tierra y cambiar potencia. Recuperar con R o Equipo → recuperar, explorar y regresar al muelle. Se conservan controles habituales.

**Límites:** raycasts segmentados y troncos simplificados, no física continua; mapa exterior acotado y sin posición persistente. No se ha realizado una captura completa nueva en navegador, prueba física Android/iOS, WebKit ni benchmark térmico. Combate/captura se comprueban en dominio; IA y frecuencia de picadas no se cambian. BUG-002/003 implementados con regresiones, **pendientes de revisión del propietario; B no aceptada**. Sin commit, push, tags ni release.
