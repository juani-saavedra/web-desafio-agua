# Cobertura hidrométrica — relevamiento de fuentes (Escobar / Tigre / San Fernando)

Relevamiento hecho el 2026-08-26. Objetivo: no es encontrar estaciones — es poder
afirmar **con evidencia** dónde no las hay. Cada fila "NO" de la Tabla 1 tiene
que poder rastrearse hasta la fuente donde se buscó y no apareció.

Estado: ✅ **verificado** con tool call real. ⚠️ **advertencia** — algo que hay
que decir antes de que lo pregunten. ❓ **pendiente** — no se pudo confirmar.

---

## Hallazgo metodológico previo (relevante para cualquiera que reuse esto)

`estacion_id` **no es** `series_id`. El catálogo `/a5/obs/puntual/estaciones`
lista estaciones, pero cada estación puede tener varias series (una por
variable — altura, caudal, media diaria, etc.), cada una con su propio
`series_id` en un espacio de numeración totalmente distinto. Consultar
`/a5/obs/puntual/series/{estacion_id}` como si fuera un `series_id` devuelve
**una estación distinta y equivocada** (lo confirmamos: `937` no es un punto
del río Luján, es "Yacyretá efluente"; `6831` no es Arroyo Toro, es "Río Chubut
en Valle Inferior"). El endpoint correcto para armar un catálogo geográfico es
la forma plural con filtro:

```
GET https://alerta.ina.gob.ar/a5/obs/puntual/series?var_id=2         # altura hidrométrica, todo el país
GET https://alerta.ina.gob.ar/a5/obs/puntual/series?var_id=1         # precipitación diaria, todo el país
GET https://alerta.ina.gob.ar/a5/obs/puntual/series?estacion_id={id} # todas las series de una estación
```

Cada uno devuelve **todas las filas en una sola respuesta, sin paginar**
(`is_last_page: true`), con `estacion.geom` embebido — se puede filtrar por
bounding box del lado del cliente sin depender de un parámetro de bbox no
documentado.

---

## Tabla 1 — Cobertura por curso de agua

Bounding box usado: lat -34.55 a -34.20, lon -59.00 a -58.40.

| Curso | Municipio | ¿Sensor? | Operador | ¿Público? | series_id | Coords | Evidencia (URL) |
|---|---|---|---|---|---|---|---|
| A° Escobar–Pinazo/Burgueño | Escobar | **NO** | — | — | — | — | Catálogo INA a5 completo (4680 estaciones) filtrado por bbox y por nombre ("pinazo", "burgueño") — 0 resultados: `alerta.ina.gob.ar/a5/obs/puntual/estaciones`. Cruzado con `datos.escobar.gob.ar` (dataset "Cursos de Agua del Partido de Escobar" — sólo geometría del curso, sin estaciones de medición) |
| A° Tajamar | Escobar | **NO** | — | — | — | — | Mismo catálogo INA a5, búsqueda "tajamar" — 0 resultados. `datos.escobar.gob.ar` — mismo dataset de geometría, sin sensores |
| A° Tatán | Escobar | **NO** | — | — | — | — | Catálogo INA a5, búsqueda "tatan"/"tatán" — único resultado es "Riacho Salado - Tatané" en Chaco (sin relación). `datos.escobar.gob.ar` — sin sensores |
| A° Garín | Escobar | **NO** | — | — | — | — | Catálogo INA a5, búsqueda "garin"/"garín" — 0 resultados en todo el país. `datos.escobar.gob.ar` — sin sensores |
| Río Luján | Escobar | **PARCIAL** | INA (red `alturas_prefe`, Prefectura) | Sí el sensor; **sin `cero_ign`** (no convertible a cota IGN) | 42 | -58.7333, -34.3 | `alerta.ina.gob.ar/a5/obs/puntual/series?estacion_id=42` — `cero_ign: null`. Además hay 2 puntos de nivel sobre el Luján muy cerca del límite de Escobar (Puente RN9, Puente Granadero Gelves — red `lujan_api`), pero con `public: false` en el catálogo — ver nota¹ |
| Río Luján | Tigre | **SÍ** | INA (Prefectura) | Sí | 49 | -58.578, -34.416 | `alerta.ina.gob.ar/a5/obs/puntual/series?estacion_id=49` — `cero_ign: -0.099`, 8.100 obs |
| A° Las Tunas | Tigre | **SÍ, privado** | Nordelta | **No** | — | — | Catálogo INA a5, búsqueda "tunas" — único resultado es "Las Tunas - Establecimiento San Antonio" en Santa Fe (sin relación). Confirma ausencia en fuentes públicas — consistente con telemetría privada de Nordelta |
| Reconquista–Canal Aliviador | Tigre | **PARCIAL / en construcción** | ADA-PBA, proyecto SIMPARH | Sin portal de datos públicos identificado — ❓ estado operativo sin confirmar | — | CeMRe en Estación de Bombeo Nº9, San Fernando | Catálogo INA a5: 0 estaciones "Reconquista" en bbox (las 13 que aparecen por nombre son en Santa Fe/Chaco). COMIREC `gba.gob.ar/comirec/la_cuenca` y `/obras_y_programas`: confirman proyecto SIMPARH (15 estaciones automáticas + 1 centro regional), **incluye explícitamente Tigre y San Fernando** entre los 11 municipios. ADA `riesgohidrico.ada.gba.gov.ar/inicio/puntos-de-monitoreo-de-riesgo-hidrico/`: página informativa, sin listado de puntos ni datos en vivo — ver nota² |
| A° Claro | Tigre | **NO** | — | — | — | — | Catálogo INA a5, búsqueda "claro" — sin resultados relevantes en la zona (matches son Brasil/otras cuencas). `datosabiertos.tigre.gob.ar?q=arroyo` (portal CKAN, 219 datasets totales) — 0 resultados |
| Río Luján / frente | San Fernando | **SÍ** | INA (Prefectura) | Sí | 52 | -58.55, -34.433 | `alerta.ina.gob.ar/a5/obs/puntual/series?estacion_id=52` — `cero_ign: -0.53`, 128.004 obs (la serie más larga de la zona) |
| Paraná Miní | San Fernando | **SÍ** | INA-INTA | Sí | 8173 | -58.5796, -34.1238 | `alerta.ina.gob.ar/a5/obs/puntual/series?estacion_id=8173` — `cero_ign: -0.55`, 4.074 obs. Existe una segunda estación llamada "Paraná Miní" (est. 1877, red `ina_delta`, sin `cero_ign`) apenas fuera del bbox estricto — no resuelta en detalle, ver nota³ |
| Canal Seoane | San Fernando | **SÍ** | INA | Sí | 149 | -58.638, -34.167 | `alerta.ina.gob.ar/a5/obs/puntual/series?estacion_id=149` — **corrección** ver nota⁴. También tiene serie de caudal (`series_id` 998) |
| *(no estaba en la lista original)* Arroyo Toro | Tigre (Primera Sección de Islas) | **SÍ** | INA-INTA | Sí | 34847 | -58.596, -34.3225 | Resuelta ahora: `alerta.ina.gob.ar/a5/obs/puntual/series?estacion_id=6831` (`cero_ign: -0.266`, 3.675 obs) + confirmado cruzando con `ina.gob.ar/delta/index.php?seccion=9` (mismo `seriesId`) |

**Notas:**

1. Los dos puntos `lujan_api` (`Puente Ruta Nac. 9`, `Puente Granadero Gelves`) están marcados `public: false` en el catálogo del INA — no confirmamos si eso bloquea la lectura de datos o es sólo metadata (ya hay un antecedente de esa misma inconsistencia documentado en `01-fuentes-datos.md` para la red `ina_delta`). Queda como ❓ pendiente probar si `series/{id}` devuelve datos igual.
2. Dos fuentes dan fechas distintas para SIMPARH: la nota de `gba.gob.ar/recursoshidricos` dice que se esperaba terminar en **febrero de 2026** (ya pasado a la fecha de este relevamiento); la propia página de COMIREC sólo confirma que la licitación se adjudicó el 2022-09-12, sin fecha de cierre. **No encontramos ningún portal de datos en vivo del SIMPARH** — alguien del equipo debería llamar a ADA/COMIREC para confirmar si ya está operativo y si publica datos públicamente.
3. La estación "Paraná Miní" (est. 1877) no apareció en el filtro estricto de bbox (lat -34.185, apenas 0.015° al norte del límite -34.20). No se le resolvió `series_id` de altura por falta de tiempo — queda ❓ pendiente.
4. **Corrección a `docs/02-estaciones.md` / `estaciones.config.json`**: Canal Seoane figura con `cero_ign: null`, pero el catálogo vivo del INA a5 (est. 149) devuelve `cero_ign: -1.047`. Es decir, **sí se puede convertir a cota IGN** y hoy el dataset la está mostrando como "Sin cota IGN" sin necesidad. No lo corregí en `estaciones.config.json` porque la consigna fue no tocar `02-estaciones.md` todavía — queda para que lo consolides a mano.

---

## Tabla 2 — Fuentes consultadas

| Fuente | URL | ¿Accesible? | ¿Encontró algo en la zona? | Notas |
|---|---|---|---|---|
| INA API a5 — catálogo de estaciones | `alerta.ina.gob.ar/a5/obs/puntual/estaciones` | ✅ Sí — 200, un solo request, 4.680 estaciones, todas las redes | Sí — 38 estaciones dentro del bbox estricto, en 12 redes distintas | El campo `id` es `estacion_id`, no `series_id` (ver hallazgo metodológico arriba) |
| INA API a5 — catálogo de series por variable | `alerta.ina.gob.ar/a5/obs/puntual/series?var_id=2` y `?var_id=1` | ✅ Sí — 200, sin paginar (1.131 series de altura, 932 de precipitación en todo el país) | Sí — permitió resolver `series_id` real + `cero_ign` de cada estación en zona | Es el endpoint correcto para armar el catálogo geográfico; no usar `series/{id}` a ciegas |
| INA — página Delta, sección 9 (las 5 interiores) | `ina.gob.ar/delta/index.php?seccion=9` | ✅ Sí | Sí — confirma Arroyo Toro (34847), Arroyo Martínez (3278), Arroyo Borches (2111), Canal Seoane (149), Carabelas (26206) | Coincide 100% con lo resuelto de forma independiente vía el catálogo de series — doble verificación |
| Precipitación en PN Ciervo de los Pantanos (5904) | `alerta.ina.gob.ar/a5/obs/puntual/series?estacion_id=5904` | ✅ Sí | Sí — 5 series de precipitación distintas: horaria (31986), 3-horaria (31987), diaria 12Z (31985), intervalo nativo (31984), acumulada (31983) | Resuelve por completo el pendiente de `02-estaciones.md`; propietario declarado: RHN |
| SINARAME / red `emas_sinarame` | Mismo catálogo INA a5 (`red.tabla_id = emas_sinarame`) | ✅ Sí (vía a5, no se buscó un portal SNIH/SINARAME separado) | **No** — 51 estaciones en el país, **todas** con `public: false`, ninguna dentro del bbox (la más cercana, Luján, a ~55 km) | No se pudo confirmar el mecanismo de descarga real (login/CSV) porque ninguna está marcada pública |
| Sistema Nacional de Información Hídrica (SNIH) | `snih.hidricosargentina.gob.ar` | ✅ Portal responde 200 | ❓ No verificado en detalle | Es el mismo backend que la red `alturas_bdhi` ("Red Hidrológica Nacional - SSRH") ya resuelta vía a5 — no se recorrió el portal completo por redundancia + tiempo |
| Red Hidrológica Nacional (SSRH) | `argentina.gob.ar/obras-publicas/hidricas/estaciones-de-la-red-hidrologica-nacional` | ⚠️ Accesible pero es sólo un mapa interactivo — el fetch de texto no devuelve el listado | **No** (cruzado vía a5: red `alturas_bdhi`, 265 estaciones nacionales, 0 en bbox estricto; las más cercanas —Puente Jáuregui, J.M. García— están 15-40 km río arriba del Luján) | La confirmación real vino del catálogo a5, no de esta página |
| ADA — Autoridad del Agua PBA | `ada.gba.gov.ar` · `riesgohidrico.ada.gba.gov.ar/inicio/puntos-de-monitoreo-de-riesgo-hidrico/` | ✅ Accesible | **Parcial** — página informativa, sin listado de puntos ni datos en vivo; sí confirma el proyecto SIMPARH (ver Tabla 1) | Sin acceso a datos, sólo descripción institucional |
| COMIREC — cuenca Reconquista | `gba.gob.ar/comirec/la_cuenca` · `/obras_y_programas` | ✅ Accesible | **Parcial** — confirma SIMPARH (15 EMA + CeMRe en San Fernando) pero sin telemetría propia publicada | Institucional; remite al mismo proyecto SIMPARH que ADA |
| Datos abiertos — Municipio de Escobar | `datos.escobar.gob.ar/datasets` (53 datasets, categoría "Riesgo Climático y Gestión de Emergencias") | ✅ Accesible (portal con datos cargados vía JS — hubo que abrirlo con navegador real, `curl` no alcanza) | **No** en tiempo real — hay "Cursos de Agua" (geometría estática), "Peligrosidad de Inundaciones" (mapa de ADA, no sensor), "Zonas de Anegamiento por Tormentas 2025" (satelital retrospectivo, no sensor en vivo) | Todo es capa GIS/satelital, ninguna es una estación telemétrica |
| Datos abiertos — Municipio de Tigre | `datosabiertos.tigre.gob.ar/dataset` (219 datasets, portal CKAN) | ✅ Accesible (igual, requirió navegador real) | **No** hidrométrico — hay 8 datasets de "Muestreo de Agua Superficial" 2019-2022 (calidad de agua, puntos georreferenciados), 0 para "arroyo"/"nivel" | Es monitoreo de **calidad** de agua (programa de cianobacterias), no de **nivel** |
| "Alerta Tigre" (municipal) | `tigre.gob.ar/seguridad/alerta_tigre` | ⚠️ Certificado SSL roto — falló con `WebFetch` y con `curl` sin `-k`; accesible con `curl -k` | **No aplica** | Es un sistema de botón de pánico escolar/seguridad, no un sistema hidrométrico — el nombre generaba una falsa pista |

---

## Resumen para consolidar en `02-estaciones.md`

- **Las 5 estaciones "pendientes de identificar" quedan resueltas**: Arroyo Toro (series 34847), Arroyo Martínez (series 3278 — confirmado en **Villa Paranacito, Entre Ríos**, fuera de la zona de foco), Arroyo Borches (series 2111, ~34 km al norte del bbox, límite Zárate/Baradero) y Carabelas (series 26206, misma zona norte) — ninguna de estas dos últimas cae en Escobar/Tigre/SF. Canal Seoane confirma su `cero_ign` real: **-1.047**, no `null`.
- **Nuevo hallazgo no buscado**: Arroyo Toro sí cae dentro de la zona (Primera Sección de Islas, Tigre) y tiene serie pública activa — no estaba en ningún documento previo del proyecto.
- **Confirmado que NO existe sensor público** para A° Escobar–Pinazo/Burgueño, A° Tajamar, A° Tatán, A° Garín y A° Claro, contra el catálogo completo del INA (4.680 estaciones, todas las redes) y los portales municipales de Escobar y Tigre.
