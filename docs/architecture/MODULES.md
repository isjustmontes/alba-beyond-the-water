# Módulos y responsabilidades

| Ruta | Responsabilidad | Símbolos exportados o función | Imports directos |
| --- | --- | --- | --- |
| [ambient-life.js](../../src/ambient-life.js) | Calcula actividad acústica según hora y clima; conserva funciones de poses de fauna experimental. | faunaConditions, makeFaunaSlots, birdPose, insectPose | — |
| [fish-motion.js](../../src/animation/fish-motion.js) | Suaviza orientación, velocidad y profundidad de la malla sin modificar al agente. | createFishMotion, updateFishMotion | `./fishing-motion.js`, `../simulation/lake.js` |
| [fishing-motion.js](../../src/animation/fishing-motion.js) | Comparte temporización de lanzamiento, curvas de pose y resorte. | CAST_TIMING, clamp, smooth, DampedSpring, castPose, rodPose, castFlight, linePoint, jumpHeight, canJump | — |
| [audio.js](../../src/audio.js) | Sintetiza avisos de pesca y mezcla capas ambientales tras un gesto. | AUDIO_STORAGE_KEY, LakeAudio | `./ambient-life.js` |
| [fishing.js](../../src/fishing.js) | Gestiona carga, lanzamiento, clavado, resistencia, captura y emisión de eventos. | FishingGame | `./simulation/config.js`, `./simulation/fish-ai.js`, `./simulation/lake.js`, `./simulation/environment.js`, `./animation/fishing-motion.js` |
| [actions.js](../../src/input/actions.js) | Agrupa fuentes de pulsación y evita duplicar lanzamientos. | FishingActions | — |
| [controller.js](../../src/input/controller.js) | Traduce eventos de puntero y teclado; limpia pulsaciones tras interrupciones. | GameControls | `./actions.js`, `./touch-mode.js` |
| [touch-mode.js](../../src/input/touch-mode.js) | Selecciona escritorio o táctil por capacidades y última entrada. | TOUCH_SENSITIVITY, shouldUseTouch, InputMode | — |
| [journal.js](../../src/journal.js) | Valida registros antiguos, normaliza condiciones, ordena récords y exporta CSV. | migrateEnvironment, captureConditions, migrateCatches, personalRecords, exportCatches | `./simulation/config.js`, `./simulation/environment.js` |
| [main.js](../../src/main.js) | Compone página, juego, UI, preferencias y listeners; administra pausa y delta. | Composición y bucle principal | `./style.css`, `./phase3.css`, `./phase4.css`, `./phase5.css`, `./mobile-hud.css`, `./simulation/environment.js`, `./world.js`, `./fishing.js`, `./simulation/config.js`, `./journal.js`, `./input/controller.js`, `./input/touch-mode.js`, `./audio.js` |
| [mobile-hud.css](../../src/mobile-hud.css) | Reorganiza información contextual y áreas seguras según viewport y estado. | Estilos de interfaz | — |
| [phase3.css](../../src/phase3.css) | Presenta equipo, controles compartidos y adaptación táctil. | Estilos de interfaz | — |
| [phase4.css](../../src/phase4.css) | Presenta las lecturas de entorno y condiciones de las capturas. | Estilos de interfaz | — |
| [phase5.css](../../src/phase5.css) | Da estilo a las preferencias de manos y sus estados desactivados. | Estilos de interfaz | — |
| [config.js](../../src/simulation/config.js) | Define coeficientes de especies, afinidades, equipo y cebos. | SPECIES, LURES, EQUIPMENT, getLure | — |
| [environment.js](../../src/simulation/environment.js) | Avanza reloj, clima y temperatura; evalúa respuesta ecológica. | ENVIRONMENT_CONFIG, WEATHER, seededRandom, dayPeriod, formatHour, GameClock, WeatherSystem, WaterTemperature, Environment, ECOLOGY, thermalSuitability, speciesResponse, preferredDepth, biteChance | — |
| [fish-ai.js](../../src/simulation/fish-ai.js) | Actualiza percepción, interés, competencia, navegación local y respuesta al señuelo. | FISH_STATES, ATTENTION, lurePerception, lureInterest, FishSchool | `./config.js`, `./lake.js`, `./environment.js` |
| [lake.js](../../src/simulation/lake.js) | Comparte la profundidad del fondo entre cebo, pez y escena. | lakeDepth | — |
| [style.css](../../src/style.css) | Define escena a pantalla completa, HUD, diálogos y tipografía base. | Estilos de interfaz | — |
| [atmosphere.js](../../src/visuals/atmosphere.js) | Calcula iluminación, dispersión de niebla y humedad de la orilla. | atmosphere, shoreWetness, shorelineMaterial | — |
| [effects.js](../../src/visuals/effects.js) | Reutiliza elementos para ondas y partículas de salpicadura. | FishingEffects | `three` |
| [environment.js](../../src/visuals/environment.js) | Traduce clima y hora a cielo, niebla, lluvia y luz. | makeEnvironmentSky, EnvironmentalView | `three`, `./atmosphere.js` |
| [fauna.js](../../src/visuals/fauna.js) | Reserva la integración de fauna sin asignar objetos visibles. | AmbientFauna | — |
| [fish.js](../../src/visuals/fish.js) | Construye modelos y materiales reutilizables con nivel de detalle. | FishModels | `three`, `../simulation/config.js`, `three/addons/utils/BufferGeometryUtils.js` |
| [hands.js](../../src/visuals/hands.js) | Valida modelos y conecta sockets de agarre con un animador opcional. | FirstPersonHands | `three` |
| [landscape.js](../../src/visuals/landscape.js) | Genera malla de relieve, materiales y grupos de vegetación instanciada. | terrainHeight, terrainGeometry, makeLandscape | `three`, `three/addons/utils/BufferGeometryUtils.js`, `./vegetation-wind.js`, `./atmosphere.js` |
| [rod.js](../../src/visuals/rod.js) | Construye la caña, los anillos, el agarre y la transmisión animada del carrete. | RodRig | `three`, `three/addons/utils/BufferGeometryUtils.js`, `../animation/fishing-motion.js` |
| [vegetation-wind.js](../../src/visuals/vegetation-wind.js) | Inyecta deformación y normales por viento conservando anclajes y variación por instancia. | VEGETATION_PROFILES, sampleVegetationWind, vegetationMaterial, padVegetationBounds, seedVegetationPhases | `three` |
| [water.js](../../src/visuals/water.js) | Vincula reflejo planar, normales, ondas locales y geometría del lecho. | waterElevation, makeLakeWater, makeLakeBed | `three`, `three/addons/objects/Water.js`, `../simulation/lake.js` |
| [world.js](../../src/world.js) | Construye el contexto WebGL, vincula poses y dibuja la escena. | LakeWorld | `three`, `./visuals/environment.js`, `./visuals/fauna.js`, `./visuals/hands.js`, `./animation/fish-motion.js`, `./animation/fishing-motion.js`, `./simulation/config.js`, `./visuals/water.js`, `./visuals/fish.js`, `./visuals/rod.js`, `./visuals/landscape.js`, `./visuals/effects.js` |

[HTML y diálogos](../../index.html). `main.js` importa las cinco hojas CSS de la base y añade `exploration.css` para la presentación contextual de M07-A.

### M07-A · módulos añadidos

| Archivo | Responsabilidad | Exportaciones / contrato | Dependencias |
| --- | --- | --- | --- |
| [exploration.js](../../src/input/exploration.js) | Posición y velocidad dentro del muelle; joystick, WASD, cambio de modo y Pointer Lock opcional | WALK, Exploration, ExplorationControls | Lógica sin renderer; adaptador DOM del navegador |
| [exploration.css](../../src/exploration.css) | Botón de modo, instrucciones y joystick contextual con áreas seguras | Estilos por modo y entrada táctil | HUD existente |

`main.js` incorpora ambos módulos y aplica posición/altura; `controller.js` recibe `isExploring` para bloquear acciones de pesca; `world.js` amplía los límites de mirada sólo al explorar. No se alteran dependencias de paquetes ni interfaces de simulación o persistencia. [Diseño](../milestones/M07-first-steps/design.md).
