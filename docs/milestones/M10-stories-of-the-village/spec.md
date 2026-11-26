# Especificación · Stories of the Village

**Alcance B vigente por encargo explícito:** A validada y conservada en `49f54c3`. Implementar exclusivamente interfaz ilustrada reutilizable y previsualización de desarrollo aislada con los dos WebP aportados (`manuel-portrait.webp`, `dialogue-parchment.webp`). Integra parte visual de T02/T03/REQ-NAR-001 y NFR-NAR-002, sin completar guion/ramas REQ-NAR-002 ni interacción contextual REQ-NAR-003. Textos/opciones de muestra, no conversaciones completas. No tocar la experiencia jugable ni crear NPC/mecánicas. Verificar layout, eventos/foco y build; detener para validación visual, sin commit B ni publicación. El orden B/C original inferior se ajusta a esta autorización.

**Problema del jugador** — La aldea ofrece exploración y comercio, pero carece de una voz humana que conecte su paisaje con la pesca. Presentar a Manuel de forma narrativa y artesanal, sin el coste ni las limitaciones de un personaje 3D provisional.

**Requisito estable y origen** — Solicitud v0.9.0 Etapa A del propietario, 26/11/2026. Diseño visual expresamente aprobado; requisitos de producto siguientes **NOT_STARTED**. Esta ficha es planificación, no evidencia de implementación.

**Alcance incluido** — Un habitante ficticio, Manuel; un retrato 2D en acuarela; pergamino y retrato independientes; panel HTML/CSS con texto seleccionable y botones reales; conversación escrita, ramificada y repetible sobre pesca/Lago Sereno; un punto contextual accesible en la plaza existente; teclado/ratón y controles móviles conservados.

**Alcance excluido** — NPC/modelos/animaciones 3D, interiores o zonas nuevas, otros habitantes, voz/doblaje, efectos sonoros nuevos, misiones, reputación, premios, cambios de saldo/equipo, progresión, guardado narrativo, dependencias, servicios externos y claves API. No se modifica IA, pesca, clima, audio ni persistencia para justificar la conversación.

| ID | Prioridad | Requisito observable | Etapa |
| --- | --- | --- | --- |
| REQ-NAR-001 | P1 | Manuel aparece como retrato narrativo natural en acuarela; panel de pergamino tierra, nombre y texto/opciones en DOM, sin texto pintado en la imagen ni NPC 3D | B/C |
| REQ-NAR-002 | P1 | Guion local con al menos dos ramas temáticas distintas (pesca y Lago Sereno), elecciones que llevan a respuestas diferentes, regreso a temas y despedida accesible desde cualquier nodo | B/C |
| REQ-NAR-003 | P1 | Proximidad a un punto existente de la plaza habilita «T · Hablar con Manuel» o botón táctil; desaparece al alejarse. Sólo al explorar en aldea, en suelo, sin aparejo activo ni otro modal | D |
| REQ-NAR-004 | P1 | Abrir diálogo limpia teclas/dedos/joysticks, libera Pointer Lock y pausa como los menús existentes; cerrar por botón/Esc devuelve el juego sin giro, salto, lanzamiento, compra o viaje accidental | C/D |
| NFR-NAR-001 | P1 | WebP separados, con procedencia/licencia registradas y presupuesto propuesto en diseño; selección responsive y carga diferida, sin dependencias ni trabajo 3D nuevo | B/E |
| NFR-NAR-002 | P1 | PC/móvil legibles: retrato izquierdo y contenido derecho cuando cabe; apilado vertical si necesario, safe areas, scroll del contenido y botones ≥44 px sin recortar cierre/opciones | C/E |
| NFR-NAR-003 | P1 | Preservar controles de v0.8.1, pesca, tienda, viajes, mapa, clima/audio y bytes de guardados previos al conversar/cerrar/cambiar zona/recargar | D/E |

**Criterios observables** — AC-NAR-01–06 de [aceptación](acceptance.md), enlazados a tareas y evidencia. Las condiciones ambientales pueden comentarse de forma general; no se muestran probabilidades ocultas ni se prometen capturas. Consejos coherentes con sistemas existentes, sin alterar sus valores.

**Decisiones propuestas para el MVP** — Texto inicialmente en castellano, con voz rural gallega respetuosa y sin caricaturas; sin sistema de traducciones nuevo. Cada apertura empieza en la bienvenida y permite releer todo. Sin persistencia de elecciones o desbloqueos, porque no hay consecuencias de progreso. Punto junto a un banco existente de la plaza: coordenadas/radio/visibilidad se comprueban al iniciar D, sin desplazar edificios, bancos ni colisiones. Guion final y retrato requieren revisión humana antes de integración.
