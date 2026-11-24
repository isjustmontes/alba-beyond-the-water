# ALBA · Fishing experience

Primera versión jugable de un simulador de pesca 3D para navegador. Three.js, JavaScript modular, HTML y CSS. Todos los modelos, texturas y sonidos se generan por código; no necesita claves API, cuentas ni servicios de pago. Tras instalar las dependencias, funciona sin conexión a Internet.

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

Verificación de esta versión: ocho pruebas de simulación superadas, compilación de producción correcta y prueba integral en Microsoft Edge con WebGL 2 superada, incluida captura mediante controles reales y persistencia tras recargar.

## Archivos

- `src/fishing.js`: simulación independiente, especies y estados de pesca.
- `src/world.js`: paisaje, agua con reflexión planar, peces, muelle y aparejo procedural.
- `src/main.js`: controles, interfaz, pausa y persistencia.
- `src/audio.js`: ambiente y señales mediante Web Audio.
- `src/style.css`, `index.html`: interfaz adaptable.
- `tests/`: pruebas de simulación y navegador.

## Alcance del prototipo

Hay truchas arcoíris, carpas y lubinas, con peso, fuerza y tamaño variables. Los peces nadan y se aproximan al cebo; su proximidad afecta al tiempo de picada y a la especie seleccionada. La tensión y la resistencia son una aproximación jugable, no una simulación física del sedal. La cámara permanece en el muelle. El agua utiliza reflejos planos y normales animadas; no hay clima dinámico, multijugador ni exploración libre.
