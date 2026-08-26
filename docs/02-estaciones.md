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

| Estación | est_id | serie | Red | Estado | Pronóstico |
|---|---|---|---|---|---|
| Canal Seoane | 149 | 149 | ina_delta | RT | no |
| Miní - Ministerio | 8173 | 42282 | ina_delta | RT | no |
| Chaná Miní | 51 | 51 | alturas_prefe | NRT | no |
| Escobar | 42 | 42 | alturas_prefe | NRT | **sí** |
| Tigre | 49 | 49 | alturas_prefe | — | no |
| Dique Luján | 50 | 50 | — | — | no |
| San Isidro | 53 | 53 | alturas_prefe | NRT | no |
| Olivos | 54 | 54 | alturas_prefe | NRT | no |

Coordenadas conocidas:
- Tigre: -58.5779747237367, -34.4159316389634
- Dique Luján: -58.686115, -34.351576
- Escobar: -58.7333333333, -34.3

### Meteorológicas (red `sat2`)

**PN Ciervo de los Pantanos** — `estacion_id` 5904, todas RT:

| Variable | series_id |
|---|---|
| Presión barométrica | 37100 |
| Humedad relativa | 37099 |
| Dirección del viento | 37103 |
| Velocidad del viento | 37098 |
| Temperatura | 37102 |
| Precipitación | (pendiente) |

> **Viento y precipitación en tiempo real.** El viento es indicador adelantado
> en sudestada; la precipitación es la variable que falta para cuenca media.

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

## Pendiente de identificar ❓

De `https://www.ina.gob.ar/delta/index.php?seccion=9` figuran cinco estaciones
interiores más con `seriesId` propio, accesibles vía
`alerta.ina.gob.ar/pub/gui/datos&seriesId={id}&auto=true`:

- Arroyo Toro
- Arroyo Martínez (ojo: ~-33.658, bastante al norte — verificar si sigue siendo
  Delta bonaerense o ya es Entre Ríos)
- Arroyo Borches
- Canal Seoane (ya identificado, est. 149)
- Carabelas

**Falta mapear cada nombre a su `seriesId` y coordenadas.**

---

## Cursos prioritarios sin cobertura (del relevamiento del equipo)

Esto define dónde está la vacancia:

| Municipio | Curso | Prioridad | Sensor |
|---|---|---|---|
| Escobar | Arroyo Escobar–Pinazo/Burgueño | Muy alta | **No identificado** |
| Escobar | Arroyo Tajamar | Alta | **No identificado** |
| Escobar | Arroyo Tatán | Alta | **No identificado** |
| Escobar | Arroyo Garín | Media/alta | **No identificado** |
| Escobar | Río Luján | Muy alta | Parcial (Escobar, Dique Luján) |
| Tigre | Río Luján | Muy alta | Sí |
| Tigre | Arroyo Las Tunas | Muy alta | Sí, **privado** (Nordelta) |
| Tigre | Reconquista–Canal Aliviador | Muy alta | Parcial |
| Tigre | Arroyo Claro | Media | No identificado |
| San Fernando | Río Luján / frente | Muy alta | Sí |
| San Fernando | Paraná Miní | Alta | Sí (Chaná Miní) |
| San Fernando | Canal Seoane | Alta | Sí |

> Los arroyos de la **cuenca media de Escobar** —que es el foco acordado— son
> justamente los que **no tienen estación hidrométrica pública**.
