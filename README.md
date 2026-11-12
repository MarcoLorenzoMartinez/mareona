# Mareona — Hub Digital de la Afición del Real Sporting

<p align="center">
  <img src="public/icons/icon-512x512.png" alt="Mareona Logo" width="120" height="120" style="border-radius: 24px;" />
</p>

<p align="center">
  <strong>Plataforma comunitaria, red social y centro de datos históricos y en directo para los aficionados del Real Sporting de Gijón.</strong>
</p>

<p align="center">
  <a href="#-módulos-de-la-aplicación">Módulos</a> •
  <a href="#-filosofía-de-diseño-y-experiencia-de-usuario">Diseño</a> •
  <a href="#-progressive-web-app-pwa">PWA Móvil</a> •
  <a href="#-calidad-y-estándares-de-ingeniería">Calidad</a> •
  <a href="#-inicio-rápido">Instalación</a> •
  <a href="docs/ARCHITECTURE.md">Arquitectura Técnica</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.4-black?style=flat-square&logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-Strict-3178c6?style=flat-square&logo=typescript" alt="TypeScript Strict" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL%20RLS-3ecf8e?style=flat-square&logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat-square&logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Accessibility-WCAG%202.2%20AA-e2001a?style=flat-square" alt="WCAG 2.2 AA" />
  <img src="https://img.shields.io/badge/Tests-493%20passed-brightgreen?style=flat-square" alt="Tests" />
  <img src="https://img.shields.io/badge/Lighthouse-SEO%20100%20%7C%20Perf%2096-orange?style=flat-square" alt="Lighthouse" />
</p>

---

## 📖 Visión del Proyecto

**Mareona** nace para ofrecer al sportinguismo un hogar digital moderno, sobrio y completo. Diseñada como una **Progressive Web App (PWA)** de alto rendimiento, unifica en una sola experiencia interactiva el seguimiento de la temporada en directo, más de un siglo de archivo histórico oficial, minijuegos diarios con ranking y una grada social participativa y segura.

El proyecto está construido bajo estándares de desarrollo senior para producción: tolerancia cero a datos ficticios, políticas de seguridad **Row Level Security (RLS)** activas en cada tabla de base de datos, tipografía tabular accesible, cumplimiento estricto de **WCAG 2.2 AA** y tiempos de respuesta inmediatos en cualquier dispositivo.

---

## 🌟 Módulos de la Aplicación

### 1. ⚽ Temporada en Vivo (`/temporada`)
* **Calendario y Próximo Encuentro:** Hero card sobrio con cuenta atrás, designación arbitral, estadio y televisión.
* **Acta de Partido en Tiempo Real:** Marcador en vivo, cronología de eventos (goles, tarjetas, sustituciones), estadísticas avanzadas (posesión, tiros, xG) y mapa táctico sobre el terreno de juego.
* **Clasificación Oficial:** Tabla de Segunda División actualizada con zonas de ascenso directo, playoff y descenso, además de balance local/visitante.
* **Plantilla y Fichas:** Estadísticas individuales de cada jugador rojiblanco con dorsales, minutos, titularidades y rendimiento.

### 2. 🎮 Zona de Juegos y Colección (`/juegos`)
* **La Porra de El Molinón:** Pronóstico de marcador, primer goleador y minuto para cada partido oficial. Sistema de puntuación transparente y ranking general de la afición.
* **Álbum de Cromos Sportinguistas:** Apertura de sobres (Aficionado, Rojiblanco y Leyenda) con valoraciones OVR, halo dinámico y colección física digitalizada con filtros por época y posición.
* **Wordle Sportinguista:** Desafío diario de palabras y apellidos históricos con algoritmo de bolsa determinista no repetitiva.
* **¿Quién es? (Who Are Ya):** Adivina el futbolista del Sporting en 6 intentos a través de su silueta, edad, posición, nacionalidad y dorsal.
* **Pregunta del Día:** Trivia histórica con efemérides y momentos dorados del club.
* **Mayor o Menor:** Minijuego de racha estadística sobre goles, partidos jugados y minutos históricos.

### 3. 💬 Comunidad y Tertulia Rojiblanca (`/social`)
* **Grada de Partido:** Conversación y debate en tiempo real ligado al hilo específico de cada encuentro oficial.
* **Tertulia General:** Publicaciones, encuestas interactivas de 2 a 4 opciones y réplicas con árbol de respuestas anidadas.
* **Mensajes Directos:** Mensajería privada y lista de amigos entre aficionados autenticados, blindada por políticas PostgreSQL RLS.
* **Seguridad y Moderación:** Sistema de denuncias, bloqueo mutuo instantáneo y pre-moderación inteligente contra lenguaje ofensivo o spam.

### 4. 📜 Archivo Histórico (`/historico`)
* **Actas Digitalizadas:** Consulta de encuentros históricos oficiales con alineaciones titulares, suplentes, entrenadores y árbitros.
* **Histórico frente a Rivales:** Balance histórico de enfrentamientos agrupado por comunidades autónomas.
* **Buscador de Futbolistas:** Archivo de leyendas que han defendido la elástica rojiblanca.

### 5. 📋 Pizarra Táctica / Mi Once
* Constructor interactivo de alineaciones en formato arrastrar/pulsar sobre el césped de El Molinón.
* Soporte para múltiples esquemas tácticos (4-4-2, 4-2-3-1, 4-3-3, 5-3-2), canteranos invitados y opción de compartir en la Tertulia con un clic.

---

## 🎨 Filosofía de Diseño y Experiencia de Usuario

Mareona sigue una línea visual deportiva **sobria, minimalista y libre de saturación cognitiva**, inspirada en los principios de diseño de Emil Kowalski y en el manual corporativo del club:

* **Paleta Rojiblanca Auténtica:** El rojo corporativo (`#e2001a`) y el blanco puro dominan la superficie. Se prohíbe el uso de azules en anillos de foco o componentes interactivos (`--ring: #b80015`).
* **Tipografía Numérica Tabular (Cero `font-mono`):** Todas las marcas de tiempo, marcadores, dorsales y estadísticas emplean la tipografía de sistema con espaciado uniforme (`font-sans tabular-nums`), erradicando estéticas de terminal o plantillas genéricas.
* **Cero Prosa Explicativa:** La interfaz se explica a través de la jerarquía visual, la tipografía y los datos; sin textos redundantes de relleno.
* **Controles Táctiles Píldora (`rounded-full`):** Selectores y filtros ergonómicos con áreas de contacto táctil de al menos 44×44 px.

---

## 📱 Progressive Web App (PWA)

Mareona funciona como una aplicación nativa instalable tanto en teléfonos móviles como en ordenadores:

* **iOS (Safari):** Pulsa el botón *Compartir* (icono de flecha) y selecciona **"Añadir a la pantalla de inicio"**.
* **Android (Chrome):** Pulsa el menú de tres puntos o el banner inferior y selecciona **"Instalar aplicación"**.
* **Experiencia a pantalla completa:** Sin barras de navegación del navegador, con soporte para gestos táctiles, arranque instantáneo y modo de contingencia offline (`/offline`).

---

## 🏆 Calidad y Estándares de Ingeniería

El proyecto se somete a una rigurosa batería de pruebas automáticas que evalúa **9 dimensiones** de software antes de cada integración:

```
▶ Resumen de Calidad Automatizada
  ✔ Unitarias: Algoritmos de Wordle, Trivia, Who Are Ya y resolución de posiciones
  ✔ Integración: Publicaciones, encuestas, árbol de comentarios y denuncias
  ✔ E2E (Playwright): Flujos críticos de navegación, Porra, Grada y ruta offline
  ✔ Accesibilidad: Contraste matemático WCAG 2.2 AA (>= 4.5:1) y modales accesibles
  ✔ Usabilidad: Ergonomía táctil móvil, foco por teclado y prevención de errores
  ✔ Rendimiento (Lighthouse): Métricas Core Web Vitals (LCP < 1.2s, CLS 0)
  ✔ Código & Arquitectura: Tolerancia cero a @ts-ignore, cero font-mono, nombre canónico
  ✔ Seguridad: Políticas Supabase RLS verificadas y desinfección Zod
  ✔ Concurrencia & Carga: Resiliencia ante ráfagas concurrentes y degradación de APIs

  Total: 493 tests passing (0 fallos)
```

---

## 🚀 Inicio Rápido

### Prerrequisitos
* **Node.js** v20+ o v24+
* **npm** v10+
* Cuenta de **Supabase** (o instancia local de desarrollo)

### Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/mareona.git
   cd mareona
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   Copia el archivo de ejemplo y completa tus credenciales:
   ```bash
   cp .env.example .env.local
   ```
   Variables principales requeridas:
   * `NEXT_PUBLIC_SUPABASE_URL`: URL de tu proyecto Supabase.
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Clave anónima pública de Supabase.
   * `SUPABASE_SERVICE_ROLE_KEY`: Clave de servicio privada (solo en servidor).
   * `SPORTS_API_KEY`: Clave de ingesta de datos deportivos.

4. **Ejecutar en desarrollo:**
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Comandos de Calidad

* **Comprobación completa (Tipos + Linter + Tests):**
  ```bash
  npm run check
  ```
* **Ejecutar batería de tests:**
  ```bash
  npm test
  ```
* **Pruebas End-to-End con Playwright:**
  ```bash
  npm run test:e2e
  ```
* **Auditoría de Rendimiento Lighthouse:**
  ```bash
  npm run audit:perf
  ```

---

## 📚 Documentación Técnica Detallada

Para consultar la arquitectura interna del sistema, diagramas de flujo de datos, diseño de base de datos PostgreSQL, políticas RLS y decisiones arquitectónicas (ADRs), consulta el documento técnico senior:

👉 **[Documento de Arquitectura Técnica (docs/ARCHITECTURE.md)](docs/ARCHITECTURE.md)**

---

## ⚖️ Aviso Legal y Derechos

Mareona es un proyecto comunitario independiente sin ánimo de lucro desarrollado con fines divulgativos, deportivos y formativos. Todos los escudos, fotografías históricas y marcas mencionadas pertenecen a sus respectivos propietarios legales.

Desarrollado con orgullo y pasión rojiblanca desde Gijón. ¡Puxa Sporting! 🔴⚪
