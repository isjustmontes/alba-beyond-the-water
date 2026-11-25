# Tareas · Prototipo jugable

Tareas reconstruidas por resultado observable. Las referencias apuntan al checkout auditado. La columna de prueba identifica el procedimiento y su resultado figura en [evidencia](evidence.md).

| ID | Alcance y requisito | Dependencia de implementación | Criterio de aceptación | Verificar con | Estado | Límite / esfuerzo restante |
| --- | --- | --- | --- | --- | --- | --- |
| M01-T01 | Resolver la jornada de pesca · REQ-CORE-001 | [fishing.js](../../../src/fishing.js) | Clavar, capturar con tensión regulada y perder por rotura u holgura | [fishing.test.js](../../../tests/fishing.test.js) | VERIFIED | Prueba de dominio · — |
| M01-T02 | Conservar capturas previas · REQ-SAVE-001 | [journal.js](../../../src/journal.js) | Migrar capturas válidas sin inventar señuelo y mantener el récord por especie | [journal.test.js](../../../tests/journal.test.js) | VERIFIED | Origen local del navegador · — |
