# Evidencia · The First Morning

**SHA y fecha** — Base `f7751bf1ff85c5c4e9524e614506fcfe8b5574b1`, 26/11/2026. Documentación A aún sin commit. No atribuir resultados históricos de M10 a M11.

**Equipo, navegador y perfil** — Inspección estática en Windows/PowerShell, worktree `C:/Users/idade/orca/workspaces/gpt-prueba/wolffish`. Sin navegador, emulación ni dispositivo físico utilizado para M11-A.

**Comandos y datos reales**

- `git status --short`: limpio antes de editar; rama inicial `feature/v0.9.0-stories-of-the-village`.
- `git fetch origin`: correcto; `git log -1 origin/main` y `git rev-parse 'v0.9.0^{commit}'`: ambos `f7751bf1ff85c5c4e9524e614506fcfe8b5574b1`.
- `gh release view v0.9.0 --repo isjustmontes/alba-beyond-the-water --json tagName,isPrerelease,url,publishedAt`: v0.9.0 publicada a las `2026-11-26T19:34:37Z`, pre-release. [Release comprobada](https://github.com/isjustmontes/alba-beyond-the-water/releases/tag/v0.9.0).
- `git switch -c feature/v0.10.0-first-morning origin/main`: correcto desde base verificada, sin commits adicionales.
- `git worktree list`: wolffish en nueva rama; dartfish continúa en `isjustmontes/dartfish`, `7ecc8f7`; no modificado.
- Lectura de AGENTS, índice, constitución/flujo/plantillas, STATUS, ROADMAP, M10, arquitectura/módulos y diseño del juego. Inspección relevante: `main.js`, `world.js`, `zones.js`, `input/exploration.js`, `village-layout.js`, `shop.js`, `audio.js`, `simulation/environment.js`.

**Resultado e incidencias** — Diagnóstico documentado: inicio fijo en muelle; tienda escribe al iniciar; cámara aplicada por main cada frame; aldea diferida; poses sólo en sesión; amanecer predeterminado 06:24. M11 define clasificación conservadora previa a escrituras, marcador aditivo y arbitraje de cámara. Coordenadas/curvas propuestas sin validación visual. No se detectó divergencia de base ni cambios pendientes iniciales.

**Revisión documental final** — `git diff --check` sin incidencias; `git status --short` muestra únicamente siete documentos canónicos modificados y la nueva carpeta M11 con sus seis documentos. HEAD permanece en la base publicada, rama nueva correcta; sin archivos de código/assets ni cambios staged. Índices, STATUS, ROADMAP y trazabilidad enlazan M11 y mantienen el historial anterior.

**Límites** — Sin implementación, tests, build, medidas de rendimiento ni pruebas visuales/accesibles en A. Sin código/assets/guardados modificados; sin commit, push, tag ni release. A pendiente de aprobación humana; B–E no autorizadas. Los procedimientos de aceptación no son resultados ejecutados.
