# Módulos y responsabilidades

| Ruta | Responsabilidad | Símbolos exportados o función | Imports directos |
| --- | --- | --- | --- |
| [animation/first-morning.js](../../src/animation/first-morning.js) | Tiempo y pose de presentación opt-in, sin renderer/guardados | FirstMorningTimeline, INTRO_DURATION, INTRO_HANDOFF | — |
| [ui/first-morning.js](../../src/ui/first-morning.js) | Overlay DOM, cámara actual y entrada temporal; se retira al completar | FirstMorning | animation/first-morning.js, CSS propio |
| [dialogues/conversation.js](../../src/dialogues/conversation.js) | Shared authored-node sessions and safe encounter proximity, no persistence | Conversation, nearEncounter | village-layout.js |
| [dialogues/shopkeeper.js](../../src/dialogues/shopkeeper.js) | Provisional shopkeeper identity, nine authored topics and catalog action | SHOPKEEPER, SHOPKEEPER_SIGN, SHOPKEEPER_NODES, nearShopkeeper | conversation.js, village-layout.js, config.js |
| [visuals/manuel-sign.js](../../src/visuals/manuel-sign.js) | Existing-bench wooden portrait sign and bounded conversation billboard | MANUEL_SIGN, manuelMarkerState, makeManuelSign | Three.js, village-layout.js; existing wood/iron supplied by VillageView |
| [dialogues/manuel.js](../../src/dialogues/manuel.js) | Pure Manuel graph, session choices and safe bench proximity; no save effects | MANUEL, MANUEL_NODES, ManuelConversation, nearManuel | config.js, environment.js, village-layout.js |
| [ui/dialogue-panel.js](../../src/ui/dialogue-panel.js) | Presentación ilustrada reusable de identidad/texto/opciones; modal/foco/cierre, sin grafo ni conexión jugable | DialoguePanel | DOM/ResizeObserver, CSS asociado |
| [previews/dialogue-preview.js](../../src/previews/dialogue-preview.js) | Entrada de desarrollo aislada con contenido de muestra, fuera del bundle de juego | Inicialización local de preview, sin exports | DialoguePanel, dialogue-panel.css |
| [shop.js](../../src/shop.js) | Catálogo compatible, saldo/inventario local y compras idempotentes con persistencia previa a mutación | VillageShop, SHOP_CATALOG, SHOP_STORAGE_KEY, INITIAL_COINS | config.js existente |
| [shop-panel.js](../../src/shop-panel.js) | Catálogo modal, selección actual y protección de doble clic/toque | ShopPanel | shop.js, DOM |
| [village-layout.js](../../src/village-layout.js) | Huellas y altura compartidas de aldea, casas, árboles y obstáculos | VILLAGE_HOUSES, VILLAGE_TREES, villageHeight, villageWalkHeight | — |
| [village.js](../../src/visuals/village.js) | Escena rural cacheada, arquitectura/materiales procedurales, vegetación compartida y señal del sendero | VillageView, makeVillageTrailSign | Three.js, village-layout, vegetación y alturas existentes |
| [zones.js](../../src/zones.js) | Registro de Lago Sereno y planes de salidas sin efectos; conserva referencia de escena existente | ZONES, ZoneManager | — |
| [lake-habitat.js](../../src/simulation/lake-habitat.js) | Profundidad de hábitat, margen al agua/rocas y hogares individuales en riberas/interior | habitatDepth, fishWater, fishHome | lake.js, alturas compartidas de shore-route.js |
| [equipment-transition.js](../../src/animation/equipment-transition.js) | Equipar/guardar el rig existente con un escalar reversible; bloqueo de entrada durante equipamiento | EquipmentTransition | `./fishing-motion.js` |
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
| [shore-route.js](../../src/input/shore-route.js) | Etapa B: ruta, puestos, superficie compartida y altura de colisión | SHORE_PATH, FISHING_SPOTS, pathDistance, shoreCenter, shoreWidth, shoreHeight, walkHeight, nearestSpot, atSpot | `../terrain-height.js` |
| [terrain-height.js](../../src/terrain-height.js) | Funciones originales de relieve reutilizadas por paisaje y ruta sin dependencias circulares | noise, fbm, terrainHeight | Sin renderer ni librerías nuevas |

`main.js` incorpora ambos módulos y aplica posición/altura; `controller.js` recibe `isExploring` para bloquear acciones de pesca; `world.js` amplía los límites de mirada sólo al explorar. No se alteran dependencias de paquetes ni interfaces de simulación o persistencia. [Diseño](../milestones/M07-first-steps/design.md).
