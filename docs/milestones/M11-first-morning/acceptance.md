# Aceptación · The First Morning

**Decisión humana** — Plan A pendiente de aprobación. Ningún criterio de producto ejecutado ni aceptado en esta etapa; todos **NOT_STARTED**. La dirección solicitada no equivale a aceptación visual de un recorrido aún inexistente.

| Criterio / requisito | Entrada y acción futura | Resultado esperado | Evidencia obtenida |
| --- | --- | --- | --- |
| AC-INTRO-01 · REQ-INTRO-001 | Perfil de prueba sin claves ALBA; arrancar, completar/saltar; comprobar suelo/plaza/modo | Aparición transitable, altura natural y caña guardada; zona/encabezado/controles coherentes | Ninguna; pendiente B |
| AC-INTRO-02 · REQ-INTRO-002 | Reloj controlado 0–12 s, distintos dt, ocultar/reanudar; inspeccionar recorrido PC/móvil | 12±1 s visibles, amanecer existente, curva suave, sin atravesar objetos ni corrección al entregar | Ninguna; pendiente C |
| AC-INTRO-03 · REQ-INTRO-003 | Inspeccionar DOM y capturas a tamaños PC/teléfono/tablet | ALBA y frase exacta, legibles, sin cortes ni texto incrustado | Ninguna; pendiente C |
| AC-INTRO-04 · REQ-INTRO-004 | Saltar al principio/mitad/final con Espacio/Escape/táctil, mantener tecla/dedo, cancelar puntero y repetir | Una finalización; no salto físico, lanzamiento, giro, menú o interacción residual; controles restaurados al liberar entrada | Ninguna; pendiente C |
| AC-INTRO-05 · REQ-INTRO-005 | Tras completar/saltar, ignorar aviso o caminar, hablar con ambos personajes, comprar y viajar al lago | «Explora la aldea» discreto y temporal; nada obligatorio ni bloqueado, sin nueva misión/recompensa | Ninguna; pendiente D |
| AC-INTRO-06 · REQ-INTRO-006 | Fixtures legadas: capturas vacías/antiguas, equipo, comercio v1/v2, mute solo, corrupción; marcador válido/desconocido; recargar durante/después; storage denegado/cuota agotada | Nunca intro en legado o marcador presente; datos anteriores intactos, sin doble moneda/stock; fallo seguro permite jugar; no reproducción tras reload con marcador persistido | Ninguna; pendiente B/E |
| AC-INTRO-07 · NFR-INTRO-001 | Movimiento reducido inicial y cambiado durante secuencia, Tab/Enter/Escape, zoom texto 200%, lector de pantalla y rotación móvil | Sin recorrido con movimiento reducido; foco/salto accesibles, botón ≥44 px y safe areas, sin anuncios repetidos ni Pointer Lock automático | Ninguna; pendiente C/E |
| AC-INTRO-08 · NFR-INTRO-002 | Comparar v0.9.0/candidato en mismo navegador/perfil/calidad y aldea; medir carga separada; cinco viajes después | Sin nuevos assets/dependencias/pases; mediana estable dentro de presupuesto propuesto 10%, sin crecimiento acumulativo | Ninguna; pendiente E; presupuesto por aprobar |
| AC-INTRO-09 · NFR-INTRO-003 | PC/móvil: dos joysticks, correr/saltar, mapa, conversaciones/catálogo, viaje ida/vuelta y lance/combate/diario; verificar clima y audio/mute | Mismos controles/mecánicas, audio sujeto a gesto; guardados conservados y sin inputs retenidos | Ninguna; pendiente D/E |

**Perfiles previstos** — Chromium escritorio 1440×900; teléfono táctil 390×844 y 844×390; tablet táctil 1024×768. WebKit y Android/iOS físicos si disponibles, siempre distinguidos de emulación; si no, registrar pendientes. Medir equipo/navegador real antes de fijar resultados de rendimiento.

**Protección durante validación futura** — Fixtures y borrado únicamente en contextos de navegador aislados de prueba, nunca eliminar el almacenamiento del usuario. No prometer restauración de ubicación entre sesiones: no existe actualmente. La política propuesta de spawn por cohorte se revisa con el propietario al aprobar A.
