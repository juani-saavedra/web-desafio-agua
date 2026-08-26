'use client';

import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { aHoraArgentina, fechaHoraEjeArgentina } from '../lib/formato';

export default function PronosticoChart({ puntos }) {
  const datos = puntos.map((p) => ({
    t: p.t,
    main: p.main,
    p25: p.p25,
    rango: p.p75 != null && p.p25 != null ? p.p75 - p.p25 : null,
  }));

  return (
    <div style={{ width: '100%', height: 220 }}>
      <ResponsiveContainer>
        <ComposedChart data={datos} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="t"
            tickFormatter={fechaHoraEjeArgentina}
            interval={Math.max(0, Math.floor(datos.length / 3))}
            tick={{ fontSize: 10 }}
            angle={-35}
            textAnchor="end"
            height={45}
          />
          <YAxis
            width={45}
            tick={{ fontSize: 11 }}
            label={{ value: 'm (IGN)', angle: -90, position: 'insideLeft', fontSize: 11 }}
          />
          <Tooltip
            labelFormatter={aHoraArgentina}
            formatter={(value, name) => [
              `${Number(value).toFixed(2)} m`,
              name === 'main' ? 'pronóstico (main)' : name === 'rango' ? 'banda p75–p25' : name,
            ]}
          />
          <Area
            dataKey="p25"
            stackId="banda"
            stroke="none"
            fill="transparent"
            isAnimationActive={false}
            legendType="none"
          />
          <Area
            dataKey="rango"
            stackId="banda"
            stroke="none"
            fill="#93c5fd"
            fillOpacity={0.5}
            isAnimationActive={false}
          />
          <Line dataKey="main" stroke="#1d4ed8" strokeWidth={2} dot={false} isAnimationActive={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
