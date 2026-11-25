# Tareas · Simulación avanzada

Tareas reconstruidas por resultado observable. Las referencias apuntan al checkout auditado. La columna de prueba identifica el procedimiento y su resultado figura en [evidencia](evidence.md).

| ID | Alcance y requisito | Dependencia de implementación | Criterio de aceptación | Verificar con | Estado | Límite / esfuerzo restante |
| --- | --- | --- | --- | --- | --- | --- |
| M03-T01 | Diferenciar aparejos · REQ-FISH-001 | [fishing.js](../../../src/fishing.js) | Cambiar la profundidad al cambiar de cebo e impedir el cambio con el aparejo en el agua | [advanced.test.js](../../../tests/advanced.test.js) | VERIFIED | Una sola caña · — |
| M03-T02 | Exigir contacto con el señuelo · REQ-AI-001 | [fish-ai.js](../../../src/simulation/fish-ai.js) | Impedir picadas en agua vacía y producirlas con un agente próximo | [ai.test.js](../../../tests/ai.test.js) | VERIFIED | Sin navegación completa alrededor de obstáculos · — |
| M03-T03 | Compartir la acción de pesca · REQ-INPUT-001 | [actions.js](../../../src/input/actions.js) | Cancelar entradas al perder foco y evitar doble lanzamiento con dos fuentes | [input.test.js](../../../tests/input.test.js) | VERIFIED | La capacidad híbrida se simula · — |
