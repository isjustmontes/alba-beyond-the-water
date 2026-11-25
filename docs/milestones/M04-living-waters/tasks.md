# Tareas · Living Waters

Tareas reconstruidas por resultado observable. Las referencias apuntan al checkout auditado. La columna de prueba identifica el procedimiento y su resultado figura en [evidencia](evidence.md).

| ID | Alcance y requisito | Dependencia de implementación | Criterio de aceptación | Verificar con | Estado | Límite / esfuerzo restante |
| --- | --- | --- | --- | --- | --- | --- |
| M04-T01 | Simular clima y temperatura · REQ-ENV-001 | [environment.js](../../../src/simulation/environment.js) | Cerrar el ciclo de reloj, interpolar viento y conservar temperaturas acotadas | [environment.test.js](../../../tests/environment.test.js) | VERIFIED | Sin estaciones ni persistencia del clima · — |
| M04-T02 | Registrar condiciones de captura · REQ-SAVE-002 | [journal.js](../../../src/journal.js) | Leer registros anteriores y normalizar condiciones parciales | [environment.test.js](../../../tests/environment.test.js) | VERIFIED | CSV de salida · — |
