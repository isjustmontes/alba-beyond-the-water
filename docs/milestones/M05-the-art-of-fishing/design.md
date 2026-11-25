# Diseño · The Art of Fishing

Puntos de implementación y fronteras en el checkout actual.

- Sincronizar liberación y gesto. [fishing-motion.js](../../../src/animation/fishing-motion.js). Límite: Física aproximada.
- Acoplar pose y escena. [world.js](../../../src/world.js). Límite: Manos sin asset validado.
- Individualizar atención al cebo. [fish-ai.js](../../../src/simulation/fish-ai.js). Límite: Equilibrio con jugadores pendiente.
- Respetar silencio y gesto. [audio.js](../../../src/audio.js). Límite: Escucha física pendiente.
- Adaptar el HUD. [mobile-hud.css](../../../src/mobile-hud.css). Límite: Insets sintéticos.
