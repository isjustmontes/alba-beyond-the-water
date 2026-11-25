# Estrategia de calidad

Ejecutar primero el dominio con node:test. Los tests inyectan agentes, RNG y tiempo para reproducir transiciones, límites y migraciones. Playwright añade entrada real de navegador, integración WebGL y capturas. Algunas pruebas avanzan un fixture o fuerzan estados para observar poses y layout. El guion móvil también ejecuta un combate. Conservar nombre de prueba, SHA, configuración y diferencias entre validación automática y observación humana.

El HUD comprueba geometría, tamaños de botón y solapes; la comparación con un JSON de referencia de escritorio sólo se hace cuando ese archivo está presente. Las capturas libres de las demás pruebas no constituyen por sí solas una comparación de píxeles contra un patrón aprobado. Falta ensayar navegación accesible, lector de pantalla, pérdida de contexto GPU, sesiones largas y controles físicos híbridos.

[Inventario por archivo y caso](TEST_INVENTORY.md) · [Trazabilidad](TRACEABILITY.md) · [Compatibilidad](COMPATIBILITY_MATRIX.md) · [Resultados y rendimiento](evidence/README.md) · [Criterios de entrega](RELEASE_CHECKLIST.md)
