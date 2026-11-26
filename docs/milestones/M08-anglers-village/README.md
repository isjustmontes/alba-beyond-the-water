# M08 · Angler's Village · v0.7.0 · propuesta de MVP

**C implementada, pendiente de validación:** B aceptada y guardada en `1b46d47`. Cerca de la puerta de ARTES DE PESCA (x≈−8,35,z≈2,5), **T** en PC o botón contextual móvil abre catálogo de cuatro artículos. 100 créditos iniciales de prueba, compras de una unidad, saldo/existencias persistentes; los cebos y equipo anteriores siguen utilizables. Selección reutiliza Equipo, sin consumos ni ventajas nuevas. Encabezado cambia ALDEA/LAGO SERENO, también en móvil. Revisar compra, doble toque, Equipo y recarga; los créditos no se reponen al recargar y no hay ventas/ingresos en este MVP. Sin commit C ni publicación; A/B aceptadas, C pendiente. Detalles de pruebas y límites en evidencia.

**B implementada localmente, aceptación visual pendiente.** Zona rural independiente con tres casas tradicionales, tienda exterior cerrada, plaza, pozo, bancos, sendero y vegetación; sin compras/interiores/NPC. `REQ-VIL-001/002` y T02/T03 IMPLEMENTED_UNVERIFIED hasta revisión del propietario. Aprobación A conservada en `2c7b2ef`. No commit B ni publicación.

Para revisar: `npm.cmd run dev -- --port 5174`, abrir `http://127.0.0.1:5174/`, pulsar **Explorar / V**, seguir el sendero tierra adentro desde el muelle hasta el cartel ALDEA (aprox. x=6,z=74) y pulsar **T** o el botón contextual. Caminar hasta plaza y tienda; regresar por el sendero sur de la aldea y activar **Volver al lago**. Se recuerdan posición y mirada por zona durante la sesión; aldea sin modo pesca. WASD/Shift/ratón o joystick/CORRER/gesto mantienen sus acciones. No se persiste posición al recargar. La tienda no tiene interacción comercial en B.

**Aceptación A confirmada:** el propietario declara aprobada la Etapa A al encargar B. Autoriza ahora conexión de zonas y aldea gallega explorable (T02/T03), con sendero, centro y exterior de tienda; sin interiores, compras, economía, NPC ni misiones. Esta autorización sustituye el orden B/C propuesto inferior sin abrir D/E. Las notas anteriores se conservan como historial; M07 no cambia de aceptación.

**Etapa A: sólo SDD, pendiente de aprobación.** Encargo del propietario del 26/11/2026. Base: `origin/main`, `28432a5738d44abceebac4a90c5fe0b30e5c3a4e` (v0.6.0). Rama `feature/v0.7.0-anglers-village`, worktree `wolffish`; `dartfish` sin cambios.

Un pueblo rural pequeño y creíble conectado con Lago Sereno: sendero, zona central, una tienda de pesca, compra de aparejos y progreso económico/inventario local persistente. No es una funcionalidad implementada. Esta autorización sólo cubre documentación; cada etapa de implementación requiere aprobación.

**Decisión de identidad del propietario:** aldea rural gallega auténtica, con arquitectura de granito, teja y madera, caminos naturales y vegetación atlántica. La tienda se integra en una casa tradicional, con atención desde el exterior para mantener el MVP sin interiores. Escala pequeña y calidad realista, optimizada para PC/móvil; sin modelos provisionales de baja calidad. La decisión define la dirección artística, no acepta la implementación ni el conjunto de la Etapa A.

[Especificación](spec.md) · [Diseño](design.md) · [Tareas](tasks.md) · [Aceptación](acceptance.md) · [Evidencia](evidence.md)

M08 se asigna a este encargo; «M08 Técnicas de pesca» era un candidato de roadmap, sin ficha ni requisitos asignados: queda como propuesta futura sin ID. No se renumeran requisitos existentes. M07 conserva su historial y sus aceptaciones pendientes; abrir esta planificación no implica aceptar retrospectivamente D.
