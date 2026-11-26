# Evidencia · First Steps · Etapa A

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
