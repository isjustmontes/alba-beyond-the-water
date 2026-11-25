# Riesgos abiertos

| ID | Impacto | Indicio y alcance | Cómo resolver la incertidumbre |
| --- | --- | --- | --- |
| RISK-001 | Alto | Sesiones físicas sin evidencia. Emular el viewport no reproduce GPU, audio, teclado virtual o calentamiento. | Captura y recarga con iOS Safari y Android físicos. |
| RISK-002 | Medio | world.js registra resize; main.js mantiene listeners y RAF durante la vida de la página. Contadores breves del renderer no descartan crecimiento sostenido. | Medir heap, geometrías y texturas durante 30 min con repetición de capturas. |
| RISK-003 | Medio | FishingGame usa Math.random y hora real por defecto. Un E2E con encuentro natural puede variar entre corridas. | Conservar semilla y estado al fallar, y distinguir la partida natural del caso determinista. |
| RISK-004 | Medio | localStorage depende del origen, cuota y permisos. Si guardar falla, main.js permite seguir en la sesión. | Probar límite de cuota y restauración con datos representativos; conservar exportación. |
| RISK-005 | Medio | Se generan modelos por código y se conserva el banner sin licencia independiente visible. | Acreditar procedencia y autorización de redistribución. |
