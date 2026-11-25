# Especificación · First Steps · Etapa A

**Problema del jugador** — Poder dar los primeros pasos en primera persona y observar el lago sin alterar la pesca existente.

**Requisito estable y origen** — Encargo del propietario «v0.6.0 — First Steps. Etapa A» y confirmación posterior de validación visual y funcional, registrados en la sesión del 25 de noviembre de 2026.

| ID | Prioridad | Comportamiento y criterio observable |
| --- | --- | --- |
| REQ-EXP-001 | P1 | Caminar en relación con la orientación mediante WASD o joystick, con aceleración y frenado suaves. Normalizar diagonales y mantener el cuerpo dentro de la superficie del muelle a 20/60/120 fps. |
| REQ-EXP-002 | P1 | Alternar mediante V o botón entre exploración y pesca. Bloquear el cambio con aparejo activo; volver a pescar sólo cerca del puesto original y mirando al lago, sin cambiar bruscamente la orientación ni duplicar un lanzamiento. |
| REQ-EXP-003 | P1 | Ofrecer ratón capturado y liberación con Esc en exploración de PC, arrastre alternativo y cámara táctil. Mostrar joystick sólo en exploración táctil, conservar el HUD de pesca y limpiar movimiento al cancelar, redimensionar, pausar o perder foco. |

**Alcance incluido y excluido** — Incluye únicamente el muelle ya existente y sus límites, cámara, entrada compartida y presentación contextual. Excluye terreno exterior transitable, conexión a la orilla, salto, carrera, personajes, manos, tiendas, nuevas zonas, persistencia de posición y cambios de pesca, IA, clima, audio o guardados. No se añade un motor físico ni dependencias.

**Criterios observables** — Se acotan en [aceptación](acceptance.md). La aceptación de esta etapa no equivale a compatibilidad física Android/iOS, rendimiento sostenido ni publicación de v0.6.0.
