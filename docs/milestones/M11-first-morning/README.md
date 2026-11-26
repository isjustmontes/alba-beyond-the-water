# M11 · The First Morning · v0.10.0

**B aceptada por el propietario:** el encargo de Etapa C confirma validación visual/funcional y autoriza su commit local. Implementar después inicio real/persistencia y aviso inicial; no publicar. Los estados de revisión inferiores quedan como registro histórico.

**Vigente B · cinemática implementada, pendiente de validación visual/funcional.** A aprobada y guardada en `107ac34`. El encargo B sustituye el orden inicial: implementar presentación, sin activar detección de partidas nuevas, guardados ni aparición normal. Revisar `http://127.0.0.1:5181/?intro=1` (sólo servidor de desarrollo): aldea/cámara existentes, unos 12 s al amanecer, título/frase, Espacio/Escape/botón, entrega a exploración en plaza y movimiento reducido. Sin parámetro, el juego conserva muelle/pesca; producción ignora el parámetro. La posición de plaza sólo pertenece a esta previsualización explícita. No es todavía la introducción automática de nuevas partidas.

Pruebas de lógica relevantes 25/25 y build correctos; perfiles/emulación y límites en [evidencia](evidence.md). No commit B ni publicación. Clasificación persistente/activación automática y objetivo inicial siguen sin implementar. Las notas originales inferiores son históricas.

**A aprobada por el propietario:** el encargo de Etapa B autoriza guardar esta planificación. La secuencia de ejecución se ajusta: B implementará sólo presentación cinematográfica previsualizable; clasificación de perfiles, guardado y aparición real quedan expresamente aplazados. Las notas inferiores conservan el plan original.

**Etapa A: sólo SDD, pendiente de aprobación del propietario.** La dirección de producto procede del encargo actual; no hay implementación ni aceptación técnica de M11. Base publicada v0.9.0 y `origin/main`: `f7751bf1ff85c5c4e9524e614506fcfe8b5574b1`. Rama `feature/v0.10.0-first-morning`, worktree wolffish; dartfish intacto.

**MVP:** dar la bienvenida a partidas realmente nuevas en la plaza de la aldea mediante una introducción al amanecer de unos 12 segundos, saltable y accesible. Reutilizar escenario, cámara, controles y habitantes actuales. No imponer tutorial ni modificar progreso anterior.

| Etapa | Entrega propuesta | Puerta de aprobación |
| --- | --- | --- |
| A | Requisitos, diagnóstico, diseño, tareas y aceptación | Aprobar este plan; detenerse aquí |
| B | Secuencia de cámara, título, frase, salto y entrega en previsualización explícita | Validar encuadre, movimiento y accesibilidad PC/móvil |
| C | Clasificación segura de guardados y activación/aparición inicial real | Autorizar C y validar perfiles nuevos/anteriores y conservación de datos |
| D | Objetivo inicial discreto e integración con interacciones existentes | Validar disponibilidad inmediata de habitantes, tienda y sendero |
| E | Regresiones, medición por perfil y evidencias finales | Aceptación humana; publicación requiere autorización independiente |

Los módulos y pruebas citados en el plan son trabajo futuro. En A no se ejecutan tests/build ni se cambia código, assets, guardados, commits o publicaciones. No se inicia B automáticamente.

[Especificación](spec.md) · [Diseño](design.md) · [Tareas](tasks.md) · [Aceptación](acceptance.md) · [Evidencia](evidence.md)
