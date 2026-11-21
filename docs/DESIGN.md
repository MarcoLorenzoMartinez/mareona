# DESIGN.md — Identidad Visual y Accesibilidad (WCAG 2.2 AA)

## 1. IDENTIDAD VISUAL

### Principio Fundamental
La aplicación utiliza como paleta principal el **rojo y blanco**, manteniendo una estética deportiva sobria, moderna y sin estridencias visuales.

### Tokens de Color (Tema Claro Único)
| Token | Hex | Uso |
|---|---|---|
| `--brand` | `#e2001a` | Color de marca: cabecera, navegación activa, CTAs, badges. Texto blanco encima (≈ 4.9:1) |
| `--brand-strong` | `#b80015` | Hover/pressed, enlaces y texto rojo pequeño, anillo de foco, mensajes de error (≈ 6.9:1) |
| `--background` | `#ffffff` | Fondo principal. Predomina el blanco |
| `--surface` | `#f5f5f5` | Tarjetas y secciones alternas (gris neutro) |
| `--foreground` | `#171717` | Texto principal |
| `--foreground-muted` | `#525252` | Texto secundario (≈ 7.8:1) |
| `--border` | `#e5e5e5` | Separadores decorativos |
| `--border-strong` | `#737373` | Bordes de inputs y controles (≥ 3:1) |
| `--success` | `#15803d` | Éxito (siempre con icono + texto) |
| `--warning` | `#92400e` | Aviso (siempre con icono + texto) |

### Reglas de Aplicación
- **Rojo y blanco dominan:** El rojo no se usa en párrafos de texto largo ni fondos de lectura extensa (feeds o tablas).
- **Sin tonos azules en la interfaz (con excepción deportiva en tablas clasificatorias):** Diseñada con tema claro rojo/blanco. Reemplazar valores por defecto del navegador y librerías (`--ring`, selecciones y enlaces) por los tokens corporativos. Única excepción aprobada en v1.0: los indicadores cromáticos de zona competitiva en clasificación (`#1d4ed8` Champions League y `#2563eb` Playoff de ascenso en `src/lib/historical/standings-zones.ts`).
- **Contenido externo:** Los escudos y fotografías de terceros conservan sus colores oficiales originales.
- **Denominación oficial del club:** En cualquier pantalla o componente, el club se nombra siempre **"Real Sporting"**, sobreescribiendo en la capa de datos cualquier variación proveniente de APIs de terceros (ej. "Sporting Gijón").
- **Logotipo:** Isotipo minimalista con fondo rojo `#e2001a` y una cresta de ola marina blanca formando sutilmente una letra "M".

### Controles de Interfaz y Filtros (Pills & Segmented Controls)
- **Estilo Píldora Redondeada (`rounded-full`):** Los selectores de vista (Tabla / Distancia Real / Evolución) y filtros secundarios de ámbito (General / En Casa / A Domicilio) o series utilizan contenedores redondeados tipo píldora (`rounded-full`).
- **Alineación Superior en la Misma Fila:** En pantallas medianas y grandes, el selector de vista se ubica en el extremo izquierdo y los filtros secundarios en el extremo derecho en la misma línea visual horizontal.
- **Estado Activo en Rojo Sporting:**
  - Los filtros deportivos secundarios seleccionados aplican fondo rojo corporativo (`bg-[var(--primary)]` `#e2001a`), texto blanco puro (`text-white`) y peso de fuente negrita (`font-bold`).
  - Los estados inactivos mantienen texto neutro legible (`text-neutral-700`) con sutil hover accesible.
- **Cero Duplicidad en Tarjetas:** Prohibido repetir títulos de secciones o filtros dentro de los componentes hijos si ya están presentes en la cabecera o barra de controles superior.

### Tratamiento Visual de Datos, Marcadores y Filtros
- **Tipografía (Prohibido `font-mono`):** Los marcadores (`0-1`), minutos (`87'`), estadísticas y dorsales deben usar exclusivamente `font-sans`. Para cifras alineadas, aplicar `tabular-nums`.
- **Modos de visualización de datos:**
  1. **Integrado en texto (por defecto):** Para eventos de partido o listas continuas, la jerarquía visual se define con peso y color (`font-semibold`, `text-muted-foreground`), sin recuadros alrededor de cada dato.
  2. **Encapsulado en píldora/cápsula (cuando aporte estructura o interacción):**
     - Si un dato o control requiere contenedor propio (p. ej. estado del partido, minuto clave, badge de resultado o filtros segmentados), debe seguir el formato cápsula del sistema de diseño:
       - Esquinas completamente redondeadas: `rounded-full`.
       - Si es neutro: fondo suave (`bg-muted/50`), texto de apoyo y sin bordes toscos.
       - Si es destacado o activo: fondo rojo corporativo (`bg-primary text-primary-foreground`) o borde sutil con tono de acento (`border border-primary/20`).
     - Prohibido usar cajas rectangulares genéricas (`rounded-md` grisáceas sin estilo) que parezcan bloques de terminal o badges sin integrar.

---

## 2. REQUISITOS DE ACCESIBILIDAD (WCAG 2.2 AA)

La accesibilidad es un **requisito bloqueante** en todas las fases.

### Percepción
- **Contraste:** Texto normal ≥ 4.5:1; texto grande o componentes interactivos ≥ 3:1, verificado automáticamente en `tests/a11y/wcag-contrast.test.ts`.
- **Nunca solo color:** Marcadores en vivo, victorias/derrotas, errores y clasificaciones deben incluir iconos, texto o patrones. En gráficos de evolución, la trayectoria de puntos y la de posiciones se diferencian por trazo sólido vs. discontinuo y marcadores circulares vs. cuadrados.
- **Texto alternativo:** Escudos/fotos junto al nombre llevan `alt=""` (decorativo). Si van solos, `alt="Nombre"`.
- **Reflow y Zoom:** Totalmente utilizable a 320 px de ancho sin scroll horizontal y hasta 200% de zoom.
- **Movimiento:** Respetar `prefers-reduced-motion`. Sin parpadeos ni autoplay.

### Operabilidad
- **Teclado:** Flujo 100% operable por teclado con orden lógico y enlace "Saltar al contenido".
- **Foco visible:** Anillo visible de ≥ 2 px en color `--brand-strong` con halo de contraste. Prohibido `outline: none` sin sustituto.
- **Objetivos táctiles:** Mínimo 24x24 px (objetivo recomendado ≥ 44x44 px).
- **Sin límites de tiempo:** Trivias y Wordle no imponen cronómetros obligatorios.

### Robustez y Casos Específicos
- **Semántica:** `header`, `nav`, `main`, `footer`, botones nativos o enlaces (prohibido `div` interactivo).
- **Live Regions:** `role="status"` o `aria-live="polite"` para actualizaciones del marcador, confirmaciones o nuevos mensajes.
- **Wordle Sportinguista:** Celdas accesibles con texto descriptivo ("S, correcta; P, en otra posición"). Estados diferenciados con formas/iconos además del color (relleno + ✓, borde + ▲, gris + ✕).
- **Clasificación y Gráficos:** Tablas nativas con `<caption>` y `<th scope>`. Gráficos SVG acompañados obligatoriamente de tablas equivalentes accesibles para lectores de pantalla (`sr-only`).

---

## 3. FILOSOFÍA DE DISEÑO: MINIMALISMO FUNCIONAL

1. **Economía Visual:** Menos elementos compitiendo por la atención. Eliminar cualquier borde, icono, sombra o etiqueta que no sea indispensable para comprender la información.
2. **Legibilidad Inmediata:**
   - Fechas y horarios en formato conciso ("Sábado 18 · 18:30" en vez de "Fecha y hora del próximo encuentro programado").
   - Marcadores limpios con el resultado en tipografía tabular destacada y escudos de ambos equipos.
3. **Manejo del Espacio en Blanco:** No llenar huecos vacíos con texto decorativo. El espacio en blanco estructura la jerarquía mejor que añadir líneas divisorias o contenedores secundarios.
4. **Modularidad Preventiva del Código:** Todo componente se mantiene estrictamente en ≤ 180 líneas de código para garantizar mantenibilidad, testabilidad y foco semántico.