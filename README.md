# ALBA · Beyond the Water

![ALBA — Beyond the Water](alba%20-%20banner.webp)

**v0.10.0 — The First Morning · Pre-Alpha.** New adventures begin in the village square with a skippable sunrise introduction. Player location and orientation now survive reloads, while existing saves, fishing, illustrated inhabitants, commerce and environmental systems remain compatible. The npm package retains its legacy 0.4.0 version; release tags identify published versions.

[Play on GitHub Pages](https://isjustmontes.github.io/alba-beyond-the-water/) · [How to play](docs/user-guide/README.md) · [v0.10.0 release notes](https://github.com/isjustmontes/alba-beyond-the-water/releases/tag/v0.10.0)

*Every water has a story.*

## The First Morning

- **A first arrival:** genuinely new profiles start in the existing village square after an approximately 12-second sunrise camera sequence. Manuel, Xosé, the shop and the lake path are immediately available.
- **An accessible introduction:** ALBA's title and “Cada agua guarda una historia. Esta es la tuya” accompany a slow view toward the plaza. Press **Space / Escape** or the visible **Skip introduction** button to continue; reduced-motion preferences omit camera travel and return control immediately.
- **A gentle invitation:** “Explora la aldea” appears briefly after the introduction without requiring conversations or a tutorial.
- **Local continuity:** the introduction is consumed before playback and does not repeat on reload or zone travel. Safe current location, orientation and mode are stored locally; old profiles without location use the compatible dock fallback without replaying the introduction or resetting progress.
- **Safe recovery:** unknown or corrupt player-location records are preserved and use a safe fallback. Height is derived from walkable ground; jumps, active fights, environmental time/weather and per-zone return history are not persisted. Abrupt process termination can lose the last short position-save interval. No cloud synchronization is provided.

## Stories of the Village

- **Two illustrated inhabitants:** meet Manuel, a veteran fisherman by the plaza bench, and Xosé, the owner of ARTES DE PESCA. Their final watercolor portraits retain transparent backgrounds; no 3D character models are introduced.
- **Handcrafted dialogue interface:** reusable parchment, readable HTML text and real choice buttons preserve ALBA's visual identity. The same panel adapts to desktop, phone and tablet; close, farewell and back options remain available.
- **Branching conversations:** fishing advice reflects the existing species, tackle and environmental systems. Short family memories and village stories give each inhabitant a distinct voice. Conversations do not grant rewards or modify saved progress.
- **Clear encounters:** small weathered wooden portrait signs and gently floating, camera-facing speech bubbles identify both locations. Indicators fade with distance and hide during menus; existing navigation boundaries remain intact.
- **Talk or shop:** press E near an inhabitant or use the mobile contextual button. Xosé's catalog option opens the existing tackle shop; T retains direct shop access on PC. Existing money, purchases and equipment remain compatible.
- **Safe controls:** conversations pause the session and clear held keys, both mobile joysticks and captured mouse input. Closing restores play; switching to the catalog keeps one paused modal open. The original fishing, weather, exploration and audio systems are preserved.

## Movement & Navigation

- **Faster exploration:** walk at 2.8 m/s (+27%) and run at 4.0 m/s (+21%), with the existing smooth acceleration and collision boundaries.
- **PC jumping:** press Space while exploring for a moderate jump with gravity and automatic landing. Double jumping is prevented; Space keeps its fishing action in fishing mode. Land before equipping tackle or travelling.
- **Current-zone maps:** press M or tap MAPA to see your position, orientation, existing paths and points of interest in Lago Sereno or the village. The map pauses the session; close it with M, Esc or ×. Sound now uses N or the existing sound button.
- **Dual mobile joysticks:** move with the left stick and hold the right stick off-centre for continuous, proportional camera control. Independent fingers, a central dead zone and smooth turning preserve the existing camera limits. Menus clear held input; layouts adapt to portrait, landscape and smaller screens.

## A Living Village

- **Atlantic vegetation:** varied oak and chestnut silhouettes, irregular tree groups, grasses and ferns respond to the existing environmental wind. Lago Sereno's trees remain unchanged.
- **Natural ground and paths:** gentle outer relief, organic grass-to-path transitions and more varied soil detail preserve the existing walkable routes and collision boundaries.
- **Rural architecture:** granite, aged tiles and natural wood gain subtle joints, grain, moss and localized wear while buildings, signs and shop access retain their layout.
- **Weather and light:** softer morning mist, balanced daylight and night visibility, and gradual surface wetting and drying follow Living Waters without introducing another simulation.
- **Landscape depth:** distant rolling hills and clustered woodland blend into atmospheric haze. This background is visual scenery, not a new explorable zone.
- **Desktop and mobile:** instanced vegetation, shared materials and reduced distant foliage on low/mobile quality keep the additional rendering work bounded. Existing controls, commerce and fishing remain available.

## The Angler's Village

- **A small explorable village:** traditional granite houses, tiled roofs, wooden doors and shutters, a village square, natural paths and Atlantic-inspired vegetation. The fishing tackle shop occupies the exterior of a traditional house; there are no interiors or 3D NPCs; illustrated inhabitants are described above.
- **Two-way travel:** follow the inland path from the dock to the ALDEA sign and use the nearby contextual interaction. Return through the village's southern path toward LAGO SERENO. Each zone remembers your position and view during the session.
- **Fishing tackle shop:** approach ARTES DE PESCA and open its catalog. New commerce progress starts with 100 test credits; buy existing bait, lures and replacement monofilament with balance checks and duplicate-purchase protection. There are no sales or recurring income yet.
- **Persistent equipment:** select purchased lure types or mount a replacement line from the shop or Equipment. Money, quantities, purchase receipts and equipped tackle survive reloads; previous catches and preferences remain compatible. Inventory quantities include owned equipment and are not consumed by fishing. Replacement line uses the existing properties rather than adding a new advantage.
- **Desktop and mobile:** contextual keyboard/touch actions, readable signs and an ALDEA / LAGO SERENO heading identify the current zone. Only the active zone is rendered; shared and cached resources limit repeated work.

## First Steps foundation

- First-person exploration with keyboard and mouse on PC, or a touch joystick and camera gestures on mobile.
- A walkable dock-to-shore connection, shoreline paths and two additional fishing areas, with basic terrain, water and obstacle boundaries.
- Fishing from safe shoreline positions using the player's current position and direction. Improved casting validation rejects land and real obstacles; fish inhabit valid areas throughout the lake.
- Smooth rod equip/unequip transitions, and exploration-only sprint at 4.0 m/s, with walking at 2.8 m/s.
- Connected-zone architecture introduced in First Steps now supports travel between Lago Sereno and the village.

Casting, bites, tension, fights, lures, equipment and the persistent journal remain available. Living Waters supplies day/night, weather, wind and depth-dependent temperature. A World Alive adds wind-responsive vegetation, morning mist, refined lighting and shorelines, environmental wildlife sounds and the refined cork grip.

Human hands remain disabled. Provisional visual wildlife is not available in gameplay; its environmental sounds remain.

## Controls

### PC

- **V / mode button:** switch between exploration and fishing. Recover active tackle before exploring; face safe open water to equip for shore fishing.
- **T / contextual button:** travel near a zone exit or open ARTES DE PESCA near its door. The prompt disappears outside interaction range; fishing is available at the lake, not inside the village.
- **WASD:** walk; **Shift:** hold to sprint while exploring; **Space:** jump while exploring, with automatic landing and no double jump. Mouse movement controls exploration view; **Esc** releases captured mouse input. Fishing retains right-button drag to aim.
- **Left mouse / Space in fishing mode:** hold and release to cast, press during a bite to set the hook, and hold to retrieve. Release periodically to manage fight tension.
- **E / contextual button:** talk to Manuel near the plaza bench or Xosé by the shop door; E opens equipment elsewhere. Back/farewell/×/Esc leave the conversation.
- **R:** recover tackle; **J:** journal; **P:** pause; **H:** help; **M:** open/close the current-zone map; **N:** sound; **F:** fullscreen.
- **During the first introduction:** Space or Escape skips it without triggering a gameplay jump or fishing action.

### Mobile

- Use the mode button to explore or fish. In exploration, use the left joystick to move and the matching right joystick to look continuously while tilted; both work with independent fingers. Toggle **CORRER** to sprint. The right joystick also works in fishing mode, within the existing camera limits; scenery dragging remains available.
- Tap the contextual travel/talk button near an exit or an inhabitant. At the shop door, speak to Xosé and choose the catalog option to buy, select a lure or mount replacement line through the existing store. Close or say farewell to continue exploring.
- In fishing mode, hold **LANZAR** and release to cast. The contextual action changes to **CLAVAR** during a bite and **RECOGER** for retrieval and fighting.
- **MAPA** opens the current-zone map; close it with × to resume. Jump is currently a PC keyboard action.
- **EQUIPO** opens equipment and lures; **CUADERNO** opens catches and records. Compact contextual indicators, safe areas and portrait/landscape layouts remain supported.
- **During the first introduction:** tap **Saltar introducción** to continue; normal touch controls return after the camera handoff.

Audio starts after a browser-permitted interaction and respects saved mute preferences. Safe current player location and orientation are persisted; environmental time/weather still restart with each session. Money, inventory, purchase receipts and equipped tackle are saved locally; catch storage and existing preferences are preserved. Commerce errors do not erase previous saves. These local saves are not cloud-synchronized.

## Run locally

With Node.js and npm installed (CI uses Node 22), run from the project terminal in ORCA or another terminal:

```sh
npm ci
npm run dev
```

Open Vite's printed URL in a modern WebGL2-capable browser. On Windows PowerShell, use `npm.cmd` if execution policy blocks `npm`. Three.js renders the lake; JavaScript, HTML and CSS handle simulation and interface, and Web Audio synthesizes sound. No paid services or API keys are required.

For a smartphone on the same local network, run `npm run dev:lan` and open the printed network URL on the phone using the computer's local IP address and port. Allow local-network access through the firewall if needed.

Run `npm test` for logic tests, `npm run build` for production output in `dist/`, and `npm run preview` to serve that build locally. With the server running and compatible Chromium available, `npm run test:browser` checks the fishing experience. Browser emulation does not replace physical Android/iOS testing or sustained mobile performance measurements.

## Version history

All releases remain **Pre-Alpha**.

| Version | Milestone |
| --- | --- |
| [v0.1.0](https://github.com/isjustmontes/alba-beyond-the-water/releases/tag/v0.1.0) | Initial playable fishing, Lago Sereno and visual foundation. |
| [v0.2.0](https://github.com/isjustmontes/alba-beyond-the-water/releases/tag/v0.2.0) | Advanced Fishing & Mobile Support: spatial AI, fights, lures, equipment, journal and touch controls. |
| [v0.3.0](https://github.com/isjustmontes/alba-beyond-the-water/releases/tag/v0.3.0) | Living Waters: day/night, weather, temperature, environmental fish behavior and audio. |
| [v0.4.0](https://github.com/isjustmontes/alba-beyond-the-water/releases/tag/v0.4.0) | The Art of Fishing: overhead casting, rod flex, reel, line and fish animations. |
| [v0.4.1](https://github.com/isjustmontes/alba-beyond-the-water/releases/tag/v0.4.1) | Individual Fish Behavior and default ambient audio with saved mute preferences. |
| [v0.4.2](https://github.com/isjustmontes/alba-beyond-the-water/releases/tag/v0.4.2) | Mobile HUD Optimization. |
| [v0.5.0](https://github.com/isjustmontes/alba-beyond-the-water/releases/tag/v0.5.0) | A World Alive: dynamic vegetation, atmosphere, shorelines, natural soundscape and refined cork grip. |
| [v0.6.0](https://github.com/isjustmontes/alba-beyond-the-water/releases/tag/v0.6.0) | First Steps: exploration, shoreline fishing, sprint and initial connected-zone architecture. |
| [v0.7.0](https://github.com/isjustmontes/alba-beyond-the-water/releases/tag/v0.7.0) | The Angler's Village: Galician-inspired village, two-way travel, contextual shop, basic currency and persistent inventory/equipped tackle. |
| [v0.8.0](https://github.com/isjustmontes/alba-beyond-the-water/releases/tag/v0.8.0) | A Living Village: Atlantic vegetation, natural terrain and paths, refined rural materials, weather-responsive lighting and distant rolling hills. |
| [v0.8.1](https://github.com/isjustmontes/alba-beyond-the-water/releases/tag/v0.8.1) | Movement & Navigation: faster walking/running, PC jumping, zone maps and dual mobile joysticks. |
| [v0.9.0](https://github.com/isjustmontes/alba-beyond-the-water/releases/tag/v0.9.0) | Stories of the Village: illustrated Manuel and Xosé, branching dialogue, contextual signs and direct catalog access. |
| [v0.10.0](https://github.com/isjustmontes/alba-beyond-the-water/releases/tag/v0.10.0) | The First Morning: skippable sunrise introduction, village-square starts, reduced-motion support, persistent player location and compatible previous saves. |

## Development

Consult the [project status](docs/project/STATUS.md), [roadmap](docs/project/ROADMAP.md) and [documentation index](docs/README.md). Choose an authorized milestone task and define its verification using the [SDD workflow](docs/sdd/WORKFLOW.md). [M07 evidence and acceptance](docs/milestones/M07-first-steps/README.md) distinguish technical checks, owner acceptance and physical-device limitations.

[M08 evidence and acceptance](docs/milestones/M08-anglers-village/README.md) document the village and persistent commerce. The final relevant logic suite passed 35/35 and the production build succeeded. Desktop and emulated portrait/landscape checks cover shop interactions, previous saves, equipment and return fishing. Physical mobile testing and sustained performance profiling remain pending; the existing large-bundle warning remains.

[Archived English v0.5.0 guide](https://github.com/isjustmontes/alba-beyond-the-water/blob/2d5ca938df5987867092774478dbd8a6df3bb0b3/README.md)

[M09 evidence and acceptance](docs/milestones/M09-living-village/README.md) record the accepted v0.8.0 visual scope. The final relevant logic suite passed 60/60 and the production build succeeded, with the existing large-bundle warning. Prior desktop and emulated mobile/tablet checks cover village views, weather, travel and commerce. Short headless measurements show stable resources across five round trips; they do not certify sustained or physical-device performance. Physical Android/iOS and WebKit validation remain pending.

[v0.8.1 SDD acceptance and evidence](docs/milestones/M09-living-village/navigation-0.8.1.md) record the accepted movement and navigation update. The final relevant suite passed 76/76 and the production build succeeded. Existing browser evidence covers six desktop/mobile/tablet profiles, independent two-finger controls, maps and fishing. The 688.39 kB JavaScript chunk (191.84 kB gzip) retains the known >500 kB warning; no dependency or bundling refactor was added. Physical mobile, WebKit and sustained performance checks remain pending.

[M10 acceptance and evidence](docs/milestones/M10-stories-of-the-village/acceptance.md) record the owner-validated inhabitants, reusable dialogue and existing-shop integration. Final validation includes 169/169 logic tests and production/Pages builds; PC and mobile/tablet emulation cover dialogue, controls, commerce, travel and saved progress. The known large-bundle warning, physical-device/WebKit checks and sustained performance remain explicit Pre-Alpha limitations.

[M11 acceptance and evidence](docs/milestones/M11-first-morning/acceptance.md) record the owner-validated introduction and persistent startup. Final checks include 184/184 logic tests, nine integrated desktop/mobile/tablet scenarios and a production build using the GitHub Pages relative base. The known large-bundle warning, physical-device/WebKit accessibility checks and sustained performance remain explicit limitations.

## Future direction — planned, not implemented

Further connected areas, recurring income, equipment progression and broader RPG systems remain planning goals without a committed release date. The current village has one exterior shop, finite test currency, two illustrated inhabitants and no 3D NPCs, interiors or quests. Physical mobile validation, sustained performance profiling and gameplay refinement remain priorities.

**ALBA — Beyond the Water**

*Every water has a story.*
