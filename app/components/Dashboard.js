'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import PanelEstacion from './PanelEstacion';
import { aHoraArgentina } from '../lib/formato';

// Leaflet toca `window` al importarse, así que no puede renderizarse en el servidor.
const MapaEstaciones = dynamic(() => import('./MapaEstaciones'), {
  ssr: false,
  loading: () => <div className="mapa-cargando">Cargando mapa…</div>,
});

export default function Dashboard({ generado, estaciones }) {
  const [seleccionadaId, setSeleccionadaId] = useState(null);

  const seleccionada = useMemo(
    () => estaciones.find((e) => e.estacion_id === seleccionadaId) ?? null,
    [estaciones, seleccionadaId]
  );
  const frescas = estaciones.filter((e) => e.calidad.estado === 'fresco').length;

  return (
    <div className="app">
      <header className="banner">
        <h1>Desafío AGUA — Escobar / Tigre / San Fernando</h1>
        <p>
          Dataset generado el {aHoraArgentina(generado)} (hora Argentina) · {estaciones.length}{' '}
          estaciones · {frescas} con dato fresco
        </p>
      </header>

      <div className="contenido">
        <div className="mapa">
          <MapaEstaciones estaciones={estaciones} onSeleccionar={setSeleccionadaId} />
        </div>
        <aside className="panel">
          {seleccionada ? (
            <PanelEstacion estacion={seleccionada} />
          ) : (
            <p className="panel-vacio">Hacé click en una estación del mapa para ver el detalle.</p>
          )}
        </aside>
      </div>

      <footer className="footer">
        Fuentes: INA (alerta.ina.gob.ar), Open-Meteo. Esto NO es un sistema de alerta de emergencia.
      </footer>
    </div>
  );
}
