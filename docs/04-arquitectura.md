# Arquitectura y stack

---

## Principio rector

**El producto es el dataset.** La web es la evidencia de que existe y está vivo.
El bot es la evidencia de que se convierte en acción.

Todo lo que se construya tiene que dejar el dataset expuesto y consumible por
terceros. Si eso se cumple, una app futura es sólo otro cliente.

---

## Stack elegido

| Capa | Elección | Por qué |
|---|---|---|
| Framework | **Next.js** | Ya conocido (digital garden), App Router, API routes |
| Hosting | **Vercel** | Deploy directo desde git, gratis |
| Mapa | **React-Leaflet** + OpenStreetMap | Open source, sin token, sin costo |
| Ingesta | **GitHub Actions (cron)** | Ver abajo |
| Almacenamiento | JSON versionado en el repo | Simple, gratis, histórico gratis |
| Alertas | **Telegram Bot API** | Ver abajo |

MapLibre es más potente que Leaflet, pero para marcadores y polígonos coloreados
no hace falta.

---

## Patrón de datos: desacoplar ingesta de presentación ⚠️ importante

> ✅ **Implementado, con una diferencia respecto al plan de acá abajo**: en
> vez de `fetch` a `raw.githubusercontent.com` con `revalidate`, la app lee
> `data/latest.json` del filesystem en build time (queda estática) y confía
> en que cada push de la ingesta dispara un rebuild completo en Vercel. El
> principio (no pegarle a la API del INA desde el frontend) se cumple igual.
> Detalle real en `CLAUDE.md`, sección "Patrón de datos".

**No hacer fetch a las APIs externas desde el frontend.**

Motivos:
- En una demo con diez personas mirando, se le pegan diez consultas al INA.
- Si el INA está caído, la web se rompe en vivo.
- No hay control sobre latencia ni sobre rate limits.

Patrón correcto:

```
GitHub Actions (cron, cada 1h)
   ├── consulta API a5 del INA (observaciones + pronóstico)
   ├── consulta SMN (alertas + estaciones automáticas)
   ├── normaliza (cota IGN, timezone, calidad del dato)
   └── escribe JSON en el repo

Next.js
   └── lee el JSON → siempre rápido, siempre disponible
```

**Por qué GitHub Actions y no el cron de Vercel:** en el plan gratuito de Vercel
la frecuencia de cron está limitada (verificar el límite vigente antes de
decidir). Actions permite correr cada pocos minutos sin costo, y además deja el
histórico versionado en git — gratis, y sirve para el análisis posterior.

---

## Portabilidad ⚠️

El Notion dice que la plataforma la alojaría **la UNDelta**.

→ Construir con Next.js estándar, **sin depender de features propietarias de
Vercel** (Edge Config, KV, Blob, etc.). Así el traspaso posterior es trivial.

---

## Estructura del dataset normalizado

Para cada estación, unificar en un esquema propio:

```jsonc
{
  "estacion_id": 52,
  "nombre": "San Fernando",
  "rio": "Luján",
  "red": "alturas_prefe",
  "coords": [-34.4333333333, -58.55],   // [lat, lon] para Leaflet
  "cero_ign": -0.53,
  "umbrales": {
    "alerta": 3.0,
    "evacuacion": 3.5,
    "aguas_bajas": 0.33,
    "fuente": "INA"          // o "calibrado_local" o null
  },
  "ultima_observacion": {
    "timestamp": "2026-08-24T15:45:00Z",
    "valor_escala": 1.21,
    "valor_ign": 0.68,        // valor_escala + cero_ign
    "timeupdate": "2026-08-24T16:43:52Z",
    "antiguedad_min": 62
  },
  "calidad": {
    "estado": "fresco",       // fresco | demorado | sin_dato
    "umbral_demorado_min": 180
  },
  "pronostico": {
    "disponible": true,
    "series_id": 26202,
    "cal_id": 432,
    "emitido": "2026-08-24T06:00:00Z",
    "horizonte_h": 96,
    "puntos": [ { "t": "...", "main": 1.98, "p05": 1.5, "p25": 1.7, "p75": 2.2, "p95": 2.4 } ]
  }
}
```

Campos innegociables: **`valor_ign`** (comparabilidad entre estaciones) y
**`calidad.estado`** (honestidad sobre la frescura del dato).

---

## Alertas: Telegram, no WhatsApp (para el prototipo)

**Por qué no WhatsApp:** la Cloud API de Meta no permite mensajes proactivos
libres. Fuera de la ventana de 24 h desde el último mensaje del usuario hacen
falta **plantillas aprobadas por Meta**, y en sandbox sólo se puede escribir a
números precargados. Para un sistema de alertas es un bloqueo real.

**Por qué Telegram:** Bot API gratis, mensajes proactivos sin restricción, sin
aprobación previa. Se puede tener alertas funcionando de verdad en una tarde.

**La contra, que hay que decir antes de que la digan:** en el Delta y el
conurbano la gente usa WhatsApp, no Telegram. Telegram demuestra que la cadena
funciona; no es el canal final. Migrar el canal después es la parte fácil.

### Dónde va la lógica

n8n con pocos nodos sirve para arrancar, **pero sólo para el tramo de envío**.

La lógica de "¿esto amerita alerta?" va en **código**, del lado de la web. Si
queda dentro de un flujo visual, no se versiona ni se testea, y es exactamente la
parte que va a cambiar más veces.

---

## Alcance de la primera versión

Una sola página:

1. ✅ **Mapa** con marcadores de las estaciones disponibles en Escobar–Tigre–San
   Fernando. Implementado — marcadores diferenciados por color según si la
   estación tiene pronóstico o no.
2. ✅ Por estación: último valor (en escala y en cota IGN), cuándo se actualizó,
   estado del dato, y si tiene pronóstico. Implementado — panel lateral al
   hacer click en un marcador.
3. ❌ **Panel lateral** con la alerta vigente del SMN para la zona (consumida, no
   construida). **No implementado todavía** — sigue en el plan, no se hizo en
   esta primera versión.
4. ✅ Para las estaciones con pronóstico: gráfico con la curva `main` y la banda
   p25–p75. Implementado con `recharts`.

Código en `app/` (Next.js, App Router). Ver `CLAUDE.md` para la estructura de
componentes.

Esto es el **inventario en vivo de fuentes** con forma de producto. Sirve a los
cuatro integrantes:

- A **Cyn** le muestra exactamente qué falta, para enfocar el relevamiento.
- A **Agus** le da la pregunta precisa para la UNLu: "estos son los puntos sin
  cobertura, ¿ustedes tienen pluviómetros acá?"
- A **Viki** le da algo concreto para mostrarle a Piñeiro.
- A **Juan** le cierra sus dos líneas de investigación del Notion.

**El semáforo se enciende después**, cuando se sepa de dónde sale el umbral. La
estructura ya lo soporta.

---

## Lo que NO hay que construir

- ❌ Mapa de alertas meteorológicas → ya lo hace el SMN, se consume.
- ❌ Semáforo de riesgo con umbrales inventados → sin umbral validado, es una
  afirmación falsa sobre seguridad de personas.
- ❌ App nativa → fuera de alcance para el demo day.
- ❌ Scraping de lo que ya tiene API → frágil e innecesario. Scraping sólo para
  lo que no tiene API (pluviómetros UNLu, datos municipales, avisos de Defensa
  Civil).

---

## Advertencia de responsabilidad ⚠️

El INA aclara explícitamente que los valores publicados **no constituyen un
pronóstico oficial** y que no se responsabiliza por su uso.

El producto **no puede presentarse como sistema de alerta de emergencia**. Es una
ayuda para decisiones cotidianas y un complemento informativo, no Defensa Civil.
Decirlo en la web y en el pitch, antes de que lo pregunten.
