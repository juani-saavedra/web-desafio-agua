# Desafío AGUA — Contexto del proyecto

## Qué es

Proyecto del equipo formado en la **Hackatón CarpinchIA 2026** (Universidad
Nacional del Delta, UNDelta), eje temático **Agua**.

- Equipo formado el **22/08/2026** en el desayuno de conformación.
- **Demo day: ~14/09/2026** (tres semanas desde el 24/08).
- El premio mayor de la hackatón es un año de incubación y mentoría.

## Equipo

| Nombre | Rol / línea de trabajo |
|---|---|
| Agustina Viaggio | Coordinación y definición de producto |
| Cynthia Lencioni | Relevamiento de personas/zonas afectadas y fuentes; pluviómetros UNLu |
| María Victoria Bernárdez (Viki) | Entrevista con Martín Piñeiro (Personal Tech / Nordelta) |
| Juan Ignacio Saavedra | **Perfil técnico**: datos, dataset, web, bot de alertas |

## Foco territorial acordado

**Cuenca media de Escobar y Tigre.**

Se busca una zona donde personas y comunidades sufran anegamientos o
inundaciones sin anticipación suficiente, y que no esté ya cubierta por otras
organizaciones.

> Nota importante: el foco se movió. Arrancó en el Delta interior (arroyos
> isleños), pasó por el Río Luján, y quedó en cuenca media. **Esto cambia la
> física del problema** — ver `02-hallazgos-tecnicos.md`, sección "Riesgo
> abierto".

## Hipótesis de problema (a validar)

Las personas que viven o circulan por zonas vulnerables, y los servicios de
respuesta, no cuentan con información suficientemente localizada, integrada y
oportuna para anticipar el impacto de las lluvias y actuar antes de una
inundación.

Existen mediciones de mareas, vientos y altura del río (INA, SHN), pero la
información sobre **lluvias locales** podría ser insuficiente, estar
fragmentada, o no traducirse a tiempo en alertas útiles.

## Producto definido por el equipo

Cita textual de Agustina:

> "El producto es esencialmente un **dataset**. Recurso muy valioso en sí mismo
> y que le sirve a múltiples actores."

Una plataforma web (alojada eventualmente por la UNDelta) que disponga de datos
**hidrográficos, meteorológicos y pluviales** integrados.

Como evolución posible —no comprometida— una app georreferenciada con mapa de
zonas verdes/amarillas/rojas.

## Alcance asumido por Juan para el demo day

1. **Dataset unificado** — normalizado, con metadatos de calidad y frescura.
2. **Web** que lo exponga y lo muestre (evidencia de que el dataset existe y
   está vivo).
3. **Bot de Telegram** con alertas funcionando de verdad (evidencia de que el
   dataset se convierte en acción).

**Fuera de alcance:** app nativa. Justificación a comunicar al equipo:

> En tres semanas una app no llega a estar bien, y una app a medias resta en vez
> de sumar. Si el dataset queda expuesto por API, la app después es sólo un
> cliente más. La mostramos como evolución en el roadmap, con la arquitectura
> lista para soportarla.

## Pedido explícito pendiente de Agustina

> "Buscá las que ya existen. Fijate que hay varias que levantan datos de INA,
> SMN y SHN. Buscá también los que publica UNLu de pluviómetros."

Es **análisis de competencia** y va antes de escribir código. Ver
`05-pendientes.md`.

## Mapa de actores relevante

- **INA** — Instituto Nacional del Agua: produce niveles y pronósticos.
- **SMN** — Servicio Meteorológico Nacional: lluvia, viento, alertas, radares.
- **SHN** — Servicio de Hidrografía Naval: marea astronómica y sudestadas.
- **UNLu** — Universidad Nacional de Luján: posibles pluviómetros propios.
- **Defensa Civil / municipios de Escobar y Tigre** — usuarios operativos.
- **Martín Piñeiro (Personal Tech / Nordelta)** — planteó el desafío original de
  anticipar la altura del Río Luján integrando mareas, vientos y precipitaciones.
- **Anticipando la Crecida (CIMA/UBA-CONICET)** — proyecto existente que ya
  trabajó con escuelas de Río Carapachay y Canal 8. **Zona ya cubierta**, no
  duplicar.
