# Contrato de trabajo de ALBA

Leer en orden [índice](docs/README.md), [constitución](docs/sdd/CONSTITUTION.md), [flujo SDD](docs/sdd/WORKFLOW.md), [estado](docs/project/STATUS.md), [hoja de ruta](docs/project/ROADMAP.md), ficha del hito activo y documentos del dominio y arquitectura afectados.

Revisar `git status` antes de editar y preservar cambios ajenos. Identificar tarea y criterio, respetar alcance y convenciones, actualizar las pruebas pertinentes, registrar resultados reales y mantener sincronizados la documentación canónica y STATUS. Comunicar bloqueos y terminar al cubrir el alcance autorizado.

## CI

Después de un push o actualización de PR, consultar CI una vez. Si quedan checks pendientes o activos, comunicar su estado, pedir al usuario que vuelva al terminar o fallar y finalizar el turno. Evitar sondeos repetidos, gh run watch, bucles de espera y agentes dedicados a esperar CI. Al regreso, investigar fallos reales. Tras activar otra ejecución, aplicar el mismo límite. Conservar los requisitos de seguridad y aprobación. Nunca fusionar ni desplegar automáticamente. Sólo operaciones de producción expresamente autorizadas que requieran vigilancia activa quedan exceptuadas del límite de espera.
