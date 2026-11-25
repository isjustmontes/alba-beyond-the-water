# Tareas · Mejoras visuales

Tareas reconstruidas por resultado observable. Las referencias apuntan al checkout auditado. La columna de prueba identifica el procedimiento y su resultado figura en [evidencia](evidence.md).

| ID | Alcance y requisito | Dependencia de implementación | Criterio de aceptación | Verificar con | Estado | Límite / esfuerzo restante |
| --- | --- | --- | --- | --- | --- | --- |
| M02-T01 | Construir el lago y relieve · REQ-GFX-001 | [landscape.js](../../../src/visuals/landscape.js) | Mantener el fondo sumergido y producir terreno con vértices finitos | [visuals.test.js](../../../tests/visuals.test.js) | VERIFIED | La comprobación geométrica no califica la estética · — |
| M02-T02 | Mostrar modelos de pesca · REQ-GFX-002 | [fish.js](../../../src/visuals/fish.js) | Inspeccionar niveles de detalle, peces y aparejo en escena | [models.mjs](../../../tests/models.mjs) | VERIFIED | Chromium · — |
