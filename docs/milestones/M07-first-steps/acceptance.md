# Aceptación · First Steps · Etapa A

**Criterio** — REQ-EXP-001: movimiento acotado y suave. **Entrada y acción** — Entrar en exploración, caminar en cada dirección y diagonal a 20/60/120 fps y accionar joystick analógico. **Resultado esperado** — Velocidad normalizada, aceleración/frenado graduales, posición siempre dentro del muelle. **Evidencia obtenida** — Seis pruebas unitarias de exploración y recorrido previo de navegador; VERIFIED para el muelle. No acredita colisión con un terreno exterior.

**Criterio** — REQ-EXP-002: aislamiento de modos. **Entrada y acción** — Intentar explorar con aparejo activo; caminar, intentar pescar lejos, regresar al puesto mirando al lago y lanzar. **Resultado esperado** — Cambios inválidos bloqueados; estado de pesca conservado; un solo lanzamiento tras volver. **Evidencia obtenida** — Unitarias relevantes y recorrido previo en cuatro perfiles; VERIFIED. No se ha repetido una captura completa en navegador tras el merge; las pruebas de dominio de captura sí se han ejecutado.

**Criterio** — REQ-EXP-003: controles y HUD. **Entrada y acción** — Capturar ratón, mover vista y liberarlo con Esc; mover joystick y cámara táctil, cancelar gesto y redimensionar. Abrir pausa o perder foco libera entradas. **Resultado esperado** — Joystick y movimiento sólo en exploración, cámara y HUD de pesca conservados, sin acciones de pesca accidentales. **Evidencia obtenida** — Limpieza de estado cubierta por unitarias; Pointer Lock, Esc, joystick, cancelación, cámara y resize cubiertos por el recorrido previo. La pérdida real de foco/ocultación y toda combinación de navegador/SO no se certifican por separado. VERIFIED con esos límites y la validación del propietario.

**Decisión humana** — El propietario confirmó la Etapa A validada y autorizó conservarla e incorporar SDD. Esto acepta el alcance limitado al muelle; no declara Alpha, compatibilidad física universal, finalización de v0.6.0 ni autorización de la Etapa B.

[Procedimientos y evidencia fechada](evidence.md)
