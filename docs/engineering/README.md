# Desarrollo y distribución

## Reproducir una sesión

Instala con `npm ci`; conserva package-lock.json. `npm run dev` y `npm start` escuchan en loopback. Para probar en un teléfono de la misma Wi-Fi, ejecuta `npm run dev:lan` y abre la IP y el puerto indicados. En desarrollo, `?hour=0&weather=heavyRain&transition=2` permite observar la noche y la lluvia. `window.__alba.snapshot()` expone diagnósticos sólo en desarrollo.

Ejecuta `npm test`, `npm run build -- --base=./` y `npm run preview -- --port 5175`. Mantén el servidor de desarrollo en 5173 para las pruebas que importan módulos fuente. Configura `ALBA_TEST_URL` y `ALBA_PRODUCTION_URL` si cambian las direcciones. Usa `npx playwright install chromium` o indica un ejecutable Chromium con `ALBA_BROWSER_PATH`. Un 504 Outdated Optimize Dep después de reinstalar requiere reiniciar Vite con `--force`. [Inventario y resultados](../quality/README.md)

## Entrega y dependencias

[Pages](../../.github/workflows/pages.yml) se activa por push a main o manualmente. Ubuntu instala Node 22, usa caché npm, ejecuta npm ci y el build con base relativa, configura Pages y sube dist. El despliegue depende del build. Usa contents:read, pages:write e id-token:write y el entorno github-pages. La concurrencia agrupa ejecuciones sin cancelar la activa. El YAML carece de un job de tests, humo posterior o rollback automático. Restaurar un commit conocido y volver a publicar requiere autorización. Las reglas externas de protección de la rama y del entorno requieren comprobación independiente.

Propuesta para revisión: ejecutar unitarias, build y humo sobre preview antes de subir el artefacto; conservar resultados y SHA para reproducir el despliegue. No se modificó el flujo.

El cliente usa Three.js 0.180.0. La instalación auditada resolvió Vite 7.3.8 y Playwright Test 1.65.1. El bundle y la instalación se detallan en [evidencia](../quality/evidence/README.md). La app puede servirse localmente sin red tras instalar. No hay service worker que garantice el arranque offline desde Pages.

## Recursos y mantenimiento

El banner WebP está versionado. El juego genera geometrías, texturas y audio localmente. La nota histórica de Living Waters conserva fuentes FAO/USGS y describe la licencia MIT de Three.js. El repositorio auditado carece de un archivo LICENSE y de acreditación independiente del banner. Confirmar derechos antes de reutilizarlo fuera del proyecto. [Procedencia histórica](../releases/history/PHASE_04_LIVING_WATERS.md)

Conservar los módulos ES, las funciones de simulación comprobables sin DOM y las claves de guardado. Preferir RNG inyectable para reproducir fallos; usar capturas en Chromium para contrastar cambios visuales. Los cambios en sombras, materiales, reflejos, densidad o LOD requieren medir ambos niveles de calidad sobre el mismo equipo.
