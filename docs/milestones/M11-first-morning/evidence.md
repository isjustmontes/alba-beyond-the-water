# Evidencia · The First Morning

## Etapa B · 26/11/2026 · base local `107ac34`

A aprobada por el encargo B y guardada como `docs: plan the first morning milestone`; implementación B aún sin commit, aceptación humana pendiente. Sólo previsualización DEV opt-in; ningún nuevo escritor ni clave de persistencia, ni cambio de aparición habitual.

- `node --test tests/first-morning.test.js tests/exploration.test.js tests/input.test.js tests/zones.test.js tests/village.test.js`: **25/25 PASS**, seis nuevas pruebas. Duración, distintos dt, corredor libre/altura, entrega exacta, salto idempotente, suspensión/deltas inválidos y movimiento reducido; regresiones relevantes de controles/zonas. Primera ejecución detectó diferencia flotante en pose final (23/25); corregida copiando exactamente el destino al completar, segunda ejecución 25/25.
- `npm.cmd run build`: **PASS**, 64 módulos; JS 719,72 kB (gzip 202,80), CSS final 42,03 kB (gzip 9,24). Aviso conocido de chunk >500 kB conservado, sin refactorizaciones ni dependencia nueva. Build final tras ajustes de timeline y presentación reducida.
- Revisión de capturas de inicio/mitad PC y teléfono vertical: plaza/arquitectura visibles, sin intersección de edificios en el recorrido; texto y salto dentro de pantalla. Materiales/luz/clima rurales actuales, sin modificaciones ambientales.
- Primera ejecución de `tests/first-morning-browser.mjs`: cuatro perfiles PASS (PC 1280×800, teléfono 390×844, horizontal 844×390, tablet 1024×768 con movimiento reducido), más fin natural/cambio de preferencia/arranque habitual PASS. Comprueba entrega de cámara/modo/altura, gesto mantenido, ausencia de acciones/menús accidentales, movimiento posterior, guardados sin cambios por presentación y errores JS/consola ausentes en perfiles. Segunda ejecución amplía la cobertura con blur/focus y uso táctil simultáneo de ambos joysticks; resultado final se registra abajo.

**Resultado ampliado final:** cuatro perfiles y grupo de finalización natural/cambio de preferencia/arranque normal **PASS**. Blur/focus suspende cámara sin abrir pausa; caminar/mirar con dos dedos funciona después de la entrega. La segunda ejecución encontró un error de fixture: usar WASD en el perfil móvil seleccionaba correctamente interfaz de escritorio y ocultaba los joysticks; se corrigió la prueba para verificar teclado en PC y entrada táctil en móvil, sin cambiar el detector del juego. Tercera ejecución completa PASS, sin errores JS/consola detectados en los cuatro perfiles. Inspeccionadas capturas PC inicial/intermedia, teléfono vertical y tablet posterior. `git diff --check` correcto; sólo B y documentación asociada pendientes, dartfish sigue en `7ecc8f7`. Nada de `test-results/` incluido en Git.

**Entorno y límites:** Windows, Edge/Chromium headless vía Playwright, WebGL/SwiftShader, misma máquina local; son perfiles emulados, no Android/iOS físicos ni Safari/WebKit. Sin benchmark sostenido o comparación FPS certificada; la animación añade sólo cinco interpolaciones escalares/pose, sin asignaciones de vectores por frame ni nuevos pases/recursos 3D. Se retiran listeners al finalizar; carga rural adelantada sólo en preview. Recursos de evidencia en `test-results/first-morning-*`, ignorados por Git.

**Revisión manual:** servidor local `http://127.0.0.1:5181/?intro=1` (abrir sólo en desarrollo; puerto 5177 ya ocupado y no alterado). Esperar recorrido completo o saltar con Espacio/Escape/botón; caminar y mirar tras llegar a plaza; activar movimiento reducido del sistema/navegador y recargar para omitir desplazamiento. Sin parámetro, inicio de pesca en muelle. La activación automática sólo en partidas nuevas, la persistencia de introducción y la aparición de producto quedan expresamente pendientes de autorización posterior.

## Etapa A · registro histórico

**SHA y fecha** — Base `f7751bf1ff85c5c4e9524e614506fcfe8b5574b1`, 26/11/2026. Documentación A aún sin commit. No atribuir resultados históricos de M10 a M11.

**Equipo, navegador y perfil** — Inspección estática en Windows/PowerShell, worktree `C:/Users/idade/orca/workspaces/gpt-prueba/wolffish`. Sin navegador, emulación ni dispositivo físico utilizado para M11-A.

**Comandos y datos reales**

- `git status --short`: limpio antes de editar; rama inicial `feature/v0.9.0-stories-of-the-village`.
- `git fetch origin`: correcto; `git log -1 origin/main` y `git rev-parse 'v0.9.0^{commit}'`: ambos `f7751bf1ff85c5c4e9524e614506fcfe8b5574b1`.
- `gh release view v0.9.0 --repo isjustmontes/alba-beyond-the-water --json tagName,isPrerelease,url,publishedAt`: v0.9.0 publicada a las `2026-11-26T19:34:37Z`, pre-release. [Release comprobada](https://github.com/isjustmontes/alba-beyond-the-water/releases/tag/v0.9.0).
- `git switch -c feature/v0.10.0-first-morning origin/main`: correcto desde base verificada, sin commits adicionales.
- `git worktree list`: wolffish en nueva rama; dartfish continúa en `isjustmontes/dartfish`, `7ecc8f7`; no modificado.
- Lectura de AGENTS, índice, constitución/flujo/plantillas, STATUS, ROADMAP, M10, arquitectura/módulos y diseño del juego. Inspección relevante: `main.js`, `world.js`, `zones.js`, `input/exploration.js`, `village-layout.js`, `shop.js`, `audio.js`, `simulation/environment.js`.

**Resultado e incidencias** — Diagnóstico documentado: inicio fijo en muelle; tienda escribe al iniciar; cámara aplicada por main cada frame; aldea diferida; poses sólo en sesión; amanecer predeterminado 06:24. M11 define clasificación conservadora previa a escrituras, marcador aditivo y arbitraje de cámara. Coordenadas/curvas propuestas sin validación visual. No se detectó divergencia de base ni cambios pendientes iniciales.

**Revisión documental final** — `git diff --check` sin incidencias; `git status --short` muestra únicamente siete documentos canónicos modificados y la nueva carpeta M11 con sus seis documentos. HEAD permanece en la base publicada, rama nueva correcta; sin archivos de código/assets ni cambios staged. Índices, STATUS, ROADMAP y trazabilidad enlazan M11 y mantienen el historial anterior.

**Límites** — Sin implementación, tests, build, medidas de rendimiento ni pruebas visuales/accesibles en A. Sin código/assets/guardados modificados; sin commit, push, tag ni release. A pendiente de aprobación humana; B–E no autorizadas. Los procedimientos de aceptación no son resultados ejecutados.
