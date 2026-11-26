# Defectos confirmados

**BUG-004 · P1 · Hábitat centrado en el muelle (M07-T10 / REQ-EXP-008).** Confirmado: hogares originales x≈−9,5…9,5 / z≈−25,5…−3; patrulla sólo alrededor de esos hogares y recorte de movimiento z≤8. Corrección local: 27 hogares variados entre riberas e interior, borde seco y huellas de rocas reales compartidos con la simulación; decisiones individuales conservadas. Pendiente aceptación C.

**BUG-005 · P1 · Falso bloqueo por pendiente seca inicial (M07-T07 / REQ-EXP-006).** En (−18,40), yaw=0, potencia=0,5: el destino (−18,12,5) era agua, pero la primera muestra a 5,6 m golpeaba la ribera a y≈0,47 m. El arco elevado puede sobrevolarla. Corrección local: detectar primer tramo húmedo y adaptar llegada/recogida; mantener terreno/rocas en trayectoria y barreras posteriores. No había un origen fijo al muelle en C: posición/orientación actuales ya se utilizaban y se conservan. Pendiente aceptación C.

**Actualización M07 · 26/11/2026:** BUG-002 y BUG-003 cerrados dentro del alcance B por validación del propietario (incluidas ambas correcciones), conservados en `00208d9`. Los diagnósticos y estados previos de abajo son históricos. C amplía pesca libre y transiciones, pendiente de aceptación independiente.

**BUG-001 · P2 · Identificación de versión.** Abrir el pie de la interfaz y comparar con el tag v0.5.0. [index.html](../../index.html) muestra v0.4.0 · The Art of Fishing y [package.json](../../package.json) declara 0.4.0. La reproducción es estática y afecta también al encabezado de npm. Criterio de cierre propuesto: una instalación del artefacto de la siguiente entrega muestra el mismo identificador acordado en UI, metadatos y notas.

Los fallos observados en guiones de navegador se conservan con su mensaje y condiciones en la [baseline](../quality/evidence/README.md); sólo se atribuyen al producto cuando la reproducción lo demuestra.

**BUG-002 · P1 · Muro invisible al salir del muelle (M07-T04 / REQ-EXP-004).** Confirmado por el propietario y reproducido en (0,20): suelo visible a 0,806 m, pero `walkHeight` devolvía `null` por estar fuera de 1,35 m del eje. Corrección implementada sin commit: superficie seca compartida, margen al agua y obstáculos visibles. Estado: pendiente de aceptación humana de B. [Regresiones y evidencia](../milestones/M07-first-steps/evidence.md).

**BUG-003 · P1 · Pesca bloqueada en las calas (M07-T05 / REQ-EXP-005).** En (−7,20), a 1 m del centro, el radio de 0,80 m rechazaba el puesto; en el centro, yaw=−0,20 rad hacia el lago quedaba fuera del cono ±0,10. Corrección implementada sin commit: zonas sobre tierra seca, origen/dirección actuales y guarda geométrica del lance. Estado: pendiente de aceptación humana de B. No se modifica el puesto original. [Regresiones y evidencia](../milestones/M07-first-steps/evidence.md).
