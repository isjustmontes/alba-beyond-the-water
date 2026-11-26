# ALBA · Beyond the Water

![ALBA — Beyond the Water](alba%20-%20banner.webp)

**v0.7.0 — The Angler's Village · Pre-Alpha.** Explore a Galician-inspired rural village, visit its fishing tackle shop and return to Lago Sereno with your equipped tackle. Existing fishing, environmental simulation, audio and saved catches are preserved. The npm package retains its legacy 0.4.0 version; release tags identify published versions.

[Play on GitHub Pages](https://isjustmontes.github.io/alba-beyond-the-water/) · [How to play](docs/user-guide/README.md) · [v0.7.0 release notes](https://github.com/isjustmontes/alba-beyond-the-water/releases/tag/v0.7.0)

*Every water has a story.*

## The Angler's Village

- **A small explorable village:** traditional granite houses, tiled roofs, wooden doors and shutters, a village square, natural paths and Atlantic-inspired vegetation. The fishing tackle shop occupies the exterior of a traditional house; there are no interiors or NPCs.
- **Two-way travel:** follow the inland path from the dock to the ALDEA sign and use the nearby contextual interaction. Return through the village's southern path toward LAGO SERENO. Each zone remembers your position and view during the session.
- **Fishing tackle shop:** approach ARTES DE PESCA and open its catalog. New commerce progress starts with 100 test credits; buy existing bait, lures and replacement monofilament with balance checks and duplicate-purchase protection. There are no sales or recurring income yet.
- **Persistent equipment:** select purchased lure types or mount a replacement line from the shop or Equipment. Money, quantities, purchase receipts and equipped tackle survive reloads; previous catches and preferences remain compatible. Inventory quantities include owned equipment and are not consumed by fishing. Replacement line uses the existing properties rather than adding a new advantage.
- **Desktop and mobile:** contextual keyboard/touch actions, readable signs and an ALDEA / LAGO SERENO heading identify the current zone. Only the active zone is rendered; shared and cached resources limit repeated work.

## First Steps foundation

- First-person exploration with keyboard and mouse on PC, or a touch joystick and camera gestures on mobile.
- A walkable dock-to-shore connection, shoreline paths and two additional fishing areas, with basic terrain, water and obstacle boundaries.
- Fishing from safe shoreline positions using the player's current position and direction. Improved casting validation rejects land and real obstacles; fish inhabit valid areas throughout the lake.
- Smooth rod equip/unequip transitions, and exploration-only sprint at 1.5× walking speed.
- Connected-zone architecture introduced in First Steps now supports travel between Lago Sereno and the village.

Casting, bites, tension, fights, lures, equipment and the persistent journal remain available. Living Waters supplies day/night, weather, wind and depth-dependent temperature. A World Alive adds wind-responsive vegetation, morning mist, refined lighting and shorelines, environmental wildlife sounds and the refined cork grip.

Human hands remain disabled. Provisional visual wildlife is not available in gameplay; its environmental sounds remain.

## Controls

### PC

- **V / mode button:** switch between exploration and fishing. Recover active tackle before exploring; face safe open water to equip for shore fishing.
- **T / contextual button:** travel near a zone exit or open ARTES DE PESCA near its door. The prompt disappears outside interaction range; fishing is available at the lake, not inside the village.
- **WASD:** walk; **Shift:** hold to sprint while exploring. Mouse movement controls exploration view; **Esc** releases captured mouse input. Fishing retains right-button drag to aim.
- **Left mouse / Space:** hold and release to cast, press during a bite to set the hook, and hold to retrieve. Release periodically to manage fight tension.
- **R:** recover tackle; **E:** equipment; **J:** journal; **P:** pause; **H:** help; **M:** sound; **F:** fullscreen.

### Mobile

- Use the mode button to explore or fish. In exploration, use the joystick, drag clear scenery to look, and toggle **CORRER** to sprint.
- Tap the contextual travel/shop button when it appears near an exit or the shop door. Choose an item to buy, select a lure or mount replacement line; close the panel to continue exploring.
- In fishing mode, hold **LANZAR** and release to cast. The contextual action changes to **CLAVAR** during a bite and **RECOGER** for retrieval and fighting.
- **EQUIPO** opens equipment and lures; **CUADERNO** opens catches and records. Compact contextual indicators, safe areas and portrait/landscape layouts remain supported.

Audio starts after a browser-permitted interaction and respects saved mute preferences. Exploration position and environmental time/weather are not persisted between sessions. Money, inventory, purchase receipts and equipped tackle are saved locally; catch storage and existing preferences are preserved. Commerce errors do not erase previous saves. These local saves are not cloud-synchronized.

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

## Development

Consult the [project status](docs/project/STATUS.md), [roadmap](docs/project/ROADMAP.md) and [documentation index](docs/README.md). Choose an authorized milestone task and define its verification using the [SDD workflow](docs/sdd/WORKFLOW.md). [M07 evidence and acceptance](docs/milestones/M07-first-steps/README.md) distinguish technical checks, owner acceptance and physical-device limitations.

[M08 evidence and acceptance](docs/milestones/M08-anglers-village/README.md) document the village and persistent commerce. The final relevant logic suite passed 35/35 and the production build succeeded. Desktop and emulated portrait/landscape checks cover shop interactions, previous saves, equipment and return fishing. Physical mobile testing and sustained performance profiling remain pending; the existing large-bundle warning remains.

[Archived English v0.5.0 guide](https://github.com/isjustmontes/alba-beyond-the-water/blob/2d5ca938df5987867092774478dbd8a6df3bb0b3/README.md)

## Future direction — planned, not implemented

Further connected areas, recurring income, equipment progression and broader RPG systems remain planning goals without a committed release date. The current village has one exterior shop, finite test currency and no NPCs, interiors or quests. Physical mobile validation, sustained performance profiling and gameplay refinement remain priorities.

**ALBA — Beyond the Water**

*Every water has a story.*
