# Diseño de Lago Sereno

**M11-A · propuesta, no disponible:** [The First Morning](../milestones/M11-first-morning/spec.md) planifica primera llegada a la plaza, presentación de amanecer saltable y «Explora la aldea» sin tutorial obligatorio. Habitantes, tienda y sendero siguen disponibles sin desbloqueos. Preservar progreso y omitir introducción en perfiles anteriores; política de aparición y accesibilidad pendientes de aprobación. No modifica el diseño de pesca descrito abajo.

## Pesca y equilibrio

La distancia se calcula como 9 + 31 × potencia, en metros. La carga comienza en 0,08 y crece 0,58 por segundo hasta 1. Una suelta inmediata desde el estado normal da aproximadamente 11,48 m; 9 m es la ordenada de la fórmula. Tras el impacto, la profundidad del cebo se limita por el fondo. El banco evalúa posición, apetito, cautela, memoria de escape, competencia y afinidad. La picada requiere un atacante próximo. Durante el combate, recoger reduce distancia y aumenta tensión; soltar permite recuperarse. La fatiga y los tirones modifican ese intercambio.

La caña ALBA Creek de 2,40 m usa monofilamento de 0,28 mm y resistencia nominal de 7,5 kg. La cucharilla trabaja a 0,75 m y favorece trucha, lubina y perca. La lombriz trabaja a 2,8 m y favorece carpa y tenca. El artificial trabaja a 1,4 m y premia alternar recogidas y pausas. Los coeficientes por especie están en [config.js](../../src/simulation/config.js). Las cinco especies tienen fuerza, agresividad, profundidad y resistencia distintas. El equilibrio entre jugadores queda pendiente de sesiones observadas.

## Entorno, arte y sonido

El día predeterminado dura 60 minutos reales. Temperatura, luz, viento y precipitación evolucionan durante la sesión. La trucha busca aguas más profundas con calor; la memoria individual del pez penaliza una segunda aproximación tras una amenaza. La ecología simplifica preferencias para que el jugador pueda experimentar con hora y profundidad. [Modelo ambiental](../../src/simulation/environment.js)

Agua reflectante, fondo batimétrico, follaje instanciado y niebla forman el paisaje. M06 incorpora humedad de orillas, oscilación por viento y bruma matinal. Los sonidos de aves, insectos y vegetación dependen del entorno. La fauna aérea visible está retirada. El agarre de corcho y el carrete acompañan el gesto de lanzamiento. Las manos tienen adaptador y sockets sin modelo aprobado. [Historial de animación](../releases/history/PHASE_05_THE_ART_OF_FISHING.md)

Los récords locales representan la progresión disponible. El jugador puede exportar capturas a CSV. Compras, experiencia, desgaste y recuperación de un guardado exportado son posibilidades de diseño pendientes.

## Parámetros de la jornada

El banco inicial contiene 27 individuos. El índice de especie rota al crearlos. El RNG muestrea el peso de manera uniforme entre los límites de la especie y redondea a centésimas. La longitud se deriva de la raíz cúbica del peso y de coeficientes por especie. Las cifras siguientes describen el diseño del juego.

| Especie | Peso, kg | Profundidad base, m | Cebo favorecido |
| --- | --- | --- | --- |
| Trucha arcoíris | 0,45–2,8 | 1,0 | Cucharilla |
| Carpa común | 1,1–6,5 | 2,8 | Lombriz |
| Lubina | 0,6–3,6 | 1,5 | Artificial |
| Perca europea | 0,18–1,8 | 1,8 | Cucharilla o artificial |
| Tenca | 0,4–3,8 | 2,5 | Lombriz |

El reloj comienza a las 06:24. Los seis climas son despejado, parcialmente nublado, nublado, lluvia ligera, lluvia intensa y viento moderado. El grafo permite, por ejemplo, pasar de lluvia intensa a ligera antes de despejar. El intervalo predeterminado entre decisiones es de 150 s; los parámetros se acercan al objetivo con una transición de 35 s. La temperatura tiene inercia y una referencia profunda de 14 °C.

El sedal se libera a los 0,32 s y el impacto llega a los 1,10 s. La boya sigue la superficie y el cebo se sitúa por debajo, limitado por el fondo. En combate, acumular más de 0,65 s de sobrecarga por encima de 0,97 de tensión rompe el sedal. La holgura se acumula por debajo de 0,035. Con distancia igual o inferior a 2,6 m se registra la captura si no ha ocurrido un escape. Tras la presentación, el juego vuelve a preparado a los 4,5 s. Pausar o perder foco libera controles; reanudar conserva el combate.

[Agentes y muestreo](../../src/simulation/fish-ai.js) · [Reglas de combate](../../src/fishing.js) · [Temporización de la caña](../../src/animation/fishing-motion.js)
