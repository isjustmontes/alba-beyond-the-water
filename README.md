# ALBA · Beyond the Water · Fishing experience

<p align="center">
  <img src="alba%20-%20banner.webp"
       alt="ALBA — Beyond the Water"
       width="900">
</p>

Simulador de pesca 3D para navegador, ahora con las mejoras visuales de la **fase 2**. Three.js, JavaScript modular, HTML y CSS. Los modelos, texturas y sonidos se generan por código; no necesita claves API, cuentas ni servicios de pago. Tras instalar las dependencias, funciona sin conexión a Internet.

## Fase 2: mejoras visuales

El punto de restauración anterior a los cambios es el commit **`d98231d`** (`chore: checkpoint playable ALBA before phase 2 visual upgrades`). Puedes consultar esa versión con `git show d98231d:src/world.js` o compararla con `git diff d98231d` sin cambiar tu carpeta actual.

- **Agua:** tres ondas suaves con desplazamiento geométrico y normales analíticas, detalles de superficie, reflexión dinámica del escenario y ondas locales que modifican las normales alrededor de la boya. La transparencia depende de la profundidad aproximada del fondo y del ángulo de observación. El fondo y el shader utilizan la misma batimetría procedural; esta aproximación evita un pase adicional de profundidad. Los peces próximos siguen visibles.
- **Luz:** amanecer cálido, nubes procedurales, iluminación ambiental del cielo mediante PMREM, reflejos sobre los materiales y niebla atmosférica. Las sombras del escenario se calculan al inicio y al cambiar de calidad, ya que el sol y el muelle permanecen fijos.
- **Peces:** cuerpos perfilados por especie, escamas, manchas de trucha, franjas laterales, branquias, ojos, boca y aletas con radios. Hay variaciones de tamaño y tono; la cola y el cuerpo ondulan y los giros se interpolan. A partir de 22 metros se usa una geometría simplificada. Las capturas y los peces del lago comparten recursos de GPU.
- **Caña:** perfil continuo y afilado, acabado de carbono, empuñadura de corcho, anillas, bobina, aro de recogida y manivela. La tensión curva el cuerpo de la caña; las anillas y el punto de salida del sedal siguen esa curva. Al soltar, recupera progresivamente su forma.
- **Paisaje:** relieve continuo con normales suaves, textura de piedra proyectada en tres ejes, variación de vegetación, roca y nieve por altura e inclinación. Hay pinos, abetos y árboles de hoja ancha, con follaje recortado, variación y una brisa suave. Rocas, hierbas y juncos completan la orilla. Los árboles, rocas y hierbas utilizan instancing.

La simulación en `src/fishing.js`, los controles, el cuaderno, la interfaz y la clave de guardado `alba-catches-v1` se conservan. No se han añadido dependencias.

Para comprobar las mejoras: observa los reflejos al mirar alrededor con el botón derecho; lanza cerca para ver peces y ondas junto a la boya; durante la lucha, alterna la recogida y observa cómo se flexionan la caña y el sedal. Abre el cuaderno con **J** y cambia entre gráficos altos y bajos para comparar el detalle.

## Iniciar desde ORCA

Abre la terminal del proyecto actual y ejecuta:

```powershell
npm.cmd install
npm.cmd run dev
```

Abre la dirección que muestra Vite, normalmente **http://127.0.0.1:5173**, en el navegador o en la vista previa de ORCA si está disponible. En Windows se usa `npm.cmd` para evitar restricciones de ejecución de scripts de PowerShell. En macOS/Linux puedes usar `npm`.

No abras `index.html` mediante `file://`: los módulos necesitan el servidor local. Requiere un navegador moderno con WebGL 2 y aceleración gráfica. Si el rendimiento es bajo, pulsa «GRÁFICOS: ALTO» para bajar resolución y desactivar sombras.

## Pescar

1. Mantén pulsado el botón izquierdo sobre el paisaje, Espacio o el botón inferior. La fuerza aumenta hasta el 100%; suelta para lanzar entre 9 y 40 metros.
2. Espera a que un pez encuentre el cebo. Los peces cercanos aceleran el encuentro; la espera suele ser de 5 a 20 segundos. Observa las oscilaciones de la boya.
3. Cuando se hunda y aparezca **¡PICADA!**, pulsa antes de 3 segundos para clavar.
4. Mantén pulsado para recoger. La tensión aumenta más durante los tirones; **suelta para bajarla** y vuelve a recoger alrededor del 30%. Alterna para mantenerla aproximadamente entre el 25% y el 70%.
5. Al acercar el pez a menos de 2,6 metros, se registra la captura. Al 100% de tensión se rompe el sedal. Mantener holgura durante más de 4 segundos también permite escapar al pez.

Controles adicionales:

| Control | Acción |
| --- | --- |
| Botón derecho + arrastrar | Mirar alrededor y apuntar el próximo lanzamiento |
| R | Recuperar aparejo / cancelar lanzamiento |
| P | Pausa |
| H / ? | Instrucciones |
| J | Cuaderno de capturas |
| M / ♪ | Ambiente y avisos sintetizados (apagado inicialmente) |
| F / ⛶ | Pantalla completa |

En pantallas táctiles, mantén pulsado el botón inferior. La jornada se pausa al cambiar de pestaña o perder el foco. El cuaderno persiste en `localStorage` del navegador, asociado a la dirección y al puerto; también puedes descargarlo como CSV. El botón del cuaderno muestra todas las capturas guardadas, incluidas jornadas anteriores.

## Comprobar y distribuir

```powershell
npm.cmd test
npm.cmd run build
npm.cmd run preview
```

`dist/` contiene el juego preparado para cualquier alojamiento estático. `preview` lo sirve normalmente en http://127.0.0.1:4173.

Prueba de navegador opcional (con el servidor de desarrollo en marcha):

```powershell
npx.cmd playwright install chromium
npm.cmd run test:browser
```

Esta prueba abre Chromium sin ventana (aprovecha Microsoft Edge si está instalado en Windows), comprueba el renderizado WebGL, efectúa lanzamientos con ratón y teclado, espera una picada real y captura un pez regulando la tensión. Guarda capturas de pantalla en `test-results/`. Puedes indicar otro navegador compatible mediante `ALBA_BROWSER_PATH` y otra dirección mediante `ALBA_TEST_URL`.

La batería incluye las ocho pruebas originales de pesca y dos comprobaciones del fondo y la orientación del relieve. La prueba de navegador también comprueba la flexión de la caña, la unión del sedal a su punta, las ondas de la boya y la lectura de un guardado de la fase 1.

Para revisar los gráficos por separado, con el servidor en marcha:

```powershell
node tests/visual.mjs phase2
node tests/models.mjs
```

La primera orden captura ambos perfiles gráficos y la orilla; registra el renderizador, 120 intervalos entre fotogramas por perfil y los recursos de GPU en `test-results/phase2-metrics.json`. La segunda genera una vista cercana de las tres especies y verifica que los modelos comparten texturas y geometrías y que la caña se flexiona y recupera su forma. Las mediciones son muestras locales a 1280×800; el rendimiento depende de la GPU, la resolución y el navegador.

El perfil alto usa reflejos de hasta 24 actualizaciones por segundo, sombras y relieve detallado. El perfil bajo reduce los reflejos a 12, la resolución de pantalla, el relieve y la densidad de vegetación, y desactiva las sombras. Los reflejos también se actualizan al mover la cámara para mantener su correspondencia con la vista.

Medición local de la fase 2 en Microsoft Edge, WebGL 2, Intel Iris Xe y 1280×800, con 120 intervalos entre fotogramas por perfil:

| Perfil | Mediana | Percentil 95 |
| --- | --- | --- |
| Alto | 16,7 ms (aprox. 60 FPS) | 16,8 ms |
| Bajo | 16,7 ms (aprox. 60 FPS) | 16,9 ms |

La escena inicial utiliza 15 texturas de GPU. La muestra inicial anterior a los cambios también registró una mediana de 16,7 ms en el mismo equipo. Estas medidas corresponden a una vista fija del lago y están limitadas por la frecuencia de presentación; no garantizan el mismo resultado en todos los equipos ni miden el margen de GPU disponible. La prueba integral de pesca se ejecuta por separado.

## Archivos

- `src/fishing.js`: simulación independiente, especies y estados de pesca.
- `src/world.js`: paisaje, agua con reflexión planar, peces, muelle y aparejo procedural.
- `src/visuals/water.js`: ondas, reflejos, batimetría y fondo.
- `src/visuals/fish.js`: modelos, materiales compartidos, animación y LOD de peces.
- `src/visuals/rod.js`: caña flexible y carrete detallado.
- `src/visuals/landscape.js`: relieve, texturas, árboles y vegetación con instancing.
- `src/main.js`: controles, interfaz, pausa y persistencia.
- `src/audio.js`: ambiente y señales mediante Web Audio.
- `src/style.css`, `index.html`: interfaz adaptable.
- `tests/`: pruebas de simulación y navegador.

## Alcance del prototipo

Hay truchas arcoíris, carpas y lubinas, con peso, fuerza y tamaño variables. Los peces nadan y se aproximan al cebo; su proximidad afecta al tiempo de picada y a la especie seleccionada. La tensión y la resistencia son una aproximación jugable, no una simulación física del sedal. La cámara permanece en el muelle. Los gráficos usan recursos procedurales: el follaje a distancia utiliza tarjetas cruzadas con recorte alfa y las reflexiones del agua son planas. El amanecer permanece fijo; el alcance sigue siendo una jornada de pesca desde el muelle.
