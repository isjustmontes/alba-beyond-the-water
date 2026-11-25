# Baseline de v0.5.0

**25 de noviembre de 2026 · main · `544b7e1182279ee1b3b50f7de0a1f654e97fde1b`.** macOS 27.2 (26B123), Darwin 27.2.0 arm64, Node 24.19.0, npm 11.17.0, Chrome 158.0.8127.37 headless vía Playwright 1.65.1. Se usó Chrome instalado con las opciones WebGL de los propios guiones. Desarrollo en 127.0.0.1:15173 y preview en 15175. Se ejecutaron los guiones gráficos de uno en uno.

| Comando | Resultado |
| --- | --- |
| npm ci | 18 paquetes instalados, 19 auditados, 0 vulnerabilidades comunicadas. npm avisa de scripts de instalación sin política explícita para esbuild y fsevents. |
| npm test | 81 descubiertas, 81 aprobadas, 0 fallidas, 0 canceladas, 0 omitidas, 0 TODO. |
| npm run build | 36 módulos; HTML 9,18 kB, CSS 27,39 kB, JS 623,01 kB. Gzip 3,75 / 6,30 / 169,17 kB. 480 ms. |
| npm run build -- --base=./ | Correcto, 461 ms. HTML 9,19 kB; mismo JS y CSS. Aviso en ambos builds por chunk minificado superior a 500 kB. |

### Integración y navegador

Cada fila cuenta un guion completo. El número de aserciones internas depende del perfil. Un fallo detiene el guion y deja sin verificar los pasos siguientes.

| Comando | Última ejecución | Alcance o incidencia |
| --- | --- | --- |
| `npm run test:animation` | PASS | Gesto completo, caña, sedal, líder y salto en tres viewports |
| `node tests/atmosphere-browser.mjs` | PASS | Bruma, humedad, luz y encuadre en distintas horas y perfiles |
| `node tests/audio-browser.mjs` | PASS | Preferencia, desbloqueo tras gesto y señal de audio en preview |
| `npm run test:browser` | PASS | Partida desde teclado, equipo persistente, combate y cuaderno |
| `npm run test:environment` | PASS | Forzar clima, día/noche, transición y perfiles de pantalla |
| `node tests/fauna-browser.mjs` | PASS | Ambiente sonoro, silencio y ausencia de recursos de fauna visible |
| `npm run test:mobile` | PASS | Teléfono y tableta, multitáctil, híbrido, cancelación y pesca |
| `node tests/mobile-hud.mjs` | PASS | Alcance y solape de botones, áreas seguras, INFO y orientación |
| `node tests/models.mjs` | PASS | Geometrías compartidas, coste de peces y flexión de caña |
| `npm run test:production` | PASS | Preview compilado, WebGL2, equipo, sonido y exclusión de diagnósticos |
| `node tests/vegetation-browser.mjs` | PASS | Deformación por viento, estabilidad de buffers y variaciones visuales |
| `node tests/vegetation-performance.mjs` | PASS | Coste de paisaje aislado en alternancia v0.4.2/candidato con lectura GPU |
| `node tests/visual.mjs` | PASS | 120 intervalos RAF por calidad, llamadas, triángulos y capturas |

El primer intento de test:browser y test:animation encontró errores HTTP 504 «Outdated Optimize Dep» después de reinstalar dependencias con Vite en marcha. Se reinició Vite con --force para repetirlos. Los resultados de preview se obtuvieron contra dist servido localmente. La demo pública respondió HTTP 200; ese control no identifica el SHA servido.

### Medidas

| Perfil | Condición | Mediana ms | p95 ms | Draw calls | Triángulos |
| --- | --- | --- | --- | --- | --- |
| desktop | dawn | 99.9 | 116.7 | 199 | 237690 |
| desktop | noon | 33.4 | 100.1 | 195 | 234574 |
| desktop | rain | 99.9 | 116.6 | 230 | 399138 |
| desktop | mist | 99.9 | 116.7 | 201 | 236920 |
| portrait | dawn | 100 | 116.7 | 113 | 219232 |
| portrait | noon | 100.1 | 116.7 | 141 | 379080 |
| portrait | rain | 100 | 116.6 | 149 | 380096 |
| portrait | mist | 100 | 116.7 | 152 | 382714 |
| landscape | dawn | 100 | 116.7 | 236 | 401932 |
| landscape | noon | 100 | 116.7 | 241 | 403998 |
| landscape | rain | 99.9 | 116.7 | 204 | 236928 |
| landscape | mist | 100 | 116.7 | 203 | 236928 |

Muestras de 60 intervalos RAF por condición. La variación entre mediodía, lluvia y bruma obliga a fijar hora y clima antes de comparar cambios.

**Escena completa** · 1280x800 · ANGLE (Apple, ANGLE Metal Renderer: Apple M5, Unspecified Version). El nombre phase2 del archivo es el argumento predeterminado de visual.mjs. La ejecución corresponde a M06.

| Calidad | Mediana ms | p95 ms | FPS equivalentes a la mediana | Draw calls | Triángulos |
| --- | --- | --- | --- | --- | --- |
| high | 99.9 | 116.7 | 10.0 | 211 | 242372 |
| low | 100 | 116.7 | 10.0 | 195 | 182538 |

**Paisaje aislado**, alternancia entre v0.4.2 y v0.5.0, con lectura GPU síncrona.

| Perfil | Revisión | Mediana ms | p95 ms | Llamadas | Triángulos | Geometrías | Texturas |
| --- | --- | --- | --- | --- | --- | --- | --- |
| desktop | base | 2.3 | 4.4 | 12 | 124606 | 10 | 4 |
| desktop | candidate | 3 | 4.5 | 12 | 131968 | 10 | 4 |
| desktop | candidate | 3.1 | 8.2 | 12 | 131968 | 10 | 4 |
| desktop | base | 2.5 | 4 | 12 | 124606 | 10 | 4 |
| mobile | base | 1.9 | 5.6 | 12 | 124606 | 10 | 4 |
| mobile | candidate | 1.8 | 3.5 | 12 | 131968 | 10 | 4 |
| mobile | candidate | 2.2 | 4.1 | 12 | 131968 | 10 | 4 |
| mobile | base | 1.8 | 3.5 | 12 | 124606 | 10 | 4 |

El fixture de cinco peces detallados registró 40 llamadas, 11 770 triángulos, 30 geometrías y seis texturas, conservadas al añadir variantes. Los contadores GPU cuentan recursos; no miden bytes de memoria total. Falta medir carga inicial fría, heap sostenido, consumo, temperatura y sesiones largas. El coste del shader individual no está aislado.

**Presupuesto propuesto.** Conservar las 40 llamadas máximas del fixture de cinco peces y la reutilización de sus seis texturas. Como umbral de investigación, repetir tres veces la misma escena si el p95 crece más del 10 % frente a este SHA en el mismo navegador y hardware. Fijar un objetivo físico después de observar una sesión completa.

**Evidencia histórica.** M04 documentó 34/34 Node y medianas de 33,3 ms el 24 de noviembre de 2026. M05 documentó 47/47 y comparó alta/baja en Edge headless sobre Intel Iris Xe con ANGLE/D3D11. Los informes originales conservan números, plataforma y limitaciones. [M04](../../releases/history/PHASE_04_LIVING_WATERS.md) · [M05](../../releases/history/PHASE_05_THE_ART_OF_FISHING.md)

[Inventario de las pruebas y criterios](../TEST_INVENTORY.md) · [Resultados documentales](../../project/AUDIT_REPORT.md)

### Comprobación adicional entre motores

Se instalaron los binarios WebKit 27.2 y Firefox 159.0 de la versión de Playwright del lockfile. En cada motor se abrió el preview local a 1280 × 800, se esperó al fin de carga, se comprobó contexto WebGL2, ausencia de pantalla fatal y de window.__alba, se abrió Equipo con E y se cerró su diálogo. Se envió una pulsación de Espacio de 400 ms y se observó la página durante 1,8 s. Ambos recorridos finalizaron sin errores de consola ni de página. No se afirmó una captura ni se midió el rendimiento en estos motores. Estas dos comprobaciones adicionales se contabilizan fuera de los 13 guiones versionados.
