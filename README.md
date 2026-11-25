# ALBA · Beyond the Water · Fishing experience

**v0.5.0 — A World Alive (Pre-Alpha).** Wind-responsive vegetation, morning mist, improved lighting and shorelines, environmental wildlife sounds and a refined cork rod handle. [Read the v0.5.0 release notes](https://github.com/isjustmontes/alba-beyond-the-water/releases/tag/v0.5.0).

Built on **The Art of Fishing** and **Living Waters**, preserving advanced fishing, desktop and touch controls, environmental simulation and saved catches. See the [fishing animation guide, architecture, tests and limitations](THE_ART_OF_FISHING.md) and the [Living Waters guide](LIVING_WATERS.md).

<p align="center">
  <img src="alba%20-%20banner.webp"
       alt="ALBA — Beyond the Water"
       width="900">
</p>

A browser-based 3D fishing experience set on Lago Sereno, built with Three.js, modular JavaScript, HTML and CSS. Gameplay models, textures and sounds are generated procedurally; no API keys, accounts or paid services are needed to play. After installing dependencies, the local development server can run without an Internet connection.

*Every water has a story.*

## A World Alive: the current experience

- **Living vegetation:** trees, grasses and reeds respond to Living Waters wind direction and intensity. Individual variations keep movement subtle and avoid synchronized swaying, including along the shoreline.
- **Atmosphere and shorelines:** light morning mist responds to time, moisture and wind. Smoother environmental lighting and improved wet ground and rock materials strengthen the transition from land to water while preserving fishing visibility.
- **Natural soundscape:** synthesized birds, insects and wind through trees respond to daylight, weather and wind. Audio is enabled by default for new players, starts after a permitted interaction, and respects saved mute preferences and the sound control.
- **Fishing equipment:** the cork grip has slimmer proportions, an aligned connection to the rod blank and a matching end cap. Casting, reel motion, rod flex and line behavior are preserved.
- **Desktop and mobile:** keyboard, mouse and touch controls remain available, with a compact contextual mobile HUD, safe-area support and portrait/landscape layouts. Instancing, shared resources and efficient animation keep environmental effects lightweight.

Provisional visual birds and insects have been removed; their environmental sounds remain. Human hands are **not available in gameplay**. The experimental integration boundary remains disabled pending suitable animation and visual validation.

## Version history

All releases remain **Pre-Alpha**. Earlier stages form the foundation of the current game.

| Version | Milestone |
| --- | --- |
| [v0.1.0](https://github.com/isjustmontes/alba-beyond-the-water/releases/tag/v0.1.0) | Initial playable fishing and visual foundation: Lago Sereno, procedural scenery, casting, bites, fights, catches and saved progress. |
| [v0.2.0](https://github.com/isjustmontes/alba-beyond-the-water/releases/tag/v0.2.0) | **Advanced Fishing & Mobile Support:** spatial fish AI, species-specific fights, lures, equipment, an expanded journal and touch controls. |
| [v0.3.0](https://github.com/isjustmontes/alba-beyond-the-water/releases/tag/v0.3.0) | **Living Waters:** a 60-minute day/night cycle, gradual weather and wind, water temperature by depth, environmental fish responses, European perch and tench, catch conditions and synthesized ambient audio. |
| [v0.4.0](https://github.com/isjustmontes/alba-beyond-the-water/releases/tag/v0.4.0) | **The Art of Fishing:** synchronized overhead casting, damped rod flex, animated reel and line, smoother swimming, occasional jumps and water interactions. |
| [v0.4.1](https://github.com/isjustmontes/alba-beyond-the-water/releases/tag/v0.4.1) | **Individual Fish Behavior:** staggered and varied lure reactions, environmental detection and audio enabled by default for new players, retaining mute preferences. |
| [v0.4.2](https://github.com/isjustmontes/alba-beyond-the-water/releases/tag/v0.4.2) | **Mobile HUD Optimization:** compact contextual indicators and more visible fishing action on smaller screens. |
| [v0.5.0](https://github.com/isjustmontes/alba-beyond-the-water/releases/tag/v0.5.0) | **A World Alive:** wind-responsive vegetation, atmospheric and shoreline refinements, environmental wildlife sounds, removal of provisional visual wildlife and a refined cork grip. |

## Phase 3 foundation: simulation and shared input

- Each fish has its own position, weight and state machine: swimming, seeking food, investigating, attacking, fleeing, resisting and recovering. Species differ in speed, aggression, stamina, depth and attack likelihood. Subsequent updates add individual reaction delays, interest, alertness and memory. A fish must approach the lure to create a bite; elapsed time alone does not produce catches.
- Fights alternate pulls of varying duration and strength, changes of direction and fatigue. Rod bending follows tension and the line endpoint follows the hooked fish. Sustained critical tension or prolonged slack can lose the fish.
- Equipment offers a **spinner**, **worm** or **artificial lure**, their characteristics, the equipped rod and 7.5 kg monofilament strength. It also provides tackle recovery and graphics quality. Change lures before casting or after landing a fish; otherwise recover the tackle first.
- The journal saves species, weight, length, lure and date, calculates personal weight records and exports CSV. Living Waters adds in-game time, weather, water temperature and approximate depth to new catches. Older catches retain their data and show an unrecorded value for missing fields. Catch storage remains `alba-catches-v1`; equipment selection uses `alba-equipment-v1`.
- Effects include approach ripples, pooled splash particles, bite vibration, an animated reel and a brief catch presentation. Instanced dock boards and nails reduce draw calls.

### Equipment and technique

| Lure | Nominal depth, limited by the lake bed | Technique and species |
| --- | --- | --- |
| Spinner | 0.75 m | Pauses or a gentle retrieve; trout and bass |
| Worm | 2.8 m | Resting or slow retrieval; bottom-feeding carp |
| Artificial lure | 1.4 m | Short retrieves and pauses; larger predators |

Retrieving actually moves the lure. Abrupt artificial-lure movements can scare nearby cautious fish. Affinity affects interest and attack likelihood without guaranteeing a species. Time, weather, temperature, depth and alertness also shape the response. If activity is low, recover the tackle and try another distance, lure or retrieve.

### PC controls

Left mouse and Space share casting, hook-setting and retrieval actions. Right mouse drag preserves the camera's sensitivity and rotation limits.

| Control | Action |
| --- | --- |
| Left mouse / Space | Hold and release to cast; press to set the hook; hold to retrieve |
| Right mouse + drag | Look around and aim |
| R | Recover tackle / cancel cast |
| E / panel selector | Equipment and lures |
| J | Journal and personal records |
| P / H / M / F | Pause / help / sound / fullscreen |

Touch menus remain hidden in the desktop interface, including in narrow windows. Pointer Lock is not used.

### Mobile controls

Activation combines touch capabilities, `pointer`, `hover`, interface size and the most recent input. On hybrid devices, mouse or keyboard restores the desktop interface; touch in a mobile interface enables the touch layer.

- Drag one finger over a clear part of the landscape to look around. Buttons and panels do not trigger camera gestures.
- Hold **LANZAR** and release to choose casting strength. The same action becomes **CLAVAR** during a bite and **RECOGER** while waiting or fighting. Alternate holding and releasing to manage tension. These are the current in-game labels.
- **EQUIPO** opens lure selection, tackle recovery and graphics settings. **CUADERNO** shows catches, records and CSV export.
- Look with one finger while holding the fishing control with another. Gesture cancellation, focus loss, page hiding or resizing clears held input without an accidental cast.
- Compact power and tension indicators appear when relevant. Menus support touch scrolling and safe areas; portrait and landscape are supported. The rotation hint is a recommendation, not an orientation lock.

The player stays on the dock, so there is no movement joystick.

### Limitations and next improvements

- Fish AI, fatigue, rod bending and line behavior are gameplay approximations. Fish do not navigate around every rock or simulate a complete ecology.
- There is one equipped rod and line and three selectable lures. Purchases, persistent equipment wear and equipment upgrades are not implemented.
- Records are local. Cross-device synchronization and importable backups remain future work; CSV export is available.
- Gameplay balancing, physical Android/iOS testing and automated Safari/WebKit coverage remain areas for further validation. Emulated mobile checks do not establish performance on every smartphone.
- Human hands remain disabled; provisional visual wildlife is not a finished feature.

## Phase 2 foundation: visual improvements

- **Water:** gentle geometric waves with analytical normals, surface detail, dynamic planar reflections and local bobber ripples. Transparency depends on approximate depth and viewing angle. Shared procedural bathymetry avoids an extra depth pass and keeps nearby fish visible.
- **Lighting:** warm sunrise tones, procedural clouds, sky-based ambient lighting, material reflections and atmospheric fog. Living Waters subsequently added changing sun position, day/night lighting and weather; v0.5.0 refines mist and lighting transitions. Static-scene shadow refreshes are limited rather than recalculated every frame.
- **Fish:** species-shaped bodies, scales, trout spots, stripes, gills, eyes, mouths and detailed fins, with size and color variations. Body and tail motion and interpolated turns improve swimming. Simplified distant geometry and shared GPU resources limit rendering cost.
- **Rod:** a tapered carbon blank, cork grip, guides, spool, bail and crank. Guides and the line exit follow progressive bending and damped recovery. The Art of Fishing added overhead casting, reel animation and variable line slack; v0.5.0 refines the grip.
- **Landscape:** continuous terrain with smooth normals, projected rock textures and height/slope-based vegetation, stone and snow. Pines, firs and broadleaf trees use varied cutout foliage; rocks, grasses and reeds complete the shore. Trees, rocks and grasses use instancing, with wind-responsive vegetation added in v0.5.0.

Visual and simulation updates preserve existing controls and saved progress without adding heavy dependencies.

## Fishing

1. Hold left mouse over the landscape, Space or the touch action. Power increases to 100%; release to cast between 9 and 40 metres.
2. Wait for a fish to find the lure or animate it with gentle retrieval. Fish presence, lure movement, depth and environmental conditions influence opportunities. Watch the bobber and surrounding ripples.
3. When the bobber dips and **¡PICADA!** appears, press within the bite window to set the hook.
4. Hold to retrieve. Tension rises more during strong pulls; **release to lower it**, then retrieve again around 30%. Alternate to keep tension roughly between 25% and 70%.
5. Bring the fish close enough to land and record it. Sustained critical tension breaks the line; prolonged slack also allows escape.

Additional controls:

| Control | Action |
| --- | --- |
| Right mouse + drag | Look around and aim the next cast |
| R | Recover tackle / cancel cast |
| P | Pause |
| H / ? | Instructions |
| J | Catch journal |
| M / ♪ | Synthesized ambience and cues; enabled for new players after interaction, with saved mute respected |
| F / ⛶ | Fullscreen |

## Installation and local development

Install a Node.js version supported by the project's Vite version, then run from the project directory in ORCA or a terminal:

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite in a modern WebGL-capable browser. On Windows PowerShell, use `npm.cmd` if execution policy prevents running `npm`.

To try a smartphone on the same local network:

```sh
npm run dev:lan
```

Open the printed network URL on the phone, using the computer's local IP address and Vite's port. Allow local-network access through the firewall if needed. Both devices must be on a network that permits communication between them.

```sh
npm test
npm run build
npm run preview
```

These run logic tests, create the production build in `dist/`, and serve it locally. Browser checks are available through `test:browser`, `test:mobile`, `test:environment`, `test:animation` and `test:production`; they require a compatible installed browser and the appropriate local server. No API keys are required.

## Files

- `src/fishing.js`: independent fishing simulation and states.
- `src/simulation/`: spatial fish behavior, species, lures, environment and shared lake-bed logic.
- `src/input/`: shared actions, keyboard/mouse, touch camera and interface detection.
- `src/journal.js`: compatible saved-data migration, records and CSV.
- `src/phase3.css`: equipment and adaptive touch interface.
- `src/world.js`: scene, reflective water, fish, dock and procedural tackle.
- `src/visuals/water.js`: waves, reflections, bathymetry and lake bed.
- `src/visuals/fish.js`: fish models, shared materials, animation and LOD.
- `src/visuals/rod.js`: flexible rod, refined cork grip and animated reel.
- `src/visuals/landscape.js`: terrain, textures and instanced vegetation.
- `src/visuals/vegetation-wind.js`: efficient wind-driven plant deformation.
- `src/visuals/atmosphere.js`: atmospheric and shoreline response helpers.
- `src/visuals/environment.js`: environmental visual presentation.
- `src/ambient-life.js`: environmental activity factors used by ambient audio.
- `src/main.js`: controls, interface, pause and persistence.
- `src/audio.js`: synthesized ambience and cues through Web Audio.
- `src/style.css`, `index.html`: responsive interface.
- `tests/`: simulation and browser checks.

## Prototype scope

Rainbow trout, carp, bass, European perch and tench have different sizes, weights and environmental preferences. Individual fish approach, investigate, attack, ignore or abandon a lure according to their state and surroundings. Lago Sereno changes over a simulated day/night cycle with gradual weather, wind and depth-dependent water temperature. Fishing remains a session from the dock; the player cannot walk around the lake.

Graphics rely on procedural resources, distant foliage cards and planar water reflections. Rod, line and ecology models prioritize understandable gameplay and stable desktop/mobile rendering over complete physical simulation. Environmental audio remains available without visible wildlife or human hands.

## Future direction — planned, not implemented

ALBA's longer-term direction includes first-person exploration, connected fishing areas, a village, a shop and RPG-style progression. These are planning goals, not features available in v0.5.0, and have no committed release date. Current play remains focused on fishing from the dock at Lago Sereno.

**ALBA — Beyond the Water**

*Every water has a story.*
