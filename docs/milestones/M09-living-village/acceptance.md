# Aceptación propuesta · A Living Village

**Criterio** — Todos los criterios de producto están NOT_STARTED; A pendiente de aprobación del propietario. Matriz de trazabilidad local:

| Criterio / requisito / tarea | Entrada y acción | Resultado esperado / evidencia futura |
| --- | --- | --- |
| AC-LVI-01 · REQ-LVI-001/002 · T02 | Recorrer entrada, plaza, tienda y salida en PC y táctil; mirar bordes y suelo, volver al lago. | Suelo/colisiones coherentes, caminos y vegetación naturales, accesos y señales despejados. Capturas equivalentes y registro de recorrido/alturas; aceptación visual B. |
| AC-LVI-02 · REQ-LVI-003 · T03 | Observar mismas fachadas/cubiertas/carpinterías a distancia y cerca en dos calidades. | Materiales reconocibles y proporcionados sin parpadeo, detalle de prototipo ni alteración de interacciones; capturas antes/después y aceptación visual C. |
| AC-LVI-03 · REQ-LVI-004 · T04 | Comparar amanecer, mediodía, noche y lluvia; avanzar transición gradualmente y viajar entre zonas. | Iluminación/bruma coherentes y suaves, suelo/señales legibles; reloj/clima continúan sin reinicio. Capturas y registro de condiciones; aceptación visual D. |
| AC-LVI-04 · NFR-LVI-001 · T05 | Misma ruta/semilla si disponible, cámaras, DPR, calidad y entorno antes/después; calentamiento y duración idénticos; cinco viajes. | Registrar mediana/p95, draw calls y recursos. Propuesta: p95 ≤110% de baseline, sin crecimiento monotónico tras calentamiento; justificar variación y aprobar presupuesto antes de B. No confundir emulación con rendimiento físico. |
| AC-LVI-05 · NFR-LVI-002 · T05 | PC, teléfono vertical/horizontal y tablet emulados: viajar, abrir/cerrar tienda, usar inventario/equipo, volver y pescar; recargar guardado compatible. | Controles, HUD, economía/equipo, pesca, clima, audio y progreso conservados; sin errores JS/shaders nuevos. Registrar prueba y alcance; móviles físicos/WebKit pendientes salvo ejecución real. |

**Evidencia obtenida** — Sólo planificación y comprobación de base Git, descritas en [evidencia](evidence.md). Ninguna captura, medición, prueba o build nuevo; los resultados de M08 son antecedentes, no validación de M09.

**Decisión humana** — A pendiente de aprobación; B–D sin autorización de implementación ni aceptación. No cerrar M09 ni presentar v0.8.0 como disponible hasta decisión explícita y evidencias correspondientes. Limitaciones físicas/performance heredadas siguen abiertas.
