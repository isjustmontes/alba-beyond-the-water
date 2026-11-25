# Estado del proyecto · 25 de noviembre de 2026

**ALBA v0.5.0 · A World Alive · Pre-Alpha.** Base auditada: `main`, `544b7e1182279ee1b3b50f7de0a1f654e97fde1b`. Se partió de un árbol limpio en 6500994 y se actualizó por fast-forward al main remoto antes de auditar. El tag v0.5.0 y la prepublicación de GitHub identifican la entrega; el manifiesto y la interfaz aún indican 0.4.0.

El hito de producto más reciente es **M06**. Se propone mantenerlo como referencia activa de estabilización hasta que el propietario decida el siguiente alcance. M00 recoge la adopción documental transversal en el árbol de trabajo. El juego permite una partida completa con cinco especies, IA individual, entorno cambiante, pesca con tensión y capturas persistentes. Los límites para aceptar Alpha son compatibilidad física, rendimiento sostenido y gates de entrega.

### Estado por hito

| Hito | Tareas | Verif. | Impl. sin verificar | Parcial | Pend. | Bloq. | En curso | Impl. | Verif. % |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| M00 | 3 | 3 | 0 | 0 | 0 | 0 | 0 | 100% | 100% |
| M01 | 2 | 2 | 0 | 0 | 0 | 0 | 0 | 100% | 100% |
| M02 | 2 | 2 | 0 | 0 | 0 | 0 | 0 | 100% | 100% |
| M03 | 3 | 3 | 0 | 0 | 0 | 0 | 0 | 100% | 100% |
| M04 | 2 | 2 | 0 | 0 | 0 | 0 | 0 | 100% | 100% |
| M05 | 5 | 5 | 0 | 0 | 0 | 0 | 0 | 100% | 100% |
| M06 | 8 | 6 | 0 | 1 | 0 | 1 | 0 | 75% | 75% |

Cada fila usa el total de tareas reconstruidas de ese hito en este checkout. Implementación completa = (VERIFIED + IMPLEMENTED_UNVERIFIED) / total. Verificación = VERIFIED / total. Una tarea parcial o bloqueada no suma al numerador. Los porcentajes describen este inventario retrospectivo y los criterios propuestos, sin estimar el porcentaje del juego futuro. Las pruebas actuales no certifican retroactivamente los binarios históricos.

### Requisitos

| Estado de requisito | Cantidad |
| --- | --- |
| VERIFIED | 23 |
| BLOCKED | 1 |
| PARTIAL | 1 |

[Requisitos individuales, criterios y pruebas](../quality/TRACEABILITY.md) · [Baseline completa](../quality/evidence/README.md). npm test: 81/81. Compilación normal y de Pages correctas con aviso de tamaño. Guiones gráficos aprobados en su última ejecución: 13/13.

### Subsistemas

| Subsistema | Implementación | Verificación | Limitación principal | Riesgo | Siguiente mejora |
| --- | --- | --- | --- | --- | --- |
| Gameplay | Captura y escape | Node y captura táctil | Equilibrio sin sesiones con jugadores | Medio | Observar primera partida |
| Mecánica | Carga, tensión, fatiga y tres cebos | Dominio a 20/60 fps | Una caña y modelo simplificado | Medio | Medir duración del combate |
| IA | Atención y memoria por agente | Tests de encuentros con RNG controlado | Obstáculos sin navegación completa | Medio | Reproducir trayectorias problemáticas |
| Entorno | Ciclo, clima, profundidad y bruma | Node y Chromium | Sin persistencia ambiental | Bajo | Acordar continuidad entre sesiones |
| Gráficos | WebGL2, agua, vegetación y LOD | Modelos y atmósfera en Chromium | Coste variable de reflejos | Medio | Perfilar lluvia en teléfono |
| Animación | Overhead, flexión, sedal y salto | Node / guion de tres perfiles en baseline | Manos desactivadas | Bajo | Revisar legibilidad de clavado |
| Audio | Síntesis y desbloqueo con gesto | Node y preview | Escucha física pendiente | Medio | Probar suspensión en iOS |
| Control de escritorio | Ratón y teclado | Node / recorrido browser en baseline | Pérdida de foco entre plataformas | Medio | Completar la captura en Firefox/WebKit |
| Control móvil | Botón contextual y multitáctil | Teléfono/tableta emulados | Faltan iOS y Android reales | Alto | BL-001 |
| Persistencia | Diario, récords, CSV y preferencias | Migración y recarga | Sin importación ni copia automática | Medio | Simular cuota y datos antiguos |
| Pruebas | Dominio y 13 guiones | Baseline por comando | Sin gate en Pages | Alto | BL-003 |
| Rendimiento | Dos calidades, pools y reflexión limitada | Métricas de escena y modelos | Sin medición térmica sostenida | Alto | BL-002 |
| Infraestructura | Build estático y Pages | Build local, preview y HTTP 200 | Sin rollback ensayado | Alto | Ensayar recuperación con autorización |
| Documentación | Archivo histórico y SDD | Enlaces, IDs, preservación y Mermaid | Aceptación de objetivos físicos pendiente | Bajo | Revisar al cambiar cada criterio |

### Próximas tres tareas

1. **BL-001.** Validar captura, audio, rotación y recarga con un Android y un iPhone físicos. La emulación cubre eventos y layout; falta el comportamiento combinado de navegador, GPU y hardware.
2. **BL-002.** Reutilizar esos perfiles en una sesión de 30 minutos y registrar p95, memoria y degradación. Esto permite elegir presupuestos antes de aumentar densidad visual.
3. **BL-003.** Someter a aprobación un gate de unitarias y humo de preview. El flujo actual permite que un build con regresión jugable se publique.

El propietario debe acordar los dispositivos, los presupuestos, los gates y la apertura de M07. [Hoja de ruta](ROADMAP.md) · [Problemas confirmados](KNOWN_ISSUES.md) · [Riesgos](RISKS.md) · [Deuda](TECHNICAL_DEBT.md)
