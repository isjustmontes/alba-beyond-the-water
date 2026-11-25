# Defectos confirmados

**BUG-001 · P2 · Identificación de versión.** Abrir el pie de la interfaz y comparar con el tag v0.5.0. [index.html](../../index.html) muestra v0.4.0 · The Art of Fishing y [package.json](../../package.json) declara 0.4.0. La reproducción es estática y afecta también al encabezado de npm. Criterio de cierre propuesto: una instalación del artefacto de la siguiente entrega muestra el mismo identificador acordado en UI, metadatos y notas.

Los fallos observados en guiones de navegador se conservan con su mensaje y condiciones en la [baseline](../quality/evidence/README.md); sólo se atribuyen al producto cuando la reproducción lo demuestra.
