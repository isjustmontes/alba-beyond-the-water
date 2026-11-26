# Diseño propuesto · A Living Village

**Estado propietario** — Sólo A autorizada; plan y presupuesto pendientes de aprobación. B–D no iniciadas. Se parte del contrato M08 de escena rural cacheada y navegación compartida, no de una reconstrucción del pueblo.

**Módulos y contratos afectados** — Mapa documental de candidatos, por confirmar mediante inspección acotada al iniciar cada etapa:

- B: `src/village-layout.js` (altura, huellas y navegación), `src/visuals/village.js` (suelo/caminos/vegetación). Compartir la misma altura para malla, edificios, objetos y colisión; mantener apariciones seguras, puntos de interacción y anchura transitable. Favorecer relieve analítico suave y bordes de camino sin geometría superpuesta que parpadee. Ajustar apoyos visuales al suelo antes de aumentar detalle.
- C: construcción y materiales existentes en `village.js`; conservar huellas, puertas, carteles y objetivos de interacción. Priorizar escala de grano/juntas, variación moderada de rugosidad/color y encuentro de aleros, dinteles y zócalos. Reutilizar texturas procedurales, geometrías compartidas e instancing de tejas; sin modelos de prueba ni detalle masivo para ocultar siluetas deficientes.
- D: presentación ambiental de `VillageView`, `src/visuals/environment.js` y `atmosphere.js` sólo donde sea necesario. Consumir el estado existente de Living Waters, sin duplicar reloj/clima ni alterar el lago. Suavizar parámetros visuales, conservar visibilidad nocturna y limitar niebla/sombras; no introducir postprocesado pesado.

Ver [arquitectura](../../architecture/README.md), [módulos](../../architecture/MODULES.md) y [diseño M08](../M08-anglers-village/design.md). Esas fuentes describen la base; este documento sólo propone cambios, no afirma que ya existan.

**Compatibilidad de guardados** — Ninguna clave/esquema/migración nuevos. Mantener `alba-village-progress-v1`, equipo legado, diario y preferencias sin reescribirlos por motivos gráficos. Conservar APIs de viajes, tienda y entrada; no rehacer controles ni HUD.

**Coste gráfico y alternativa descartada** — Reutilización antes que densidad; variación por instancia y materiales compartidos, detalle distante reducido cuando haga falta. No renderizar zonas inactivas ni recrear recursos en cada viaje. Sin dependencias, descargas ni nuevas texturas de alta resolución. Descartados terreno físico complejo, arquitectura genérica nueva, aldea ampliada y efectos cinematográficos costosos.

Antes de B registrar baseline en SHA `5793ffb`: ruta y cámaras repetibles, resolución, DPR, calidad, hora/clima, navegador y hardware; medir después del mismo calentamiento/duración. Comparar móvil emulado con móvil emulado, sin certificar rendimiento físico. Ver procedimiento y presupuesto propuesto en especificación/aceptación. Si la medición no es fiable o falta dispositivo, marcar evidencia pendiente.

Riesgos: desniveles que separen colisión y malla; vegetación que tape señales; repetición/escala de materiales; niebla que esconda accesos; coste de sombras y de conservar dos escenas. Mitigar con cambios por etapa y retorno al comportamiento base; recursos externos o cambios ajenos requieren decisión previa. Sin nuevas abstracciones salvo necesidad demostrada.
