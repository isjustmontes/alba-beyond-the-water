# Diseño · First Steps · Etapa A

**Estado propietario** — `Exploration` posee modo, posición horizontal, velocidad, teclas y joystick. `FishingGame` conserva íntegramente el dominio de pesca. `main.js` compone ambos modos y traslada la posición a la cámara; no se modifica el formato persistente.

**Módulos y contratos afectados** — [exploration.js](../../../src/input/exploration.js) separa movimiento comprobable sin renderer de eventos DOM. `ExplorationControls` gestiona WASD, V, Pointer Lock y joystick con Pointer Events. [controller.js](../../../src/input/controller.js) bloquea `FishingActions` mientras se explora y evita procesar dos veces el ratón capturado. [world.js](../../../src/world.js) mantiene los límites originales al pescar y permite giro horizontal completo y pitch acotado al explorar. [exploration.css](../../../src/exploration.css) aísla la presentación por modo y capacidad táctil.

El volumen transitable es el rectángulo de tablas existente, retraído 0,30 m: x entre −2,10 y 2,10; z entre 2,01 y 13,39. Así quedan fuera postes, cuerdas, bordes y agua. Suelo aproximado a 0,78 m y ojos a 1,70 m sobre él; velocidad máxima 2,20 m/s. No se implementa navegación por terreno ni detección genérica de obstáculos: la orilla está separada por agua.

La pesca calcula sus lances desde el puesto original: el retorno exige distancia horizontal ≤0,18 m respecto de (0,7), yaw entre −0,8 y 0,8 y pitch entre −0,48 y 0,25. Se recentra el pequeño desplazamiento restante, sin girar la vista; la altura converge suavemente a los 3 m originales. Sólo el estado `ready` permite salir a explorar; durante `caught` hay que esperar el final de la presentación.

**Compatibilidad de guardados** — No cambia ninguna clave ni dato. La posición y el modo no se guardan. El arranque sigue siendo en modo pesca en el puesto original.

**Coste gráfico y alternativa descartada** — Sin nuevas mallas, assets, librerías ni simulación física. Límites rectangulares y subpasos cortos evitan atravesar los bordes. Se conserva arrastre como alternativa a Pointer Lock no disponible. No se introduce teletransporte entre muelle y orilla ni un puente artificial. No hay medición térmica o de FPS sostenidos en hardware móvil.
