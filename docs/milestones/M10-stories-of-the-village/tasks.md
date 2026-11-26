# Tareas · Stories of the Village

**Shopkeeper - current:** T10 / REQ-NAR-006 / AC-NAR-08 - IMPLEMENTED_UNVERIFIED: reuse accepted Manuel panel/session/sign for shopkeeper, add concise branching script and existing-catalog handoff, focused logic/browser/build evidence. Do not commit any pending work; preserve dartfish.

**M10-T09 / REQ-NAR-005 / AC-NAR-07 - VERIFIED:** accepted conversation retained; implement portrait sign and contextual billboard only, validate geometry/visibility conditions and PC/mobile captures/build. No navigation, narrative or gameplay edits.

**Current C:** T03/T04/T08 implemented, pending owner validation; B/T07 accepted in `6086909`. Automated graph, interaction and regression checks are recorded in evidence. No C commit or publication. The earlier NOT_STARTED descriptions are historical planning, not current implementation.

**Alcance vigente de B:** el propietario autoriza interfaz/previsualización con assets aportados, sin conversación completa ni conexión al juego. A conservada en `49f54c3`. T02/T03 avanzan parcialmente según ese encargo; T07 identifica la entrega B acotada y su aceptación visual pendiente. No iniciar D ni completar guion sin nuevo encargo.

**Dependencia global:** v0.8.1 publicada y rama desde main verificada; propietario decide aprobación de A y autoriza B–E individualmente. No implementar ni producir assets al completar esta ficha.

| ID / etapa / requisito | Dependencias | Cambio acotado propuesto | Prueba, esfuerzo restante y bloqueo | Estado |
| --- | --- | --- | --- | --- |
| M10-T01 · A · todos | Base limpia y dirección visual aprobada | Planificar MVP, contratos, presupuestos y aceptación con las plantillas | A validada expresamente al encargar B y su commit; sin tests/build en A | VERIFIED |
| M10-T02 - B/C - REQ-NAR-001/002, NFR-NAR-001 | B accepted | Supplied artwork unchanged; full local script integrated | Script owner review pending; asset budget/variants/public license remain partial | PARTIAL |
| M10-T03 - C - REQ-NAR-001/002/004, NFR-NAR-002 | B accepted | Original panel connected to pure 13-node conversation | Graph and modal/input regression checks; owner acceptance pending | VERIFIED |
| M10-T04 - C - REQ-NAR-003/004, NFR-NAR-003 | Current C request supersedes original D schedule | Existing bench, E/mobile contextual action, clearHeld/pause/return | Proximity/blockers, shop/travel/map coexistence and held-input tests | VERIFIED |
| M10-T05 · E · NFR-NAR-001/002/003 | D aceptada, E autorizada | Validación final acotada, recursos y documentación; sin ampliar contenido | Ejecutar sólo entonces tests pertinentes/build, PC y teléfonos/tablet emulados; registrar errores/bytes/recursos y límites físicos. Esfuerzo pequeño/medio | NOT_STARTED |
| M10-T06 · E · todos | Evidencia técnica y revisión humana | Registrar aceptación final y preparar propuesta de entrega | Publicación/commit/tag requieren autorización posterior expresa; no inferir aceptación por pasar tests | NOT_STARTED |
| M10-T07 - B - REQ-NAR-001, NFR-NAR-002 | A accepted, supplied art | Reusable illustrated panel and isolated preview | Six profiles/build passed; owner visually accepted B, commit 6086909 | VERIFIED |
| M10-T08 · C · REQ-NAR-002/003/004 | B aceptada | Manuel integrado, conversaciones y control modal | Grafo puro, proximidad, regresiones PC/móvil, build | VERIFIED |

Cada entrega se detiene para revisión. Si falla un criterio grave, resolver dentro del alcance antes de avanzar; si exige otro sistema/asset/licencia, consultar. No se asigna fecha de publicación ni se presenta trabajo propuesto como completado.
