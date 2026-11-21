# Mareona — Especificación Técnica y Funcional

## 1. Project Manifest & Vision

### 1.1. Resumen ejecutivo

- **Nombre:** Mareona
- **Concepto:** Hub comunitario, red social y plataforma de datos para los aficionados del Real Sporting de Gijón.
- **Formato:** Progressive Web App (PWA): código único, responsiva e instalable en iOS y Android a pantalla completa.
- **Objetivo:** Producto con rigor profesional para portfolio, con usuarios reales y presentable formalmente al club o a patrocinadores locales.
- **Coste de infraestructura:** 0 € (solo planes gratuitos).
- **Idioma de la UI:** Español, con internacionalización (i18n) preparada desde el día 1.

### 1.2. Funcionalidades principales

La aplicación contará con cuatro áreas verticales de primer nivel en la navegación principal.

#### Temporada (`/temporada`)

- **Partidos:** calendario, próximo encuentro, alineaciones probables, marcador en vivo y cronología básica.
- **Clasificación:** tabla clasificatoria actualizada.
- **Datos:** estadísticas de la temporada en curso.
- **Jugadores:** plantilla actual y fichas individuales.

#### Histórico (`/historico`)

- Temporadas pasadas.
- Datos históricos: archivo y estadísticas del club.
- Efemérides.

#### Social (`/social`)

- Feed social ligero por partido.
- Chat general abierto con formato de publicaciones y respuestas.
- Chats privados entre usuarios.

#### Juegos (`/juegos`)

- **La Porra de El Molinón:** pronósticos, puntos y ranking.
- **Trivias semanales.**
- **Wordle Sportinguista, ¿Quién es? y ¿Más o Menos?.**
- **Álbum de Cromos (Memoria Rojiblanca):** apertura de sobres diarios, misiones y colección histórica.
- **Futura Expansión Post-Lanzamiento:** Duelos tácticos 11 vs 11 con los cromos del álbum (ver detalle en `docs/DUELOS_11VS11_SPEC.md`).

**Zona horaria:** `Europe/Madrid` para todos los partidos y juegos diarios.

### 1.3. Stack tecnológico (100 % gratuito)

| Capa | Tecnología | Propósito |
|---|---|---|
| Frontend | Next.js (App Router) | Aplicación web y renderizado |
| Lenguaje | TypeScript estricto | Seguridad de tipos |
| Estilos | Tailwind CSS | Diseño y estilos |
| Componentes UI | shadcn/ui (Radix UI) | Componentes accesibles |
| Backend / Base de datos | Supabase | PostgreSQL, Auth, Row Level Security (RLS) y Storage |
| Despliegue | Vercel | CI/CD continuo desde GitHub |
| PWA | Service Worker propio (`public/sw.js`) + Manifest Web | Instalación y funcionamiento offline compatible con Turbopack |
| Datos deportivos | ESPN + FotMob (adaptadores en servidor con caché L1/L2) | Datos de partidos, clasificaciones y estadísticas |
| Validación | Zod | Validación de datos |
| Tests unitarios e integración | Node.js Test Runner (`node --test`) | Pruebas unitarias, de integración, arquitectura, carga y a11y |
| Tests E2E | Playwright | Pruebas de extremo a extremo |
| Accesibilidad automatizada | Suite `tests/a11y/` + revisión manual WCAG 2.2 AA | Detección de problemas de contraste y accesibilidad |
| Calidad de código | ESLint | Análisis estático |
| Auditoría integral | `npm run check` | Ejecución conjunta de tipado, lint y pruebas |
| Tipado | `tsc --noEmit` | Comprobación de tipos |

### 1.4. Reglas de oro de arquitectura

1. **La base de datos es la última línea de defensa:** aplicar RLS y constraints.
2. **Servidor primero:** utilizar Server Components por defecto.
3. **API deportiva protegida:** nunca llamar a la API deportiva desde el cliente.
4. **Tipos derivados del esquema:** generar los tipos mediante `supabase gen types`.
5. **Simplicidad antes que abstracción:** aplicar el principio YAGNI.
6. **Cambios pequeños:** todo cambio debe ser revisable y reversible.
7. **Protección de secretos:** ninguna credencial debe incluirse en el repositorio.
8. **Accesibilidad desde el primer commit:** cumplir WCAG 2.2 AA en toda la aplicación.
9. **Identidad visual:** utilizar el rojo y el blanco como paleta central de la interfaz.
10. **Tolerancia cero a datos ficticios:** queda prohibido inventar o mockear datos en producción; si falta información o la fuente no responde, se muestra un estado de aviso transparente al usuario.

---

## 2. Estructura y dependencias entre capas

### 2.1. Estructura de carpetas

```text
mareona/
├── docs/
│   ├── adr/
│   ├── api-terms.md
│   ├── assets-licenses.md
│   └── design-tokens-contrast.md
├── public/
│   ├── icons/
│   └── manifest.webmanifest
├── supabase/
│   ├── migrations/
│   ├── seed.sql
│   └── config.toml
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   ├── registro/
│   │   │   └── onboarding/
│   │   ├── (main)/
│   │   │   ├── temporada/
│   │   │   ├── historico/
│   │   │   ├── social/
│   │   │   ├── juegos/
│   │   │   └── perfil/
│   │   ├── (legal)/
│   │   │   ├── accesibilidad/
│   │   │   ├── privacidad/
│   │   │   ├── terminos/
│   │   │   └── acerca-de/
│   │   ├── api/
│   │   │   ├── cron/
│   │   │   └── webhooks/
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/
│   │   ├── brand/
│   │   ├── media/
│   │   └── features/
│   ├── domain/
│   │   ├── season/
│   │   ├── history/
│   │   ├── social/
│   │   ├── games/
│   │   └── shared/
│   ├── application/
│   │   └── casos de uso / Server Actions
│   ├── lib/
│   │   ├── supabase/
│   │   ├── sports-api/
│   │   ├── validation/
│   │   └── utils.ts
│   ├── types/
│   │   ├── database.types.ts
│   │   └── index.ts
│   └── proxy.ts
└── tests/
    ├── e2e/
    ├── integration/
    └── fixtures/
```

### 2.2. Reglas de dependencias entre capas

La arquitectura seguirá el siguiente flujo de dependencias:

```text
app/ (UI y rutas)
    ↓
components/
    ↓
application/ (casos de uso y Server Actions)
    ↓
domain/ (lógica de negocio pura)

lib/ (adaptadores técnicos)
    ↓
Implementaciones de las interfaces utilizadas por application/
```

Reglas:

- **`app/`:** contiene las rutas y la interfaz de usuario. Las páginas deben ser finas y obtener los datos mediante casos de uso.
- **`components/`:** contiene los componentes reutilizables de la interfaz y los componentes específicos de cada funcionalidad.
- **`application/`:** orquesta los casos de uso y coordina el dominio con los adaptadores mediante interfaces.
- **`domain/`:** contiene la lógica de negocio en TypeScript puro. No debe importar React, Next.js ni Supabase.
- **`lib/`:** implementa los adaptadores técnicos, como el acceso a Supabase y la integración con las API deportivas.

### 2.3. Estrategia de caché de datos deportivos

La API externa se consumirá exclusivamente desde `src/lib/sports-api/`, en el servidor.

#### Flujo de lectura

```text
Solicitud de datos
       ↓
¿Existe un dato fresco en Supabase?
       ↓
   ┌───┴───┐
   │       │
   Sí      No
   │       │
   ↓       ↓
Devolver  Consultar API deportiva
caché          ↓
          Persistir en Supabase
               ↓
          Devolver resultado
```

#### TTL por tipo de dato

| Tipo de dato | Tiempo de vida (TTL) |
|---|---|
| Calendario | 12–24 horas |
| Datos en directo | 30–60 segundos, únicamente durante la ventana del partido |
| Clasificación | 1 hora |
| Jugadores | 24 horas–7 días |

#### Control del consumo de API

- Al alcanzar el **80 % de la cuota disponible**, activar el modo «solo caché».
- La sincronización se realizará mediante un cron protegido con `CRON_SECRET`.
- Las solicitudes de los usuarios no deben provocar directamente sincronizaciones con la API deportiva.
- Los partidos en directo se transmitirán al cliente mediante Supabase Realtime, escuchando los cambios de la tabla `matches`.

---

## 3. Roadmap por hitos (MVP)

### Fase 1 — Setup, autenticación y fundamentos de accesibilidad

- Configuración de Next.js y shadcn/ui.
- Definición de los tokens corporativos de diseño.
- Implementación de la autenticación con Supabase Auth.
- Creación de un layout accesible con las cuatro áreas principales.
- Implementación de `TeamCrest` y `PlayerPhoto` con imágenes alternativas o fallbacks.
- Tests de RLS para la tabla `profiles`.

### Fase 2 — Temporada y Porra

- Implementación del adaptador de API de fútbol.
- Implementación de caché persistente en Supabase.
- Desarrollo de las vistas de Temporada:
  - Partidos.
  - Clasificación.
  - Jugadores.
- Implementación de la Porra:
  - Validación del cierre de pronósticos antes del saque inicial.
  - Liquidación atómica de resultados y puntos.
  - Actualización del ranking.

### Fase 3 — Social

- Implementación del feed por partido.
- Implementación del chat general.
- Implementación de chats privados 1:1.
- Funcionalidad de bloqueo de usuarios.
- Sistema de reportes.
- Creación de páginas legales.
- Implementación del borrado de cuentas en cascada conforme al RGPD.

### Fase 4 — Histórico y Juegos

- Incorporación de contenido histórico.
- Implementación de trivias semanales con validación en servidor.
- Desarrollo de Wordle Sportinguista:
  - La palabra objetivo se mantiene exclusivamente en el servidor.
  - La interfaz debe ser accesible.

### Fase 5 — Optimización PWA y caché de APIs

- Implementación del service worker con Serwist.
- Configuración de la instalación como PWA.
- Auditorías Lighthouse:
  - Rendimiento: puntuación objetivo de al menos 90.
  - Accesibilidad: puntuación objetivo de al menos 95.
- Pruebas con lectores de pantalla.
- Elaboración del dossier de presentación del proyecto.

### Fase 6 — Expansión Post-Lanzamiento: Duelos 11 vs 11

> Esta fase se acometerá **exclusivamente post-lanzamiento**, una vez consolidada una base activa de usuarios con masa crítica de cartas coleccionadas (≥ 30–40 cartas por usuario). Ver especificación en `docs/DUELOS_11VS11_SPEC.md`.

- Activación previa del teaser en `/juegos` y en el álbum para generar expectación en el momento oportuno.
- Modo «Retos de Leyenda» (PvE / un jugador) contra plantillas históricas del club (sin depender de concurrencia en directo).
- Modo asíncrono («Squad Battles») contra alineaciones guardadas de otros aficionados.
- Desafíos directos 1:1 mediante enlace privado compartible.

---

## 4. Convenciones, documentación y calidad

### 4.1. Convenciones de nombres

| Elemento | Convención | Ejemplo |
|---|---|---|
| Archivos de componentes | kebab-case | `match-card.tsx` |
| Nombres de componentes React | PascalCase | `MatchCard` |
| Funciones y variables | camelCase | `calculatePoints` |
| Constantes | UPPER_SNAKE_CASE | `MAX_PREDICTION_POINTS` |
| Server Actions | Verbo + sustantivo + `Action` | `submitPredictionAction` |
| Migraciones SQL | `YYYYMMDDHHMMSS_descripcion.sql` | `20261012090000_create_profiles.sql` |
| Commits | Commits semánticos | `feat(social): add match feed` |

Tipos de commit habituales:

- `feat`: nueva funcionalidad.
- `fix`: corrección de errores.
- `refactor`: refactorización.
- `test`: pruebas.
- `db`: cambios en la base de datos.
- `docs`: documentación.
- `chore`: tareas de mantenimiento.

### 4.2. Estándar de comentarios y documentación en código

La documentación TSDoc es obligatoria para:

- Cada función pública del dominio.
- Cada Server Action.
- Cada componente base del sistema de diseño.

#### Ejemplo de documentación TSDoc

```typescript
/**
 * Calculates points awarded for a match prediction based on final score.
 *
 * @param prediction - The user predicted scores.
 * @param actual - The finalized official match scores.
 * @returns Total calculated score based on exact match or outcome rules.
 */
```

#### Comentarios de intención

Los comentarios deben explicar únicamente:

- La razón técnica de una decisión no trivial.
- Los algoritmos matemáticos.
- Las restricciones externas que condicionan una implementación.

**Evitar comentarios redundantes** que describan código autoexplicativo.

### 4.3. Definition of Done de cada tarea

Antes de considerar una tarea terminada, deben cumplirse los siguientes criterios:

- [ ] Compila sin errores mediante `npm run typecheck`.
- [ ] No contiene usos de `any`.
- [ ] `npm run lint` termina sin errores.
- [ ] `npm run format:check` termina sin errores.
- [ ] Se utilizan Server Components por defecto; cualquier directiva `"use client"` está justificada.
- [ ] Se han añadido las pruebas correspondientes y `npm test` termina correctamente.
- [ ] Se han verificado las políticas RLS y la validación con Zod.
- [ ] La interfaz cumple WCAG 2.2 AA, incluyendo navegación por teclado, foco visible y contraste.
- [ ] No hay credenciales expuestas ni dependencias no autorizadas.
- [ ] No existen llamadas directas a la API deportiva desde el cliente.
- [ ] Los comentarios añadidos aportan contexto técnico real y son claros.
- [ ] Se incluye un resumen de los cambios realizados.
- [ ] Se proponen los commits correspondientes.
