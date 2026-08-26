# Fuentes de datos — endpoints y cómo consumirlos

Estado: **verificado** = probado y devolvió datos. **Pendiente** = no confirmado.

---

## 1. INA — API a5 (principal) ✅ verificado

Base: `https://alerta.ina.gob.ar/a5`
Documentación: `https://alerta.ina.gob.ar/a5/apiUI`
Visualizador: `https://alerta.ina.gob.ar/a5/secciones`

**No requiere token** para los endpoints usados hasta ahora.

### Observaciones (niveles medidos)

JSON:
```
GET /a5/obs/puntual/series/{series_id}?timestart={ISO}&timeend={ISO}
```

CSV:
```
GET /a5/getObservaciones?tipo=puntual&series_id={id}&timestart={ISO}&timeend={ISO}&format=csv
```

**Trampas conocidas:**

- Sin `timestart` y `timeend` devuelve **sólo metadatos**, con
  `observaciones: []`. No es un error, es el catálogo de la serie.
- `/obs/puntual/series/{id}?format=csv` **no devuelve observaciones** — devuelve
  la fila del catálogo de series. Para CSV usar siempre `getObservaciones`.
- Formato de fecha: ISO 8601 con `Z` (UTC). Ej: `2026-08-15T00:00:00Z`.

Campos del CSV de observaciones:
`id, tipo, series_id, timestart, timeend, nombre, descripcion, unit_id, timeupdate, valor`

### Pronóstico (simulado) ✅ verificado

```
GET /a5/sim/calibrados/{cal_id}/corridas/last?series_id={id}&includeProno=true&group_by_qualifier=true
```

Ejemplo real (San Fernando):
```
https://alerta.ina.gob.ar/a5/sim/calibrados/432/corridas/last?series_id=26202&includeProno=true&group_by_qualifier=true
```

- `cal_id = 432` → modelo `modelo_delta_corregido`
- **`series_id` del pronóstico es DISTINTO al de la observación.** San Fernando:
  observación = `52`, pronóstico = `26202`.
- Devuelve **cinco curvas** por `qualifier`: `main`, `p05`, `p25`, `p75`, `p95`.
  Las cuatro percentiles son la banda de incertidumbre.
- Paso temporal: **1 hora**.
- Horizonte: **4 días**.
- Campo `forecast_date` = fecha/hora de emisión de la corrida.

Existe también un grupo `modelo_delta_15D_corregido` (horizonte 15 días) que en
las pruebas **devolvió vacío**. Pendiente confirmar si está operativo.

### Catálogos

Accesibles desde el menú **Catálogo** del visualizador: clases, estaciones,
áreas, escenas, variables, procedimientos, unidades, redes, fuentes ráster,
series puntuales, series areales, series ráster, observaciones, asociaciones.

Valores ya resueltos:

| Campo | Valor | Significado |
|---|---|---|
| `var_id` | 2 | Altura hidrométrica (la que se usa) |
| `var_id` | 33 | Altura media mensual |
| `var_id` | 39 | Altura media diaria |
| `var_id` | 49 | Altura mínima mensual |
| `var_id` | 50 | Altura máxima mensual |
| `var_id` | 85 | Altura horaria |
| `unit_id` | 11 | **metros** |
| `proc_id` | 1 | Medición directa |

Redes relevantes:

| tabla_id | id | Nombre |
|---|---|---|
| `ina_delta` | 32 | red INA Delta y AMBA |
| `alturas_prefe` | 10 | escalas Prefectura Nacional |
| `alturas_varios` | 17 | Otras redes hidrológicas |
| `puntos_FDelta` | 25 | puntos del frente del Delta |
| `sat2` | — | estaciones meteorológicas satelitales |

> ⚠️ Inconsistencia detectada: el catálogo de redes marca `ina_delta` como
> `public: true`, pero el objeto `red` embebido dentro de la respuesta de una
> estación dice `public: false`. **No afirmar públicamente que los datos son
> libres sin confirmarlo por mail con el INA.**

### Portal alternativo

```
https://alerta.ina.gob.ar/pub/gui/datos&seriesId={id}&auto=true
```
Interfaz pública distinta al visualizador a5, accede directo por `seriesId`.

### Páginas con login (sin acceso)

`/res/mapa`, `/res/gui`, `/dashboard_delta/login`, `/informes/login`

---

## 2. INA — páginas web ✅ verificado

- **Delta Paraná, datos y pronósticos:** `https://www.ina.gob.ar/delta/index.php?seccion=9`
- **Pronóstico a 4 días:** `https://www.ina.gob.ar/alerta/index.php?seccion=10`
  (tiene link de descarga JSON directo por estación)
- **Pronóstico a 15 días:** `https://alerta.ina.gob.ar/delta/index.php?seccion=13`
- **Informe de ceros hidrométricos (PDF, >30 MB):**
  `https://www.ina.gob.ar/delta/pdf/03_02_INA-DELTA_Info04_CerosHidrometricos.pdf`

Contacto: `alerta@ina.gob.ar`

---

## 3. SMN — Servicio Meteorológico Nacional ⚠️ parcialmente verificado

- **Datos abiertos:** `https://www.smn.gob.ar/descarga-de-datos`
  (bloquea bots; requiere navegador)
- **Alertas:** `https://www.smn.gob.ar/alertas`
- **Alertas por área:** `https://www.smn.gob.ar/alertas_area?loc=763`
- **Radar:** `https://www.smn.gob.ar/radar`
- **API en desarrollo (pendiente explorar):** `https://public-api-test.smn.gov.ar/radar`

### Hallazgo clave sobre las alertas del SMN

La zona de alerta agrupa **Escobar - San Fernando - San Isidro - Tigre - Vicente
López** en un **único polígono con un único color**.

Consecuencias:
1. El semáforo meteorológico **ya existe**: no hay que construirlo, hay que
   consumirlo.
2. Su granularidad es de cinco municipios juntos → **ahí está el aporte del
   equipo**: decir qué pasa en tu zona, no en cinco municipios.
3. Es una alerta **meteorológica** (va a llover), no **hidrológica** (el arroyo
   se va a desbordar).

Niveles: verde (tranquilidad), amarillo (informate), naranja (preparate), rojo
(seguí instrucciones oficiales).

### Red SINARAME (radares)

19 radares en total, 11 de ellos RMA fabricados por INVAP. Alcance de detección
de ecos de lluvia hasta 240 km. Incluye **53 estaciones meteorológicas
automáticas** que registran temperatura, humedad, presión, **precipitación** y
viento **cada 10 minutos**, descargables desde el SNIH.

> ⚠️ El propio SMN advierte que los radares de SINARAME están en período de
> validación, con anomalías esperables en continuidad y calidad, y que su
> interpretación requiere entrenamiento especializado. **No meter radar crudo en
> un sistema de alertas.** Las estaciones automáticas cada 10 min probablemente
> sean más útiles y más fáciles de consumir.

### Descartado

**Sensores remotos de humedad del suelo (SMAP):** resolución espacial 9 km,
temporal 3 días, actualización mensual con 4-5 días de latencia. **Inútil para
alerta temprana.** Sirve sólo para caracterizar estado antecedente de cuenca en
análisis retrospectivo.

---

## 4. Otras fuentes

- **Red hidrológica nacional:**
  `https://www.argentina.gob.ar/obras-publicas/hidricas/estaciones-de-la-red-hidrologica-nacional`
  (pendiente: chequear si tiene puntos en Escobar o cuenca alta del Luján)
- **COMIREC (cuenca Río Reconquista):** `https://www.gba.gob.ar/comirec/la_cuenca`
- **Mapa del Delta de Tigre:** `https://www.viatigre.com.ar/tigre/delta/mapa/`
- **UNLu pluviómetros:** ❓ pendiente — lo averigua Agus. **Camino crítico del
  proyecto.**
