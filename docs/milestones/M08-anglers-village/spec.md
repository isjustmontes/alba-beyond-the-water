# Especificación · Angler's Village

## Alcance autorizado B · aldea explorable

A aprobada y guardada en `2c7b2ef`. El propietario agrupa en B la conexión (REQ-VIL-001) y la aldea gallega (REQ-VIL-002), antes separadas como B/C. Tres casas exteriores, centro pequeño, pozo, bancos, caminos naturales y tienda señalizada integrada en casa tradicional. Viaje explícito desde el final del sendero terrestre de Lago Sereno, retorno a la posición/orientación conservadas por zona durante la sesión, exploración PC/móvil. Bloquear transición con aparejo activo y pesca en el pueblo. No interiores, atención comercial interactiva, compra, economía, inventario nuevo, NPC ni misiones. Aceptación visual B pendiente; las propuestas económicas inferiores no se implementan en esta etapa.

**Problema del jugador** — La exploración termina en el lago; falta un destino rural coherente y un lugar para consultar y comprar aparejos, conservando la pesca y el progreso actual.

**Requisito estable y origen** — Solicitud v0.7.0 Etapa A del propietario, 26/11/2026. Prioridades P1 para recorrido/comercio/persistencia y P2 para acabado. Propuesta, no autorización de implementación.

| ID | Prioridad | Requisito | Criterio observable |
| --- | --- | --- | --- |
| REQ-VIL-001 | P1 | Pueblo y lago como zonas conectadas | Ir y volver por un sendero señalado por el propio entorno; aparecer en suelo seguro, conservar orientación coherente y no duplicar escenas/listeners tras cinco recorridos. |
| REQ-VIL-002 | P2 | Aldea rural gallega auténtica de escala pequeña | Zona central y sendero natural continuo; arquitectura de granito, cubiertas de teja, carpintería de madera y vegetación atlántica. Tienda reconocible integrada en una casa tradicional, accesible desde el exterior. Proporciones humanas y materiales realistas coherentes con ALBA, sin modelos provisionales de baja calidad. Recorrido sin agua transitable, obstáculos atravesables ni salidas del mapa. |
| REQ-VIL-003 | P1 | Tienda consultable PC/móvil | Interacción intencional cercana abre catálogo con nombre, precio, cantidad poseída y compatibilidad; cancelar no compra ni lanza. No requiere NPC ni interior: mostrador accesible desde el exterior. |
| REQ-ECO-001 | P1 | Compra y economía local | Saldo entero no negativo; una compra válida descuenta precio × cantidad y suma existencias una sola vez. Fondos insuficientes, cantidad inválida o repetición del mismo evento no cambian datos. |
| REQ-INV-001 | P1 | Inventario de aparejos persistente | Cantidades y propiedad reaparecen tras recarga; consultar y seleccionar un aparejo compatible usa el sistema existente. Equipamiento y cebos anteriores siguen disponibles, sin pagar de nuevo. |
| REQ-SAVE-001 | P1 | Guardado compatible y seguro | Una compra sólo se confirma tras guardar saldo e inventario juntos. Error de almacenamiento conserva estado previo y muestra aviso. Capturas, récords, preferencias y equipo antiguos no se borran ni reinician. Datos corruptos no se sobrescriben silenciosamente. |
| NFR-VIL-001 | P1 | Compatibilidad y coste acotado | Pescar tras ida/vuelta conserva IA, clima, audio, HUD y datos. PC y móvil mantienen controles; tienda no solapa acciones ni deja entradas mantenidas. Medición comparable a la base por perfil antes de aceptar. |

**Alcance incluido y excluido** — Una zona de pueblo, una zona central, una tienda exterior y un sendero bidireccional; catálogo inicial pequeño de aparejos compatibles con los tres tipos de señuelo existentes. Compra y consulta de existencias, selección mediante contratos actuales. No cambiar resistencia, capturas, consumo de cebos ni ventajas de equipo en este MVP. No NPC, diálogos, casas visitables, misiones, fabricación, multijugador, manos, nuevas especies ni simulación de aldeanos.

**Economía propuesta para aprobar** — 100 créditos iniciales una sola vez al crear el nuevo progreso; tres entradas de catálogo correspondientes a cucharilla/lombriz/artificial, precios orientativos 20/15/35 créditos, existencias comerciales ilimitadas y compra de una unidad por acción. Las compras acumulan reservas; el equipo legado se conserva y no se consume al pescar. Saldo y precios son enteros configurables. No venta de capturas, ingresos recurrentes, desgaste ni conversión retroactiva del diario: saldo finito de demostración, sin prometer un bucle RPG completo. Aprobar o ajustar esta limitación antes de implementar economía; no inventar ingresos ni retirar funcionalidad existente para justificar compras.

**Criterios observables** — Detalle reproducible en [aceptación](acceptance.md): REQ-VIL-001/002 IMPLEMENTED_UNVERIFIED tras B; comercio/economía/inventario nuevo NOT_STARTED. La identidad rural gallega está decidida por el propietario; su realización visual, precios y presupuesto móvil quedan pendientes de aprobación. No se atribuyen resultados de M07 a M08.
