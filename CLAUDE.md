# Desafío AGUA — instrucciones para Claude Code

Contexto completo en `docs/`. Leer `docs/README.md` primero, después los demás
archivos en orden numérico.

## Estado actual del repo

Ya existe la app Next.js (App Router) en la raíz, y la ingesta completa:

- `scripts/ingesta/index.mjs` consulta niveles de agua (API a5 del INA:
  observaciones + pronóstico donde hay `cal_id`) y pronóstico meteorológico
  (Open-Meteo, para las estaciones con `coords`), normaliza a cota IGN y
  `calidad.estado`, y escribe `data/latest.json`. Usa sólo módulos built-in
  de Node (`fs`, `path`) + `fetch` nativo — sin dependencias propias (el
  `package.json` de la raíz es el de la app Next.js, no de este script).
- El pronóstico del INA (`corridas/last`) sólo devuelve la última corrida —
  cada una que no se guarda se pierde. Por eso cada corrida se archiva
  completa (incluye ~2 semanas de historia de calibración, no sólo el
  horizonte futuro) en `data/pronosticos/{estacion_id}_{forecast_date}.json`.
  `data/latest.json` sólo expone los puntos desde `forecast_date` en
  adelante, para no inflar el archivo que se commitea cada hora.
- `.github/workflows/ingesta.yml` corre ese script cada hora (`cron: '17 * * * *'`,
  UTC) y commitea `data/` si cambió. El commit lo hace `ingesta-bot`, con
  `[skip ci]`. **No edites `data/latest.json` a mano** — es el output del
  script, se sobreescribe en la próxima corrida. Probado en producción: el
  push del bot dispara el auto-deploy de Vercel solo (confirmado con un
  `workflow_dispatch` manual — ver `docs/05-pendientes.md` si hace falta
  repetir la prueba).
- `scripts/ingesta/estaciones.config.json` es la fuente de verdad: 6
  estaciones hidrométricas + 1 meteorológica, con `cero_ign`, `series_id` y
  umbrales (algunos en `null` a propósito — ver regla 3 y
  `docs/06-cobertura.md` para qué está confirmado que no existe vs. lo que
  sigue sin verificar). La ingesta no tiene ningún ID hardcodeado.
- `app/page.js` (Server Component) lee `data/latest.json` con
  `fs.readFileSync` y se lo pasa a `app/components/Dashboard.js` (Client
  Component: mapa + panel + estado). El mapa (`MapaEstaciones.js`) se importa
  con `next/dynamic({ ssr:false })` porque Leaflet toca `window`. El gráfico
  de pronóstico usa `recharts` (`PronosticoChart.js`).

## Reglas innegociables

1. **`cota_IGN = lectura_escala + cero_ign`.** Nunca comparar lecturas crudas
   entre estaciones. Sin esta conversión el error es de casi un metro.
2. **Todo dato expuesto lleva `calidad.estado`:** `fresco` | `demorado` | `sin_dato`.
   Nunca mostrar el último valor conocido como si fuera actual. El umbral de
   "demorado" es 180 minutos sin dato nuevo.
3. **No inventar umbrales de alerta.** Si `nivel_alerta` es `null`, es `null`.
   No encender ningún semáforo, no asignar colores de riesgo.
4. **Fechas ISO 8601 UTC con `Z` en el dataset.** La conversión a hora local
   (UTC-3, Argentina) es sólo de presentación.
5. **Esto NO es un sistema de alerta de emergencia** y no puede presentarse
   como tal. Es información complementaria.

## Stack

- **Framework:** Next.js (App Router)
- **Mapa:** React-Leaflet + OpenStreetMap (sin token, sin costo)
- **Hosting:** Vercel (temporal, se migra a UNDelta)
- **Ingesta:** GitHub Actions (cron cada hora)
- **Alertas:** Telegram Bot API (prototipo)

**Sin features propietarias de Vercel** (Edge Config, KV, Blob, Image
Optimization con loader propio). La plataforma se migra a UNDelta después
y tiene que ser Next.js estándar.

## Patrón de datos

La web **NUNCA** le pega directo a la API del INA en el frontend.

```
GitHub Actions (cron cada hora)
  → consulta API a5 del INA
  → normaliza (cota IGN, timezone, calidad)
  → commitea JSON en data/ y pushea a main

Vercel (auto-deploy desde main)
  → cada push rebuildea

Next.js (app/page.js, Server Component)
  → fs.readFileSync('data/latest.json') — igual en dev y en build de producción
```

**Ojo, esto difiere del plan original documentado antes de construir la app:**
la idea era servir en producción con `fetch` a `raw.githubusercontent.com` y
`revalidate`. Se implementó más simple: `page.js` lee el filesystem directo,
sin `fetch` ni revalidate. Como `data/` está commiteado en el repo, Next.js
lo empaqueta en el build y la página queda estática (`next build` la marca
`○ Static`). La frescura no viene de revalidar en runtime — viene de que
**cada commit de la ingesta dispara un rebuild completo en Vercel**. Si en
algún momento se corta esa cadena (se apaga el cron, o se desconecta el
auto-deploy), la página sirve el último build para siempre sin avisar.

## Catálogo de estaciones

`scripts/ingesta/estaciones.config.json` es la fuente de verdad de IDs,
coordenadas, `cero_ign` y umbrales. El script de ingesta no debe tener
ningún ID hardcodeado — todo sale de ese archivo.

## Esquema del dataset normalizado

Ver `docs/04-arquitectura.md`, sección "Estructura del dataset normalizado".
Los campos innegociables son `valor_ign` y `calidad.estado`.

## API del INA — trampas conocidas

Ver `docs/01-fuentes-datos.md`. Las más importantes:

- Sin `timestart` y `timeend`, la API devuelve solo metadatos (observaciones
  vacías). No es un error.
- El `series_id` del pronóstico es DISTINTO al de la observación. San Fernando:
  observación = 52, pronóstico = 26202.
- El pronóstico trae 5 curvas: `main`, `p05`, `p25`, `p75`, `p95`.
- `estacion_id` **no es** `series_id`. Una estación puede tener varias series
  (altura, caudal, media diaria...), cada una con su propio `series_id` en
  otro espacio de numeración. Pasar un `estacion_id` como si fuera
  `series_id` en `/a5/obs/puntual/series/{id}` devuelve una estación
  cualquiera equivocada, sin error. Para armar un catálogo (buscar todas las
  series de una estación, o todas las de una variable) usar la forma
  colección con query params: `GET /a5/obs/puntual/series?estacion_id={id}`
  o `?var_id={id}` (2 = altura hidrométrica) — devuelve `{ rows, total,
  is_last_page }` con `estacion.geom`/`estacion.cero_ign` embebidos, sin
  paginar. Detalle completo en `docs/06-cobertura.md`.

## Comandos

```bash
node scripts/ingesta/index.mjs   # corre la ingesta real localmente, pega a INA + Open-Meteo
npm run dev                      # levanta la app Next.js en desarrollo
npm run build                    # build de producción (Turbopack)
npm run lint                     # eslint
```

No hay suite de tests todavía.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
