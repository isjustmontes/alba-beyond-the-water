# Explorar y pescar

**The First Morning · v0.10.0 (Pre-Alpha):** genuinely new profiles begin in the village square. Watch the sunrise introduction or skip with Space/Escape on PC or **Saltar introducción** on touchscreens; reduced-motion preferences return control without camera travel. “Explora la aldea” is optional and fades away. Location/orientation save locally without replaying the intro after reload or travel. Existing profiles without location retain the dock fallback; catches, commerce and preferences remain compatible. Older stage-specific position limits below are historical.

**Shopkeeper (v0.9.0 development):** approach the portrait sign left of the ARTES DE PESCA door. Press E or the mobile contextual button to talk. Choose the catalog option to open the existing store; T still opens the store directly on PC. Close/leave or return through conversation topics as usual. Conversation does not grant or spend money; only normal catalog purchases change saved progress. Manuel remains by the plaza bench.

**Manuel · desarrollo v0.9.0:** en la aldea, acércate al banco de la plaza, a la derecha del pozo al llegar desde el sendero. Aparece **E · Hablar con Manuel** en PC o el botón contextual táctil. El retrato sólo aparece en la conversación; no hay personaje 3D. Elige los temas, vuelve o despídete; × y Esc también cierran. La jornada y los controles se pausan mientras conversas. E sigue abriendo Equipo fuera del encuentro. Al cerrar, vuelve a pulsar para caminar o mover los joysticks; el ratón no se captura automáticamente.

**Movement & Navigation · v0.8.1 (Pre-Alpha):** V / Explore switches to walking. On PC, use WASD and the mouse (click to capture, Esc to release), hold Shift to run and press Space to jump while exploring. Walking is 2.8 m/s and running is 4.0 m/s. Gravity and automatic landing prevent double jumps; existing water and obstacle boundaries remain. Land before equipping or travelling. Space keeps casting, hooking and retrieving in fishing mode. On mobile, use the left joystick to move, the right joystick for continuous proportional looking, and CORRER to toggle running. Both sticks accept independent fingers; the right also works while fishing. Central dead zone, smoothing and existing pitch limits apply. Release to centre; maps and menus clear held input. Scenery dragging remains available.

**Mapa:** pulsa M o el botón MAPA en PC/móvil. Muestra la zona actual, caminos, puestos/tienda/salidas existentes y una flecha marfil con tu posición y mirada; orientación del mapa fija. La jornada se pausa: M, Esc o × cierra y reanuda. El mapa no permite viajar ni revela peces. **Sonido: N** o el botón ♪; preferencias y mute se conservan.

## Pesca

1. Abre Equipo y selecciona un cebo. Prueba la lombriz cerca del fondo o mueve la cucharilla con recogidas cortas.
2. Mantén pulsado el botón izquierdo, Espacio o LANZAR. Suelta para fijar la distancia. Mira la boya mientras un pez se acerca.
3. Cuando aparezca **¡PICADA!**, pulsa antes de tres segundos para clavar. Mantén para recoger durante el combate. Suelta cuando suba demasiado la tensión y vuelve a recoger antes de acumular cuatro segundos de holgura.
4. Acerca el pez para registrar la captura. Abre el cuaderno para comparar pesos por especie o exportar las filas a CSV.

**Escritorio.** Botón derecho y arrastre para mirar. R recupera el aparejo, E abre Equipo, J abre el cuaderno, P pausa, H abre ayuda, M abre/cierra el mapa de zona, N cambia el sonido y F solicita pantalla completa.

**Táctil.** Arrastra sobre el paisaje para mirar, incluso mientras mantienes otro dedo sobre el botón de pesca. El botón cambia entre lanzar, clavar y recoger. INFO pausa la acción para consultar condiciones. Equipo permite recuperar el aparejo, seleccionar cebo y cambiar calidad. En un híbrido, el modo depende también de la última entrada.

El sonido espera una interacción y recuerda el silencio elegido. El cuaderno conserva capturas en este navegador y origen. Borrar los datos del sitio elimina ese historial. El CSV sirve para consulta externa.

## Registro histórico: First Steps · Etapa A (rama de desarrollo v0.6.0, sin publicar)

- Pulsa **V** o **Explorar** con el aparejo recogido y tras terminar la presentación de la captura. La caña y el HUD de pesca se ocultan durante exploración.
- **PC:** WASD camina en relación con la vista. Haz clic sobre el paisaje para capturar el ratón y mirar; Esc lo libera. También puedes arrastrar el paisaje para mirar si no utilizas captura de ratón.
- **Móvil:** usa el joystick inferior izquierdo para caminar y arrastra una zona libre del paisaje para mirar. El joystick sólo aparece en exploración táctil. Los menús siguen disponibles.
- Para volver a pescar, regresa al puesto inicial, a menos de 0,18 m del centro (el indicador muestra la distancia), y mira hacia el lago. Pulsa V o **Pescar en el puesto**. Los controles de pesca anteriores vuelven a estar disponibles.

El paseo está limitado al interior del muelle: sus extremos y laterales bloquean la salida al agua. No hay conexión caminable a la orilla, salto ni guardado de posición. Esta etapa fue validada en PC y móviles emulados y aceptada por el propietario; no implica pruebas en teléfonos físicos. [Aceptación y límites](../milestones/M07-first-steps/acceptance.md).

## Etapa B · orillas (aceptada, commit local `00208d9`)

Entra en exploración y sal **por detrás del puesto original**: con la cámara inicial mirando al lago, usa S o el joystick hacia abajo. Tras el extremo posterior del muelle aparece tierra. Sigue el sendero: una corta desviación a la izquierda conduce a **Ribera oeste**, la de la derecha a **Cala de juncos**. El indicador de exploración muestra el puesto más próximo y la distancia. Continúa hacia el bosque para llegar a la ribera sur original; recorre el mismo camino para regresar.

La Etapa B aceptada permite pescar en las zonas de las dos calas (4 m alrededor de sus centros). La Etapa C descrita debajo amplía esa posibilidad a la ribera segura sin radios. Puedes caminar por la hierba seca de la conexión, no sólo por el sendero. Se mantienen margen al agua, colisiones, límite exterior y tolerancia de 0,18 m del puesto original del muelle. No se guarda posición ni se abre todo el bosque. [Evidencia B/C](../milestones/M07-first-steps/evidence.md).

## Etapa C · pesca libre (local, pendiente de aceptación)

**Carrera:** mantén Shift mientras caminas en PC. En móvil, activa CORRER junto al joystick para ir a 1,5×; pulsa de nuevo para caminar. Sólo funciona en exploración y se desactiva al cambiar de modo, cancelar entradas, pausar o redimensionar. La velocidad cambia progresivamente y conserva los límites del terreno.

Corrección de nuevas orillas: puedes apuntar también al agua lateral exterior de las calas (oeste desde la cala izquierda, este desde la derecha), sin dirigir todos los lances al muelle. La pendiente inicial puede sobrevolarse; si hay tierra/rocas intermedias, aguas demasiado someras o destino seco, cambia dirección/potencia o acércate al borde. El final de recogida se adapta al borde húmedo. Hay 27 peces repartidos entre riberas e interior, sin garantía de presencia o picada en cada lance; observa el agua y prueba profundidad, cebo y hora. Las preferencias y el comportamiento individual se mantienen.

B está aceptada por el propietario. C elimina los radios de sus calas como requisito: camina por la ribera existente y apunta a agua libre. **V / Pescar** equipa caña y carrete juntos en unos 0,38 s; espera a que estén equipados para lanzar. La orientación se conserva y la altura sigue el suelo. El muelle mantiene su puesto original.

Se comprueban destino, trayectoria, cuenca y corredor de recogida. Si se rechaza, acércate al borde transitable o cambia dirección/potencia. No se permite lanzar desde cualquier punto del interior, sobre tierra, rocas o agua demasiado somera/fuera de la cuenca. Para guardar la caña recupera el aparejo (R en PC o Equipo → recuperar en móvil) y pulsa V / Explorar. WASD/ratón y joystick/gesto siguen iguales. Sin mapa nuevo ni posición persistente.
