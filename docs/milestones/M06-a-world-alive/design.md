# Diseño · A World Alive

Puntos de implementación y fronteras en el checkout actual.

- Mover vegetación según viento. [vegetation-wind.js](../../../src/visuals/vegetation-wind.js). Límite: Presupuesto térmico pendiente.
- Modelar bruma y humedad. [atmosphere.js](../../../src/visuals/atmosphere.js). Límite: Modelo de presentación.
- Alinear el agarre de corcho. [rod.js](../../../src/visuals/rod.js). Límite: Geometría contrastada por fixture.
- Ambientar amanecer y noche. [audio.js](../../../src/audio.js). Límite: Emulación y análisis de señal.
- Retirar fauna provisional. [fauna.js](../../../src/visuals/fauna.js). Límite: Fauna visual aplazada.
- Validar pesca en móviles físicos. [controller.js](../../../src/input/controller.js). Límite: Faltan dispositivos y sesión manual.
- Sostener una jornada de pesca. [world.js](../../../src/world.js). Límite: Microbenchmark no cubre una sesión larga.
- Excluir diagnósticos de desarrollo del build. [main.js](../../../src/main.js). Límite: Sólo build local.
