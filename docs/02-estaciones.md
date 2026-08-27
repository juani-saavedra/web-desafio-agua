# Inventario de estaciones

`obs` = disponibilidad de observaciones. **RT** = tiempo real, **NRT** = casi
tiempo real, **H** = sólo histórico.

---

## Estaciones verificadas ✅

### San Fernando — la más importante

| Campo | Valor |
|---|---|
| `estacion_id` | 52 |
| `series_id` (observación, var 2) | **52** |
| `series_id` (horaria, var 85) | 31605 |
| `series_id` (**pronóstico**) | **26202** (cal_id 432) |
| Red | `alturas_prefe` (Prefectura Naval) |
| Río | **LUJÁN** (¡no Paraná!) |
| Coordenadas | -58.55, -34.4333333333 |
| `cero_ign` | **-0.53** |
| `nivel_alerta` | **3.0 m** |
| `nivel_evacuacion` | **3.5 m** |
| `nivel_aguas_bajas` | 0.33 m |
| Serie desde | 2006-01-01 (~127.800 obs) |
| Estado | RT + pronóstico |

> Está sobre el **río Luján**, cerca de su desembocadura. Nombrarla como
> "San Fernando (desembocadura del río Luján)", no genéricamente "la costa".

### Arroyo Carapachay

| Campo | Valor |
|---|---|
| `estacion_id` | 1698 |
| `series_id` (var 2) | **3279** |
| `series_id` (media diaria, var 39) | 26388 |
| Red | `ina_delta` |
| Coordenadas | -58.633833, -34.356202 |
| `cero_ign` | **-1.459** |
| `nivel_alerta` | **null** ⚠️ |
| Serie desde | 2018-07-11 (~50.100 obs) |
| Estado | RT, **sin pronóstico** |

> El `nivel_alerta: null` es un hallazgo, no un dato faltante: **para el
> habitante interior no existe umbral oficial de alerta.**

### Otras del INA en la zona

| Estación | est_id | serie | Red | Estado | Pronóstico | `cero_ign` | Coords (lon, lat) |
|---|---|---|---|---|---|---|---|
| Canal Seoane | 149 | 149 | ina_delta | RT | no | **-1.047** ✅ | -58.638, -34.167 |
| Miní - Ministerio | 8173 | 42282 | ina_delta | RT | no | **-0.55** ✅ | -58.5796, -34.1238 |
| Chaná Miní | 51 | 51 | alturas_prefe | NRT | no | — | — |
| Escobar | 42 | 42 | alturas_prefe | NRT | **sí** | `null` ✅ verificado — ninguna de sus 17 series tiene `cero_ign` en el INA | -58.7333333333, -34.3 |
| Tigre | 49 | 49 | alturas_prefe | — | no | — | -58.5779747237367, -34.4159316389634 |
| Dique Luján | 50 | 50 | — | — | no | — | -58.686115, -34.351576 |
| San Isidro | 53 | 53 | alturas_prefe | NRT | no | — | — |
| Olivos | 54 | 54 | alturas_prefe | NRT | no | — | — |

`cero_ign` y coords de Canal Seoane y Miní - Ministerio, resueltos y
verificados en `docs/06-cobertura.md`, ya están cargados en
`estaciones.config.json` — antes tenían ambos campos en `null` y por eso no
aparecían en el mapa.

### Arroyo Toro — nueva, agregada al dataset ⚠️ discontinuada

| Campo | Valor |
|---|---|
| `estacion_id` | 6831 |
| `series_id` (altura, var 2) | **34847** |
| Red | `ina_delta` |
| Río | Arroyo Toro |
| Municipio | Tigre (Primera Sección de Islas) — cae dentro del foco del proyecto |
| Coordenadas (lon, lat) | -58.596, -34.3225 |
| `cero_ign` | **-0.266** |
| Serie | 2023-06-26 a 2023-12-30 (3.675 obs) |
| Estado | **no reporta desde fines de 2023** — cobertura histórica, no viva |

> No estaba identificada en el proyecto hasta `docs/06-cobertura.md`. Se
> agregó a `estaciones.config.json` igual: la ingesta la muestra
> correctamente con `calidad.estado: "sin_dato"` (regla 2 de `CLAUDE.md`) en
> vez de mostrar el último valor de 2023 como si fuera actual.

### Meteorológicas (red `sat2`)

**PN Ciervo de los Pantanos** — `estacion_id` 5904, todas RT:

| Variable | series_id |
|---|---|
| Presión barométrica | 37100 |
| Humedad relativa | 37099 |
| Dirección del viento | 37103 |
| Velocidad del viento | 37098 |
| Temperatura | 37102 |
| Precipitación horaria | **31986** ✅ |
| Precipitación 3-horaria | 31987 |
| Precipitación diaria (corte 12Z) | 31985 |
| Precipitación, intervalo nativo | 31984 |
| Precipitación acumulada | 31983 |

> **Viento y precipitación en tiempo real.** El viento es indicador adelantado
> en sudestada; la precipitación es la variable que falta para cuenca media.
> Resuelto en `docs/06-cobertura.md` — son 5 series distintas, no una; la
> más directa para el dataset es la horaria (31986). Todavía no está cargada
> en `estaciones.config.json` (`meteorologicas[0].series.precipitacion` sigue
> en `null`) — queda para cuando se decida sumarla a la ingesta.

**A° Medrano Reser. - Tecnópolis** — `estacion_id` 7237: series 38753 (altura
4-horaria, RT), 36837 (RT), 38226 (media diaria, NRT). Urbano, CABA — poco
relevante.

---

## Estaciones con pronóstico a 4 días (lista oficial completa)

Rosario, Villa Constitución, San Nicolás, Lima, Zárate, Campana, **Escobar**,
**San Fernando**, Nueva Palmira.

Series conocidas: San Nicolás 36, Ramallo 37, San Fernando 52,
Nueva Palmira 3280, Paraná-Rosario 29435, Paraná-Villa Constitución 29436,
Paraná Las Palmas-Zárate 29437.

> **Ninguna es interior.** Todas son frente del Delta o grandes ríos. Este es el
> hallazgo central del proyecto.

---

## Las 5 interiores de `seccion=9` — ✅ resueltas (`docs/06-cobertura.md`)

Las que figuraban en `https://www.ina.gob.ar/delta/index.php?seccion=9` sin
`seriesId` mapeado. Doble verificadas (catálogo `series?var_id=2` del INA +
la propia página de `seccion=9`, coinciden exacto):

| Nombre | `series_id` | Ubicación | ¿En el foco (Escobar/Tigre/SF)? |
|---|---|---|---|
| Arroyo Toro | 34847 | Tigre, Primera Sección de Islas | **Sí** — agregada al dataset (ver arriba; discontinuada desde 2023) |
| Canal Seoane | 149 | San Fernando | Sí — ya estaba, ahora con `cero_ign` |
| Arroyo Martínez | 3278 | **Villa Paranacito, Entre Ríos** | **No** — confirmado fuera de la zona de foco, no es Delta bonaerense |
| Arroyo Borches | 2111 | ~34 km al norte del bbox del proyecto, límite Zárate/Baradero | No |
| Carabelas | 26206 | Misma zona norte que Borches | No |

Arroyo Martínez, Borches y Carabelas quedan fuera de alcance del proyecto —
no hace falta agregarlos a `estaciones.config.json`.

---

## Cursos prioritarios sin cobertura — ✅ confirmado con evidencia

Actualizado con el relevamiento exhaustivo de `docs/06-cobertura.md`
(catálogo completo del INA — 4.680 estaciones, todas las redes — + portales
municipales de Escobar y Tigre + ADA/COMIREC). Ya no quedan "No
identificado": todo es SÍ / NO / PARCIAL con evidencia.

| Municipio | Curso | Prioridad | Sensor | Evidencia |
|---|---|---|---|---|
| Escobar | Arroyo Escobar–Pinazo/Burgueño | Muy alta | **NO** — confirmado | Catálogo INA completo + `datos.escobar.gob.ar` |
| Escobar | Arroyo Tajamar | Alta | **NO** — confirmado | Ídem |
| Escobar | Arroyo Tatán | Alta | **NO** — confirmado | Ídem |
| Escobar | Arroyo Garín | Media/alta | **NO** — confirmado | Ídem |
| Escobar | Río Luján | Muy alta | Parcial — sensor sí (Escobar, Dique Luján), sin `cero_ign` en Escobar | `docs/06-cobertura.md` nota¹ (dos puntos `lujan_api` cercanos con `public: false`, sin resolver si bloquean lectura) |
| Tigre | Río Luján | Muy alta | Sí | est. 49 |
| Tigre | Arroyo Las Tunas | Muy alta | Sí, **privado** (Nordelta) — confirmado ausente de toda fuente pública | Catálogo INA completo |
| Tigre | Arroyo Toro | *(no estaba en esta tabla)* | Sí, pero **discontinuada desde 2023** | Ver sección de arriba |
| Tigre | Reconquista–Canal Aliviador | Muy alta | Parcial / en construcción — proyecto SIMPARH (ADA-PBA + COMIREC, 15 estaciones + centro en San Fernando), **sin portal de datos públicos identificado** | `docs/06-cobertura.md` — ❓ falta confirmar si ya está operativo |
| Tigre | Arroyo Claro | Media | **NO** — confirmado | Catálogo INA completo + `datosabiertos.tigre.gob.ar` |
| San Fernando | Río Luján / frente | Muy alta | Sí | est. 52 |
| San Fernando | Paraná Miní | Alta | Sí | est. 8173, ahora con `cero_ign` |
| San Fernando | Canal Seoane | Alta | Sí | est. 149, ahora con `cero_ign` |

> Los arroyos de la **cuenca media de Escobar** —que es el foco acordado— son
> justamente los que **no tienen estación hidrométrica pública**. Esto ya no
> es una suposición del equipo: está verificado contra el catálogo completo
> del INA y contra los portales de datos abiertos de ambos municipios.
