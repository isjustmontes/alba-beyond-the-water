# Aceptación propuesta · A Living Village

**Horizonte E:** AC-LVI-06 se amplía por encargo explícito: lomas suaves/irregulares y bosque distante con profundidad atmosférica, sin cortes visibles ni cambios en árboles actuales/recorrido/lago. Evidencia técnica implementada (12/12, build, vistas y coste), aceptación visual humana pendiente. +3 lotes simples de fondo permitidos por esta ampliación, sin mapas nuevos ni efectos pesados. NFR/aceptación final siguen parciales, sin inferir aceptación D/E.

**Incidencia visual E del propietario:** copas ovaladas similares, alineaciones y ramas inferiores dominantes; E no aceptada. Corrección exclusivamente arbórea implementada y comprobada: cuatro variantes, agrupación exterior e integración de ramas, sin alterar Lago Sereno/colisiones. AC-LVI-06 permanece IMPLEMENTED_UNVERIFIED hasta nueva revisión humana; ver evidencia. No se infiere aceptación de D ni se publica.

**Actualización E:** AC-LVI-06/REQ-LVI-005 IMPLEMENTED_UNVERIFIED: comparar D/E desde plaza y márgenes, comprobar menor repetición de árboles y suelo sin costuras, accesos/huellas conservados y coste sin lotes/pases nuevos. 19/19 relevantes y build correctos; pruebas/capturas en evidencia. E pendiente de revisión visual humana; D continúa pendiente y no se confirma retrospectivamente. AC-LVI-04/05 siguen PARTIAL por límites físicos/sostenidos.

**Actualización D:** propietario confirma C validada (`43d4587`); AC-LVI-02/REQ-LVI-003 VERIFIED. AC-LVI-03/REQ-LVI-004 IMPLEMENTED_UNVERIFIED tras pruebas y revisión técnica de capturas; falta aceptación visual del propietario. AC-LVI-04/05 PARTIAL: ensayo breve PC/móvil, cuatro perfiles ambientales y regresión comercial/retorno, sin hardware físico/WebKit ni sesión sostenida. No cerrar M09 ni publicar; las notas inferiores conservan el historial.

**Actualización C:** el propietario confirma B validada; AC-LVI-01 VERIFIED en su alcance, commit `333ebb6`. AC-LVI-02/REQ-LVI-003 IMPLEMENTED_UNVERIFIED hasta revisión visual humana C. AC-LVI-04/05 siguen PARTIAL: sólo regresión acotada y medición breve emulada; dispositivos físicos/rendimiento sostenido pendientes. AC-LVI-03/D NOT_STARTED. Aceptar B no certifica hardware ni autoriza D; las anotaciones inferiores son históricas.

**Actualización B:** A aceptada explícitamente por el propietario y guardada en `585e1dc`. AC-LVI-01 IMPLEMENTED_UNVERIFIED: regresión de alturas/recorrido y revisión técnica de capturas PC/táctiles correctas, pendiente aceptación visual del propietario. AC-LVI-04/05 PARTIAL: ensayo breve de tres perfiles, cinco viajes con recursos estables, tienda/recarga/pesca de regreso correctas; sin hardware físico, WebKit ni rendimiento sostenido. AC-LVI-02/03 NOT_STARTED. No cerrar B, C/D ni M09 con esta evidencia; los estados inferiores pertenecen a A.

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
