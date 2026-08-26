# Desafío AGUA — instrucciones para Claude Code

Contexto completo en `docs/`. Leer `docs/README.md` primero, después los demás
archivos en orden numérico.

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
node scripts/ingesta/index.mjs        # corre la ingesta localmente
npm run dev                            # levanta la web en desarrollo
```
