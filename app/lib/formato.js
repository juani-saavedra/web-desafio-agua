const TIMEZONE = 'America/Argentina/Buenos_Aires';

// formatToParts + armado manual (en vez de toLocaleString) porque el formato
// de 12h ("a. m./p. m.") de Node y del navegador usan un espacio distinto
// alrededor del sufijo según la versión de ICU, y eso rompe la hidratación
// de React (SSR y cliente producen texto "igual" pero con bytes distintos).
// Formato 24h evita el sufijo por completo.
function partesArgentina(isoString, opciones) {
  const partes = new Intl.DateTimeFormat('es-AR', {
    timeZone: TIMEZONE,
    hourCycle: 'h23',
    ...opciones,
  }).formatToParts(new Date(isoString));
  return (tipo) => partes.find((p) => p.type === tipo)?.value;
}

export function aHoraArgentina(isoString) {
  if (!isoString) return '—';
  const valor = partesArgentina(isoString, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${valor('day')}/${valor('month')}/${valor('year')} ${valor('hour')}:${valor('minute')}`;
}

// Con un pronóstico de varios días, mostrar sólo la hora es ambiguo (el eje
// "camina" en hora sin indicar el cambio de día). Siempre incluir la fecha.
export function fechaHoraEjeArgentina(isoString) {
  const valor = partesArgentina(isoString, {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${valor('day')}/${valor('month')} ${valor('hour')}:${valor('minute')}`;
}

export function formatoMetros(valor) {
  if (valor == null) return 'Sin cota IGN';
  return `${valor.toFixed(2)} m`;
}
