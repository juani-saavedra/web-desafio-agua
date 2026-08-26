# Desafío AGUA — instrucciones para Claude Code

Contexto completo en `docs/`. Leer `docs/README.md` primero, después los demás
archivos en orden numérico.

## Estado actual del repo

**Todavía no existe la app Next.js** — no hay `package.json` ni directorio de
app en la raíz. Lo que sí está implementado es la ingesta completa:

- `scripts/ingesta/index.mjs` consulta niveles de agua (API a5 del INA:
  observaciones + pronóstico donde hay `cal_id`) y pronóstico meteorológico
  (Open-Meteo, para las estaciones con `coords`), normaliza a cota IGN y
  `calidad.estado`, y escribe `data/latest.json`. Usa sólo módulos built-in
  de Node (`fs`, `path`) + `fetch` nativo — sin dependencias, sin
  `package.json`.
- El pronóstico del INA (`corridas/last`) sólo devuelve la última corrida —
  cada una que no se guarda se pierde. Por eso cada corrida se archiva
  completa (incluye ~2 semanas de historia de calibración, no sólo el
  horizonte futuro) en `data/pronosticos/{estacion_id}_{forecast_date}.json`.
  `data/latest.json` sólo expone los puntos desde `forecast_date` en
  adelante, para no inflar el archivo que se commitea cada hora.
- `.github/workflows/ingesta.yml` corre ese script cada hora (`cron: '17 * * * *'`)
  y commitea `data/` si cambió. El commit lo hace `ingesta-bot`, con
  `[skip ci]`. **No edites `data/latest.json` a mano** — es el output del
  script, se sobreescribe en la próxima corrida.
- `scripts/ingesta/estaciones.config.json` es la fuente de verdad: 5
  estaciones hidrométricas + 1 meteorológica, con `cero_ign`, `series_id` y
  umbrales (muchos en `null` — ver regla 3). La ingesta no tiene ningún ID
  hardcodeado.

Cuando se arranque la app Next.js, seguir el patrón de datos de abajo y crear
el `package.json` en la raíz (no en `scripts/`).

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
  → commitea JSON en data/

Next.js
  → lee data/latest.json (en dev, desde filesystem)
  → en producción, fetch desde raw.githubusercontent.com con revalidate
```

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

## Comandos

```bash
node scripts/ingesta/index.mjs        # corre la ingesta localmente (hoy: escribe el placeholder)
```

`npm run dev` todavía no aplica — no hay app Next.js creada. Agregar esta
sección cuando exista `package.json`.
