# Arquitectura del cliente

El documento HTML proporciona el canvas y los diálogos. `src/main.js` inicializa el juego, la escena, la entrada y el audio; restaura las capturas y proyecta los eventos de dominio al DOM. La simulación recibe tiempo y aleatoriedad inyectables. `FishingGame` posee el estado de la jornada, las capturas y la referencia al pez enganchado. `FishSchool` actualiza agentes individuales. `LakeWorld` consume esos datos y mantiene recursos GPU, cámara, caña y efectos. El intervalo se subdivide al simular; una pausa sigue permitiendo presentar la escena. Un delta superior a 250 ms pierde tiempo simulado.

El audio crea su contexto tras interacción. La vista reutiliza geometrías y materiales para peces y trofeos. El generador PMREM se libera tras inicializar; `GameControls.dispose` retira sus listeners. La vida normal de la escena coincide con la de la página. La estabilidad tras sesiones largas o recreaciones necesita medición.

El diario conserva `alba-catches-v1`, un array JSON con nombre, peso, longitud y fecha. La migración valida los campos mínimos, normaliza el señuelo y las condiciones antiguas y filtra registros inválidos. El récord desempata por longitud. `alba-equipment-v1` almacena el identificador de cebo; `alba-audio-v1` conserva la preferencia de sonido. La hora y el clima reinician con la sesión.

[Inventario de módulos y dependencias](MODULES.md) · [Matriz de requisitos](../quality/TRACEABILITY.md)

### Contexto

```mermaid
flowchart LR
 Jugador --> Navegador --> LagoSereno
 LagoSereno --> WebGL2
 LagoSereno --> WebAudio
 LagoSereno --> localStorage
 Pages --> Navegador
```

### Dependencias principales

```mermaid
flowchart TD
 main --> LakeWorld & GameControls & FishingGame & LakeAudio
 FishingGame --> FishSchool & Environment
 FishSchool --> lakeDepth & speciesResponse
 LakeWorld --> RodRig & EnvironmentalView & FishModels
```

### Fotograma

```mermaid
flowchart LR
 RAF --> delta[Delta limitado a 250 ms] --> Pausa
 Pausa -->|Activo| pasos[Pasos de hasta 1/60 s] --> mundo[Actualizar mundo]
 Pausa -->|Pausado| mundo
 mundo --> HUD --> RAF
```

### Pesca

```mermaid
stateDiagram-v2
 [*] --> ready
 ready --> charging
 charging --> casting
 charging --> ready: cancelar
 casting --> waiting: impacto
 waiting --> bite: ataque
 waiting --> ready: recuperar
 bite --> fighting: clavar
 bite --> ready: caduca ventana
 fighting --> ready: rotura o escape
 fighting --> caught: captura
 caught --> ready
```

### Pez individual, rutas principales

```mermaid
stateDiagram-v2
 swimming --> foraging
 foraging --> swimming
 swimming --> investigating
 foraging --> investigating
 investigating --> attacking
 investigating --> fleeing
 attacking --> resisting: clavado
 resisting --> recovering: liberación
 fleeing --> recovering
 recovering --> swimming
```

### Lanzamiento y captura

```mermaid
sequenceDiagram
 actor J as Jugador
 participant A as FishingActions
 participant G as FishingGame
 participant B as FishSchool
 participant U as main
 J->>A: Mantener y soltar
 A->>G: press y release
 G->>B: update con señuelo activo tras impacto
 B-->>G: atacante próximo
 J->>A: Clavar y recoger
 A->>G: press y release
 G-->>U: evento de captura
 U->>U: actualizar diario
```

### Entrada

```mermaid
flowchart LR
 PointerEvent --> GameControls
 KeyboardEvent --> GameControls
 GameControls --> FishingActions --> FishingGame
 GameControls -->|arrastrar| LakeWorld
 InputMode --> HUD
```

### Simulación y presentación

```mermaid
flowchart LR
 Environment --> FishSchool
 FishSchool --> agentes[Posición y conducta]
 agentes --> updateFishMotion --> FishModels
 FishingGame --> rodPose --> RodRig
```

### Clima

```mermaid
flowchart LR
 dt --> GameClock --> daylight
 dt --> WeatherSystem --> viento[Viento y lluvia]
 daylight --> WaterTemperature
 viento --> WaterTemperature
 WaterTemperature --> speciesResponse
 viento --> EnvironmentalView
```

### Persistencia

```mermaid
flowchart LR
 localStorage --> migrateCatches --> capturas
 capturas --> personalRecords
 capturas --> exportCatches --> CSV
 capturaNueva --> capturas --> localStorage
```

### Distribución

```mermaid
flowchart LR
 main[Push a main] --> build
 manual[workflow_dispatch] --> build
 build --> npmci[npm ci] --> Vite --> dist --> artifact[Artefacto de Pages] --> deploy
```
