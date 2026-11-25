# Tareas · A World Alive

Tareas reconstruidas por resultado observable. Las referencias apuntan al checkout auditado. La columna de prueba identifica el procedimiento y su resultado figura en [evidencia](evidence.md).

| ID | Alcance y requisito | Dependencia de implementación | Criterio de aceptación | Verificar con | Estado | Límite / esfuerzo restante |
| --- | --- | --- | --- | --- | --- | --- |
| M06-T01 | Mover vegetación según viento · REQ-GFX-003 | [vegetation-wind.js](../../../src/visuals/vegetation-wind.js) | Conservar raíces y dirección tras rotar instancias, también en detalle bajo | [vegetation.test.js](../../../tests/vegetation.test.js) | VERIFIED | Presupuesto térmico pendiente · — |
| M06-T02 | Modelar bruma y humedad · REQ-ENV-002 | [atmosphere.js](../../../src/visuals/atmosphere.js) | Dispersar la bruma con el viento y atenuar humedad con altura | [atmosphere.test.js](../../../tests/atmosphere.test.js) | VERIFIED | Modelo de presentación · — |
| M06-T03 | Alinear el agarre de corcho · REQ-ANIM-003 | [rod.js](../../../src/visuals/rod.js) | Mantener juntas la base y la empuñadura, el socket alineado y el acabado texturizado | [animation-browser.mjs](../../../tests/animation-browser.mjs) | VERIFIED | Geometría contrastada por fixture · — |
| M06-T04 | Ambientar amanecer y noche · REQ-AUDIO-002 | [audio.js](../../../src/audio.js) | Activar capas ambientales bajo gesto y silenciarlas en los perfiles de la escena | [fauna-browser.mjs](../../../tests/fauna-browser.mjs) | VERIFIED | Emulación y análisis de señal · — |
| M06-T05 | Retirar fauna provisional · REQ-GFX-004 | [fauna.js](../../../src/visuals/fauna.js) | Instanciar AmbientFauna sin objetos ni recursos GPU añadidos | [fauna.test.js](../../../tests/fauna.test.js) | VERIFIED | Fauna visual aplazada · — |
| M06-T06 | Validar pesca en móviles físicos · NFR-COMPAT-001 | [controller.js](../../../src/input/controller.js) | Completar captura, rotación, audio y recarga en Android e iOS físicos | [mobile.mjs](../../../tests/mobile.mjs) | BLOCKED | Faltan dispositivos y sesión manual · M |
| M06-T07 | Sostener una jornada de pesca · NFR-PERF-001 | [world.js](../../../src/world.js) | Medir p95, memoria y temperatura durante 30 min en dispositivos acordados | [vegetation-performance.mjs](../../../tests/vegetation-performance.mjs) | PARTIAL | Microbenchmark no cubre una sesión larga · M |
| M06-T08 | Excluir diagnósticos de desarrollo del build · NFR-SEC-001 | [main.js](../../../src/main.js) | Comprobar que window.__alba no existe y que la URL no fuerza clima en preview | [production.mjs](../../../tests/production.mjs) | VERIFIED | Sólo build local · — |
