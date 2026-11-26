# Diseño · The First Morning

## C · diseño autorizado de inicio y persistencia

**Implementado, pendiente de aceptación:** `PlayerProgress` aplica este contrato sin renderer; `main` resuelve inicio antes de inicializar comercio, prepara la ubicación después de registrar controles y bloquea entrada durante la espera de carga/cinemática. Se conserva también un registro de ubicación versión 1 anterior sin `introSeen`: su propia presencia excluye la introducción y sus campos adicionales se mantienen. Documentos/versiones desconocidos no se reemplazan. La entrada DEV repetible no instancia PlayerProgress ni guarda su cámara.

Añadir `player-progress.js`, adaptador localStorage pequeño y comprobable sin renderer. Clasificar antes de VillageShop u otros escritores. Documento aditivo `alba-player-v1`: versión 1, `introSeen:true` y `location:{zoneId,position:{x,y,z},yaw,pitch,mode}`; guardar marca y aparición inicial juntas antes de reproducir para que recargar durante la secuencia no la repita. Reconocer también la presencia de la clave de onboarding propuesta en A, sin escribirla ni inferir que su ausencia significa partida nueva. No migrar ni sobrescribir documentos de capturas/comercio/equipo/audio.

Restaurar sólo ubicaciones de zonas conocidas con números finitos y suelo transitable usando alturas/obstáculos existentes. Normalizar altura al ojo sobre suelo (no conservar salto/velocidad ni combate incompleto). Mantener x/z y orientación válidas; sólo restaurar pesca donde sea segura. Sin ubicación disponible, muelle compatible; documento de jugador corrupto/desconocido o con ubicación insegura se conserva sin sobrescribir y permite jugar mediante fallback. Si almacenamiento falla o cambia desde la lectura, no iniciar presentación ni sobrescribirlo. No se promete atomicidad entre pestañas.

Al terminar/saltar/reducir movimiento, una sola ruta aplica plaza, libera controles y muestra «Explora la aldea» durante 8 s sin bloquear. Guardar ubicación al viajar, periódicamente cada 2 s sólo si cambió y al ocultar/salir de página; nunca guardar la cámara cinematográfica, una posición en el aire o la preview DEV. Persiste sólo ubicación actual, no mapa completo de retornos ni hora/clima. Esta ampliación de persistencia reemplaza la exclusión del plan A por instrucción C; integración, pruebas y aceptación se registrarán sin certificar resultados antes de ejecutarlos.

## B implementada · contrato actual

`animation/first-morning.js` posee sólo estado/tiempo/pose: 12 s, interpolación quíntica con velocidad inicial/final nula, salida anticipada amortiguada de 0,65 s, tiempo suspendible y final exacto e idempotente. `ui/first-morning.js` adapta la cámara existente y el overlay DOM/CSS: captura de entradas antes de los controles normales, limpieza de teclas/dedos, foco, bloqueo hasta liberar el gesto de salto y retirada de listeners al terminar. No utiliza almacenamiento ni decide elegibilidad/aparición.

`main.js` instancia la presentación únicamente con DEV y `?intro=1`, antes de registrar controles, y prepara temporalmente la escena rural y la plaza para esa previsualización. No toca el arranque habitual ni los inicializadores de guardado. Reutiliza `ZoneManager`, `VillageView`, renderer/cámara, altura y controles actuales; el bucle cede cámara mientras la presentación bloquea, mantiene el entorno existente y oculta HUD/indicadores mediante una clase temporal. Finaliza en (0, suelo+1,7, 11), yaw 0 y pitch -0,055; recargar sin parámetro vuelve al comportamiento normal. Preparado para un llamador futuro que resuelva partida nueva, sin conectarlo todavía.

Recorrido elegido: (1,4; 7,8; 24) hacia (0; 2,788; 11), sobre corredor central sin huellas de casas, bancos o pozo. Los textos se retiran gradualmente antes de la entrega normal. Movimiento reducido omite el recorrido, devuelve control inmediatamente y conserva título/frase como breve aviso no bloqueante de 2,4 s; cambio de preferencia durante recorrido también lo finaliza sin traslación animada. Blur/ocultación suspenden el reloj y limpian entradas. No nuevos assets, luces, pases, vídeos ni dependencias. Clasificación/clave de onboarding, aparición real y objetivo del diseño original inferior permanecen propuestos.

## Diagnóstico de la base publicada

- `main.js` crea `LakeWorld`, `ZoneManager` por defecto en `lago-sereno`, `Environment` y `FishingGame`; `Exploration` comienza en modo pesca en (0,7). Se restauran capturas/equipo y después se construye `VillageShop`.
- `VillageShop` escribe `alba-village-progress-v1` en su constructor si no existe. Clasificar después de construirlo convertiría una partida nueva en anterior. `LakeAudio` se crea antes, pero su constructor sólo lee preferencias; el contexto sonoro se desbloquea mediante interacción.
- El bucle principal asigna x/z de cámara cada frame y suaviza y con el suelo del jugador. `LakeWorld.setView()` aplica yaw/pitch. Una animación paralela sin arbitraje quedaría sobrescrita.
- `ZoneManager` admite zona/entrada iniciales, pero la aldea sólo tiene entrada `lakePath` (0,29); las poses de viaje se guardan en memoria, no en localStorage. `LakeWorld.setZone` crea `VillageView` de forma diferida y reutiliza renderer/cámara.
- `villageWalkHeight` comparte suelo y obstáculos. La plaza contiene bancos en (5,7), (-4,9) y pozo en (3.5,3); (0,11) es candidato analítico transitable, no un encuadre validado visualmente.
- `Environment` comienza a las 06:24 y el día dura 3600 s reales. Hora/clima no persisten. El panel de diálogo y los menús ya limpian entradas y pausan; ambos joysticks pertenecen a los controles existentes.

## Estado propietario

Proponer un controlador pequeño, independiente de DOM/Three.js, con estados `inactive → presenting → handing-off → complete`. `main` posee su instancia y decide exclusivamente quién escribe la cámara: controlador durante presentación/entrega; exploración después. Completar, saltar, cambiar a movimiento reducido o recuperarse de un fallo converge en una finalización idempotente. No usar el booleano de pausa de un diálogo como sustituto de toda la secuencia.

Un reloj local acumula tiempo visible; ocultar página o perder foco detiene la secuencia y limpia entradas, sin avanzar de golpe al regresar. La escena puede seguir renderizándose; la actualización ambiental existente avanza durante la presentación visible, sin controlar al jugador ni simular peces del lago desde la aldea. No reiniciar el reloj climático cada frame ni cambiar su modelo.

## Módulos y contratos afectados — propuestos, no implementados

| Área | Cambio mínimo previsto | Contrato que se conserva |
| --- | --- | --- |
| Nuevo controlador de introducción, ruta a fijar al implementar B/C | Decisión de elegibilidad, tiempo/estado y finalización comprobables con almacenamiento/reloj inyectados | Sin dependencia del renderer ni estado comercial propio |
| `main.js` | Leer clasificación antes de inicializadores; activar zona/modo; arbitrar cámara, overlay y entradas; aplicar pose final coherente | Una escena activa, acciones de pesca/diálogo/tienda existentes |
| `zones.js` y composición de inicio | Añadir entrada de plaza sólo si hace falta; inicialización segura de aldea sin fingir viaje desde una salida | IDs/salidas actuales, poses de retorno y validación de suelo |
| `world.js`, controles | Reutilizar cámara/village cacheada y bloqueo compartido de entrada; evitar escrituras competidoras | Límites de mirada, colisiones, Pointer Lock voluntario y joysticks independientes |
| HTML/CSS de presentación | Overlay encapsulado de título/frase/salto y objetivo discreto | HUD previo sin rediseño; sin nuevo menú permanente |

No crear un framework de cinemáticas, bus global, segunda cámara, gestor de misiones o servicio de guardado nuevo. Una función acotada de activación de zona puede reutilizar las operaciones actuales de viaje; no refactorizar el sistema de viajes entero.

## Compatibilidad de guardados

1. Antes de construir tienda o cualquier escritor, leer sin mutar `alba-catches-v1`, `alba-equipment-v1`, `alba-village-progress-v1`, `alba-audio-v1` y la nueva clave propuesta `alba-onboarding-v1`.
2. Sólo ausencia total confirmada permite clasificar como nueva. No inferirlo de capturas cero, saldo inicial, stock o JSON vacío. Claves existentes malformadas y marcadores desconocidos excluyen la introducción; nunca sobrescribirlos ni eliminarlos.
3. Para un perfil nuevo, guardar y verificar un marcador mínimo versionado `{version:1,introSeen:true}` **antes** de presentar la secuencia. Significa «introducción consumida», también si se salta, se recarga a mitad o falla la escena. No esperar al final para guardarlo. Releer inmediatamente antes de escribir para reducir carreras entre pestañas; no afirmar atomicidad entre pestañas.
4. Un marcador válido de M11 selecciona aparición en plaza sin repetir la presentación; un perfil legado sin ese marcador conserva el inicio actual del muelle. No escribir marcadores de actualización en los perfiles legados ni cambiar su progreso.
5. Lectura/escritura/verificación fallida: omitir introducción y usar inicio compatible, sin impedir jugar ni tocar datos antiguos. Un indicador en memoria evita reentrada dentro de la sesión; almacenamiento borrado manualmente es indistinguible de un perfil nuevo. No prometer persistencia cuando el navegador la prohíbe.
6. La clave nueva es aditiva; no cambia esquemas comercial/journal/audio ni migra posiciones inexistentes. Probar bytes de claves anteriores antes/después, separando escrituras normales de compra/equipo del flujo de introducción.

## Cámara, amanecer y entrega

Preparar la aldea antes de retirar la carga; comprobar aparición con `villageWalkHeight`, modo exploración, caña guardada, altura suelo + `WALK.eye`, yaw/pitch coherentes. Candidato final (0,11), yaw 0, pitch 0, pendiente de revisión de encuadre. Proponer recorrido corto sobre el espacio central abierto, nunca dentro de casas/pozo/bancos, con posición y objetivo interpolados mediante curvas suaves y orientación sin saltos angulares. Las coordenadas definitivas se validarán en C con la geometría visible, no se consideran aceptadas en A.

Secuencia propuesta: 0–2 s establecimiento y aparición de ALBA; 2–9 s desplazamiento lento con la frase; 9–12 s convergencia a ojos del jugador y retirada gradual del overlay. Usar el amanecer existente de 06:24, sin forzar clima despejado ni sustituir Living Waters. Al saltar, convergencia breve y suave desde la pose actual; con movimiento reducido, ninguna traslación animada. La duración de salida forma parte del presupuesto nominal salvo salto anticipado.

Antes de devolver entrada, sincronizar posición del jugador, suelo, altura, yaw/pitch, modo y targets de cámara; anular velocidad/salto/inputs retenidos. El siguiente frame normal no debe corregir una pose distinta. Si cargar/validar la aldea falla, liberar recursos del overlay y volver al arranque compatible, sin borrar progreso ni dejar pantalla bloqueada.

## Entrada, accesibilidad y objetivo

Mientras presenta, bloquear movimiento, ambos joysticks, pesca, cambio de modo, mapa, interacciones y menús que compitan; conservar salto de introducción y preferencias de audio. Enrutar Espacio/Escape sólo a finalizar, consumiendo repetición de tecla y click compatible táctil. Mantener bloqueo hasta liberar la tecla/dedo que saltó, para impedir salto físico, lanzamiento o diálogo accidental. Blur/visibility/cancel limpian pulsaciones. No solicitar Pointer Lock ni audio al cargar; un gesto válido puede usar el desbloqueo sonoro existente respetando mute.

Botón HTML «Saltar introducción», foco visible y ≥44 px, safe areas y buen contraste; título/frase en texto real, sin texto en texturas. Comprobar Tab/Enter/Espacio/Escape, lector de pantalla (anuncio una vez, no por frame), zoom de texto, vertical/horizontal y tablets. `prefers-reduced-motion: reduce` al iniciar o cambiar evita recorrido y oscilaciones: vista fija final, texto breve no bloqueante y control inmediato; no exigir esperar 12 s. Resize no reinicia reloj ni marcador.

Tras completar/saltar, «Explora la aldea» aparece sin modal y se desvanece tras unos 8 s visibles; no requiere visitar puntos, no da recompensas y no crea una misión persistente. No se vuelve a mostrar en sesiones posteriores. Manuel, Xosé, catálogo y sendero siguen usando exactamente sus condiciones existentes, sin desbloqueos.

## Coste gráfico, riesgos y alternativa descartada

Reutilizar Three.js y la escena cacheada; vectores/orientaciones preasignados y overlay CSS sin trabajo DOM por frame. Sin texturas, luces, partículas, pases o librerías adicionales. Medir por separado carga inicial rural (ahora adelantada al inicio) y ejecución estable con calidad/perfil iguales a v0.9.0. Presupuesto propuesto: mediana de frame estable ≤10% sobre base equivalente, sin acumulación de recursos tras finalizar y cinco viajes. Si la base no permite esa comparación, registrar límite y no certificar rendimiento móvil físico.

Descartados vídeo pregrabado, escena duplicada y reinicio general de guardados: coste/fragilidad innecesarios. Riesgos abiertos: encuadre real, carga rural en móviles, eventos de tecla al saltar, navegación asistiva y carrera de dos pestañas. Recuperación: omitir presentación y conservar el juego; no compensar fallos reseteando datos. Requieren validación en etapas posteriores y aprobación del presente plan.
