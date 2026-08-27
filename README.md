# Desafío AGUA

Dataset unificado de niveles de agua y pronóstico para la cuenca media de
Escobar y Tigre, con una web que lo expone. Proyecto del equipo formado en la
Hackatón **CarpinchIA 2026** (Universidad Nacional del Delta), eje temático
Agua.

**Esto NO es un sistema de alerta de emergencia.** Es información
complementaria — ver `docs/04-arquitectura.md` para el porqué.

## Qué hay acá

- `scripts/ingesta/` — script Node sin dependencias que consulta la API a5
  del INA (niveles + pronóstico) y Open-Meteo (lluvia/viento), normaliza a
  cota IGN, y escribe `data/latest.json`. Corre solo cada hora vía
  `.github/workflows/ingesta.yml`.
- `app/` — la web (Next.js, App Router): mapa con las estaciones, panel de
  detalle por estación, gráfico de pronóstico.
- `docs/` — todo el contexto del proyecto (equipo, fuentes de datos,
  hallazgos técnicos, arquitectura, pendientes, cobertura hidrométrica).
  Empezar por `docs/README.md`.

## Desarrollo

```bash
npm install
npm run dev
```

La web lee `data/latest.json` directo del filesystem — ya viene en el repo
y se actualiza solo por el cron, así que no hace falta correr la ingesta
para levantar la web localmente.

Para correr la ingesta a mano (pega en vivo a INA + Open-Meteo):

```bash
node scripts/ingesta/index.mjs
```

Otros comandos: `npm run build` (producción), `npm run lint`.

## Stack

Next.js (App Router) + React-Leaflet/OpenStreetMap + recharts, ingesta por
GitHub Actions, hosting en Vercel (temporal, se migra a UNDelta). Detalle
completo en `docs/04-arquitectura.md` y en `CLAUDE.md`.
