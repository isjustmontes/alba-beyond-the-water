# Diseño · Stories of the Village

**Estado propietario** — Sólo A autorizada. Composición artística aprobada; plan, guion, arte final, presupuesto y posición concreta pendientes de validación. Usar los módulos actuales como puntos de integración, no declarar construido un sistema de conversación inexistente. No se produce arte ni código en esta etapa.

## Recursos independientes y dirección visual

Manuel: retrato de busto reconocible y cálido, proporciones humanas creíbles, pintura en acuarela narrativa sobre papel; ropa rural sobria adecuada al entorno, sin caricatura ni manos geométricas. Detalles del personaje/guion se revisan con el propietario en B. Paleta tierra, sepia, marfil apagado y verde bosque; ornamentación gallega discreta, evitando una interfaz medieval genérica o recargada.

Recursos previstos (nombres orientativos, **no archivos creados**):

| WebP independiente | Tamaño máximo propuesto | Peso objetivo | Uso |
| --- | --- | --- | --- |
| `manuel-portrait.webp` | 768×1024 | ≤180 KiB | Retrato desktop/tablet; sin texto, botones ni pergamino completo incrustado |
| `manuel-portrait-small.webp` | 480×640 | ≤90 KiB | Variante móvil de la misma pintura, composición y color; `srcset`/`sizes`, no otra identidad |
| `aged-parchment.webp` | 512×512 | ≤80 KiB | Textura de papel reutilizable, en CSS como fondo; encuadre/bordes con CSS, contenido siempre en DOM |

Presupuesto inicial a aprobar con A/B: primera apertura ≤260 KiB transferidos en alta o ≤170 KiB móvil (una variante del retrato más papel); sin descargar ambas variantes a propósito. Decodificación RGBA aproximada ≤4 MiB en alta y ≤2,2 MiB móvil, no medición de memoria real. Ajustar compresión tras comparar el retrato a escala de uso, no aumentar resolución para simular calidad. No añadir más variantes/ornamentos sin necesidad visible. Carga al abrir o solicitud explícita de conversación, nunca todos los retratos en inicio, sin recargar imágenes en cada respuesta; las cachés del navegador reutilizan URLs.

Crear/reutilizar únicamente recursos propios, generados con condiciones de uso compatibles o de licencia comprobada (p. ej., CC0/CC-BY con atribución). B registrará autor, URL/procedencia, licencia, permisos, modificaciones, dimensiones y tamaño final en evidencia; en recursos generados registrar herramienta y condiciones aplicables. No descargar ni incorporar modelos/arte por dar su disponibilidad por supuesta. No se invoca ninguna herramienta de imagen ni descarga en A. Si falta arte convincente, detener integración y conservar el texto como trabajo pendiente, sin sustitutos de baja calidad.

## Interfaz HTML/CSS

Reutilizar modal nativo y tokens/estilos compatibles con el cliente; un panel específico acotado, sin biblioteca de componentes. En escritorio y móvil horizontal con espacio suficiente: retrato a la izquierda, nombre Manuel, párrafo y opciones a la derecha. En vertical estrecho: mismo orden de lectura, retrato contenido arriba/izquierda y conversación debajo, sin forzar dos columnas ilegibles; el pergamino sigue conteniendo ambos. El retrato no debe consumir la mayor parte de una pantalla pequeña.

Texto oscuro sobre marfil con contraste objetivo ≥4,5:1; tipografías existentes y tamaño base ≥16 px para diálogo, interlineado cómodo. Botones reales con foco visible y área ≥44 px, cierre siempre accesible, safe areas y scroll interior cuando haga falta. Nombre/rol con `aria-labelledby`, retrato con alternativa adecuada; texto no rasterizado, sin animación de escritura obligatoria. Respuestas anunciadas de forma discreta, navegación Tab/Enter/Espacio y Esc estándar; conservar foco entre elecciones y devolverlo a la interacción al cerrar. No usar un canvas/imagen gigante como UI ni desplazar el mundo para simular una conversación.

## Módulos y contratos afectados (propuesta, no implementación)

- **Datos narrativos pequeños:** grafo local de nodos `{id, text, choices: [{label, next}]}` y nodos de salida. Resolución pura y comprobable sin DOM/Three.js; IDs únicos, destinos existentes, sin acciones arbitrarias, economía ni entrada de usuario ejecutable. Un archivo de contenido y un controlador/panel acotado bastan: no hace falta motor genérico de misiones, eventos globales ni nuevo framework.
- **Composición `main.js`:** reutilizar diálogo/pausa/`clearHeld`, interacción contextual T y botón actual; añadir resolución de interacción cercana sin duplicar sistema de entrada. No modificar `GameControls`, `CameraStick` ni lógica de pesca salvo conexión estrictamente necesaria con el modal existente. M/E/J/V/T no abren otro menú o ejecutan otra acción mientras Manuel está abierto; Space activa sólo el botón enfocado, nunca pesca/salto subyacentes. No recapturar automáticamente el ratón al cerrar.
- **Proximidad:** punto por verificar junto a un banco de plaza existente, radio orientativo 2–2,5 m, desde superficie transitable. Sin cuerpo 3D ni nuevo obstáculo. Validar acceso y ausencia de habla a través de casas/muros; no basta distancia euclídea si atraviesa una barrera real. Mantener puntos de tienda y salida: no superponer radios; ante coincidencia involuntaria, seleccionar una interacción contextual inequívoca y comprobar prioridad determinista, nunca abrir dos paneles.
- **Presentación de presencia:** el indicador contextual identifica a Manuel al acercarse. Sin figura 3D, silueta plana en el mundo ni modelo de sustitución; el retrato aparece únicamente en el panel. Validar que el encuentro se entiende al recorrer la plaza sin añadir ubicaciones ni decorado nuevo.

## Esqueleto de conversación propuesto

| Nodo | Propósito y elecciones | Destinos |
| --- | --- | --- |
| Bienvenida | Manuel saluda; «Cuéntame del lago», «¿Algún consejo para pescar?», «Hasta luego» | Recuerdos / Pesca / Salida |
| Recuerdos | Relato breve de Lago Sereno; preguntar por señales del agua, vida de la aldea o volver | Condiciones / Aldea / Bienvenida |
| Pesca | Consejos de observación y técnica; cebos, combate o volver | Señuelos / Combate / Bienvenida |
| Condiciones | Hora, viento y clima como pistas, nunca captura garantizada | Señuelos / Recuerdos / Salida |
| Aldea | Perspectiva personal de Manuel, sin prometer NPC/tiendas/zonas no existentes | Recuerdos / Bienvenida / Salida |
| Señuelos | Opciones de equipo ya disponibles y profundidad, sin otorgar aparejos | Pesca / Bienvenida / Salida |
| Combate | Alternar recogida y holgura, observar tensión; sin alterar mecánicas | Pesca / Bienvenida / Salida |

Siete nodos de contenido y salida explícita, párrafos cortos y 2–3 elecciones; añadir «Cerrar» permanente permite salir incluso si se cambia el guion. El texto final se escribe/revisa en B; esta tabla no es un diálogo implementado. Reapertura empieza en bienvenida; sin elecciones temporizadas ni castigo por releer.

**Compatibilidad de guardados** — Ninguna clave o esquema nuevo en el MVP. Leer los mismos datos de juego sólo si una frase lo necesita, sin inventar dependencia de capturas/moneda. Conversación y nodo activo sólo durante apertura; reload/recorrido no escriben progreso. Capturas, saldo, compras, equipo y preferencias deben permanecer idénticos. Persistencia narrativa queda fuera de alcance.

**Coste gráfico y alternativa descartada** — DOM y dos imágenes visibles, sin geometrías, draw calls de Three.js, voces ni simulaciones por frame. Medir tiempos de apertura, bytes/decodificación y recursos al implementar; no hay benchmark en A. Mantener aviso de bundle conocido como limitación y evitar dependencias pesadas. Se descartan NPC 3D, vídeo, UI horneada en una imagen y servicios de diálogo: no aportan valor al MVP autorizado.
