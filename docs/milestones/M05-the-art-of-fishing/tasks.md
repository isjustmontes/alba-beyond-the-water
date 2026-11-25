# Tareas · The Art of Fishing

Tareas reconstruidas por resultado observable. Las referencias apuntan al checkout auditado. La columna de prueba identifica el procedimiento y su resultado figura en [evidencia](evidence.md).

| ID | Alcance y requisito | Dependencia de implementación | Criterio de aceptación | Verificar con | Estado | Límite / esfuerzo restante |
| --- | --- | --- | --- | --- | --- | --- |
| M05-T01 | Sincronizar liberación y gesto · REQ-ANIM-001 | [fishing-motion.js](../../../src/animation/fishing-motion.js) | Liberar una sola vez antes del impacto; mantener unidos los extremos del sedal | [motion.test.js](../../../tests/motion.test.js) | VERIFIED | Física aproximada · — |
| M05-T02 | Acoplar pose y escena · REQ-ANIM-002 | [world.js](../../../src/world.js) | Observar caña, aparejo y vuelo en tres viewports | [animation-browser.mjs](../../../tests/animation-browser.mjs) | VERIFIED | Manos sin asset validado · — |
| M05-T03 | Individualizar atención al cebo · REQ-AI-002 | [fish-ai.js](../../../src/simulation/fish-ai.js) | Escalonar decisiones y respetar memoria y competencia | [fish-attention.test.js](../../../tests/fish-attention.test.js) | VERIFIED | Equilibrio con jugadores pendiente · — |
| M05-T04 | Respetar silencio y gesto · REQ-AUDIO-001 | [audio.js](../../../src/audio.js) | Arrancar con preferencia habilitada y crear contexto sólo tras interacción | [audio.test.js](../../../tests/audio.test.js) | VERIFIED | Escucha física pendiente · — |
| M05-T05 | Adaptar el HUD · REQ-UX-001 | [mobile-hud.css](../../../src/mobile-hud.css) | Mantener controles alcanzables e INFO con pausa en los perfiles definidos | [mobile-hud.mjs](../../../tests/mobile-hud.mjs) | VERIFIED | Insets sintéticos · — |
