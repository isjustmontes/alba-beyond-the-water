# Aceptación · First Steps · Etapa A

## D · criterios previos · aceptación PENDIENTE

REQ-ZONE-001: iniciar con Lago Sereno, escena previa por identidad y aparición del muelle original; ninguna salida activada. REQ-ZONE-002: con registros de prueba, preparar una salida devuelve ID de destino, entrada y aparición; nunca cambia zona/escena/jugador y no admite destino inexistente o posición no finita. NFR-EXP-001: mantener código de pesca, exploración, clima, audio, HUD y guardados; ejecutar sólo pruebas relevantes y build. Sin nueva zona jugable ni transición visual.

Resultado técnico D: **27/27** relevantes y build correctos. Registro/planes comprobados sin renderer, sin cambiar escena ni coordenadas reales de arranque. No se prueban carga/descarga o transición visual porque no se implementan. **D pendiente de aceptación del propietario.** [Evidencia](evidence.md).

**Aceptación posterior C · 26/11/2026:** el propietario confirma validada la Etapa C al autorizar D y su commit local, incluidas correcciones de pesca, distribución y carrera. REQ-EXP-006/007/008/009 y extensión NFR-EXP-001 quedan VERIFIED dentro del alcance y límites registrados. Los pendientes inferiores se conservan como históricos; esta aceptación no publica v0.6.0.

## C · criterios previos a implementar · aceptación PENDIENTE

**Carrera y picadas alejadas:** REQ-EXP-009 debe alcanzar 3,30 m/s con aceleración/frenado existentes, Shift mantenido o botón táctil alternable, sin correr al pescar ni atravesar bordes; cancelar/redimensionar/cambiar modo limpia carrera. REQ-EXP-008 añade picadas naturales con pez próximo en (−32,24), (32,24), (0,−85), y ninguna en agua vacía. Pruebas relevantes actuales 38/38 y build correctos; aceptación C pendiente.

**Ampliación por incidencias:** REQ-EXP-008 verifica distribución fuera del muelle, 27 peces, riberas e interior, sin suelo/rocas, profundidad válida y respuestas individuales. REQ-EXP-006 debe aceptar una pendiente inicial sobrevolable y finalizar recogida en agua segura. Probar direcciones laterales alejadas del muelle, falsos bloqueos anteriores y rechazo de obstáculos reales. Los resultados 99/99 siguientes son históricos, anteriores a estos reportes. C sigue pendiente de aceptación.

**Resultado corregido actual:** 107/107 y build correctos; aplicación completa PC/teléfono con lances laterales desde ambas calas, regreso y lance del muelle; fixture final de cuatro tamaños con pendiente sobrevolable, distribución válida y rechazo de tierra/rocas. Sin errores JavaScript/shaders. Incidencia táctil lenta cubierta por regresión y repetición completa correcta. **Aceptación C PENDIENTE**; huellas conservadoras, emulación y costes locales documentados en [evidencia](evidence.md).

- REQ-EXP-006: caminar a ambas calas y otros tramos navegables fuera de los radios B, equipar mirando al lago y lanzar con origen/dirección actuales. Rechazar tierra, rocas, cuenca inaccesible y corredor de recogida seco; una potencia/dirección cambiada después de equipar se vuelve a validar.
- REQ-EXP-007: alternar modos, incluso rápidamente, conservar orientación/posición y equipar/guardar caña y carrete con movimiento continuo. Girar tras equipar sin salto de pitch/yaw. Controles mantenidos, toques duplicados y transición no producen lances accidentales.
- NFR-EXP-001: flujo completo muelle/ambas calas en PC y teléfono emulado; pruebas relevantes y build sin dependencias ni cambios a sistemas excluidos. No equivale a móvil físico ni benchmark sostenido.

**Resultado técnico C:** 29/29 pruebas relevantes, 99/99 suite completa y build correctos. Aplicación real PC/teléfono emulado: ambos márgenes fuera de radios B, equipar/guardar, rechazo hacia tierra, lances y recuperación, vuelta y lance desde muelle. Fixture adicional de cuatro perfiles comprueba lances válidos y bloqueos por corredor seco, rocas y cuenca. Capturas revisadas; sin errores JavaScript/shaders. **Aceptación humana C PENDIENTE**, con límites y comandos en [evidence.md](evidence.md).

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
