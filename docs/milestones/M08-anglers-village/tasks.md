# Tareas · Angler's Village

**Cierre vigente:** A/B/C/D aceptadas; T01–T06 y T08 VERIFIED dentro del alcance acordado. D conservada en `92d2548`. T07 PARTIAL conserva límites de dispositivos físicos y rendimiento sostenido; no se inventa evidencia para cerrarlos. MVP M08 cerrado para pre-release v0.7.0 por autorización del propietario. Las letras/estados inferiores son registro histórico de decisiones; no autorizan tareas futuras.

**D implementada, pendiente de aceptación:** C validada en `19d31c5`; T04–T06 VERIFIED dentro de C. M08-T08 · REQ-INV-002/REQ-SAVE-001 IMPLEMENTED_UNVERIFIED: migración compatible de equipo, acción compartida de selección/montaje, stock y aplicación en pesca, regresión de reload/viajes/fallos. 35/35 y build correctos; navegador PC/móvil vertical-horizontal correcto. Mantener T07 PARTIAL hasta aceptación humana y límites físicos; no abrir funcionalidades RPG adicionales.

**C implementada:** B aceptada en `1b46d47`; T02/T03 VERIFIED. T04/T05/T06 IMPLEMENTED_UNVERIFIED, ahora agrupadas como Etapa C: interacción/catálogo, moneda/compras/existencias y persistencia aditiva. 29/29 pruebas relevantes, build y PC/móvil vertical-horizontal correctos; pendiente aceptación del propietario. T07 PARTIAL, sólo regresión acotada de C. No nuevas zonas/modelos ni ingresos. La aceptación B no elimina los límites de hardware físico.

**B implementada, pendiente de aceptación:** M08-T02/M08-T03 IMPLEMENTED_UNVERIFIED agrupan ahora zona independiente y construcción de aldea, con evidencia técnica y revisión visual emulada. M08-T01 aceptada en `2c7b2ef`; T04/T05/T06 NOT_STARTED. T07 PARTIAL se limita a evidencias de B, sin declarar verificado el MVP completo. El orden inferior refleja planificación original; no se habilitan compras.

**Actualización de autorización:** T01 VERIFIED por aprobación explícita del propietario. Etapa B autorizada agrupa T02 y T03 (conexión + aldea); T04–T07 no se abren como funcionalidades nuevas. Validar únicamente alcance B y actualizar evidencia, sin commit de implementación.

**ID y requisito** — A aceptada; B actual implementa T02/T03 con aceptación pendiente. Las etapas comerciales y la validación completa posteriores permanecen propuestas, sin autorización de implementación.

| ID | Etapa / requisito | Dependencias | Cambio acotado | Prueba prevista / bloqueo |
| --- | --- | --- | --- | --- |
| M08-T01 | A · especificación/diseño/aceptación | Base v0.6.0 y plantillas SDD | Documentar MVP y decisiones | VERIFIED por aprobación del propietario, commit 2c7b2ef |
| M08-T02 | B · REQ-VIL-001 | T01 aprobado; inspección real de contratos | Activación mínima de zonas, retorno seguro y bloqueo con aparejo activo | Unitarias de entrada/salida/duplicados; paseo PC/táctil; sin escena provisional publicada |
| M08-T03 | C · REQ-VIL-002 | T02; identidad gallega decidida, alcance visual/presupuesto por aprobar | Sendero natural, centro pequeño y tienda en casa tradicional de granito, teja y madera; vegetación atlántica y colisiones | Ida/vuelta, bordes, autenticidad/proporciones y calidad visual día/lluvia PC/móvil; sin modelos provisionales de baja calidad, assets condicionados a licencia |
| M08-T04 | D · REQ-VIL-003 | T03 | Interacción cercana y catálogo accesible | Abrir/cerrar/cancelar teclado/táctil, sin lances ni movimiento accidental |
| M08-T05 | E · REQ-ECO-001, REQ-INV-001 | T04; precios/saldo/reservas aprobados | Economía e inventario de dominio, adaptación de selección actual | Compra válida, saldo insuficiente, entrada inválida, doble evento; sin ventajas nuevas |
| M08-T06 | E · REQ-SAVE-001 | T05; esquema y recuperación aprobados | Persistencia aditiva y compra confirmada tras guardar | Recarga, legado, datos corruptos/futuros, almacenamiento denegado y reintento |
| M08-T07 | F · NFR-VIL-001 y criterios completos | T02–T06 | Validar regresión, rendimiento, documentación y aceptación | Tests relevantes/build, PC y móvil emulado, cinco viajes; distinguir pruebas físicas pendientes |

**Dependencias** — Aprobar cada etapa antes de código; no abrir automáticamente la siguiente. T02 incluye revisar límites M07-D, no cambiar su aceptación histórica.

**Prueba, esfuerzo restante y bloqueo** — No tests ni build ejecutados en A. B esfuerzo medio; C alto y condicionado por calidad de recursos; D/E medio; F medio y con hardware físico por acordar. Actualizar evidencia con SHA, entorno y resultados reales por etapa; IMPLEMENTED_UNVERIFIED hasta evidencia/aceptación suficiente. No publicar ni aceptar por anticipado.
