# Especificación · A Living Village

**C autorizada e implementada localmente:** B validada por el propietario y conservada en `333ebb6`. REQ-LVI-001/002 y T02 VERIFIED en el alcance B; C desarrolla únicamente REQ-LVI-003: granito/teja/madera existentes, juntas menos regulares y desgaste/humedad/musgo localizados. Sin cambiar mallas, edificios, distribución, terreno, caminos, colisiones, puntos de tienda/carteles ni viajes. REQ-LVI-003 IMPLEMENTED_UNVERIFIED hasta revisión visual del propietario; D permanece NOT_STARTED.

**B autorizada, 26/11/2026:** el propietario aprueba A y solicita terreno/vegetación conservando zonas transitables y colisiones. REQ-LVI-001/002 IMPLEMENTED_UNVERIFIED hasta aceptación visual; NFR-LVI-001/002 PARTIAL en el alcance B. C/D siguen NOT_STARTED. El relieve adicional se limita al exterior no transitable; dentro se conserva exactamente `villageHeight`, incluidas casas, plaza y accesos. La malla anterior añadía una elevación radial también en esquinas transitables: ahora respeta la altura de navegación. No se amplían huellas ni cambian colisiones para justificar el acabado. El presupuesto propuesto queda como referencia del plan aprobado, sin certificar rendimiento sostenido/físico con el ensayo breve. El estado NOT_STARTED inferior describe A antes de este encargo.

**Problema del jugador** — La aldea es explorable y funcional, pero necesita relieve, transiciones, materiales y luz más naturales para integrarse visualmente con Lago Sereno.

**Requisito estable y origen** — Encargo v0.8.0 Etapa A del propietario, 26/11/2026. Todos los requisitos de producto siguientes están NOT_STARTED; la planificación no constituye implementación ni aceptación visual.

| ID | Prioridad | Requisito y criterio observable | Etapa |
| --- | --- | --- | --- |
| REQ-LVI-001 | P1 | Relieve rural suave: suelo visible y altura de navegación coinciden; ruta entrada–plaza–tienda–salida transitable, sin escalones bruscos, hundimientos, obstáculos atravesables ni salida del recinto. Conservar acceso y proximidad de tienda/carteles. | B |
| REQ-LVI-002 | P2 | Caminos de tierra/piedra con bordes irregulares y transición orgánica a vegetación atlántica; reutilizar árboles, hierba y helechos adecuados, sin patrones repetidos evidentes ni follaje que oculte señales o accesos. Mantener respuesta al viento existente. | B |
| REQ-LVI-003 | P1 | Mejorar casas existentes: granito con escala y juntas creíbles, teja curva y madera coherentes entre sí; detalles rurales integrados y proporciones humanas. Conservar lectura de ARTES DE PESCA y LAGO SERENO, sin geometría provisional, nuevas casas ni interiores. | C |
| REQ-LVI-004 | P1 | Luz y atmósfera rurales responden progresivamente al reloj/clima/viento actuales; amanecer, mediodía, noche y lluvia mantienen acceso legible y materiales coherentes. Viajar no reinicia entorno ni causa saltos nuevos de iluminación. | D |
| NFR-LVI-001 | P1 | Calidad perceptible con coste acotado PC/móvil: comparar la misma ruta y encuadres con v0.7.0 por perfil/calidad/hora/clima; registrar mediana/p95, draw calls y recursos antes/después. Presupuesto propuesto: p95 no empeora más del 10% y recursos sin crecimiento monotónico en cinco viajes tras calentamiento. Aprobar presupuesto en A; incumplirlo exige optimización o decisión explícita, no aceptación silenciosa. | B–D |
| NFR-LVI-002 | P1 | Preservar viajes, colisiones, controles PC/táctiles, HUD, pesca al volver al lago, tienda/economía/equipo, capturas y preferencias; sin cambios de esquemas ni pérdidas al viajar/recargar. | B–D |

**Alcance incluido y excluido** — Refinamiento visual de la zona actual; reutilización de geometrías/materiales/texturas y sistemas existentes. No NPC, nuevas zonas, interiores, misiones, RPG adicional, economía nueva, manos, fauna visual, dependencias ni recursos pesados. No modificar simulación ambiental, pesca, IA, audio, HUD o persistencia. Si el acabado requiere recursos externos o cambios de arquitectura, consultar primero, con procedencia/licencia y coste documentados.

**Criterios observables** — [Aceptación](acceptance.md) enlaza los requisitos con recorridos, capturas comparables y mediciones futuras. Revisión humana obligatoria del realismo; una prueba técnica no acredita autenticidad visual ni hardware físico.
