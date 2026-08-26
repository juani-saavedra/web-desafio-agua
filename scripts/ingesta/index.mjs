/**
 * Ingesta de datos — Desafío AGUA
 *
 * TODO: Claude Code va a escribir este script.
 * Por ahora solo crea un latest.json mínimo para que el workflow no falle.
 *
 * Leer CLAUDE.md y docs/ antes de tocar esto.
 */

import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

const OUTPUT = 'data/latest.json';

const placeholder = {
  _generado: new Date().toISOString(),
  _nota: 'Placeholder — la ingesta real todavía no está implementada',
  estaciones: [],
};

mkdirSync(dirname(OUTPUT), { recursive: true });
writeFileSync(OUTPUT, JSON.stringify(placeholder, null, 2));

console.log(`✓ Escrito ${OUTPUT} (placeholder)`);
