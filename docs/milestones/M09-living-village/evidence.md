# Evidencia · A Living Village

## B · 26/11/2026 · local, pendiente de aceptación visual

- Base A: `585e1dc`, commit local `docs: plan living village visual improvements`. Propietario aprueba A y autoriza únicamente B. Sin commit B ni publicación, sin cambios en dartfish.
- `node --test tests/village-ground.test.js tests/village.test.js tests/vegetation.test.js tests/zones.test.js`: **18/18**. Tres regresiones nuevas: altura visual idéntica en toda navegación/esquinas, continuidad de bancos exteriores y exclusión de plantas/caminos/accesos. Recorrido/colisiones y viento actuales conservados.
- `npm.cmd run build`: correcto, Vite 7.3.8, 49 módulos; JS **673,41 kB / gzip 186,70 kB** (v0.7.0: 669,57 / 185,29). Persiste aviso conocido >500 kB; sin dependencias nuevas.
- Chromium/Edge headless en Windows, DPR 1, mañana 09:00 y clima inicial despejado; PC 1280×800 alta, teléfono 390×844 baja, horizontal 844×390 baja. Vista aislada con `LakeWorld`/`FishingGame` reales; mismos encuadres/base y candidato. Capturas revisadas de plaza, caminos y márgenes; sin errores JS/shaders. Prueba reproducible `node tests/village-visuals.mjs candidate` con servidor `npm.cmd run dev -- --port 5175`; URL configurable por ALBA_TEST_URL. La misma sonda se ejecutó como `test-results/m09-view.mjs` antes/después; el guion en tests conserva esa lógica, con creación anticipada del directorio y URL configurable.
- `$env:ALBA_TEST_URL='http://127.0.0.1:5175'; node tests/shop-browser.mjs`: **PC/vertical/horizontal correctos**. Entrada T/botón, tienda/Equipo, doble toque, guardado antiguo, recarga, retorno y lanzamiento conservados. Usa fixture de posición servido, no acredita caminar toda la ruta en navegador; recorrido físico del controlador cubierto por village.test.js.

| Perfil | Mediana/p95 base → B, ms | CPU mediana/p95 base → B, ms | Draw calls base → B | Triángulos base → B |
| --- | --- | --- | --- | --- |
| PC | 33,3/33,8 → 16,7/17,0 | 2,1/3,2 → 1,3/2,5 | 29 → 30 | 96994 → 110882 |
| Teléfono | 33,3/33,9 → 16,7/17,0 | 1,8/3,2 → 1,1/1,9 | 19 → 20 | 90042 → 99450 |
| Horizontal | 33,3/34,0 → 16,7/17,2 | 2,0/2,8 → 1,0/2,3 | 29 → 30 | 90082 → 99490 |

30 frames de calentamiento, 120 muestras y cinco viajes por perfil, mismo navegador/viewport/DPR y cámara. Son muestras cortas, sujetas a planificación/rAF y backend headless: la diferencia 33→16 ms **no demuestra duplicación de rendimiento** ni presupuesto físico sostenido. Recursos sin crecimiento en cinco viajes: B PC 86 geometrías/24 texturas; vertical 71/22; horizontal 86/23 (base 85/21, 70/19, 85/20). Un draw adicional por separar robles/castaños; tres texturas procedurales adicionales residentes. Capturas/JSON locales en `test-results/m09-{baseline,candidate}*`, ignorados por Git. Sin teléfonos/tablets físicos ni WebKit; no se declara aceptado el realismo por las pruebas automáticas.

Limitaciones: relieve adicional sólo fuera de la zona transitable para cumplir colisiones intactas; follaje de tarjetas con transparencia y texturas propias, no modelos escaneados. No cambia clima/luz (D), edificios/materiales arquitectónicos (C), pesca, HUD, audio o guardados. Próxima acción: propietario revisa B visualmente.

## Historial A

**SHA y fecha** — 26/11/2026, base `5793ffbfac44ee097f06ac80a5a7b17f476195c5` (v0.7.0). Documentación A local sin commit.

**Equipo, navegador y perfil** — PowerShell en worktree `wolffish`; sin navegador, GPU ni dispositivo ensayados en A.

**Comando y datos** — `git status --short --branch`, `git worktree list`, `git fetch origin`, `git rev-parse origin/main`, `git rev-parse 'v0.7.0^{}'`; rama creada con `git switch -c feature/v0.8.0-living-village origin/main`. Lectura de contrato, constitución/flujo/plantillas, estado/roadmap, M08 y dominio/arquitectura/calidad afectados.

**Resultado, métricas e incidencias** — Árbol limpio antes de crear rama; origin/main coincide con tag publicado v0.7.0. `dartfish` conservado en `7ecc8f7`, sin cambiar su rama ni archivos. Plan A listo para revisión, no aprobado. Sin implementación, assets, pruebas, build, mediciones o publicación. Evidencias B–D pendientes; registrar SHA, entorno, configuración, métricas reales, incidencias y decisión humana al ejecutarlas.
