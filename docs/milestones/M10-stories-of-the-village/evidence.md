# Evidencia · Stories of the Village

**SHA y fecha** — 26/11/2026, base `6a1724084133006b4aec1152ada9fe839e425f4b`, v0.8.1 — Movement & Navigation. Etapa A documental sin commit.

**Equipo, navegador y perfil** — Windows/PowerShell en wolffish. No se lanza navegador, emulación ni hardware físico en A; los datos de GitHub se consultan por CLI autenticada, sin modificar releases.

**Comando y datos reales**:

- `git status --short`: limpio antes de crear rama. Rama anterior `feature/v0.8.0-living-village`; worktrees enumerados: wolffish, dartfish y raíz original; sin modificaciones a otros worktrees.
- `git fetch origin`, `git ls-remote origin refs/heads/main refs/tags/v0.8.1 'refs/tags/v0.8.1^{}'`: main y tag resuelven a la base indicada; objeto de tag anotado `16241f98d67a9d6bc2653c7e30eac0d8055bbb7c`. Comparación `origin/main...HEAD`: 0/0.
- `gh release view v0.8.1`: pre-release publicado el 26/11/2026, [URL verificada](https://github.com/isjustmontes/alba-beyond-the-water/releases/tag/v0.8.1).
- Consulta única al workflow pendiente de la entrega anterior: [Pages 45853421011](https://github.com/isjustmontes/alba-beyond-the-water/actions/runs/45853421011), **completed / success**. No sondeos ni nueva ejecución.
- `git switch -c feature/v0.9.0-stories-of-the-village origin/main`: rama nueva en wolffish, HEAD igual a main verificado; árbol limpio después de crearla. No merge/rebase ni cambio de otra rama usada por worktree.
- Leídos contrato AGENTS, índice, constitución, workflow, STATUS/ROADMAP, plantillas SDD, arquitectura/módulos y contratos pertinentes de M08/M09. M10 no tenía ficha; la anterior propuesta «M10 Experiencia» del roadmap se conserva como candidatura futura sin ID, sin renumerar hitos reales.

**Resultado, métricas e incidencias** — M10 documenta requisitos, contratos, guion propuesto, presupuesto de WebP, tareas B–E y criterios futuros. Sólo ficheros Markdown bajo docs. No assets, código, tests, build, commit, push, tag ni release. Pesos/tiempos/contraste de diseño son objetivos propuestos, no mediciones. No hay evidencia de conversación funcionando ni aceptación del retrato; el propietario debe revisar A antes de autorizar otra etapa.

**Límites heredados** — Pre-Alpha, aviso de tamaño del bundle v0.8.1 y pruebas físicas/WebKit/sesión sostenida pendientes no se resuelven por esta planificación. La comprobación de publicación anterior no acredita calidad técnica o artística de M10.
