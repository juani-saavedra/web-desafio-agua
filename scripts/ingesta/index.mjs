/**
 * Ingesta de datos — Desafío AGUA
 *
 * Consulta niveles de agua (INA) y pronóstico meteorológico (Open-Meteo) para
 * las estaciones de estaciones.config.json, normaliza a cota IGN + calidad
 * del dato, y escribe data/latest.json.
 *
 * Leer CLAUDE.md y docs/ antes de tocar esto.
 */

import { writeFileSync, mkdirSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = join(__dirname, 'estaciones.config.json');
const OUTPUT_PATH = 'data/latest.json';
const PRONOSTICOS_DIR = 'data/pronosticos';

const INA_BASE = 'https://alerta.ina.gob.ar/a5';
const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1/forecast';
const TIMEOUT_MS = 15000;
const UMBRAL_DEMORADO_MIN = 180;
const VENTANA_OBS_HORAS = 24;
const OPEN_METEO_HOURLY_VARS = [
  'precipitation',
  'precipitation_probability',
  'rain',
  'wind_speed_10m',
  'wind_direction_10m',
  'wind_gusts_10m',
  'temperature_2m',
];

async function fetchJson(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} en ${url}`);
    }
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

// cota_IGN = lectura_escala + cero_ign (regla innegociable, ver CLAUDE.md).
function toValorIgn(valorEscala, ceroIgn) {
  if (valorEscala == null || ceroIgn == null) return null;
  return Math.round((valorEscala + ceroIgn) * 1000) / 1000;
}

async function obtenerUltimaObservacion(seriesId, ceroIgn, ahora) {
  const timestart = new Date(ahora.getTime() - VENTANA_OBS_HORAS * 3600_000).toISOString();
  const timeend = ahora.toISOString();
  const url = `${INA_BASE}/obs/puntual/series/${seriesId}?timestart=${encodeURIComponent(timestart)}&timeend=${encodeURIComponent(timeend)}`;

  const data = await fetchJson(url);
  const observaciones = data.observaciones ?? [];
  if (observaciones.length === 0) {
    return { ultima_observacion: null, calidad: { estado: 'sin_dato', umbral_demorado_min: UMBRAL_DEMORADO_MIN } };
  }

  const ultima = observaciones.reduce((max, o) =>
    new Date(o.timestart) > new Date(max.timestart) ? o : max
  );

  // La frescura se mide contra timeupdate (cuándo se cargó el dato), no
  // timestart (cuándo se midió): es lo que detecta huecos de carga, no el
  // desfasaje normal de medición → publicación (ver docs/03-hallazgos-tecnicos.md).
  const antiguedadMin = Math.round((ahora.getTime() - new Date(ultima.timeupdate).getTime()) / 60000);

  return {
    ultima_observacion: {
      timestamp: ultima.timestart,
      valor_escala: ultima.valor,
      valor_ign: toValorIgn(ultima.valor, ceroIgn),
      timeupdate: ultima.timeupdate,
      antiguedad_min: antiguedadMin,
    },
    calidad: {
      estado: antiguedadMin <= UMBRAL_DEMORADO_MIN ? 'fresco' : 'demorado',
      umbral_demorado_min: UMBRAL_DEMORADO_MIN,
    },
  };
}

async function obtenerPronostico(pronosticoConfig, ceroIgn, estacionId, ahora) {
  if (!pronosticoConfig) {
    return { pronostico: { disponible: false }, archivar: null };
  }

  const { series_id: seriesId, cal_id: calId } = pronosticoConfig;
  const url = `${INA_BASE}/sim/calibrados/${calId}/corridas/last?series_id=${seriesId}&includeProno=true&group_by_qualifier=true`;
  const data = await fetchJson(url);

  const forecastDate = data.forecast_date;
  const forecastMs = new Date(forecastDate).getTime();

  // Cada qualifier (main, p05, p25, p75, p95) llega como una serie separada
  // con su propio array de puntos, todas con el mismo eje temporal. Las
  // fusionamos en un punto por timestamp.
  const puntosPorTiempo = new Map();
  for (const serie of data.series ?? []) {
    for (const p of serie.pronosticos ?? []) {
      if (!puntosPorTiempo.has(p.timestart)) puntosPorTiempo.set(p.timestart, { t: p.timestart });
      puntosPorTiempo.get(p.timestart)[serie.qualifier] = toValorIgn(p.valor, ceroIgn);
    }
  }
  const todosLosPuntos = [...puntosPorTiempo.values()].sort((a, b) => new Date(a.t) - new Date(b.t));

  // El array completo incluye ~2 semanas de historia de calibración además
  // del horizonte futuro. Para el dataset expuesto sólo interesa el
  // pronóstico real (desde forecast_date en adelante); la corrida completa
  // se archiva aparte.
  const puntosFuturos = todosLosPuntos.filter((p) => new Date(p.t).getTime() >= forecastMs);
  const ultimoPunto = puntosFuturos[puntosFuturos.length - 1];
  const horizonteH = ultimoPunto
    ? Math.round((new Date(ultimoPunto.t).getTime() - forecastMs) / 3600_000)
    : 0;

  return {
    pronostico: {
      disponible: true,
      series_id: seriesId,
      cal_id: calId,
      emitido: forecastDate,
      horizonte_h: horizonteH,
      puntos: puntosFuturos,
    },
    archivar: {
      estacionId,
      forecastDate,
      contenido: {
        estacion_id: estacionId,
        series_id: seriesId,
        cal_id: calId,
        emitido: forecastDate,
        guardado: ahora.toISOString(),
        puntos: todosLosPuntos,
      },
    },
  };
}

async function obtenerMeteo(coords, ahora) {
  const [lat, lon] = coords;
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    hourly: OPEN_METEO_HOURLY_VARS.join(','),
    forecast_days: '4',
    timezone: 'America/Argentina/Buenos_Aires',
  });
  const data = await fetchJson(`${OPEN_METEO_BASE}?${params}`);
  return {
    fuente: 'open-meteo',
    generado: ahora.toISOString(),
    hourly: data.hourly,
  };
}

function nombreArchivoPronostico({ estacionId, forecastDate }) {
  const fechaSanitizada = forecastDate.replace(/:/g, '-');
  return join(PRONOSTICOS_DIR, `${estacionId}_${fechaSanitizada}.json`);
}

async function procesarEstacion(estacionConfig, ahora, resumen) {
  const { series, pronostico: pronosticoConfig, ...base } = estacionConfig;
  const nombre = estacionConfig.nombre;

  let ultima_observacion = null;
  let calidad = { estado: 'sin_dato', umbral_demorado_min: UMBRAL_DEMORADO_MIN };
  try {
    const r = await obtenerUltimaObservacion(series.observacion, estacionConfig.cero_ign, ahora);
    ultima_observacion = r.ultima_observacion;
    calidad = r.calidad;
  } catch (err) {
    console.error(`[${nombre}] error consultando observaciones: ${err.message}`);
    resumen.fallos.push(`${nombre} (observaciones)`);
  }

  let pronostico = { disponible: false };
  let archivar = null;
  if (pronosticoConfig) {
    try {
      const r = await obtenerPronostico(pronosticoConfig, estacionConfig.cero_ign, estacionConfig.estacion_id, ahora);
      pronostico = r.pronostico;
      archivar = r.archivar;
    } catch (err) {
      console.error(`[${nombre}] error consultando pronóstico: ${err.message}`);
      resumen.fallos.push(`${nombre} (pronóstico)`);
    }
  }

  let meteo;
  if (estacionConfig.coords) {
    try {
      meteo = await obtenerMeteo(estacionConfig.coords, ahora);
    } catch (err) {
      console.error(`[${nombre}] error consultando Open-Meteo: ${err.message}`);
      resumen.fallos.push(`${nombre} (open-meteo)`);
      meteo = null;
    }
  }

  resumen.procesadas += 1;
  if (calidad.estado === 'fresco') resumen.frescas += 1;

  if (archivar) {
    mkdirSync(PRONOSTICOS_DIR, { recursive: true });
    writeFileSync(nombreArchivoPronostico(archivar), JSON.stringify(archivar.contenido, null, 2));
  }

  return {
    ...base,
    ultima_observacion,
    calidad,
    pronostico,
    ...(meteo !== undefined && { meteo }),
  };
}

async function main() {
  const config = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
  const ahora = new Date();
  const resumen = { procesadas: 0, frescas: 0, fallos: [] };

  const estaciones = await Promise.all(
    config.estaciones.map((e) => procesarEstacion(e, ahora, resumen))
  );

  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(
    OUTPUT_PATH,
    JSON.stringify({ _generado: ahora.toISOString(), estaciones }, null, 2)
  );

  console.log(`✓ Escrito ${OUTPUT_PATH}`);
  console.log(
    `Resumen: ${resumen.procesadas} estaciones procesadas, ${resumen.frescas} con dato fresco, ${resumen.fallos.length} fallos.`
  );
  if (resumen.fallos.length > 0) {
    console.log(`Fallos: ${resumen.fallos.join(', ')}`);
  }
}

main();
