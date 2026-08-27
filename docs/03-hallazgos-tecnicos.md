# Hallazgos técnicos

Todo lo de acá está medido sobre datos reales, salvo lo marcado como pendiente.

---

## 1. Los ceros hidrométricos son distintos por estación ⚠️ crítico

Cada estación mide desde su propio cero de escala. **Comparar lecturas crudas de
dos estaciones es directamente incorrecto.**

Conversión:

```
cota_IGN = lectura_escala + cero_ign
```

El campo `cero_ign` viene en la respuesta de la estación en la API a5.

Valores conocidos:

| Estación | `cero_ign` |
|---|---|
| San Fernando | -0.530 |
| Arroyo Carapachay | -1.459 |
| Nueva Palmira | +0.0275 |
| Tigre (del PDF de ceros) | -0.01 |
| Campana (del PDF de ceros) | +0.42 |

Diferencia San Fernando vs Carapachay: **0,929 m**. Sin corregir, el error es de
casi un metro.

**Validación:** tras convertir ambas series a cota IGN sobre un mes de datos, la
diferencia media entre estaciones fue de **6,6 cm** (sobre un rango de más de
2,5 m). El `cero_ign` de la API es confiable.

Metodología de respaldo: informe "Ceros Hidrométricos" del Proyecto Delta del
INA. La campaña cubrió Tigre, Zárate, Campana, Baradero, San Pedro, Rosario,
Paraná, Ibicuy — **no** San Fernando ni Carapachay, cuyos valores salen de la
API.

---

## 2. Desfasaje y atenuación costa → interior ✅ medido

Análisis sobre **760 observaciones cruzadas** (15/07 al 15/08 de 2026),
San Fernando → Arroyo Carapachay:

| Métrica | Valor |
|---|---|
| **Desfasaje** | **2 horas** (r = 0.9713) |
| Correlación a 1 h | 0.9463 |
| Correlación a 3 h | 0.9398 |
| Correlación a 0 h | 0.8683 |
| Amplitud diaria media San Fernando | 1.05 m |
| Amplitud diaria media Carapachay | 0.81 m |
| **Atenuación** | **~0.77** |

Modelo de propagación de primer orden resultante:

```
cota_carapachay(t) ≈ media + 0.77 × ( cota_sanfernando(t − 2h) − media )
```

**Asimetría relevante:** el signo de la diferencia de cota IGN se invierte con la
marea. En pleamar el arroyo está ~8-13 cm *por debajo* de la costa (el agua
todavía está entrando); en bajamar está 17-38 cm *por encima* (el interior no
drena del todo). Es física real, no ruido.

> Frase para el pitch: *"En bajante, la costa te dice que está bajísimo y en tu
> arroyo todavía hay 30 o 40 centímetros más."*

---

## 3. Latencia y huecos de ingesta ⚠️ afecta el diseño

Comparando `timestart` (momento medido) con `timeupdate` (momento en que se
cargó el dato):

- **Latencia típica: ~1 hora.** El dato de las 15:45 aparece recién a las 16:44.
- **Huecos de carga:** se detectaron tramos de hasta **6 horas sin datos**,
  cargados después todos juntos en bloque (mismo `timeupdate` para seis
  observaciones).
- Frecuencia media: ~17 observaciones por día (≈ una cada 85 min), tanto en
  San Fernando como en Carapachay.

**Consecuencia de diseño:** el sistema **tiene que detectar dato viejo** y
decirlo explícitamente, en vez de mostrar el último valor conocido como si fuera
actual. Un estado "dato demorado / sin dato" es requisito, no adorno.

**Consecuencia sobre la anticipación real** usando sólo observaciones:

```
15:45  ocurre el nivel en San Fernando
16:44  recién se publica
17:45  ese nivel llega al Carapachay
```

→ **1 hora de anticipación efectiva.** Insuficiente. Por eso el pronóstico no es
un extra, es un requisito.

---

## 4. El pronóstico oficial: qué es y qué no cubre ✅ verificado

Sistema **HIDRO-DELTA** (INA) + **SMARA** (SHN). Fuente: Guizzardi, Bianchi y
Sabarots Gerbec, CONAGUA 2025.

| Característica | Valor |
|---|---|
| Modelo 1D | HIDRO-DELTA, implementado en HEC-RAS |
| Discretización temporal | 30 minutos |
| **Discretización espacial** | **5 km** |
| Condiciones de borde | 13 (caudales aguas arriba + niveles del frente) |
| Modelo 2D del estuario | SMARA (SHN), simula mareas y sudestadas |
| Horizonte | 4 días |
| Actualización | cada 6 h (paper) / cada 3 h (web del INA) ❓ discrepancia |
| Tiempo de cómputo | < 2 minutos |
| Publicación | API web |

**Los 5 km de resolución espacial confirman el hueco**: un arroyo de decenas de
metros de ancho es invisible para el modelo. Ya no es inferencia, es
especificación publicada.

**Forzantes que NO incluye:** lluvia local sobre la cuenca. Sólo caudal aguas
arriba, niveles del frente y pronóstico de viento.

### Precedente que valida el enfoque empírico

El propio INA, antes de usar la salida de SMARA, la corrige con una **regresión
lineal múltiple sobre los últimos 60 días de datos observados** en San Fernando
y Nueva Palmira, recalculada en cada corrida.

> Es la misma familia de método que la corrección empírica costa→interior. Si
> alguien cuestiona el rigor del enfoque, la respuesta es que el INA lo usa en
> producción.

### Desempeño: peor justo donde vamos a trabajar

| Estación | NSE @6h | NSE @96h | Sesgo |
|---|---|---|---|
| Rosario | 0.99 | 0.98 | ~0 |
| Villa Constitución | 0.98 | 0.96 | leve + |
| Brazo Largo | 0.93 | 0.79 | negativo |
| **Atucha** | 0.93 | 0.81 | negativo |

MAE entre 0.07 y 0.17 m; errores dentro de ±0.25 m.

El paper atribuye la degradación a la **incertidumbre del viento**, que pesa más
cerca del estuario. Traducido: en la zona del frente del Delta y del Luján el
pronóstico oficial es menos confiable y **tiende a subestimar**.

### Bandas de incertidumbre disponibles ✅

El JSON del pronóstico trae cinco curvas: `main`, `p05`, `p25`, `p75`, `p95`.

Responde directamente a uno de los "aprendizajes comunes" del equipo: *la
incertidumbre debe hacerse visible*. **Ya está publicada** — sólo hay que
mostrarla.

---

## 5. Riesgo abierto: el foco en cuenca media cambia la física ⚠️

**Todo el análisis anterior es sobre un sistema mareal**: el agua entra desde el
estuario, con desfasaje y atenuación. Aplica al Delta y al tramo inferior del
Luján.

**La cuenca media es un sistema pluvial**: el agua baja de la lluvia sobre la
cuenca. Es otra física, otros tiempos, otras variables.

Y peor: los arroyos de la cuenca media de Escobar **no tienen estación
hidrométrica pública** (ver `02-estaciones.md`). Sin serie histórica no hay nada
que calibrar.

> ✅ **Esto dejó de ser una inferencia.** `docs/06-cobertura.md` lo confirmó
> contra el catálogo completo del INA a5 (4.680 estaciones, todas las redes)
> y los portales de datos abiertos de Escobar y Tigre: A° Escobar–Pinazo/
> Burgueño, Tajamar, Tatán, Garín y (en Tigre) A° Claro no tienen sensor
> público en ninguna fuente relevada.

**Implicancias:**

1. El dato de **lluvia local** pasa de "sería lindo tenerlo" a requisito
   estructural. Sin él, en cuenca media no hay sistema posible.
2. Los pluviómetros de la UNLu son el **camino crítico** del proyecto — y no
   dependen de Juan.
3. Lo transferible del trabajo previo es el **método** (normalización de datum,
   estimación de un punto no medido desde estaciones cercanas, detección de dato
   viejo), no el modelo mareal específico.

### Respaldo académico del método

Seo et al. (2022), *Weather and Forecasting* 37, "Expanding and Enhancing
Streamflow Prediction Capability of the National Water Model Using Real-Time
Low-Cost Stage Measurements".

Sensores de nivel de bajo costo para llenar huecos del modelo nacional de EEUU.
Hallazgo central: **el beneficio es mayor en cuencas menores a 1.000 km²** —
justo la escala de los arroyos. También dedican media metodología a corregir la
geometría del canal, porque un error ahí arruina la estimación: el mismo
problema que resuelve `cero_ign`.

---

## 6. Antecedentes internacionales relevantes

| País | Proyecto | Qué aporta al diseño |
|---|---|---|
| Países Bajos | Delft-FEWS | Integrar fuentes heterogéneas y expresar resultados con márgenes de incertidumbre |
| EEUU | National Water Model | Estimar puntos no medidos usando estaciones cercanas y calibración local |
| Indonesia | PetaBencana | Reportes comunitarios validando el impacto local en mapa público |
| Vietnam | Gestión de riesgo Can Tho | Elegir puntos de sensor por criticidad, no por distancia |
| Bangladesh | Flood Forecasting and Warning Centre | Conectar el modelo con alertas comprensibles y acciones preventivas |
