# Tareas · Stories of the Village

**Alcance vigente de B:** el propietario autoriza interfaz/previsualización con assets aportados, sin conversación completa ni conexión al juego. A conservada en `49f54c3`. T02/T03 avanzan parcialmente según ese encargo; T07 identifica la entrega B acotada y su aceptación visual pendiente. No iniciar D ni completar guion sin nuevo encargo.

**Dependencia global:** v0.8.1 publicada y rama desde main verificada; propietario decide aprobación de A y autoriza B–E individualmente. No implementar ni producir assets al completar esta ficha.

| ID / etapa / requisito | Dependencias | Cambio acotado propuesto | Prueba, esfuerzo restante y bloqueo | Estado |
| --- | --- | --- | --- | --- |
| M10-T01 · A · todos | Base limpia y dirección visual aprobada | Planificar MVP, contratos, presupuestos y aceptación con las plantillas | A validada expresamente al encargar B y su commit; sin tests/build en A | VERIFIED |
| M10-T02 · B · REQ-NAR-001/002, NFR-NAR-001 | A validada, B acotada autorizada | Dos WebP aportados inspeccionados y usados sin modificar, pesos/procedencia documentados | Arte integrado pendiente de revisión; no hay guion completo ni variante pequeña. Presupuesto A excedido con originales, sin falsear licencia/optimización | PARTIAL |
| M10-T03 · B/C · REQ-NAR-001/002/004, NFR-NAR-002 | B autoriza sólo presentación | Panel reusable implementado; callbacks, texto/botones reales y modal accesible, sin grafo narrativo | Seis perfiles, reutilización/foco/cierre/fallback correctos; C conversacional y pausa del juego no implementadas | PARTIAL |
| M10-T04 · D · REQ-NAR-003/004, NFR-NAR-003 | Panel C aceptado, punto seguro confirmado, D autorizada | Conectar proximidad/acción existente en aldea, pausa/limpieza y retorno al juego | Probar cerca/lejos/otra zona/barreras, competencia tienda/salida, doble toque/T repetida y dos joysticks activos al abrir/cerrar. Esfuerzo pequeño/medio | NOT_STARTED |
| M10-T05 · E · NFR-NAR-001/002/003 | D aceptada, E autorizada | Validación final acotada, recursos y documentación; sin ampliar contenido | Ejecutar sólo entonces tests pertinentes/build, PC y teléfonos/tablet emulados; registrar errores/bytes/recursos y límites físicos. Esfuerzo pequeño/medio | NOT_STARTED |
| M10-T06 · E · todos | Evidencia técnica y revisión humana | Registrar aceptación final y preparar propuesta de entrega | Publicación/commit/tag requieren autorización posterior expresa; no inferir aceptación por pasar tests | NOT_STARTED |
| M10-T07 · B · REQ-NAR-001, NFR-NAR-002 | A aceptada, recursos aportados | Interfaz ilustrada y vista temporal de desarrollo aislada del juego | `dialogue-panel-browser.mjs`: seis perfiles + API/foco/escape/fallo de imagen, build correcto. Pendiente aceptación visual del propietario | IMPLEMENTED_UNVERIFIED |

Cada entrega se detiene para revisión. Si falla un criterio grave, resolver dentro del alcance antes de avanzar; si exige otro sistema/asset/licencia, consultar. No se asigna fecha de publicación ni se presenta trabajo propuesto como completado.
