import { aHoraArgentina, formatoMetros } from '../lib/formato';
import PronosticoChart from './PronosticoChart';

const ESTADO_LABEL = {
  fresco: 'Fresco',
  demorado: 'Demorado',
  sin_dato: 'Sin dato',
};

const ESTADO_COLOR = {
  fresco: '#16a34a',
  demorado: '#d97706',
  sin_dato: '#6b7280',
};

export default function PanelEstacion({ estacion }) {
  const { ultima_observacion: obs, calidad, pronostico } = estacion;

  return (
    <div className="panel-estacion">
      <h2>{estacion.nombre_largo ?? estacion.nombre}</h2>
      <dl className="ficha">
        <dt>Río</dt>
        <dd>{estacion.rio ?? '—'}</dd>
        <dt>Red</dt>
        <dd>{estacion.red ?? '—'}</dd>
      </dl>

      <div className="calidad" style={{ borderColor: ESTADO_COLOR[calidad.estado] }}>
        <span className="calidad-punto" style={{ background: ESTADO_COLOR[calidad.estado] }} />
        {ESTADO_LABEL[calidad.estado]}
      </div>

      {obs ? (
        <div className="observacion">
          <p>
            <strong>Escala:</strong> {obs.valor_escala.toFixed(2)} m
          </p>
          <p>
            <strong>Cota IGN:</strong> {formatoMetros(obs.valor_ign)}
          </p>
          <p>
            <strong>Medido:</strong> {aHoraArgentina(obs.timestamp)}
          </p>
          <p>
            <strong>Antigüedad:</strong> {obs.antiguedad_min} min
          </p>
        </div>
      ) : (
        <p>Sin observaciones en las últimas 24 h.</p>
      )}

      {pronostico?.disponible ? (
        <div className="pronostico">
          <h3>Pronóstico</h3>
          <p>
            Emitido: {aHoraArgentina(pronostico.emitido)} · Horizonte: {pronostico.horizonte_h} h
          </p>
          <PronosticoChart puntos={pronostico.puntos} />
        </div>
      ) : (
        <p className="sin-pronostico">Sin pronóstico disponible para esta estación.</p>
      )}
    </div>
  );
}
