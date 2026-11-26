# Hoja de ruta propuesta

**M08-D actual:** C aceptada y guardada en `19d31c5`; D completa persistencia/uso de equipo sin ampliar mecánicas RPG. Selección/montaje y compatibilidad local implementados, pendientes de validación del propietario; no se autoriza siguiente etapa, backend, misiones ni publicación.

**M08-C actual:** B aceptada en `1b46d47`; el propietario autoriza tienda/economía básica agrupando T04/T05/T06 como C. Implementación y evidencia pendientes de aceptación humana; no se abren interiores, ingresos, misiones ni NPC. Se conserva el historial de etapas inferior.

**M08-B vigente:** propietario acepta A y autoriza aldea y conexión como una sola Etapa B (T02/T03). Tienda únicamente exterior; compras, economía e inventario nuevo permanecen pendientes de autorización posterior. Detenerse tras evidencia técnica y revisión visual; no publicar.

**Planificación autorizada v0.7.0:** [M08 · Angler's Village](../milestones/M08-anglers-village/README.md), sólo Etapa A SDD pendiente de aprobación. Etapas propuestas: B conexión de zonas, C pueblo/sendero, D tienda, E economía/inventario persistente, F validación. «M08 Técnicas de pesca» de la tabla histórica inferior era candidato sin ficha y queda como propuesta futura sin ID; no se renumeran requisitos ni hitos existentes. No se autoriza código ni se acepta M07 retrospectivamente. Base publicada v0.6.0, `28432a5`.

**26/11/2026 · Entrega v0.6.0 autorizada.** Implementación M07 A–D cerrada para pre-release, D conservada en `be1430a`. A/B/C aceptadas; D y aceptación final pendientes. La autorización actual sustituye las restricciones históricas de publicación inferiores; no autoriza ampliar funcionalidades ni abrir otro hito.

La línea publicada es M06. Antes de ampliar el lago conviene decidir si las entradas táctiles, el audio y la frecuencia de cuadro son aceptables en los equipos de los jugadores. Las siguientes agrupaciones requieren decisión del propietario.

**Actualización autorizada:** M07 identifica ahora [First Steps · v0.6.0](../milestones/M07-first-steps/README.md), con Etapa A validada y sin publicar. La anterior propuesta «M07 Calidad de entrega» permanece como candidata sin ID asignado; no se renumeran requisitos o tareas existentes.

La **Etapa B** está aceptada en `00208d9` y **C** en `b7ae025` (pesca libre, correcciones y carrera). El propietario autoriza **D**, arquitectura mínima de zonas sobre Lago Sereno: datos y planificación, sin destinos nuevos jugables ni transición visual. D queda sin commit y pendiente de aceptación. No se autoriza publicación ni otra etapa.

| Orden | Hito candidato | Valor y dependencia | Coste y salida |
| --- | --- | --- | --- |
| 1 | Estabilizar M06 | Confirmar el alcance de dispositivos y medir sobre el artefacto actual | M. Captura, recarga y sesión larga con umbrales aprobados |
| 2 | Calidad de entrega (candidato sin ID asignado) | Evitar publicar regresiones; parte de una baseline reproducible | M. Gates aprobados, versión coherente y ensayo de recuperación |
| 3 | M08 Técnicas de pesca | Probar primero el spinning sin boya y un único equipo alternativo; cambia el contrato visual del lanzamiento | L. Un ciclo completo por técnica con pruebas de equilibrio |
| 4 | M09 Ecología y entorno | Persistir condiciones antes de ampliar especies y obstáculos. Estaciones y nuevos lagos requieren datos y presupuesto de escena | L–XL. Migración compatible y comportamiento espacial repetible |
| 5 | M10 Experiencia | Priorizar ayuda contextual y accesibilidad antes de ampliar progresión y desafíos | M–L. Prueba con jugadores y restauración segura de datos |

Reelaborar carrete, física de sedal, interacción con cebo y combate sólo tras acordar qué decisión nueva ofrece al jugador. Las manos articuladas requieren modelo, licencia, validación de agarre y medición física. Una importación del diario requiere definir conflictos y validar datos externos. [Backlog](BACKLOG.md)
