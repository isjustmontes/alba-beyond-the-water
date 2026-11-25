# Deuda técnica

| ID | Prioridad | Evidencia y consecuencia | Criterio de reducción |
| --- | --- | --- | --- |
| DEBT-001 | P1 | pages.yml sube dist después del build sin ejecutar los tests. Un fallo de pesca puede llegar a Pages. | Una regresión deliberada bloquea la subida en un flujo aprobado. |
| DEBT-002 | P2 | main.js acopla consultas DOM, persistencia, audio, pausa y composición. world.js combina cámara, inicialización de recursos y dibujo. | Ante el siguiente cambio real, aislar el contrato afectado con una prueba y conservar snapshot/entrada. |
| DEBT-003 | P2 | El JS minificado supera el umbral de aviso de Vite. | Medir arranque frío y red en teléfono antes de decidir división del paquete. |
| DEBT-004 | P2 | Los escenarios gráficos se distribuyen entre scripts npm y módulos mjs con puertos por defecto distintos. | Una ejecución documentada demuestra el mismo SHA y artefacto para todos los escenarios. |
