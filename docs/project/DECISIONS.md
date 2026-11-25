# Decisiones de producto e ingeniería

Las siguientes decisiones se reconstruyen de la implementación y del historial. La fecha de la auditoría acredita su observación; la motivación histórica se atribuye sólo donde figura en las notas de fase.

| Decisión observada | Consecuencia para el desarrollo | Evidencia |
| --- | --- | --- |
| Mantener una única simulación de pesca para escritorio y táctil | Una acción nueva necesita cobertura de las dos fuentes y de la cancelación | [FishingActions](../../src/input/actions.js) y [controlador](../../src/input/controller.js) |
| Conservar la clave del cuaderno al ampliar su esquema | Los registros anteriores requieren valores desconocidos explícitos en cebo y condiciones | [Migración](../../src/journal.js) |
| Mantener el flotador en el lanzamiento overhead | Una modalidad de spinning necesita una especificación de técnica independiente | [Nota de fase 5](../releases/history/PHASE_05_THE_ART_OF_FISHING.md) |
| Mantener manos experimentales desactivadas y fauna visual retirada | Los sockets y cálculos de movimiento por sí solos no acreditan una mejora visual entregada | [Manos](../../src/visuals/hands.js) y [fauna](../../src/visuals/fauna.js) |
| Identificar esta baseline por tag y SHA | README y STATUS citan v0.5.0 aunque el paquete y el HUD conserven v0.4.0 | [Historial](../releases/README.md) |

Las decisiones pendientes son equipos de referencia, presupuestos físicos, gates de Pages y alcance del siguiente hito. Registrar la opción aprobada, las alternativas y sus consecuencias usando la [plantilla ADR](../sdd/templates/adr.md).
