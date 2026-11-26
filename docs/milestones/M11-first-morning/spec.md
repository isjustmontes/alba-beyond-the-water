# Especificación · The First Morning

**Final delivered scope:** owner accepts B/C and authorizes v0.10.0. REQ-INTRO-001–006 delivered; optional objective included under C authorization. No new tutorial, dependencies, models, economy or world content. Existing records and published history preserved. NFR certification is limited to the evidence/profiles recorded in final acceptance, with physical/WebKit/sustained checks partial. Original planning stages/exclusions below are historical where superseded by explicit C scope.

**C autorizada · alcance vigente:** B aceptada en `094ee84`. Implementar REQ-INTRO-001/005/006 y la integración de la presentación: nuevas partidas en plaza, introducción consumida antes de reproducir, aviso no bloqueante y recuperación de ubicación válida al recargar. La solicitud C amplía explícitamente el plan original para persistir la ubicación actual (zona, x/z, orientación y modo seguro), sin historial completo de posiciones por zona. Fuente real inspeccionada: versiones previas no escriben ubicación. Capturas/comercio/equipo/audio conservan claves y bytes. Guardados antiguos sin ubicación usan muelle; presencia de cualquier dato previo excluye la introducción, incluso vacío/corrupto. Sin commit C ni publicación; aceptación pendiente.

**Alcance B vigente:** A aprobada en `107ac34`; REQ-INTRO-002/003/004 y parte de NFR-INTRO-001/003 se implementan ahora como presentación opt-in DEV `?intro=1`. Título completo «ALBA — Beyond the Water». No clasificación de perfiles, nuevas claves, objetivo inicial ni cambio de aparición normal; REQ-INTRO-001/005/006 continúan NOT_STARTED. La Etapa C original de cámara se adelanta a B por instrucción explícita; persistencia/aparición se aplazan a autorización posterior. Resultados y aceptación actual prevalecen sobre estados/etapas del plan original inferior.

**Problema del jugador** — El inicio actual coloca a todas las sesiones en el muelle, en modo pesca. Falta una primera llegada que presente la aldea y permita descubrirla libremente.

**Requisito estable y origen** — Encargo del propietario de ALBA v0.10.0, Etapa A, 26/11/2026. Sólo planificación autorizada. Todos los requisitos de implementación están **NOT_STARTED**.

**Alcance incluido** — Primera aparición junto a la plaza existente; presentación cinematográfica al amanecer de unos 12 segundos; título y frase en DOM; salto accesible; entrega suave a exploración; aviso inicial no obligatorio; compatibilidad de guardados y accesibilidad PC/móvil.

**Alcance excluido** — Nuevas zonas, NPC 3D, modelos, manos, recursos externos, dependencias, vídeos, doblaje, misiones/recompensas, tutorial guiado, cambios de pesca/IA/economía/clima/audio, persistencia general de posición y reinicio o borrado de partidas. No añadir una opción de «Nueva partida» que elimine datos.

| ID | Prioridad | Requisito observable | Etapa / criterio |
| --- | --- | --- | --- |
| REQ-INTRO-001 | P1 | Identificar partida nueva antes de que los inicializadores escriban datos; comenzar en suelo transitable cerca de la plaza, explorando y con caña guardada | B / AC-INTRO-01 |
| REQ-INTRO-002 | P1 | Introducción de aproximadamente 12 s activos al amanecer, usando cámara y escena rural existentes, sin saltos de pose ni atravesar geometría | C / AC-INTRO-02 |
| REQ-INTRO-003 | P1 | Mostrar título «ALBA» y frase exacta «Cada agua guarda una historia. Esta es la tuya» con texto HTML legible | C / AC-INTRO-03 |
| REQ-INTRO-004 | P1 | Espacio, Escape y botón móvil permiten saltar desde el inicio; completar/saltar devuelve controles una sola vez, sin acciones residuales | C / AC-INTRO-04 |
| REQ-INTRO-005 | P1 | Mostrar brevemente «Explora la aldea» tras la entrega de controles, sin bloquear ni exigir tareas; Manuel, Xosé, tienda y camino al lago disponibles | D / AC-INTRO-05 |
| REQ-INTRO-006 | P0 | Nunca repetir la introducción en perfiles anteriores o sesiones posteriores; conservar capturas, saldo, compras, inventario, equipo y preferencias, incluso ante datos incompletos o fallos de almacenamiento | B/E / AC-INTRO-06 |
| NFR-INTRO-001 | P1 | Movimiento reducido elimina el recorrido de cámara; salto enfocable, botones ≥44 px, contraste, safe areas y orientación responsive, sin Pointer Lock automático | C/E / AC-INTRO-07 |
| NFR-INTRO-002 | P1 | Sin dependencias ni nuevos pases de render; costes medidos PC/móvil y recursos estables después de la introducción y viajes | E / AC-INTRO-08 |
| NFR-INTRO-003 | P1 | Preservar controles, diálogos, comercio, mapa, viajes, pesca y simulación ambiental existentes; liberar entradas al salir o interrumpir | D/E / AC-INTRO-09 |

**Criterios observables** — Procedimientos y evidencias futuras en [aceptación](acceptance.md). La duración nominal es 12 s de página visible, con tolerancia de ±1 s en condiciones normales, excluyendo carga y suspensiones. Reducir movimiento o saltar acorta deliberadamente la presentación.

**Decisiones propuestas para aprobación** — Cualquier clave previa reconocida, aunque vacía o corrupta, cuenta como perfil anterior; es preferible omitir una bienvenida a repetirla o modificar progreso. Preferencias de audio por sí solas también cuentan. Sin acceso fiable al almacenamiento, omitir introducción y conservar arranque compatible. Los perfiles creados por M11 vuelven a la plaza sin introducción en sesiones posteriores; los perfiles anteriores mantienen su arranque vigente en el muelle. Ninguno de estos casos promete restaurar una posición histórica que el juego no guarda actualmente.
