import { readFileSync } from 'fs';
import { join } from 'path';
import Dashboard from './components/Dashboard';

// Patrón de datos del proyecto: la web nunca le pega directo a las APIs
// externas. Lee el JSON que ya generó la ingesta (ver CLAUDE.md).
export default function Home() {
  const raw = readFileSync(join(process.cwd(), 'data', 'latest.json'), 'utf8');
  const data = JSON.parse(raw);

  return <Dashboard generado={data._generado} estaciones={data.estaciones} />;
}
