# Diseño · First Steps · Etapa A

**Estado propietario** — `Exploration` posee modo, posición horizontal, velocidad, teclas y joystick. `FishingGame` conserva íntegramente el dominio de pesca. `main.js` compone ambos modos y traslada la posición a la cámara; no se modifica el formato persistente.

**Módulos y contratos afectados** — [exploration.js](../../../src/input/exploration.js) separa movimiento comprobable sin renderer de eventos DOM. `ExplorationControls` gestiona WASD, V, Pointer Lock y joystick con Pointer Events. [controller.js](../../../src/input/controller.js) bloquea `FishingActions` mientras se explora y evita procesar dos veces el ratón capturado. [world.js](../../../src/world.js) mantiene los límites originales al pescar y permite giro horizontal completo y pitch acotado al explorar. [exploration.css](../../../src/exploration.css) aísla la presentación por modo y capacidad táctil.

El volumen transitable es el rectángulo de tablas existente, retraído 0,30 m: x entre −2,10 y 2,10; z entre 2,01 y 13,39. Así quedan fuera postes, cuerdas, bordes y agua. Suelo aproximado a 0,78 m y ojos a 1,70 m sobre él; velocidad máxima 2,20 m/s. No se implementa navegación por terreno ni detección genérica de obstáculos: la orilla está separada por agua.

La pesca calcula sus lances desde el puesto original: el retorno exige distancia horizontal ≤0,18 m respecto de (0,7), yaw entre −0,8 y 0,8 y pitch entre −0,48 y 0,25. Se recentra el pequeño desplazamiento restante, sin girar la vista; la altura converge suavemente a los 3 m originales. Sólo el estado `ready` permite salir a explorar; durante `caught` hay que esperar el final de la presentación.

**Compatibilidad de guardados** — No cambia ninguna clave ni dato. La posición y el modo no se guardan. El arranque sigue siendo en modo pesca en el puesto original.

**Coste gráfico y alternativa descartada** — Sin nuevas mallas, assets, librerías ni simulación física. Límites rectangulares y subpasos cortos evitan atravesar los bordes. Se conserva arrastre como alternativa a Pointer Lock no disponible. No se introduce teletransporte entre muelle y orilla ni un puente artificial. No hay medición térmica o de FPS sostenidos en hardware móvil.

## Diseño previo · Etapa B

**Estado propietario** — Un módulo de ruta sin renderer comparte superficie y puestos entre movimiento, malla de ribera y pruebas. Se prolonga tierra firme desde la ribera sur hasta la parte posterior del muelle con pendiente suave y bordes sumergidos, evitando puentes o plataformas provisionales. La franja transitable se restringe a muelle, conexión y sendero, con radio corporal y círculos de obstáculos.

**Módulos y contratos afectados** — `Exploration` consulta altura y validez de cada subpaso y el puesto cercano. El paisaje utiliza su textura, materiales y vegetación actuales para representar la superficie compartida. El cambio de modo fija un origen por puesto en `FishingGame`: sólo se parametrizan las constantes espaciales del lanzamiento, recogida y combate; no se cambian tensiones, fatiga, peces ni probabilidades. La cámara conserva orientación y límites relativos al puesto. El puesto original mantiene su origen histórico (0,4) y su cámara (0,7).

**Compatibilidad de guardados** — No cambia ninguna clave ni el formato de capturas. Puesto y posición sólo existen durante la sesión.

**Coste gráfico y alternativa descartada** — Malla estática compartida en ambas calidades, material existente, sin físicas de mallas por fotograma. Colisión analítica y recursos vegetales reutilizados. Se descarta un puente artificial y permitir caminar sobre agua invisible. No se ocultan obstáculos sin comprobar su correspondencia con la ruta. Recuperación: conservar commits A y su documentación; la Etapa B queda sin commit y no se publica.

### Implementación B para revisar

Los límites siguientes describen la primera implementación, conservada como diagnóstico histórico. La corrección tras prueba real al final de este documento sustituye la franja, radio y cono de las calas.

[shore-route.js](../../../src/input/shore-route.js) comparte nueve puntos de ruta, la lengua de tierra, altura y tres puestos. Se sale por el extremo trasero del muelle (z≈13), se accede a las calas oeste (−6,20) y este (6,20), y se sigue hasta la ribera existente (6,76). Franja transitable: 1,35 m alrededor del eje; se conserva el margen corporal del muelle. Los subpasos rechazan agua y deslizan sobre el borde. La malla de transición usa la misma función de altura; su borde cae por debajo del agua y su extremo se funde con el terreno original.

`terrain-height.js` extrae únicamente las funciones procedurales necesarias para compartir alturas sin un ciclo entre paisaje y navegación; `landscape.js` sigue exportando `terrainHeight` para sus consumidores anteriores. No se cambia la fórmula de relieve. La textura, material, shader de humedad y viento existentes se reutilizan. Se redistribuyen 24 árboles y 240 matas ya existentes, sin aumentar sus recuentos; árboles y rocas importantes quedan fuera de la franja transitable, comprobados contra sus instancias reales. Se añade una sola malla de tierra (5.945 vértices, 11.520 triángulos), sin texturas nuevas ni raycasts en el bucle de juego.

La interacción usa el botón y el indicador de exploración existentes; no se modifica el HUD de pesca. El puesto original conserva tolerancia de 0,18 m. Las calas admiten 0,80 m, sin recentrar la cámara: el origen se calcula 3 m por delante de la posición real. Ambas se orientan al norte, entre los promontorios existentes; mirada de pesca ±0,10 rad en calas, ±0,80 rad en el muelle. La exploración conserva giro libre. `setOrigin` sólo acepta coordenadas finitas y estado `ready`. Los combates trasladan su objetivo respecto de ese origen; sus coeficientes y la IA permanecen intactos. Sin posiciones persistentes ni ampliación libre del mapa.

### Corrección tras prueba real · BUG-002 / BUG-003

La navegación B consulta toda la superficie seca de la lengua de tierra, en vez de una distancia de 1,35 m al eje. Conserva z=12,8…77,3, límites laterales de la malla y margen corporal de 0,30 m frente al agua. Rechaza alturas ≤0,35 m y comprueba cuatro muestras periféricas; los árboles y rocas visibles añaden círculos de colisión. Una instancia retirada por LOD no genera un muro invisible. El muelle conserva sus límites originales.

Las calas son zonas de 4 m alrededor de sus centros, sobre suelo transitable. No se recentra al jugador ni se impone un cono al norte; se conserva la orientación. Antes de entrar en pesca se comprueba si hay un lance viable con potencia baja, media o alta. Al soltar se valida de nuevo la potencia y dirección reales: raycast al destino sobre terreno y rocas, segmentos del arco `castFlight` y comprobación de troncos. Se reutilizan vectores y el Raycaster; estas consultas sólo ocurren al cambiar de modo o soltar, nunca en cada frame. No se permite lanzar sobre tierra ni a través de obstáculos detectados. Un rechazo cancela la carga sin consumir un lance.

`setOrigin` admite `ready` o `charging`, sin cambiar un aparejo ya lanzado. El origen de las calas se actualiza al soltar desde la posición actual, 3 m en la dirección actual del jugador; el evento de lanzamiento fija la misma dirección en la simulación. Se conservan el origen histórico, límites de mirada y tolerancia del muelle. La validación de trayectoria es aproximada (20 segmentos y troncos simplificados), sin física continua ni navegación nueva de peces.
