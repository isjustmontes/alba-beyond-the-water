# Tareas · The First Morning

**Estado B vigente:** M11-T01 VERIFIED en alcance de planificación: aprobación explícita del propietario y commit `107ac34`. M11-T04/T05 IMPLEMENTED_UNVERIFIED hasta validación visual/funcional humana; 25/25 pruebas relevantes y build correctos, evidencia de navegador separada. Se ejecutan en B antes de T02/T03, por encargo explícito y con previsualización DEV aislada del arranque normal. M11-T02/T03 (clasificación/aparición real) se aplazan a C autorizada; T06/T07 siguen NOT_STARTED en su alcance completo. La tabla inferior conserva el plan original, no el orden vigente.

**Dependencias** — v0.9.0 publicada, arquitectura de zonas M07/M08, aldea M09, habitantes M10. Sólo A autorizada. Las pruebas citadas abajo son futuras, no ejecutadas.

| ID y requisito | Etapa / dependencias | Cambio acotado | Prueba y esfuerzo restante | Estado / bloqueo |
| --- | --- | --- | --- | --- |
| M11-T01 · todos | A / base publicada | Diagnóstico y ficha SDD según plantillas; sincronizar estado/trazabilidad | Revisión documental, sin tests/build; aprobación humana pendiente | IN_PROGRESS · entrega documental pendiente de aprobación |
| M11-T02 · REQ-INTRO-001/006 | B / T01 aprobada | Clasificación previa a escritores y marcador aditivo, fallos seguros | Unitarias con storage falso: ausente, legado vacío/corrupto, nuevo marcador, fallo lectura/escritura y reload; esfuerzo medio | NOT_STARTED · autorización B pendiente |
| M11-T03 · REQ-INTRO-001/006 | B / T02 | Aparición nueva en plaza, coherencia zona/suelo/modo/HUD; perfiles anteriores sin traslado | Casos de spawn, reload y viaje ida/vuelta; PC/móvil; esfuerzo medio | NOT_STARTED · autorizar B y validar B antes de C |
| M11-T04 · REQ-INTRO-002/004 | C / B aceptada | Controlador temporal, arbitraje de cámara, curva/entrega idempotente | Reloj inyectado, duración, skip en distintos tiempos, blur/ocultación y cancelación; esfuerzo medio | NOT_STARTED · autorización C y encuadre pendientes |
| M11-T05 · REQ-INTRO-003/004, NFR-INTRO-001 | C / T04 | Overlay semántico, texto exacto, salto PC/móvil y movimiento reducido | DOM/foco/inputs sin duplicación; capturas PC/teléfono/tablet, ambas orientaciones; esfuerzo medio | NOT_STARTED · aceptación visual/accesible pendiente |
| M11-T06 · REQ-INTRO-005, NFR-INTRO-003 | D / C aceptada | Objetivo discreto y verificación de habitantes/tienda/sendero sin gates | Conversar, comprar/equipar, mapa, viajar y pescar tras completar/saltar; esfuerzo bajo/medio | NOT_STARTED · autorización D pendiente |
| M11-T07 · REQ-INTRO-006, NFR-INTRO-001/002/003 | E / B–D aceptadas | Regresiones y mediciones comparables, evidencia y documentación final | Pruebas pertinentes + build al autorizar implementación; guardar métricas/capturas/límites; esfuerzo medio | NOT_STARTED · autorización E y revisión humana final pendientes |

**Regla para avanzar** — Cada etapa documenta SHA, entradas, resultados reales, incidencias y aceptación. Si hay pérdida de datos, bloqueo de controles o cámara inconsistente, detener avance y corregir dentro del alcance; nunca declarar VERIFIED sólo por existir código. Sin commit/publicación salvo autorización posterior.
