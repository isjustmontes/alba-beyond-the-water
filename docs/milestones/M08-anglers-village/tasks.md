# Tareas · Angler's Village

**Actualización de autorización:** T01 VERIFIED por aprobación explícita del propietario. Etapa B autorizada agrupa T02 y T03 (conexión + aldea); T04–T07 no se abren como funcionalidades nuevas. Validar únicamente alcance B y actualizar evidencia, sin commit de implementación.

**ID y requisito** — Etapas propuestas, sin implementación autorizada. Todas las tareas B–F NOT_STARTED; A es documentación pendiente de aprobación.

| ID | Etapa / requisito | Dependencias | Cambio acotado | Prueba prevista / bloqueo |
| --- | --- | --- | --- | --- |
| M08-T01 | A · especificación/diseño/aceptación | Base v0.6.0 y plantillas SDD | Documentar MVP y decisiones | Revisión del propietario; IN_PROGRESS hasta aprobación |
| M08-T02 | B · REQ-VIL-001 | T01 aprobado; inspección real de contratos | Activación mínima de zonas, retorno seguro y bloqueo con aparejo activo | Unitarias de entrada/salida/duplicados; paseo PC/táctil; sin escena provisional publicada |
| M08-T03 | C · REQ-VIL-002 | T02; identidad gallega decidida, alcance visual/presupuesto por aprobar | Sendero natural, centro pequeño y tienda en casa tradicional de granito, teja y madera; vegetación atlántica y colisiones | Ida/vuelta, bordes, autenticidad/proporciones y calidad visual día/lluvia PC/móvil; sin modelos provisionales de baja calidad, assets condicionados a licencia |
| M08-T04 | D · REQ-VIL-003 | T03 | Interacción cercana y catálogo accesible | Abrir/cerrar/cancelar teclado/táctil, sin lances ni movimiento accidental |
| M08-T05 | E · REQ-ECO-001, REQ-INV-001 | T04; precios/saldo/reservas aprobados | Economía e inventario de dominio, adaptación de selección actual | Compra válida, saldo insuficiente, entrada inválida, doble evento; sin ventajas nuevas |
| M08-T06 | E · REQ-SAVE-001 | T05; esquema y recuperación aprobados | Persistencia aditiva y compra confirmada tras guardar | Recarga, legado, datos corruptos/futuros, almacenamiento denegado y reintento |
| M08-T07 | F · NFR-VIL-001 y criterios completos | T02–T06 | Validar regresión, rendimiento, documentación y aceptación | Tests relevantes/build, PC y móvil emulado, cinco viajes; distinguir pruebas físicas pendientes |

**Dependencias** — Aprobar cada etapa antes de código; no abrir automáticamente la siguiente. T02 incluye revisar límites M07-D, no cambiar su aceptación histórica.

**Prueba, esfuerzo restante y bloqueo** — No tests ni build ejecutados en A. B esfuerzo medio; C alto y condicionado por calidad de recursos; D/E medio; F medio y con hardware físico por acordar. Actualizar evidencia con SHA, entorno y resultados reales por etapa; IMPLEMENTED_UNVERIFIED hasta evidencia/aceptación suficiente. No publicar ni aceptar por anticipado.
