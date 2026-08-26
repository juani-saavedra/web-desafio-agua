'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const CENTRO = [-34.38, -58.6];
const ZOOM = 11;
const COLOR_CON_PRONOSTICO = '#2563eb';
const COLOR_SIN_PRONOSTICO = '#6b7280';

function icono(conPronostico) {
  const color = conPronostico ? COLOR_CON_PRONOSTICO : COLOR_SIN_PRONOSTICO;
  return L.divIcon({
    className: '',
    html: `<span style="display:block;width:16px;height:16px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 0 3px rgba(0,0,0,.6)"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

export default function MapaEstaciones({ estaciones, onSeleccionar }) {
  const conCoords = estaciones.filter((e) => e.coords);

  return (
    <MapContainer center={CENTRO} zoom={ZOOM} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {conCoords.map((e) => (
        <Marker
          key={e.estacion_id}
          position={e.coords}
          icon={icono(e.pronostico?.disponible)}
          eventHandlers={{ click: () => onSeleccionar(e.estacion_id) }}
        >
          <Popup>
            <strong>{e.nombre}</strong>
            <br />
            {e.pronostico?.disponible ? 'Con pronóstico' : 'Sin pronóstico'}
          </Popup>
        </Marker>
      ))}
      <div className="leyenda-mapa">
        <span>
          <i style={{ background: COLOR_CON_PRONOSTICO }} /> con pronóstico
        </span>
        <span>
          <i style={{ background: COLOR_SIN_PRONOSTICO }} /> sin pronóstico
        </span>
      </div>
    </MapContainer>
  );
}
