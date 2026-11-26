# Tareas · A Living Village

**Cierre autorizado, 26/11/2026:** A–E aceptadas para el MVP Pre-Alpha; D/E en `351da15`, comprobación final 60/60 y build correcto. T05 mantiene explícitamente los límites no certificados.

| ID y requisito | Dependencias | Cambio acotado | Prueba propuesta, esfuerzo y bloqueo | Estado |
| --- | --- | --- | --- | --- |
| M09-T01 · A, todos | M08 publicado | Plan conservado en `585e1dc`; propietario aprueba A al encargar B. | Revisión documental aceptada; sin pruebas/build en A. | VERIFIED |
| M09-T02 · B, REQ-LVI-001/002 | T01 aprobado; baseline registrada | Relieve exterior, caminos y vegetación conservados en `333ebb6`. | 18/18, build y PC/móvil emulado; propietario confirma B validada al encargar C. | VERIFIED |
| M09-T03 · C, REQ-LVI-003 | B aceptada | Materiales/desgaste conservados en `43d4587`. | 9/9, build y revisión PC/móvil; propietario confirma C validada al encargar D. | VERIFIED |
| M09-T04 · D, REQ-LVI-004 | C aceptada | Luz/bruma/humedad y sombras rurales integradas sin alterar simulación ni geometría; commit 351da15. | 14/14 previas, cuatro perfiles/condiciones y regresión; suite final 60/60 y build. Propietario acepta al autorizar cierre y publicación final. | VERIFIED |
| M09-T05 · NFR-LVI-001/002, transversal | Evidencia por B–E | Comparaciones equivalentes y regresión tienda/viajes/pesca; recursos estables, horizonte +3 calls/geometrías sin mapas nuevos. | Microensayo y emulación correctos; faltan móviles físicos/WebKit/sesión sostenida. MVP Pre-Alpha aceptado con estos límites. | PARTIAL |
| M09-T06 · E, REQ-LVI-005 | D conservada, encargos E explícitos | Pulido/corrección arbórea y horizonte rural independiente en 351da15; árboles actuales/lago intactos, sin cambios mecánicos. | Histórico E 19/19, árboles 16/16, horizonte 12/12, vistas/coste; suite final 60/60 y build. Propietario acepta E al autorizar publicación final. | VERIFIED |

No iniciar una etapa con errores graves pendientes. Aprobación de una etapa no autoriza publicación ni cambios fuera del alcance. Actualizar evidencia, aceptación y STATUS tras cada entrega.
