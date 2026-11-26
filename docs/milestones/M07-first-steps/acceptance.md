# Aceptación · First Steps · Etapa A

**Actualización del propietario · Etapa B:** aceptada visual y funcionalmente, incluidas las correcciones BUG-002/003, en el encargo de Etapa C del 26/11/2026. Los pendientes históricos siguientes se conservan como registro; REQ-EXP-004/005 y NFR-EXP-001 quedan VERIFIED dentro de las limitaciones de emulación documentadas.

**Criterio** — REQ-EXP-001: movimiento acotado y suave. **Entrada y acción** — Entrar en exploración, caminar en cada dirección y diagonal a 20/60/120 fps y accionar joystick analógico. **Resultado esperado** — Velocidad normalizada, aceleración/frenado graduales, posición siempre dentro del muelle. **Evidencia obtenida** — Seis pruebas unitarias de exploración y recorrido previo de navegador; VERIFIED para el muelle. No acredita colisión con un terreno exterior.

**Criterio** — REQ-EXP-002: aislamiento de modos. **Entrada y acción** — Intentar explorar con aparejo activo; caminar, intentar pescar lejos, regresar al puesto mirando al lago y lanzar. **Resultado esperado** — Cambios inválidos bloqueados; estado de pesca conservado; un solo lanzamiento tras volver. **Evidencia obtenida** — Unitarias relevantes y recorrido previo en cuatro perfiles; VERIFIED. No se ha repetido una captura completa en navegador tras el merge; las pruebas de dominio de captura sí se han ejecutado.

**Criterio** — REQ-EXP-003: controles y HUD. **Entrada y acción** — Capturar ratón, mover vista y liberarlo con Esc; mover joystick y cámara táctil, cancelar gesto y redimensionar. Abrir pausa o perder foco libera entradas. **Resultado esperado** — Joystick y movimiento sólo en exploración, cámara y HUD de pesca conservados, sin acciones de pesca accidentales. **Evidencia obtenida** — Limpieza de estado cubierta por unitarias; Pointer Lock, Esc, joystick, cancelación, cámara y resize cubiertos por el recorrido previo. La pérdida real de foco/ocultación y toda combinación de navegador/SO no se certifican por separado. VERIFIED con esos límites y la validación del propietario.

**Decisión humana** — El propietario confirmó la Etapa A validada y autorizó conservarla e incorporar SDD. Esto acepta el alcance limitado al muelle; no declara Alpha, compatibilidad física universal, finalización de v0.6.0 ni autorización de la Etapa B.

[Procedimientos y evidencia fechada](evidence.md)

## Etapa B · criterios definidos antes de implementar

- **REQ-EXP-004:** entrar en exploración desde el puesto original, recorrer muelle → tierra → sendero → ambos puestos y regresar. Esperado: superficie continua, cámara sobre el suelo, sin atravesar agua ni obstáculos; bloqueos deslizan sobre límites. Probar también el sentido inverso y baja frecuencia de actualización. Evidencia pendiente.
- **REQ-EXP-005:** activar pesca cerca de cada puesto mirando al lago, lanzar y recuperar; simular un combate desde esos orígenes. Esperado: sedal y señuelo coherentes con la ubicación, retorno a explorar sólo sin aparejo activo y controles originales conservados. Evidencia pendiente.
- **NFR-EXP-001:** reproducir ruta con entradas PC y joystick/cámara en móvil emulado, revisar paisaje y accesibilidad, ejecutar pruebas relevantes y producción. Esperado: sin errores JavaScript/shaders ni recursos pesados nuevos; los sistemas excluidos permanecen sin modificaciones. Evidencia pendiente. No equivale a hardware móvil físico ni rendimiento sostenido.

**Decisión humana:** alcance B autorizado en el encargo actual; resultado visual y funcional todavía pendiente de validación del propietario. No publicar ni confirmar en Git la Etapa B.

### Resultado técnico B

La suite de dominio pasa 93/93, incluidas cinco pruebas nuevas de ribera y una de toque de modo sin doble activación. El guion con pasos controlados recorre ida/vuelta en cuatro perfiles, compara suelo con las mallas renderizadas y comprueba tres orígenes y recogida. Los raycasts de prueba (no utilizados durante juego) miden hasta 0,053 m de diferencia con el terreno en los puntos visitados de calidad baja y 0,015 m en alta. La captura final desde las calas se mantiene cubierta por las reglas de dominio; no se afirma una captura completa nueva en teléfonos físicos. Los resultados actuales complementan los de A, sin sustituirlos. Procedimientos, incidencias y prueba sobre la aplicación completa en [evidence.md](evidence.md).

**Aceptación visual del propietario: PENDIENTE.** Revisar continuidad del muelle, naturalidad del sendero, altura y colisiones, orientación al activar pesca, visibilidad desde ambas calas y controles en el dispositivo habitual.

### Corrección de incidencias reportadas por el propietario

Los resultados anteriores eran previos a BUG-002/003 y no implican aceptación B. REQ-EXP-004 debe incluir hierba fuera del eje, especialmente (0,20). REQ-EXP-005 debe aceptar (−7,20)/(7,20) y yaw ±0,20 hacia agua, usar posición/dirección actuales y rechazar lances hacia tierra u obstáculos aunque se gire después de entrar en pesca. El muelle mantiene sus reglas originales.

Evidencia actual: **95/95** pruebas y build correctos; cuatro perfiles en fixture, y aplicación completa PC/teléfono emulado con ambas calas, dos lances válidos, intentos hacia tierra bloqueados y regreso al muelle. La aceptación humana **sigue pendiente**. [Diagnóstico, comandos, resultados y límites](evidence.md#corrección-b-tras-prueba-real--26112026--aceptación-pendiente).
