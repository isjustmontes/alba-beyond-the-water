# Tareas · First Steps · Etapa A

**ID y requisito** — Sólo las tres tareas de la etapa autorizada; no se abre la Etapa B.

| ID | Requisito y cambio acotado | Dependencias | Prueba | Estado | Esfuerzo restante / bloqueo |
| --- | --- | --- | --- | --- | --- |
| M07-T01 | REQ-EXP-001 · Movimiento suavizado y límites del muelle | Geometría actual de tablas; `Exploration` | `exploration.test.js`: diagonales, velocidad, límites y tasas de actualización | VERIFIED | Ninguno dentro del alcance; terreno exterior excluido |
| M07-T02 | REQ-EXP-002 · Cambio de modo y conservación de la pesca | M07-T01; acciones y origen de pesca existentes | `exploration.test.js`, `input.test.js`, `fishing.test.js`, `exploration-browser.mjs` | VERIFIED | Ninguno dentro del criterio; no habilita pesca desde nuevas posiciones |
| M07-T03 | REQ-EXP-003 · Ratón, joystick, cámara y presentación contextual | M07-T02; detección táctil y HUD existentes | `exploration-browser.mjs`: PC, teléfono vertical/horizontal y tablet; validación del propietario | VERIFIED | Validación física y sesión larga pendientes, fuera de este criterio acotado |

**Dependencias** — La base publicada sigue siendo v0.5.0; el merge incorpora SDD sin alterar código de la Etapa A.

**Prueba, esfuerzo restante y bloqueo** — Resultados, incidencias y límites en [evidence.md](evidence.md). Para otra etapa se debe acordar primero alcance, requisitos y criterios según el flujo SDD.
