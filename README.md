# ALBA · Beyond the Water

![ALBA — Beyond the Water](alba%20-%20banner.webp)

**v0.6.0 — First Steps · Pre-Alpha.** Explore Lago Sereno on foot, follow its shoreline and choose a safe place to fish. Existing fishing, environmental simulation, audio and saved catches are preserved. The npm package retains its legacy 0.4.0 version; release tags identify published versions.

[Play on GitHub Pages](https://isjustmontes.github.io/alba-beyond-the-water/) · [How to play](docs/user-guide/README.md) · [v0.6.0 release notes](https://github.com/isjustmontes/alba-beyond-the-water/releases/tag/v0.6.0)

*Every water has a story.*

## First Steps

- First-person exploration with keyboard and mouse on PC, or a touch joystick and camera gestures on mobile.
- A walkable dock-to-shore connection, shoreline paths and two additional fishing areas, with basic terrain, water and obstacle boundaries.
- Fishing from safe shoreline positions using the player's current position and direction. Improved casting validation rejects land and real obstacles; fish inhabit valid areas throughout the lake.
- Smooth rod equip/unequip transitions, and exploration-only sprint at 1.5× walking speed.
- Initial connected-zone architecture: Lago Sereno has an ID, entry and spawn. Transition planning is prepared; additional playable zones and visual transitions are not implemented.

Casting, bites, tension, fights, lures, equipment and the persistent journal remain available. Living Waters supplies day/night, weather, wind and depth-dependent temperature. A World Alive adds wind-responsive vegetation, morning mist, refined lighting and shorelines, environmental wildlife sounds and the refined cork grip.

Human hands remain disabled. Provisional visual wildlife is not available in gameplay; its environmental sounds remain.

## Controls

### PC

- **V / mode button:** switch between exploration and fishing. Recover active tackle before exploring; face safe open water to equip for shore fishing.
- **WASD:** walk; **Shift:** hold to sprint while exploring. Mouse movement controls exploration view; **Esc** releases captured mouse input. Fishing retains right-button drag to aim.
- **Left mouse / Space:** hold and release to cast, press during a bite to set the hook, and hold to retrieve. Release periodically to manage fight tension.
- **R:** recover tackle; **E:** equipment; **J:** journal; **P:** pause; **H:** help; **M:** sound; **F:** fullscreen.

### Mobile

- Use the mode button to explore or fish. In exploration, use the joystick, drag clear scenery to look, and toggle **CORRER** to sprint.
- In fishing mode, hold **LANZAR** and release to cast. The contextual action changes to **CLAVAR** during a bite and **RECOGER** for retrieval and fighting.
- **EQUIPO** opens equipment and lures; **CUADERNO** opens catches and records. Compact contextual indicators, safe areas and portrait/landscape layouts remain supported.

Audio starts after a browser-permitted interaction and respects saved mute preferences. Exploration position and environmental time/weather are not persisted between sessions; existing catch and equipment storage is preserved.

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

## Development

Consult the [project status](docs/project/STATUS.md), [roadmap](docs/project/ROADMAP.md) and [documentation index](docs/README.md). Choose an authorized milestone task and define its verification using the [SDD workflow](docs/sdd/WORKFLOW.md). [M07 evidence and acceptance](docs/milestones/M07-first-steps/README.md) distinguish technical checks, owner acceptance and physical-device limitations.

[Archived English v0.5.0 guide](https://github.com/isjustmontes/alba-beyond-the-water/blob/2d5ca938df5987867092774478dbd8a6df3bb0b3/README.md)

## Future direction — planned, not implemented

Connected playable areas, a village, a shop and RPG-style progression remain planning goals without a committed release date. The initial zone registry does not yet provide travel to another zone. Physical mobile validation, sustained performance profiling and gameplay refinement remain priorities.

**ALBA — Beyond the Water**

*Every water has a story.*
