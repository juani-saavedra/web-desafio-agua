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

> ⚠️ **Parcialmente cubierto** por `docs/06-cobertura.md`: ese relevamiento sí
> tocó ADA, COMIREC y los portales de datos abiertos de Escobar y Tigre, pero
> desde el ángulo de "¿tienen sensores públicos?", no desde "¿ya existe un
> producto/dashboard que compita con el nuestro?". Sirve como insumo, pero la
> pregunta de competencia original (¿alguien ya integra estas fuentes en un
> producto de cara al usuario?) sigue sin responder para esos tres actores.

---

## Verificaciones técnicas pendientes

- [x] **`series_id` de las estaciones interiores faltantes**: Arroyo Toro
      (34847), Arroyo Martínez (3278), Arroyo Borches (2111), Carabelas
      (26206) — resuelto y doble-verificado en `docs/06-cobertura.md`.
      Sólo Arroyo Toro cae en la zona de foco (se agregó al dataset,
      discontinuada desde 2023); las otras tres quedan fuera.
- [x] **Ubicación de Arroyo Martínez**: confirmado **Entre Ríos** (Villa
      Paranacito), no Delta bonaerense — fuera del foco del proyecto.
- [x] **`series_id` de precipitación** en PN Ciervo de los Pantanos (5904):
      son 5 series, no una (horaria 31986, 3-horaria 31987, diaria 31985,
      intervalo nativo 31984, acumulada 31983) — ver `docs/02-estaciones.md`.
      Todavía no cargado en `estaciones.config.json`.
- [x] **Estaciones automáticas SINARAME**: ninguna dentro del bbox del
      proyecto (51 en el país, la más cercana a ~55 km). Las 51 están
      marcadas `public: false` en el catálogo del INA, así que el mecanismo
      de descarga real (¿login? ¿CSV manual?) sigue sin confirmar — no
      importa para esta zona, pero quedó ❓ como dato general.
- [x] **Red hidrológica nacional** (argentina.gob.ar / SSRH): confirmado que
      **no** tiene puntos en Escobar ni cuenca media/alta del Luján dentro
      del bbox del proyecto (265 estaciones nacionales, 0 en zona; las más
      cercanas están 15-40 km río arriba). Verificado vía el catálogo a5 del
      INA (red `alturas_bdhi`), no vía el portal — el portal es sólo un mapa
      interactivo, no expone un listado por fetch.
- [ ] **Frecuencia real de actualización del pronóstico**: la web del INA dice
      cada 3 h, el paper de CONAGUA 2025 dice cada 6 h. Afecta la frecuencia del
      cron.
- [ ] **API del SMN**: explorar `public-api-test.smn.gov.ar` y ver si hay
      endpoint estable de alertas y de estaciones automáticas.
- [ ] **Campo `automatica: false`** en estaciones que actualizan solas cada ~85
      min: ¿el campo está desactualizado o significa otra cosa?
- [ ] **Límite de cron en el plan gratuito de Vercel** (por si se decide usarlo
      en vez de Actions) — dejó de ser relevante en la práctica: la ingesta
      corre por GitHub Actions, no por cron de Vercel.
- [ ] **Reconquista–Canal Aliviador (Tigre)**: existe el proyecto SIMPARH
      (ADA-PBA + COMIREC, 15 estaciones automáticas + centro en San
      Fernando) pero sin portal de datos públicos encontrado, y con fechas
      contradictorias entre fuentes (una dice terminado en feb-2026, ya
      pasado). Alguien tiene que llamar a ADA/COMIREC para confirmar si ya
      está operativo — ver `docs/06-cobertura.md` nota².
- [ ] **Puntos `lujan_api` cerca de Escobar** (Puente Ruta Nac. 9, Puente
      Granadero Gelves): marcados `public: false` en el catálogo del INA —
      falta probar si eso bloquea la lectura de datos o es sólo metadata
      (ver `docs/06-cobertura.md` nota¹).
- [x] **Pipeline de deploy**: confirmado en producción que el push de
      `ingesta-bot` dispara el auto-deploy de Vercel solo, sin intervención
      manual (probado con `gh workflow run` + verificado el deployment
      resultante por API). No hay riesgo de loop: el workflow de ingesta
      sólo corre por `schedule`/`workflow_dispatch`, nunca por `push`.

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
