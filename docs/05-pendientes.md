# Pendientes, preguntas abiertas y riesgos

---

## Bloqueantes reales

### 1. Pluviómetros de la UNLu ❓ camino crítico

**No depende de Juan.** Lo averigua Agus.

Sin dato de lluvia local, en cuenca media **no hay sistema posible** — porque ahí
el régimen es pluvial, no mareal, y los arroyos no tienen estación hidrométrica.

Preguntas concretas a hacer:
- ¿Cuántos pluviómetros, dónde están exactamente?
- ¿Qué frecuencia de registro y qué latencia de publicación?
- ¿Hay API, o hay que scrapear / pedir export manual?
- ¿Desde cuándo hay serie histórica?
- ¿Se pueden usar y republicar?

### 2. Permiso de uso de datos del INA ❓

Contradicción sin resolver: el catálogo de redes marca `ina_delta` como
`public: true`, pero el objeto embebido en la estación dice `public: false`.

**Mail a `alerta@ina.gob.ar`** preguntando:
1. ¿Los datos de la red `ina_delta` son de uso público?
2. ¿Qué atribución hay que incluir?
3. ¿Hay límites de frecuencia de consulta? (el plan es ~1 vez por hora)
4. ¿El pronóstico de 15 días (`modelo_delta_15D_corregido`) está operativo?

La respuesta puede tardar días. **Mandarlo ya.**

---

## Tarea explícita pedida por Agustina, todavía sin hacer

> "Buscá las que ya existen. Fijate que hay varias que levantan datos de INA, SMN
> y SHN."

**Análisis de competencia.** Va antes de escribir código: si en el demo day
alguien dice "esto ya lo hace tal", hay que tener la respuesta lista.

Lo relevado hasta ahora:

| Producto | Qué hace | Diferencia con lo nuestro |
|---|---|---|
| **DeltaLevels** | App, muestra altura del río con alertas por umbral | Muestra el número; no localiza ni integra lluvia |
| **molol.com** | Web, altura del río + alerta por nivel seteado | Ídem |
| **Mapa de alertas SMN** | Semáforo meteorológico oficial | Agrupa 5 municipios en un color; es meteorológico, no hidrológico |
| **Dashboard Delta del INA** | Panel institucional | Cerrado con login, para técnicos |
| **Anticipando la Crecida (CIMA/UBA)** | Monitoreo comunitario con escuelas | Ya cubre Carapachay y Canal 8 — **no duplicar** |

Falta chequear: ADA (Autoridad del Agua PBA), COMIREC, apps municipales de
Escobar y Tigre, Tiempo y Radar.

---

## Verificaciones técnicas pendientes

- [ ] **Frecuencia real de actualización del pronóstico**: la web del INA dice
      cada 3 h, el paper de CONAGUA 2025 dice cada 6 h. Afecta la frecuencia del
      cron.
- [ ] **`series_id` de las estaciones interiores faltantes**: Arroyo Toro,
      Arroyo Martínez, Arroyo Borches, Carabelas.
- [ ] **Ubicación de Arroyo Martínez** (~-33.658): ¿sigue siendo Delta
      bonaerense o ya es Entre Ríos?
- [ ] **`series_id` de precipitación** en PN Ciervo de los Pantanos (5904).
- [ ] **API del SMN**: explorar `public-api-test.smn.gov.ar` y ver si hay
      endpoint estable de alertas y de estaciones automáticas.
- [ ] **Estaciones automáticas SINARAME**: cómo se descargan desde el SNIH y si
      hay alguna en la zona de interés.
- [ ] **Red hidrológica nacional** (argentina.gob.ar): ¿tiene puntos en Escobar
      o cuenca alta del Luján?
- [ ] **Campo `automatica: false`** en estaciones que actualizan solas cada ~85
      min: ¿el campo está desactualizado o significa otra cosa?
- [ ] **Límite de cron en el plan gratuito de Vercel** (por si se decide usarlo
      en vez de Actions).

---

## Preguntas de diseño sin responder

### ¿De dónde sale el umbral de alerta?

Es la pregunta central sin resolver. Carapachay tiene `nivel_alerta: null`, y los
arroyos de Escobar no tienen ni estación.

Idea propuesta (sin validar con nadie del dominio): **calibración por observación
en lugar de medición**. El usuario reporta "hoy el agua me llegó al borde del
muelle"; el sistema mira cuánto marcaba la estación en ese momento y aprende su
umbral. Sin agrimensor, sin que el usuario entienda de hidrometría.

Alguien con background en hidrología tiene que decir si eso se sostiene o si la
propagación por los arroyos lo rompe.

### ¿Quién es el usuario y qué decide?

Sigue abierto en el Notion. No es lo mismo un panel interno de validación que
algo para un vecino de Garín o para Defensa Civil. Depende de las entrevistas de
Cyn, Viki y Agus.

### ¿Cuánta anticipación necesita cada actor?

La tabla del Notion lo plantea: qué puede hacer cada actor con 1, 2, 6 y 24 horas
de aviso. Sin esa respuesta no se sabe si el horizonte de 4 días es útil o
excesivo.

---

## Riesgos del proyecto

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Los pluviómetros de UNLu no existen o no son accesibles | Alto — sin lluvia local no hay sistema en cuenca media | Plan B: volver al tramo inferior del Luján, donde sí hay estaciones |
| El INA niega el uso público de `ina_delta` | Alto | Mail temprano; plan B con `alturas_prefe` que es Prefectura |
| Se define un umbral sin base y alguien lo toma como alerta real | **Muy alto** | No encender el semáforo hasta tener umbral validado; disclaimer explícito |
| El equipo pide app además de web | Medio | Comunicar el alcance esta semana, no la próxima |
| Dependencia de una API externa que se cae en la demo | Medio | Patrón de ingesta desacoplada (ver `04-arquitectura.md`) |

---

## Frases listas para el pitch

- *"El INA no mide el nivel futuro de San Fernando: lo calcula, combinando el
  caudal pronosticado del Paraná con la marea pronosticada del Río de la Plata.
  Ese modelo llega hasta el frente del Delta. De ahí hacia adentro, no hay nada
  oficial."*

- *"El modelo oficial tiene 5 kilómetros de resolución espacial. Un arroyo tiene
  decenas de metros. Por diseño, no los ve."*

- *"El semáforo del SMN cubre cinco municipios con un solo color. Nosotros
  queremos decir qué pasa en tu zona."*

- *"En bajante, la costa te dice que está bajísimo y en tu arroyo todavía hay 30
  o 40 centímetros más."*

- *"Para el habitante interior no existe umbral oficial de alerta. El campo viene
  vacío en la base del INA."*
