### 4. `docs/DESIGN.md`

```markdown
# DESIGN.md — Identidad Visual y Accesibilidad (WCAG 2.2 AA)

## 1. IDENTIDAD VISUAL

### Principio Fundamental
La aplicación utiliza como paleta principal el **rojo y blanco**, manteniendo una estética deportiva sobria, moderna y sin estridencias visuales[cite: 2].

### Tokens de Color (Tema Claro Único)
| Token | Hex | Uso |
|---|---|---|
| `--brand` | `#e2001a` | Color de marca: cabecera, navegación activa, CTAs, badges. Texto blanco encima (≈ 4.9:1)[cite: 2] |
| `--brand-strong` | `#b80015` | Hover/pressed, enlaces y texto rojo pequeño, anillo de foco, mensajes de error (≈ 6.9:1)[cite: 2] |
| `--background` | `#ffffff` | Fondo principal. Predomina el blanco[cite: 2] |
| `--surface` | `#f5f5f5` | Tarjetas y secciones alternas (gris neutro)[cite: 2] |
| `--foreground` | `#171717` | Texto principal[cite: 2] |
| `--foreground-muted` | `#525252` | Texto secundario (≈ 7.8:1)[cite: 2] |
| `--border` | `#e5e5e5` | Separadores decorativos[cite: 2] |
| `--border-strong` | `#737373` | Bordes de inputs y controles (≥ 3:1)[cite: 2] |
| `--success` | `#15803d` | Éxito (siempre con icono + texto)[cite: 2] |
| `--warning` | `#92400e` | Aviso (siempre con icono + texto)[cite: 2] |

### Reglas de Aplicación
- **Rojo y blanco dominan:** El rojo no se usa en párrafos de texto largo ni fondos de lectura extensa (feeds o tablas)[cite: 2].
- **Paleta coherente:** Reemplazar los valores predeterminados del navegador y librerías de estilos por los tokens corporativos (anillo de foco `--ring`, selecciones y enlaces)[cite: 2].
- **Contenido externo:** Los escudos y fotografías de terceros conservan sus colores oficiales originales[cite: 2].
- **Logotipo:** Isotipo minimalista con fondo rojo `#e2001a` y una cresta de ola marina blanca formando sutilmente una letra "M"[cite: 2].

---

## 2. REQUISITOS DE ACCESIBILIDAD (WCAG 2.2 AA)

La accesibilidad es un **requisito bloqueante** en todas las fases[cite: 2].

### Percepción
- **Contraste:** Texto normal ≥ 4.5:1; texto grande o componentes interactivos ≥ 3:1[cite: 2]. Registrar pares verificados en `docs/design-tokens-contrast.md`[cite: 2].
- **Nunca solo color:** Marcadores en vivo, victorias/derrotas, errores y casillas del Wordle deben incluir iconos, texto o patrones[cite: 2].
- **Texto alternativo:** Escudos/fotos junto al nombre llevan `alt=""` (decorativo)[cite: 2]. Si van solos, `alt="Nombre"`[cite: 2].
- **Reflow y Zoom:** Totalmente utilizable a 320 px de ancho sin scroll horizontal y hasta 200% de zoom[cite: 2].
- **Movimiento:** Respetar `prefers-reduced-motion`[cite: 2]. Sin parpadeos ni autoplay[cite: 2].

### Operabilidad
- **Teclado:** Flujo 100% operable por teclado con orden lógico y enlace "Saltar al contenido"[cite: 2].
- **Foco visible:** Anillo visible de ≥ 2 px en color `--brand-strong` con halo de contraste[cite: 2]. Prohibido `outline: none` sin sustituto[cite: 2].
- **Objetivos táctiles:** Mínimo 24x24 px (objetivo recomendado ≥ 44x44 px)[cite: 2].
- **Sin límites de tiempo:** Trivias y Wordle no imponen cronómetros obligatorios[cite: 2].

### Robustez y Casos Específicos
- **Semántica:** `header`, `nav`, `main`, `footer`, botones nativos o enlaces (prohibido `div` interactivo)[cite: 2].
- **Live Regions:** `role="status"` o `aria-live="polite"` para actualizaciones del marcador, confirmaciones o nuevos mensajes[cite: 2].
- **Wordle Sportinguista:** Celdas accesibles con texto descriptivo ("S, correcta; P, en otra posición")[cite: 2]. Estados diferenciados con formas/iconos además del color (relleno + ✓, borde + ▲, gris + ✕)[cite: 2].
- **Clasificación:** Etiqueta `<table>` nativa con `<caption>` y `<th scope>`[cite: 2].