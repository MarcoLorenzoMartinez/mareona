# AGENTS.md — Reglas Principales de Desarrollo de Mareona

> Reglas activas e innegociables para toda IA de desarrollo. Antes de escribir código, lee este archivo.

## 1. Protocolo de Cada Iteración
1. **Lee** este archivo y el código relacionado antes de proponer cambios. Si falta contexto, **pregunta**.
2. **Explica el plan en 2-3 viñetas** (qué, dónde, por qué) **antes de escribir código** y espera visto bueno si es no trivial.
3. **Una sola unidad de trabajo por iteración:** un componente, o un endpoint/Server Action, o una migración, o un módulo de dominio. Nunca varios a la vez.
4. **Escribe primero el test** (o junto al código) cuando haya lógica de negocio.
5. **Ejecuta la checklist de calidad**, incluida accesibilidad (WCAG 2.2 AA) en toda tarea con UI.
6. **Resume al final:** archivos tocados, decisiones tomadas, deuda técnica o riesgos detectados.
7. Si descubres un problema fuera del alcance de la tarea, **repórtalo, no lo arregles** en el mismo cambio.

## 2. Estándares Técnicos Obligatorios
- **Idioma:** Código, identificadores, commits y comentarios técnicos en **inglés**. Textos de UI en **español** vía i18n.
- **TypeScript (tolerancia cero):** Prohibido `any`, `as any`, `@ts-ignore` o `@ts-expect-error`. `strict: true`. Toda entrada externa validada con **Zod** en el borde. Tipos de BD proceden de `src/types/database.types.ts` (generado, nunca a mano).
- **Server Components vs Client Components:** Por defecto Server Component. `"use client"` solo si se requiere interactividad/estado del navegador, siempre con el comentario explicativo: `// Client: <motivo>`.
- **Dependencias:** Prohibido instalar paquetes npm sin consultar. Si se resuelve con la plataforma web o ≤ 30 líneas, no se añade librería.
- **Seguridad:** RLS activada en TODAS las tablas. Variables sensibles solo en servidor (`import 'server-only'`). El `user_id` se toma siempre de la sesión en servidor vía `supabase.auth.getUser()`.
- **Datos Deportivos:** Nunca se llama a la API externa desde el cliente; siempre desde el servidor pasando por la caché de Supabase (`src/lib/sports-api/`).
- **Nombre Canónico del Real Sporting:** El club se denomina estricta y únicamente **"Real Sporting"** (nunca "Sporting Gijón", "Sporting de Gijón" ni otras variantes de APIs externas). La normalización se realiza obligatoriamente en el borde de ingesta/adaptación (`normalizeTeamName` en `src/lib/sports-api/`) antes de almacenar en BD o pasar al modelo de dominio. Los componentes de UI consumen siempre el nombre ya normalizado y nunca contienen parches de renombramiento en JSX.
- **Prohibición Estricta de Datos Ficticios (Cero Mock Data en Producción):** Queda terminantemente prohibido inventar o insertar datos de prueba/fallback ficticios (partidos, clasificaciones de muestra, marcadores inventados o plantillas simuladas) en componentes o rutas de producción. Si una consulta o API externa no dispone de datos o falla temporalmente, la interfaz debe comunicar con total transparencia que no se dispone de dicha información en ese momento.

## 3. Identidad Visual y Accesibilidad
- **Rojo y blanco dominan.** `--brand`: `#e2001a`, `--background`: `#ffffff`.
- **Sin azul en la interfaz:** Diseñada con tema claro rojo/blanco. Reemplazar tokens por defecto de foco (`--ring`), enlaces y selección por la paleta corporativa.
- **Tema único en MVP:** Claro (rojo y blanco). Declarar `color-scheme: light`.
- **Accesibilidad WCAG 2.2 AA:** Requisito bloqueante en toda pantalla desde la Fase 1. Operable por teclado, foco siempre visible, contraste ≥ 4.5:1, nunca transmitir estados solo con color.
- **Escudos y fotos:** Usar exclusivamente `<TeamCrest>` y `<PlayerPhoto>` de `src/components/media/`.

## 4. Estándar de Comentarios en Código (Industry Clean Code)
- **Explicar el porqué, nunca el qué:** Prohibido parafrasear código obvio (ej. `// increment counter`). Los comentarios justifican decisiones complejas, limitaciones de librerías, casos límite o workarounds técnicos.
- **TSDoc estricto y conciso:** Funciones de dominio, adaptadores y Server Actions deben incluir bloque JSDoc/TSDoc con `@param`, `@returns` y posibles `@throws`.
- **Sin ruido ni código muerto:** Prohibido dejar bloques de código comentado para "después", notas personales o `console.log` de depuración.
- **Marcadores de deuda técnica:** Usar solo `// TODO(issue-number): description` formal cuando quede algo pendiente previamente acordado.

## 5. Anti-patrones Prohibidos
- **Prohibido componentes monolíticos (>180 líneas por archivo):** Todo archivo de componente en `src/` debe mantenerse estrictamente en ≤ 180 líneas. Modularidad preventiva obligatoria: extraer subcomponentes de fila, tabla, canvas, encabezado o módulos de cálculo antes de superar este umbral.
- Prohibido lógica de negocio en JSX o prop drilling >2 niveles.
- Prohibido UI genérica de plantillas IA (sin degradados artificiales ni cards por defecto sin personalizar).
- Prohibido fetch de datos en `useEffect` cuando pueda hacerse en Server Component.
- Prohibido usar `style={{}}` salvo valores dinámicos estrictamente necesarios.
- Prohibido modificar migraciones ya aplicadas.

## 6. Higiene del Repositorio, Seguridad y Portfolio (Auditoría Pública)
> Repositorio insignia para portfolio y revisiones técnicas externas. Todo cambio debe reflejar nivel senior.
- **Commits atómicos y profesionales:** Mensajes estrictamente en inglés con Conventional Commits: `type(scope): imperative description`. Prohibidos mensajes vagos (`fix`, `wip`, `update`).
- **Limpieza de árbol de trabajo:** No commitear archivos residuales, builds (`.next/`), dumps ni logs.
- **Cero fugas de credenciales:** Ningún secreto (`SUPABASE_SERVICE_ROLE_KEY`, `SPORTS_API_KEY`) en el repo. `.env.example` siempre sincronizado con variables requeridas pero con valores vacíos.
- **Checklist previa a commit:** Ejecutar `npm run check` (typecheck + lint + tests) antes de dar la tarea por concluida.

## 7. Referencias y Documentación Detallada
- Visión, Arquitectura y Roadmap: `docs/PROJECT_SPEC.md`
- Sistema de Diseño y Accesibilidad: `docs/DESIGN.md`
- Licencias y Uso de Activos de Terceros: `docs/LEGAL-ASSETS.md`
- Esquema de Base de Datos: `supabase/migrations/`

## 8. Orquestación Automática de Skills (.agents/skills/)

La IA debe consultar y aplicar de forma autónoma las skills instaladas según el contexto del trabajo, sin necesidad de que el usuario lo solicite explícitamente:

| Contexto / Tipo de archivo | Skill obligatoria | Directriz principal |
| :--- | :--- | :--- |
| **Vistas con datos y tablas** (`/temporada`, clasificación, plantillas, estadísticas) | `.agents/skills/design-taste-frontend` | Controlar `VISUAL_DENSITY` (densidad alta pero legible, ritmo visual sobrio sin tarjetas infladas). |
| **Layouts móviles y PWA** (`MainNav`, vistas de móvil, navegación inferior) | `.agents/skills/mobile-native` | Áreas táctiles cómodas (≥44px), ergonomía de pulgar, evitar scroll rebote y emular sensación nativa. |
| **Microinteracciones y feedback** (botones, tarjetas activas, dialogs, tabs) | `.agents/skills/emil-design-eng` | Transiciones rápidas (<200ms), estados `:active` inmediatos y físicas naturales sin animación superflua. |
| **Notificaciones o confirmaciones** (envío de porra, guardado, errores) | `.agents/skills/ask-sonner` | Integración correcta de toasts con `sonner` y alineación con tokens del proyecto. |

> **Regla de conflicto innegociable:** Ante cualquier conflicto de estilo propuesto por una skill, los tokens y restricciones de `docs/DESIGN.md` (tema claro, rojo `#e2001a`, blanco puro y sin tonos azules) tienen prioridad absoluta.

## 9. Principios de Producto y Diseño Minimalista (Orientado a Producción)

El objetivo visual de Mareona es una interfaz deportiva **sobria, directa y sin sobrecarga cognitiva**, accesible tanto para usuarios expertos como ocasionales.

### A. Jerarquía y Claridad de Contenidos
- **Cero prosa explicativa:** Prohibidos los subtítulos descriptivos ("Aquí podrás consultar los partidos...", "Información sobre..."). El contenido debe explicarse solo. Si un elemento necesita un párrafo explicativo para entenderse, el diseño ha fallado.
- **Un único foco principal por pantalla:** Cada vista debe responder a una pregunta clave del usuario de un vistazo:
  - `/temporada`: "¿Cuándo y contra quién jugamos el próximo partido?" (Hero card sobrio) seguido de "¿Cómo vamos en la tabla?" (vista compacta).
  - `/juegos`: "¿Cuál es el partido para pronosticar hoy?" y "¿Cuántos puntos llevo?".
  - `/social`: Conversación directa y limpia, sin barras laterales recargadas de widgets secundarios.
- **Sin pantallas "resumen de resúmenes":** No crear dashboards genéricos llenos de cajitas con métricas vacías. Cada pantalla va directa al grano.
- **Cero duplicidad de títulos en tarjetas:** Prohibido repetir títulos o subtítulos dentro de las tarjetas cuando ya existen selectores en la barra superior o cabecera de la vista.

### B. Uso Restrictivo y Semántico de Elementos Visuales
- **Tipografía y números sobre adornos:** En una app de datos deportivos, el diseño lo marcan los números bien proporcionados (fechas, marcadores, posiciones), los escudos y los espacios en blanco, no las líneas decorativas.
- **Iconos estrictamente funcionales:**
  - En escritorio: enlaces del header solo con texto tipográfico y estado activo limpio.
  - En móvil: barra inferior con iconos claros de navegación.
  - En el resto de la interfaz: prohibido añadir iconos al lado de cada título de tarjeta o etiqueta de texto si no aportan una acción directa o un estado crítico (error/alerta).
- **Tratamiento de tarjetas y superficies:** Evitar anidar cajas dentro de cajas con bordes múltiples. Usar fondo blanco predominante, bordes tenues de un píxel (`--border`) y fondos neutros suaves (`--surface`) solo para separar bloques temáticos claros.
- **Controles de Interfaz y Filtros (Pills & Segmented Controls):**
  - Los selectores de modo y filtros secundarios se ubican en la misma fila superior horizontal, alineados entre sí (vista a la izquierda, filtros contextuales a la derecha).
  - Se presentan con estilo píldora (`rounded-full`), con bordes sutiles y ergonomía táctil.
  - El estado seleccionado de filtros deportivos adopta el rojo corporativo (`bg-[var(--primary)]` o `bg-[#e2001a]`) con texto blanco puro (`text-white`) y tipografía en negrita (`font-bold`).