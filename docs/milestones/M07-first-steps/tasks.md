# Tareas · First Steps · Etapa A

## Etapa C · tareas autorizadas

M07-T11 · REQ-EXP-009: carrera 1,5× Shift/botón táctil sólo exploración, con suavizado, colisión y limpieza (IMPLEMENTED_UNVERIFIED). T10 añade auditoría de picadas lejanas: sin límites adicionales del muelle reproducidos; regresión de 3 zonas/8 semillas y agua vacía, sin alterar IA/probabilidades. C pendiente de validación humana.

Tras la prueba del propietario se reabren T07/T09 para guardas espaciales, distribución y regresiones. Añadir M07-T10 · REQ-EXP-008: hogares/hábitat fuera del muelle y movimiento válido (IN_PROGRESS). C no está aceptada; los resultados anteriores son históricos y no cubrían estas direcciones ni distribución.

Implementación corregida: T07/T09/T10 **IMPLEMENTED_UNVERIFIED**; T10 incluye 7 regresiones de hábitat, llegada húmeda, persecución y combate/captura. Revisión humana C pendiente. Mantener T08 y las transiciones previas.

| ID | Requisito / alcance | Dependencia | Validación | Estado |
| --- | --- | --- | --- | --- |
| M07-T07 | REQ-EXP-006 · Pesca libre en ribera navegable segura | B aceptada `00208d9` | Suelo/agua/cuenca, origen actual y guardas; lances fuera de radios B | IMPLEMENTED_UNVERIFIED |
| M07-T08 | REQ-EXP-007 · Transiciones y entradas | T07, rig y controles existentes | Suavidad, equipar/guardar, entradas mantenidas y giros | IMPLEMENTED_UNVERIFIED |
| M07-T09 | NFR-EXP-001 ampliado a C · Compatibilidad y evidencia | T07/T08 | Flujo muelle/ambas calas PC/táctil, pruebas y build | IMPLEMENTED_UNVERIFIED |
| M07-T10 | REQ-EXP-008 · Hábitat y distribución fuera del muelle | T07; geometría real y FishSchool | 27 agentes, riberas/interior, patrulla, obstáculos, persecución y combate | IMPLEMENTED_UNVERIFIED |

T04/T05/T06 (B) VERIFIED por aceptación del propietario. No publicar ni confirmar C hasta nueva autorización.

**ID y requisito** — Sólo las tres tareas de la etapa autorizada; no se abre la Etapa B.

| ID | Requisito y cambio acotado | Dependencias | Prueba | Estado | Esfuerzo restante / bloqueo |
| --- | --- | --- | --- | --- | --- |
| M07-T01 | REQ-EXP-001 · Movimiento suavizado y límites del muelle | Geometría actual de tablas; `Exploration` | `exploration.test.js`: diagonales, velocidad, límites y tasas de actualización | VERIFIED | Ninguno dentro del alcance; terreno exterior excluido |
| M07-T02 | REQ-EXP-002 · Cambio de modo y conservación de la pesca | M07-T01; acciones y origen de pesca existentes | `exploration.test.js`, `input.test.js`, `fishing.test.js`, `exploration-browser.mjs` | VERIFIED | Ninguno dentro del criterio; no habilita pesca desde nuevas posiciones |
| M07-T03 | REQ-EXP-003 · Ratón, joystick, cámara y presentación contextual | M07-T02; detección táctil y HUD existentes | `exploration-browser.mjs`: PC, teléfono vertical/horizontal y tablet; validación del propietario | VERIFIED | Validación física y sesión larga pendientes, fuera de este criterio acotado |

**Dependencias** — La base publicada sigue siendo v0.5.0; el merge incorpora SDD sin alterar código de la Etapa A.

**Prueba, esfuerzo restante y bloqueo** — Resultados, incidencias y límites en [evidence.md](evidence.md). Para otra etapa se debe acordar primero alcance, requisitos y criterios según el flujo SDD.

## Etapa B · tareas autorizadas

| ID | Requisito / cambio acotado | Dependencia | Prueba prevista | Estado |
| --- | --- | --- | --- | --- |
| M07-T04 | REQ-EXP-004 · Superficie continua y sendero con colisiones | M07-T01 y modelo del paisaje | Continuidad, ida/vuelta, agua/obstáculos y raycast contra mallas reales | VERIFIED |
| M07-T05 | REQ-EXP-005 · Dos puestos naturales adicionales y origen espacial | M07-T02, M07-T04 | Lanzamiento, recogida y traslación de combate desde cada origen; límites de agua | VERIFIED |
| M07-T06 | NFR-EXP-001 · Validación y evidencia PC/móvil | M07-T03–T05 | Recorrido de cuatro perfiles, aplicación real PC/táctil, suite y build | VERIFIED |

El propietario aceptó B incluidas correcciones al autorizar C; commit local `00208d9`. Las notas siguientes conservan el historial de estados previo a esa aceptación.

Estos estados indican implementación y comprobaciones técnicas disponibles, con aceptación visual/funcional del propietario aún pendiente. No hay bloqueo de implementación declarado ni autorización para publicar. [Evidencia](evidence.md).

Corrección autorizada tras prueba real: reabrir M07-T04 y M07-T05 (IN_PROGRESS) por muro invisible sobre tierra seca y restricciones injustificadas de pesca. M07-T06 debe recorrer y lanzar desde **ambas** calas y regresar en aplicación completa PC/móvil; conservar resultados anteriores como históricos, no como aceptación actual.

Tras la corrección BUG-002/003, T04/T05/T06 vuelven a **IMPLEMENTED_UNVERIFIED**: 95/95 pruebas, build y recorridos completos PC/teléfono emulado correctos, incluido rechazo hacia tierra y regreso. Mantener estos estados hasta aceptación visual/funcional del propietario. [Registro posterior a la prueba real](evidence.md#corrección-b-tras-prueba-real--26112026--aceptación-pendiente).
