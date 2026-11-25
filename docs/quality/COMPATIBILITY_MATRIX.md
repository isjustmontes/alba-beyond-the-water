# Matriz de compatibilidad

| Objetivo | Método | Alcance y límite |
| --- | --- | --- |
| Chrome de escritorio, macOS | Automatizado en este equipo | WebGL2, teclado/ratón, preview. Resultados por guion en evidencia. |
| Chromium Android | Emulación en Chrome de escritorio | 390 × 844, rotación, toque y captura. Sistema Android y GPU de teléfono pendientes. |
| Tableta | Emulación Chromium | 1024 × 768; menús, multitáctil y rotación. |
| Híbrido | Eventos sintéticos y cambio de modalidad | Pendiente convertible físico con teclado y puntero. |
| Móvil físico, Android e iOS | Sin prueba actual | Pendientes pestaña en segundo plano, gesto de audio, temperatura y orientación. |
| Safari macOS / iOS | Sin validación del navegador Safari | WebKit por sí solo no acredita Safari en dispositivo. |
| Firefox 159.0, escritorio macOS | Humo adicional en Playwright | Preview local, WebGL2, equipo y entrada de lanzamiento; sin recorrido hasta captura. |
| WebKit 27.2, escritorio macOS | Humo adicional en Playwright | Mismo recorrido sin errores de consola o página. Safari físico pendiente. |
| Calidad alta y baja | visual.mjs, 1280 × 800 | Mismo navegador y equipo, distinto coste GPU. |
| Windows / Edge | Histórico M04 y M05 | Consultar informes originales con sus fechas y equipos. |

[Resultados medidos](evidence/README.md)
