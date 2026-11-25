# Evidencia · First Steps · Etapa A

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
