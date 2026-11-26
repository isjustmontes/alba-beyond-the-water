# Especificación · First Steps · Etapa A

## Etapa C · pesca libre en la orilla existente · autorizada 26/11/2026

**Ampliación acotada:** REQ-EXP-009: carrera suave 1,5× únicamente en exploración (Shift PC, botón táctil compacto), con colisiones y limpieza al cambiar modo, cancelar o perder foco. REQ-EXP-008: revisar picadas alejadas y añadir regresión de presencia real/ausencia de peces, sin elevar probabilidades ni forzar ataques. Mantener C pendiente de aceptación.

**Corrección autorizada tras prueba real:** REQ-EXP-006 debe admitir sobrevolar la pendiente seca inicial antes del primer tramo de agua, sin atravesar terreno ni obstáculos, y situar el final de recogida en agua accesible. La referencia espacial es siempre jugador/dirección actuales. Se amplía el alcance acotado a distribución y límites de peces: REQ-EXP-008, mantener 27 agentes y especies actuales, hogares variados en aguas válidas fuera del muelle, movimiento sin cruzar la ribera/rocas y sin teletransportes hacia el cebo. Conservar decisiones individuales, profundidad y respuesta ambiental. C sigue pendiente de aceptación.

Etapa B aceptada por el propietario y conservada en `00208d9`. Se mantienen REQ-EXP-004/005 como trazabilidad histórica.

| ID | Prioridad | Criterio observable |
| --- | --- | --- |
| REQ-EXP-006 | P1 | Equipar desde cualquier suelo navegable de la ribera existente con acceso seguro al lago, sin radio de puesto; conservar posición/orientación, rechazar tierra, obstáculos y agua fuera de la cuenca o sin acceso de recogida. Validar de nuevo al soltar con potencia/dirección actuales. |
| REQ-EXP-007 | P1 | Explorar → pescar → explorar sin saltos de cámara al cambiar límites; equipar/guardar caña y carrete progresivamente. No lanzar accidentalmente durante la transición o por entradas mantenidas. |

No se amplía el mapa ni se alteran decisiones individuales, fuerzas de combate, clima, audio, HUD o guardados. El ajuste posterior autorizado comprende hábitat/distribución de peces y límites espaciales de llegada; se mantienen especies y 27 entidades. El muelle conserva su puesto histórico. Evidencia técnica PC/móvil emulado y build; aceptación de C pendiente del propietario.

**Problema del jugador** — Poder dar los primeros pasos en primera persona y observar el lago sin alterar la pesca existente.

**Requisito estable y origen** — Encargo del propietario «v0.6.0 — First Steps. Etapa A» y confirmación posterior de validación visual y funcional, registrados en la sesión del 25 de noviembre de 2026.

| ID | Prioridad | Comportamiento y criterio observable |
| --- | --- | --- |
| REQ-EXP-001 | P1 | Caminar en relación con la orientación mediante WASD o joystick, con aceleración y frenado suaves. Normalizar diagonales y mantener el cuerpo dentro de la superficie del muelle a 20/60/120 fps. |
| REQ-EXP-002 | P1 | Alternar mediante V o botón entre exploración y pesca. Bloquear el cambio con aparejo activo; volver a pescar sólo cerca del puesto original y mirando al lago, sin cambiar bruscamente la orientación ni duplicar un lanzamiento. |
| REQ-EXP-003 | P1 | Ofrecer ratón capturado y liberación con Esc en exploración de PC, arrastre alternativo y cámara táctil. Mostrar joystick sólo en exploración táctil, conservar el HUD de pesca y limpiar movimiento al cancelar, redimensionar, pausar o perder foco. |

**Alcance incluido y excluido** — Incluye únicamente el muelle ya existente y sus límites, cámara, entrada compartida y presentación contextual. Excluye terreno exterior transitable, conexión a la orilla, salto, carrera, personajes, manos, tiendas, nuevas zonas, persistencia de posición y cambios de pesca, IA, clima, audio o guardados. No se añade un motor físico ni dependencias.

**Criterios observables** — Se acotan en [aceptación](acceptance.md). La aceptación de esta etapa no equivale a compatibilidad física Android/iOS, rendimiento sostenido ni publicación de v0.6.0.

## Etapa B · alcance autorizado, pendiente de validación

Origen: encargo del propietario «exploración de las orillas». Amplía la superficie de REQ-EXP-001 y los destinos de REQ-EXP-002; conserva los controles de REQ-EXP-003. Los resultados de Etapa A permanecen históricos.

| ID | Prioridad | Criterio observable |
| --- | --- | --- |
| REQ-EXP-004 | P1 | Recorrer sin saltos ni teletransporte el muelle, una transición de tierra continua, un sendero corto de ribera y volver. Representación y altura de colisión coinciden; no hay paso al agua o por obstáculos importantes. |
| REQ-EXP-005 | P1 | Acceder a dos nuevos puestos naturales además del original, activar pesca allí, lanzar y recoger con origen coherente con la posición. Mantener guardas del aparejo y límites de mirada relativos al puesto. |
| NFR-EXP-001 | P1 | Validar recorrido y puestos en PC y móvil emulado, con recursos procedurales ligeros, sin dependencias ni cambios de IA, clima, audio, HUD de pesca, inventario o guardados. |

Incluye únicamente la conexión a la orilla ya existente y una franja caminable acotada; no abre el mapa completo. Excluye nuevas zonas temáticas, edificios, economía, manos, navegación de peces o persistencia del jugador. La aceptación visual del propietario queda pendiente tras la implementación.

### Corrección tras prueba del propietario · 26/11/2026

REQ-EXP-004 exige ahora que la tierra seca visible de la conexión sea transitable, sin limitarla al eje pintado del sendero; se conserva el límite exterior, margen al agua y colisión con árboles/rocas reales. Regresión: atravesar (0,20), moverse lateralmente por la hierba y llegar a ambas calas sin teletransporte.

REQ-EXP-005 exige zonas de pesca accesibles, no puntos de precisión: entrar desde (−7,20) o posiciones equivalentes de la cala derecha y orientar la vista hacia agua libre fuera del antiguo cono de ±0,10 rad. El lanzamiento debe utilizar posición y orientación actuales; rechazar terreno u obstáculos por geometría, no por una dirección cardinal fija. Mantener el puesto original y los guardados. Las pruebas anteriores no acreditaron estas aproximaciones reales; B sigue pendiente de aceptación.
