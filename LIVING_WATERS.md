# ALBA v0.3.0 — Living Waters · Pre-Alpha

## Alcance y restauración

Evolución de la fase 3 en `isjustmontes/wolffish`, partiendo de `aad5059`. El worktree estaba limpio. `v0.2.0` apunta a `db6fd45`: su código coincide con el punto de partida y añade únicamente `alba - banner.webp`. Se conserva el commit funcional existente como restauración, sin checkpoint duplicado. No se modifican tags, otros worktrees ni remotos. Los cambios de esta fase quedan sin confirmar para revisión.

## Qué cambia

- Día de 60 minutos reales: amanecer, mañana, mediodía, tarde, atardecer y noche. Reloj independiente de la hora del dispositivo, detenido al pausar o abrir menús. Sol, cielo, estrellas, luna, iluminación, niebla y agua evolucionan suavemente. La luz ambiental mantiene visible el muelle de noche.
- Seis condiciones: despejado, parcialmente nublado, nublado, lluvia ligera, lluvia intensa y viento moderado. El clima automático elige únicamente estados vecinos cada 150 segundos; el acercamiento visual al nuevo estado tarda unos 35 segundos. La lluvia intensa llega a través de lluvia ligera.
- Viento direccional: anima vegetación, nubes, agua y lluvia; modifica menos de 0,6 m el lanzamiento y desplaza el aparejo como máximo 1,5 m por eje. La lombriz deriva menos. La dirección del HUD indica la **procedencia** del viento.
- Temperatura superficial con inercia y enfriamiento por nubosidad/lluvia; perfil gradual hacia 14 °C a unos 5,3 m. El modelo térmico se actualiza aproximadamente una vez por segundo.
- Cinco especies: las tres existentes, perca europea y tenca. Modelos procedurales compartidos, perca con bandas oscuras y aletas rojizas, tenca de cuerpo oliva más alto. Se mantienen los índices originales de especies y los récords anteriores.
- Actividad, alimentación, alerta y memoria complementan los siete estados anteriores. Las decisiones ambientales se actualizan cada 0,75 segundos por pez. Un pez que escapa conserva alerta y memoria del señuelo durante 35 segundos; la alerta se disipa gradualmente. Los tirones bruscos siguen asustando a peces cautelosos. Buscar alimento reduce hambre; volver a explorar la aumenta lentamente.
- HUD discreto con hora, clima, temperatura superficial y viento. En móvil sustituye el texto introductorio para dejar libres controles y contador. Cuaderno y CSV incluyen condiciones de nuevas capturas. Las anteriores muestran «No registrado».
- Ambiente sonoro generado con Web Audio: agua/viento filtrado, lluvia, llamadas breves de pájaros diurnos e insectos nocturnos. Desactivado inicialmente; **M** o el botón de sonido activa/desactiva la mezcla. No se descargan archivos de audio.

## Cómo influyen las condiciones

| Especie | Preferencia térmica de juego | Conducta predominante | Señuelos |
| --- | --- | --- | --- |
| Trucha arcoíris | 12–19 °C | Picos al amanecer/atardecer; busca más profundidad con calor; respuesta favorable moderada a nubes | Cucharilla, artificial |
| Carpa común | 18–25 °C | Fondo, alimentación lenta; conserva actividad nocturna; los movimientos bruscos reducen interés | Lombriz |
| Lubina / black bass | 18–26 °C | Depredador crepuscular; mayor profundidad con luminosidad; nubosidad favorable, lluvia fuerte menos favorable | Artificial, cucharilla |
| Perca europea | 14–22 °C | Depredador principalmente diurno; actividad nocturna reducida y menor eficacia con lluvia intensa | Cucharilla, artificial, lombriz |
| Tenca | 18–25 °C | Alimentación de fondo, crepuscular y nocturna; cautelosa | Lombriz |

Los rangos son parámetros amplios de equilibrio, **no límites fisiológicos científicos**. La profundidad objetivo se limita al fondo real en cada posición; las posiciones se mantienen dentro de una elipse interior del lago. Un pez puede acercarse a un cebo fuera de su profundidad preferida, con menor interés. El viento desplaza modestamente las zonas de búsqueda de alimento.

Primero se exige un pez investigando y a menos de 1 m del señuelo. El interés depende de especie, afinidad, movimiento, hambre, actividad, alerta y memoria. Cada intento de ataque combina:

`condiciones = 0,30 × actividad + 0,20 × confort térmico + 0,20 × ajuste de profundidad + 0,15 × movimiento + 0,15 × hambre`

`probabilidad = limitar(base de especie × afinidad × 0,8 × condiciones × (1 − 0,65 × alerta), 0,015, 0,94)`

La memoria del mismo señuelo reduce después el resultado un 30 %. Los intentos se espacian 0,9 s; el pez debe llegar a menos de 0,62 m para producir la picada. No hay picadas por temporizador sin peces presentes ni garantías por un factor aislado. El combate conserva tirones, fatiga, holgura, rotura y controles de la fase 3.

## Ejecutar y observar

En la terminal de ORCA, dentro de `wolffish`:

```powershell
npm.cmd install
npm.cmd run dev
```

Abre la dirección que indique Vite. Si las dependencias ya están instaladas, basta con el segundo comando. Los siguientes enlaces suponen el puerto predeterminado 5173; usa el puerto real de tu terminal.

- Juego normal: `http://localhost:5173/` (día completo de 60 minutos).
- Día completo en un minuto: `http://localhost:5173/?day=60&hour=5`.
- Noche: `http://localhost:5173/?hour=0`.
- Atardecer lluvioso: `http://localhost:5173/?hour=19&weather=lightRain`.
- Lluvia intensa con transición breve de observación: `http://localhost:5173/?hour=12&weather=heavyRain&transition=2`.
- Viento: `http://localhost:5173/?weather=windy`.

Otros valores de `weather`: `clear`, `partly`, `cloudy`, `lightRain`. Un clima elegido en la URL permanece seleccionado y también se interpola. Sin `weather`, la evolución es automática. `day` se expresa en segundos reales por día; `hour` es la hora inicial; `transition` está limitado a 2–120 s. Estos parámetros son **exclusivos del servidor de desarrollo**, no alteran partidas guardadas y se ignoran en producción. La aceleración del día no acelera el combate ni los controles. Para cambiar los valores normales, edita `ENVIRONMENT_CONFIG` en `src/simulation/environment.js`.

Para comprobar el cuaderno: captura un pez, abre **J / CUADERNO** y comprueba la hora del lago, clima, temperatura y profundidad. La profundidad se mide al producirse la picada; el resto corresponde al momento de registrar la captura. Exporta CSV y recarga: el registro debe conservarse. Una captura anterior no debe recibir condiciones inventadas.

### PC

Sin controles nuevos. Botón izquierdo/Espacio: mantener y soltar para lanzar; pulsar para clavar; mantener para recoger. Botón derecho + arrastrar: cámara. **R** recupera; **E** equipo; **J** cuaderno; **P** pausa; **H** ayuda; **M** sonido; **F** pantalla completa. Los controles táctiles siguen ocultos con ratón/teclado.

### Móvil

Arrastra sobre el paisaje para mirar. Mantén **LANZAR** y suelta; pulsa **CLAVAR** con una picada; alterna mantener/soltar **RECOGER** en combate. **EQUIPO** y **CUADERNO** conservan sus paneles desplazables. Puedes mirar con un segundo dedo mientras pescas. Se respetan áreas seguras y ambas orientaciones; no se añade movimiento del personaje.

Para probar un teléfono en la misma Wi-Fi:

```powershell
npm.cmd run dev:lan
ipconfig
```

En el teléfono abre `http://IP_LOCAL_DEL_ORDENADOR:5173/`, usando la IPv4 del adaptador Wi-Fi y el puerto que indique Vite. Permite Node/Vite en la red privada si Windows solicita acceso. Ambos dispositivos deben estar en la misma red y sin aislamiento de clientes. Para observar ciclos y climas se admiten los mismos parámetros de desarrollo. En iOS/Android, activa sonido con un toque explícito. No se ha realizado una prueba física en estos dispositivos.

## Arquitectura y archivos

| Archivos | Responsabilidad |
| --- | --- |
| `src/simulation/environment.js` | Reloj, configuración climática, transiciones, viento, temperatura y funciones ecológicas puras |
| `src/simulation/fish-ai.js`, `config.js` | Actividad, alimentación, alerta, memoria, profundidades, afinidades y especies |
| `src/fishing.js` | Entorno compartido, deriva, lanzamiento y condiciones de captura |
| `src/visuals/environment.js` | Cielo, iluminación, niebla y lluvia en GPU |
| `src/world.js`, `visuals/water.js`, `visuals/landscape.js`, `visuals/fish.js` | Integración con los gráficos existentes, agua, viento y modelos |
| `src/main.js`, `index.html`, `src/phase4.css` | HUD, observación en desarrollo y cuaderno adaptable |
| `src/journal.js` | Migración conservadora, presentación y CSV |
| `src/audio.js` | Ambiente sintetizado, condicionado por clima y hora |
| `tests/environment.test.js`, `environment-browser.mjs`, `models.mjs`, `production.mjs` | Simulación, persistencia, seis climas, ciclo completo, perfiles, cinco modelos y arranque de producción |
| `package.json`, `package-lock.json` | Versión 0.3.0 y comando de prueba ambiental; sin dependencias nuevas |

Se conservan las claves `alba-catches-v1` y `alba-equipment-v1`. La migración es idempotente, conserva campos anteriores y no escribe ni reinicia el almacenamiento al arrancar. Se guarda el historial completo al añadir una captura. Las condiciones nuevas se validan campo a campo; valores ausentes o inválidos quedan como no registrados.

La lluvia necesita una sola llamada de dibujo, con 420 trazos en PC y 110 en móvil/calidad baja. Las ondas de lluvia se calculan en el shader del agua. No hay objetos de partículas creados por fotograma. Se mantienen 27 peces, materiales/geometrías compartidos y LOD; los nuevos peces redistribuyen esa población. Los reflejos siguen a 24/12 Hz; las sombras estáticas se refrescan de manera espaciada al desplazarse el sol. El HUD/audio se actualiza a 2 Hz. No se añaden dependencias.

## Fuentes ecológicas y licencias

Lago Sereno no tiene ubicación geográfica establecida. Se supone un lago recreativo templado europeo ficticio, con zonas vegetadas, profundidad máxima aproximada de 5,3 m y poblaciones introducidas de trucha arcoíris y black bass. Se conserva «Lubina» como nombre histórico de la especie de la fase 3; **no representa la lubina marina**. Esta mezcla es una decisión de diseño, no una recomendación de introducción de especies.

Referencias para la plausibilidad general, consultadas el 24 de noviembre de 2026:

- [FAO: trucha arcoíris](https://www.fao.org/fishery/docs/DOCUMENT/aquaculture/CulturedSpecies/file/en/en_rainbowtrout.htm): especie de aguas frías, repoblaciones recreativas y temperatura.
- [FAO: carpa común](https://www.fao.org/fishery/docs/CDrom/aquaculture/I1129m/file/en/en_commoncarp.htm): alimentación y ecología de cultivo de una especie de aguas templadas/cálidas.
- [FAO: síntesis biológica de la perca](https://www.fao.org/4/ap921e/ap921e.pdf): actividad diurna y dependencia de temperatura/fotoperíodo.
- [USGS: tenca](https://nas.er.usgs.gov/queries/FactSheet.aspx?SpeciesID=652): aguas tranquilas y vegetadas, alimentación bentónica, crepuscular y nocturna.
- [FAO: síntesis biológica del black bass](https://www.fao.org/4/ap918e/ap918e.pdf): depredación, condiciones de agua y temperatura.

No se copian imágenes, modelos ni sonidos de esas fuentes. Todos los recursos incorporados son procedurales, generados por el código del proyecto; no hay recursos externos nuevos ni obligaciones de licencia adicionales. Three.js conserva su licencia MIT y el resto de dependencias sus licencias existentes.

## Validación y límites

Comandos reproducibles:

```powershell
npm.cmd test
npm.cmd run test:browser
npm.cmd run test:mobile
npm.cmd run test:environment
node tests/models.mjs
node tests/visual.mjs phase4
npm.cmd run build
npm.cmd run preview -- --port 5175
# En otra terminal, con preview funcionando:
npm.cmd run test:production
```

Si Vite usa otro puerto, configura antes `$env:ALBA_TEST_URL='http://127.0.0.1:PUERTO'`. Las pruebas de navegador necesitan Chromium instalado por Playwright o Microsoft Edge; se puede indicar `ALBA_BROWSER_PATH`. Las capturas e informes se guardan en `test-results/`, excluido de Git.

La prueba de producción usa el puerto 5175 por defecto; `ALBA_PRODUCTION_URL` permite cambiarlo. Comprueba también que los parámetros de observación y los diagnósticos de desarrollo no están activos en producción.

### Resultados de validación · 24 de noviembre de 2026

- **34/34 pruebas de Node correctas**: 23 anteriores y 11 nuevas. Reloj y velocidades, seis períodos, continuidad lumínica, grafo climático, límites/gradientes de viento y lluvia, temperatura determinista, preferencias por especie, profundidad, alerta/memoria, picadas espaciales, captura de las cinco especies a 20/60 FPS, deriva y migración del cuaderno.
- **Escritorio correcto**, Edge/Chromium con WebGL 2: teclado/ratón, sensibilidad de cámara, lanzamiento, picada, combate con tensión, captura, condiciones del cuaderno, recarga/persistencia, guardado antiguo, pausa, cancelación, equipo y ventana estrecha. Se comprueba que no aparecen controles móviles.
- **Móvil emulado correcto**: teléfono 390×844 con captura táctil completa, cuaderno y condiciones; tablet 1024×768 con cámara/menús/controles. Multitáctil, cancelación, cambio de entrada híbrida y giro a 844×390 sin acciones duplicadas ni entradas retenidas. No son pruebas físicas de iOS o Android.
- **Ambiente correcto**: ciclo acelerado completo observado en navegador, sus seis períodos y vuelta de día; seis climas; pausa del reloj; HUD sin solapar controles/contador en escritorio, teléfono vertical/horizontal y tablet; activación/desactivación de audio. Sin errores de JavaScript ni shaders en estas pruebas.
- **Modelos correctos**: cinco especies en vista detallada, 40 llamadas de dibujo en total. Crear 15 peces adicionales no aumenta las 6 texturas ni las 30 geometrías del conjunto aislado. Se conserva la flexión y recuperación de la caña.
- **Compilación de producción correcta**: Vite 7.3.8, 27 módulos. Paquete JS principal aproximadamente 600,6 kB / 161,6 kB gzip. Se mantiene el aviso de tamaño mayor de 500 kB; no hay errores de compilación.
- **Prueba de producción**: arranque WebGL, HUD, equipo y audio en escritorio/teléfono emulado; parámetros de observación ignorados y diagnósticos de desarrollo ausentes.
- **Rendimiento comparado**, Intel Iris Xe/D3D11, Edge headless, 1280×800, muestras de 120 fotogramas por calidad, ejecuciones consecutivas sin pruebas gráficas simultáneas:

| Escenario | Mediana alta/baja | Percentil 95 alta/baja |
| --- | --- | --- |
| Referencia de fase 3 (`aad5059`) | 33,3 / 33,3 ms | 33,6 / 33,6 ms |
| Fase 4, amanecer despejado | 33,3 / 33,3 ms | 33,5 / 33,6 ms |
| Fase 4, lluvia intensa | 33,3 / 33,3 ms | 33,5 / 33,7 ms |

Las tres ejecuciones rondan 30 FPS en esta sesión; no se observa diferencia apreciable de fluidez en esta muestra. Es una comparación local breve, no una garantía para otros dispositivos. La referencia se extrajo del commit a `test-results/phase3-reference`, dentro de este mismo worktree, sin cambiar ramas ni modificar otro worktree. Informes: `phase3-reference-metrics.json`, `phase4-metrics.json`, `phase4-rain-metrics.json` y `living-waters-browser.json`, bajo `test-results/`.

Limitaciones conocidas y siguiente fase:

- Modelo ambiental simplificado: no simula estaciones, oxígeno, corrientes tridimensionales, población reproductiva ni cadena trófica completa. Las respuestas al clima son parámetros de jugabilidad pendientes de más sesiones de equilibrio.
- Clima reproducible con semilla fija y sesión que comienza al amanecer; el reloj/clima no persisten al recargar. Las capturas sí. La temperatura profunda es una referencia fija, no una termoclina física.
- Los reflejos planos del agua se actualizan con el entorno. El mapa de entorno usado por algunos materiales se genera al inicio; su intensidad cambia, pero no se recalcula todo el mapa durante el día.
- La vegetación oscila más con el viento, pero sus copas no giran exactamente en su dirección. La deriva no representa corrientes reales.
- Sonido sintetizado discreto; mejorar naturalidad, variedad y mezcla tras escuchar en dispositivos reales.
- Compatibilidad móvil verificada por emulación de Chromium, pendiente validación física de Safari/iOS y Android, consumo y rendimiento térmico.
- La compilación mantiene el aviso del paquete principal mayor de 500 kB, dominado por Three.js. No impide la compilación; valorar división de módulos si mejora mediciones de carga.
- Próxima fase recomendada: sesiones de equilibrio por especie/hora/clima, perfilado en teléfonos reales y persistencia opcional del entorno antes de ampliar complejidad ecológica.

Commit propuesto: `feat: ALBA phase 4 living waters simulation`.
