# Contexto — Desafío AGUA / CarpinchIA 2026

Archivos de contexto para el proyecto de desarrollo de la plataforma.

| Archivo | Contenido | Cuándo leerlo |
|---|---|---|
| `00-proyecto.md` | Equipo, foco territorial, producto, alcance, fechas | Siempre — es el marco |
| `01-fuentes-datos.md` | Endpoints, formatos, trampas conocidas de cada API | Al escribir la capa de ingesta |
| `02-estaciones.md` | IDs, coordenadas, `cero_ign`, umbrales por estación | Al armar el dataset y el mapa |
| `03-hallazgos-tecnicos.md` | Análisis medido: desfasaje, datum, latencia, huecos | Al decidir cómo procesar y qué mostrar |
| `04-arquitectura.md` | Stack, patrón de datos, qué NO construir | Antes de escribir la primera línea |
| `05-pendientes.md` | Bloqueantes, verificaciones abiertas, riesgos | Al planificar; revisar semanalmente |
| `06-cobertura.md` | Relevamiento con evidencia de qué cursos de agua tienen/no tienen sensor público | Al hablar de cobertura o vacancia con el equipo o en el demo day |

## Convención de estado

- ✅ **verificado** — probado contra la API real, devolvió datos
- ⚠️ **advertencia** — algo que puede romper o que hay que decir antes de que lo
  pregunten
- ❓ **pendiente** — no confirmado, no asumirlo como cierto

## Lo mínimo que hay que recordar

1. **El producto es el dataset.** La web y el bot son evidencia de que existe y
   de que sirve.
2. **`cota_IGN = lectura + cero_ign`.** Sin eso, comparar estaciones es
   incorrecto por casi un metro.
3. **La frescura del dato es parte del dato.** Hay huecos de hasta 6 horas; el
   sistema tiene que decir "no tengo dato fresco" en vez de mostrar el último
   valor como si fuera actual.
4. **No inventar umbrales.** Sin umbral validado no se enciende ningún semáforo.
5. **Esto no es un sistema de alerta de emergencia** y no puede presentarse como
   tal.
