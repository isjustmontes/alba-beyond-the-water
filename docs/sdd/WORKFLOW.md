# Flujo SDD

1. Inspeccionar estado, historial y documentación del dominio. Localizar el hito activo.
2. Definir o actualizar requisito y criterios de aceptación antes del diseño.
3. Diseñar el cambio con dependencias, riesgos y límites. Dividirlo en tareas.
4. Comprobar preparación: existe alcance aprobado, responsable de decisión, procedimiento de prueba y forma de recuperar el comportamiento previo.
5. Implementar únicamente la tarea autorizada. Añadir o actualizar pruebas pertinentes.
6. Ejecutar comprobaciones automáticas y manuales. Registrar SHA, entorno, entradas, resultado, incidencias y evidencias.
7. Actualizar trazabilidad, aceptación del hito, documentos canónicos y STATUS. Terminar indicando la próxima tarea.

**Hecho.** Cada criterio tiene evidencia fechada, las regresiones están clasificadas y los riesgos aceptados constan por escrito. Una etiqueta Git acredita publicación; el propietario decide aceptación y el paso de hito.

Una errata puede resolverse en el mismo cambio con motivo, destino y comprobación de enlaces. Un arreglo urgente necesita al menos reproducción, criterio, verificación y registro. Consultar al propietario para alcance nuevo, compromisos de compatibilidad, migraciones destructivas, despliegues y apertura de hitos. [Plantillas](templates/README.md)

**Convenciones.** REQ-DOMINIO-NNN identifica comportamiento, NFR-DOMINIO-NNN una cualidad y Mnn-Tnn una tarea. Conservar el ID aunque cambie el texto. P0 crítico, P1 alto, P2 medio, P3 bajo. VERIFIED exige evidencia suficiente para el criterio. IMPLEMENTED_UNVERIFIED indica código presente con evidencia pendiente. IN_PROGRESS identifica ejecución activa; PARTIAL, criterios parcialmente implementados; NOT_STARTED, ausencia de implementación; BLOCKED, impedimento identificado; DEFERRED, decisión de aplazar; NOT_APPLICABLE, exclusión explícita.
