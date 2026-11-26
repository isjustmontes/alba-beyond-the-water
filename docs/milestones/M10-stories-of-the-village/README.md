# M10 · Stories of the Village · v0.9.0

**A validada por el propietario:** el encargo de Etapa B confirma el plan y autoriza su commit local. La implementación de B se documentará como alcance posterior; las notas de aprobación pendiente inferiores conservan la entrega original. Los recursos aportados para B quedan fuera del commit de planificación.

**Etapa A — sólo planificación SDD, pendiente de validación.** El propietario autoriza crear M10 y aprueba la dirección visual: pergamino envejecido, retrato narrativo en acuarela a la izquierda y nombre, diálogo y opciones a la derecha; colores tierra y acabado artesanal gallego, adaptable a PC/móvil. Esta aprobación visual no autoriza todavía producir recursos ni implementar B–E.

Base verificada: v0.8.1 publicada, `6a1724084133006b4aec1152ada9fe839e425f4b`, igual a `origin/main` tras fetch. Pre-release de GitHub y despliegue Pages confirmados; worktree wolffish, rama `feature/v0.9.0-stories-of-the-village`. dartfish intacto.

**MVP:** primer habitante, Manuel, presentado sólo mediante retrato 2D y conversación interactiva al acercarse a un punto existente de la plaza. Relatos breves sobre Lago Sereno y consejos de pesca mediante opciones reales de HTML. Sin NPC 3D, nueva zona, misiones, recompensas, backend, generación de diálogo en tiempo real ni migración de guardados.

| Etapa | Entrega propuesta | Condición para avanzar |
| --- | --- | --- |
| A | Especificación, diseño, tareas, aceptación y evidencia de base | Validación del propietario; detenerse aquí |
| B | Guion ramificado y recursos WebP independientes, con procedencia/licencia y presupuesto revisados | Autorizar la etapa y validar guion/arte antes de integrar |
| C | Panel HTML/CSS accesible y pequeño controlador de conversación sin renderer | Validar composición PC/móvil y rutas de diálogo |
| D | Interacción contextual en aldea, reutilizando entrada, proximidad y pausa actuales | Validar proximidad, coexistencia con tienda/viajes/mapa y controles |
| E | Regresiones, coste de recursos, pulido y documentación de entrega | Aceptación manual final; publicación requiere otra autorización |

Las pruebas de B–E son procedimientos futuros: **ningún código, asset, test ni build ejecutado en A**. No commit, push, tag ni release. El siguiente paso es revisar este plan, no iniciar implementación automáticamente.

[Especificación](spec.md) · [Diseño](design.md) · [Tareas](tasks.md) · [Aceptación](acceptance.md) · [Evidencia](evidence.md)
