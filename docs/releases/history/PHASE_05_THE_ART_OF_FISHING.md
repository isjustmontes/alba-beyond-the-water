# ALBA v0.4.0 — The Art of Fishing

Fase 5 de **ALBA — Beyond the Water**, en desarrollo (Pre-Alpha). Esta fase mejora la representación de la pesca sobre Living Waters; conserva sus decisiones de IA, meteorología, equipamiento, capturas y controles.

## Base y seguridad

La rama `feature/v0.4.0-art-of-fishing` nace del tag publicado `v0.3.0`, commit `ccee43f70462bba5046bf02c80e0b981c22d0399`, tras comprobar `origin/main` mediante fetch y revisar ramas, worktrees y un estado limpio. El trabajo se limita a `wolffish`. No se han modificado `main`, los otros worktrees, los tags ni el repositorio remoto durante esta fase. Los cambios se entregan sin commit ni publicación.

## Lanzamiento por encima de la cabeza

El diagnóstico encontró dos problemas: el signo de la rotación inicial bajaba la punta antes de levantarla, y la trayectoria del flotador se iniciaba desde el agua sin una liberación sincronizada con la punta.

La nueva secuencia utiliza el pivote existente en espacio de cámara y curvas de aceleración, en lugar de invertir el movimiento antiguo:

| Fase | Tiempo desde soltar el control | Comportamiento |
| --- | --- | --- |
| Preparación | Mientras se mantiene pulsado | Levanta y lleva la caña hacia atrás; preparación completa en unos 0,42 s, con flexión progresiva. |
| Carga final | 0–0,12 s | Completa la posición elevada, incluso en lanzamientos cortos. |
| Aceleración | 0,12–0,32 s | Movimiento hacia delante con velocidad angular creciente y acumulación de flexión. |
| Liberación | 0,32 s | Un único evento libera el aparejo desde la punta real elevada. |
| Seguimiento | Hasta 0,53 s | Continúa hacia delante, con continuidad de velocidad al liberar. |
| Impacto | 1,10 s | El aparejo alcanza el destino; se activa la pesca y aparecen ondas y gotas. |
| Recuperación | Hasta aproximadamente 1,55 s | Vuelve a la postura de pesca con oscilación breve amortiguada. |

Se conservan la carga de potencia, el alcance de 9–40 m y el tiempo total de lanzamiento de 1,1 s. La parábola visual une la posición real de liberación y el destino calculado por la lógica anterior, incluido el viento. La cámara no se mueve para simular el gesto. La preparación y el origen elevado evitan lanzar a través del punto de vista; el recorrido normal sale hacia la zona de agua del muelle. No se añade un sistema general de colisiones del aparejo contra todos los objetos.

## Arquitectura de animación

- `src/animation/fishing-motion.js`: tiempos compartidos, poses por estado, curvas de lanzamiento, trayectoria, sedal, resorte amortiguado y condiciones visuales de salto. Es lógica pura, comprobable sin WebGL.
- `src/fishing.js`: conserva la simulación; añade el tiempo de preparación, el evento único `line-release` y el contador de tirones que sincroniza los efectos.
- `src/visuals/rod.js`: tubo continuo deformado en GPU, normales corregidas, anillas y punta coherentes con la flexión; rotor, manivela, bobina y sockets de agarre.
- `src/animation/fish-motion.js`: suaviza velocidad, posición, orientación, inclinación y fase de nado sin escribir en los agentes de IA.
- `src/visuals/fish.js`: deformación por ejemplar y animación de cola; recursos geométricos y texturas compartidos, variantes de material acotadas.
- `src/world.js`: integra las poses con la cámara, trayectoria, aparejo, presentación de captura, combate, peces y agua.
- `src/visuals/water.js` y `effects.js`: elevación CPU coherente con las olas del shader, ondas locales y partículas reutilizadas.
- `src/visuals/hands.js`: frontera de integración opcional para manos riggeadas revisadas.
- `src/main.js`, `index.html`, `src/phase5.css` y `src/audio.js`: ajuste experimental, estados de efectos y sonido discreto de salida de sedal.

## Caña, carrete y sedal

La flexión responde a preparación, aceleración, recuperación, picada y tensión del combate. Un resorte con pasos internos de hasta 1/120 s conserva continuidad y permite recuperar gradualmente la forma al descargar. Las normales de iluminación acompañan la deformación, evitando que un tubo curvado siga iluminado como uno recto.

El rotor y la manivela giran al recoger, con velocidad derivada de la recuperación efectiva y la fatiga durante el combate. La bobina oscila axialmente y responde a la salida de sedal durante un tirón. Se agrupan las vueltas de hilo y los bordes del carrete para reducir objetos de dibujo.

El sedal principal reutiliza 61 puntos: sus extremos quedan sujetos a la punta y al aparejo, con caída variable y desplazamiento moderado por viento. Con tensión se endereza. Un tramo terminal une el flotador y el señuelo visible, incluido el vuelo. Durante el combate la línea llega a la boca del pez renderizado y acompaña sus movimientos y saltos. Se mantiene el sistema de flotador de las versiones anteriores; no se convierte toda la pesca en un nuevo sistema de spinning sin boya.

## Peces e interacción con el agua

La frecuencia de ondulación depende de la velocidad real. Los giros utilizan el camino angular corto, el cuerpo se inclina al virar y subir, y las transiciones de posición/profundidad se suavizan sin modificar las decisiones ambientales o las posiciones de la IA. Cada ejemplar tiene su fase y amplitud; el cuerpo y la cola se mueven de forma coordinada. Se mantienen los cinco modelos y sus niveles de detalle.

Truchas y lubinas pueden saltar visualmente en algunos tirones del combate: después de cuatro segundos, con resistencia disponible, tensión intermedia y un intervalo mínimo de seis segundos entre saltos. El arco dura un segundo y produce perturbaciones al salir y entrar en el agua. No se añaden saltos aleatorios a carpas, percas o tencas. El salto es una representación visual: no introduce una simulación balística nueva en la IA ni cambia las probabilidades de captura.

La caída del aparejo, las picadas, los tirones y el aterrizaje de peces reutilizan el sistema de partículas existente. Hay cuatro ondas transitorias en el shader, con vida de 2,8 s, y 48 gotas reutilizadas. La recogida deja ondas discretas con un intervalo mínimo de 0,32 s. El flotador acompaña las mismas ondas que calcula el agua, incluido el viento de Living Waters. No hay un pase de renderizado nuevo para estas perturbaciones.

## Manos experimentales: integración preparada, sin modelo

No se encontraron modelos GLB/glTF ni recursos esqueléticos reutilizables en el proyecto. Se retiraron la cápsula de mano y la manga cilíndrica provisionales. No se han descargado ni incorporado modelos externos.

**`First-Person Hands (Experimental)`** aparece en Equipo desactivado y no disponible, con el aviso «Sin modelo validado. Desactivado.». No es una función visual completada. La pesca funciona íntegramente sin ella.

La caña expone `RodGrip_R` y el carrete `ReelGrip_L`. `FirstPersonHands.mount()` recibe modelo, controlador de animación, procedencia, licencia y una confirmación explícita de validación visual. Requiere un modelo esquelético y mantiene el ajuste apagado al montarlo. El controlador recibe los dos sockets y un contexto reutilizado con estado, tiempo, potencia, tensión y velocidad de carrete; `setEnabled()` permite alternarlo sin tocar las mecánicas. La comprobación de campos es una barrera de integración, no una auditoría automática de la licencia o calidad del recurso.

Para completar esta función hacen falta:

- Dos manos anatómicamente convincentes y antebrazos en GLB/glTF, con rig de dedos, escala y ejes revisados y materiales PBR compatibles con la luz del lago.
- Poses y clips de agarre, reposo, preparación, lanzamiento, recogida, picada, lucha y captura; un adaptador para retargeting o IK y alineación con ambos sockets.
- Verificación de dedos, intersecciones, encuadre, materiales y rendimiento en PC, teléfono y tablet antes de habilitar la función.
- Procedencia y licencia documentadas: preferentemente material propio o CC0; cualquier recurso con atribución requiere conservar sus créditos y comprobar su compatibilidad antes de incorporarlo. No se han admitido recursos de pago ni recursos con restricciones incompatibles.

No se añade un cargador GLTF ni dependencias para una función que todavía no tiene recurso validado.

## Calidad visual y rendimiento

Las mejoras se concentran en objetos visibles durante la pesca: flexión y normales de caña/cuerpo, movimiento de carrete, aparejo continuo, nado suave y perturbaciones del agua. Se conservan cielo, iluminación, reflejos, niebla, lluvia y selección de calidad de Living Waters. No se añade postprocesado pesado.

Se reutilizan buffers, vectores de trabajo, geometrías, texturas y partículas. Los puntos de anillas se calculan al crear la caña. Los materiales animados por pez se guardan en una caché con un número de slots acotado; las capturas reutilizan su slot. La integración desactivada de manos no ejecuta un controlador ni carga modelos.

Comparación automatizada en Edge headless, Intel Iris Xe mediante ANGLE/D3D11, 1280×800, misma escena inicial y dos perfiles gráficos, 120 intervalos RAF por muestra:

| Medida | v0.3.0 base | Fase 5 |
| --- | --- | --- |
| Mediana entre fotogramas, alta / baja | 16,7 / 16,7 ms | 16,7 / 16,7 ms |
| Percentil 95, alta / baja | 16,8 / 16,8 ms | 16,8 / 16,9 ms |
| Geometrías registradas en reposo, alta / baja | 118 / 119 | 108 / 109 |
| Texturas registradas | 17 | 17 |

La reducción de geometrías procede de agrupar piezas y retirar los provisionales. El nuevo tramo terminal añade una geometría al hacerse visible durante la pesca. Las llamadas de dibujo varían por reflejos y visibilidad y no se usan como una mejora porcentual garantizada. La muestra está limitada por la cadencia del navegador: no mide tiempo puro de GPU, no es una prueba de carga sostenida de combate y no garantiza 60 FPS en cualquier móvil. Métricas y capturas locales se guardan en `test-results/art-baseline-*` y `art-final-*`, fuera de Git.

El bundle sigue mostrando el aviso previo de Vite por superar 500 kB; no se han añadido dependencias. La compilación previa a esta fase generaba 600,58 kB de JS (161,56 kB gzip); la nueva genera 611,99 kB (165,64 kB gzip). Dividir Three.js y cargar recursos futuros bajo demanda queda pendiente.

## Cómo probar

Con las dependencias ya instaladas:

```powershell
npm.cmd run dev
```

Abre la URL que indique Vite. Si faltan dependencias, ejecuta antes `npm.cmd install`. En otros sistemas se puede usar `npm` en lugar de `npm.cmd`.

1. Mantén clic izquierdo o Espacio durante medio segundo o más: la punta debe subir y retroceder. Suelta: debe avanzar desde arriba y liberar el aparejo antes del impacto. Repite con pulsaciones cortas y con máxima potencia.
2. Observa el señuelo colgando del flotador durante el vuelo, las ondas de impacto y el retorno amortiguado de la caña. **R** recupera el aparejo.
3. Mantén el control durante la espera para recoger: rotor y manivela deben girar y la boya dejar pequeñas ondas. Suelta para detener la recuperación gradualmente.
4. Clava durante una picada; alterna recoger y soltar durante la lucha. La caña debe doblarse con la tensión, el sedal seguir al pez y el carrete responder. Algunas truchas y lubinas saltan; no se garantiza un salto por combate.
5. Abre **E / EQUIPO**: el ajuste experimental de manos debe estar desmarcado y deshabilitado. Cambia el señuelo y consulta el cuaderno con **J / CUADERNO**; las capturas previas siguen ahí.
6. Comprueba el entorno con `/?day=60&hour=5` y `/?hour=19&weather=heavyRain&transition=2`. Estos parámetros de observación ya existían y siguen siendo exclusivos del servidor de desarrollo; producción los ignora.

**PC:** se conservan clic izquierdo / Espacio para cargar, clavar y recoger; botón derecho y arrastrar para mirar; R, E, J, P, H, M y F conservan recuperar, equipo, cuaderno, pausa, ayuda, sonido y pantalla completa.

**Móvil/tablet:** arrastra sobre el paisaje para mirar; mantén y suelta LANZAR y utiliza el mismo botón al pasar a CLAVAR o RECOGER. EQUIPO y CUADERNO conservan sus paneles. Es posible mirar y recoger simultáneamente. No se añade movimiento del jugador ni joystick. Prueba también ambas orientaciones.

Para un teléfono en la misma red privada:

```powershell
npm.cmd run dev:lan
ipconfig
```

Abre `http://IP_LOCAL_DEL_PC:5173/` en el teléfono, sustituyendo IP y puerto por los que correspondan. Si Windows pide acceso, permite Node/Vite en la red privada. No es necesario publicar el juego. La validación de esta fase se ha realizado con emulación; no se han probado dispositivos físicos Android o iOS.

## Pruebas realizadas

- **47/47 pruebas Node correctas**: incluidas las regresiones de IA, clima, combate, fatiga, capturas, migración y entrada táctil; nuevas pruebas de curvas, liberación única, cancelación, trayectoria, sedal, resorte a distintas frecuencias, nado sin mutar la IA, ondas acotadas e integración de manos desactivada.
- **Escritorio en navegador:** lanzamiento, captura, equipo, cuaderno, persistencia y cámara; ajuste de manos sin recurso no habilitable.
- **Teléfono y tablet emulados:** pesca completa por entrada táctil, cámara, multitáctil, cancelación, menús, cambios de orientación e interfaz híbrida.
- **Entorno:** los seis períodos del día, vuelta del reloj, seis condiciones meteorológicas, audio, pausa y HUD en teléfono vertical/horizontal y tablet.
- **Animación determinista en WebGL:** cuadros de reposo, preparación, carga, liberación elevada, seguimiento, vuelo, impacto, recuperación, recogida, lucha, salto y aterrizaje en 1280×800, 390×844 y 844×390. Comprueba anclajes, carrete, flexión y efectos. Para saltos se prepara explícitamente el estado del escenario de prueba; la prueba completa de entrada real permanece separada.
- **Modelos:** compilación de shaders, materiales compartidos, recursos estables y deformación de la caña; cinco especies.
- **Producción:** compilación correcta y comprobación del resultado servido mediante preview; WebGL, entorno, UI PC/móvil, equipo y audio, sin parámetros de observación de desarrollo.
- **Inspección visual:** capturas de preparación, avance, vuelo y salto. Las suites vigilan errores de JavaScript y de compilación de shaders; no se detectaron errores en los escenarios ejecutados.

Comandos reproducibles, con el servidor de desarrollo abierto en otra terminal:

```powershell
$env:ALBA_TEST_URL='http://127.0.0.1:5173'
npm.cmd test
npm.cmd run test:browser
npm.cmd run test:mobile
npm.cmd run test:environment
npm.cmd run test:animation
node tests/models.mjs
node tests/visual.mjs art-final
npm.cmd run build
npm.cmd run preview -- --port 5175 --strictPort
```

Con preview abierto, ejecuta `npm.cmd run test:production` en otra terminal. Las pruebas utilizan Edge instalado en Windows o el Chromium configurado en Playwright; se puede especificar otro ejecutable mediante `ALBA_BROWSER_PATH`. Los resultados gráficos y JSON quedan en `test-results/`, ignorado por Git. En esta sesión se usaron desarrollo 5174 y preview 5175 para no interferir con otros servidores.

## Limitaciones y siguientes mejoras

- Faltan el modelo y la animación de manos: la arquitectura no equivale a una integración visual completa.
- El sedal, la caña y los saltos usan aproximaciones visuales eficientes. No se simulan colisiones de cada tramo de hilo ni la física completa del pez fuera del agua.
- El lanzamiento conserva su duración breve y el flotador histórico para mantener la jugabilidad. Una futura modalidad de spinning sin boya necesitaría decisiones de diseño y pruebas propias.
- Quedan pendientes sesiones largas de equilibrio, pruebas físicas Android/iOS y validación de Safari/WebKit.
- Las mejoras no sustituyen las limitaciones ambientales de v0.3.0, como la persistencia de hora/clima entre sesiones. Las claves de guardado y las capturas anteriores no se han reiniciado ni migrado de nuevo.
- Conviene ampliar la medición a combates largos y móviles reales antes de elevar la densidad de efectos o admitir modelos esqueléticos.

**Every water has a story.**
