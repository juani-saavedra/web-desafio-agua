import './globals.css';
import { Analytics } from "@vercel/analytics/next"

export const metadata = {
  title: 'Desafío AGUA — Escobar / Tigre / San Fernando',
  description:
    'Dataset de niveles de agua y pronóstico para la cuenca media de Escobar y Tigre. No es un sistema de alerta de emergencia.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}
      <Analytics />
      </body>
    </html>
  );
}
