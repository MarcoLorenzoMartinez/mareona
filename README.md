<div align="center">

# Mareona

**Plataforma web deportiva y comunitaria de alto rendimiento para el Real Sporting**

[![Despliegue en Producción](https://img.shields.io/badge/Producción-mareona.vercel.app-000000?style=flat-square&logo=vercel&logoColor=white)](https://mareona.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-15%20App%20Router-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict%20Mode-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%7C%20Auth%20%7C%20RLS-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![WCAG](https://img.shields.io/badge/WCAG-2.2%20AA%20Compliant-E2001A?style=flat-square)](https://www.w3.org/WAI/standards-guidelines/wcag/)

<br />

[Aplicación en Directo](https://mareona.vercel.app) &nbsp;&bull;&nbsp; [Memoria Técnica de Ingeniería](docs/TECHNICAL_DOCS.md) &nbsp;&bull;&nbsp; [Contacto](#autor)

</div>

---

## 1. Visión del Producto

<!--
GUÍA DE REDACCIÓN:
- Expón la motivación principal del desarrollo y qué representa Mareona para el ecosistema sportinguista.
- Plantea la problemática actual: plataformas deportivas saturadas de publicidad intrusiva, lentitud de carga, interfaces genéricas y falta de un punto de encuentro ágil y enfocado.
- Define el valor diferencial: arquitectura Server-First, datos deportivos reales sincronizados sin datos ficticios de relleno, estética corporativa sobria y diseño centrado en el usuario.
-->

[Redacta aquí la visión general, contexto y propuesta de valor de la plataforma...]


---

## 2. Módulos y Funcionalidades del Sistema

<!--
GUÍA DE REDACCIÓN:
Describe cada sección principal y sus correspondientes subsecciones o pantallas.
Puedes ilustrar cada pantalla con capturas reales cuando lo consideres oportuno:
![Vista de la pantalla](docs/assets/nombre-captura.png)
-->

### 2.1. Inicio (`/`)
<!--
- Punto de entrada principal a la experiencia Mareona.
- Hero card con el próximo partido o resultado en directo del Real Sporting.
- Accesos rápidos a las áreas más activas (clasificación, porra de la jornada, debates destacados).
-->
[Describe aquí la pantalla de Inicio...]

---

### 2.2. Temporada (`/temporada`)

#### Partidos (`/temporada/partidos` y `/temporada/partidos/[id]`)
<!--
- Calendario completo de partidos oficiales de la temporada (LaLiga Hypermotion y Copa del Rey).
- Ficha de detalle de partido: cronología, eventos en directo, alineaciones, estadísticas y cara a cara (H2H).
-->
[Describe aquí la sección de Partidos...]

#### Clasificación (`/temporada/clasificacion`)
<!--
- Tabla de clasificación oficial y dinámica de LaLiga Hypermotion con puestos de ascenso directo, playoff y descenso.
- Métricas: puntos, partidos jugados, diferencia de goles y racha de resultados.
-->
[Describe aquí la Clasificación...]

#### Estadísticas (`/temporada/estadisticas`)
<!--
- Estadísticas colectivas e individuales de la temporada.
- Goleadores, asistentes, tarjetas y datos avanzados de rendimiento.
-->
[Describe aquí las Estadísticas...]

#### Plantilla (`/temporada/plantilla` y `/temporada/plantilla/[id]`)
<!--
- Directorio de la plantilla oficial del primer equipo clasificada por demarcaciones (porteros, defensas, medios, delanteros).
- Ficha individual de jugador: dorsal, estadísticas de temporada, minutos jugados y trayectoria.
-->
[Describe aquí la Plantilla...]

#### Mi Once (`/temporada/pizarra`)
<!--
- Pizarra táctica interactiva para configurar y analizar formaciones y sistemas de juego.
-->
[Describe aquí Mi Once...]

---

### 2.3. Histórico (`/historico`)

#### Trayectoria (`/historico`)
<!--
- Archivo histórico de la trayectoria temporada a temporada del Real Sporting en las distintas categorías.
-->
[Describe aquí la Trayectoria...]

#### Efemérides (`/historico/efemerides`)
<!--
- Efemérides, acontecimientos y fechas destacadas de la historia del club día a día.
-->
[Describe aquí las Efemérides...]

#### Rivales (`/historico/rivales`)
<!--
- Balance histórico de enfrentamientos frente a cada club rival (victorias, empates, derrotas y goles).
-->
[Describe aquí los Rivales...]

#### Legado (`/historico/legado`)
<!--
- Hitos, ascensos, temporadas célebres, trofeos y memoria histórica rojiblanca.
-->
[Describe aquí el Legado...]

---

### 2.4. Social (`/social`)

#### La Tertulia (`/social`)
<!--
- Muro de publicaciones y debate con filtros de vista ("Todos" y "Amigos").
- Publicación de opiniones, contenido de actualidad y seguimiento de la afición.
-->
[Describe aquí La Tertulia...]

#### Hilos de Conversación
<!--
- Vista de hilo para respuestas anidadas, réplicas y debates ordenados por publicación.
-->
[Describe aquí los Hilos de conversación...]

#### Mensajería Directa
<!--
- Mensajería privada y directa entre aficionados registrados.
-->
[Describe aquí la Mensajería Directa...]

---

### 2.5. Juegos (`/juegos`)

#### Memoria Rojiblanca (`/juegos/album`)
<!--
- Álbum de cromos digital y coleccionables históricos para desbloquear por participación y aciertos.
-->
[Describe aquí Memoria Rojiblanca...]

#### La Porra de la Mareona (`/juegos/porra`)
<!--
- Pronóstico del resultado del próximo partido oficial antes del pitido inicial.
- Sistema de puntuación algorítmica y tabla clasificatoria general (Leaderboard).
-->
[Describe aquí La Porra de la Mareona...]

#### Wordle (`/juegos/wordle`)
<!--
- Pasatiempo diario de adivinar el término, jugador o concepto sportinguista en 6 intentos.
-->
[Describe aquí Wordle...]

#### La Pregunta del Día (`/juegos/pregunta-del-dia`)
<!--
- Trivia diario de conocimiento sobre la historia y actualidad del club.
-->
[Describe aquí La Pregunta del Día...]

#### ¿Quién es? (`/juegos/quien-es`)
<!--
- Juego diario de adivinanza de futbolistas a partir de pistas progresivas (nacionalidad, posición, dorsal, etc.).
-->
[Describe aquí ¿Quién es?...]

#### ¿Mayor o Menor? (`/juegos/mayor-menor`)
<!--
- Minijuego estadístico de comparación de registros y récords de futbolistas rojiblancos.
-->
[Describe aquí ¿Mayor o Menor?...]

---

### 2.6. Perfil (`/perfil`)
<!--
- Panel de usuario: historial de pronósticos, colección desbloqueada y posición en clasificaciones.
- Métodos de acceso seguros (Google OAuth y Magic Link).
-->
[Describe aquí el Perfil de usuario...]


---

## 3. Principios de Ingeniería y Diseño

<!--
GUÍA DE REDACCIÓN:
Detalla los estándares técnicos y de diseño aplicados en el proyecto.
-->

### Identidad Visual y Experiencia
<!--
- Paleta cromática corporativa estricta basada en el rojo y blanco (#E2001A), eliminando colores discordantes.
- Tipografía sans-serif con alineación tabular (tabular-nums) para datos deportivos y tiempos, evitando estéticas informales.
- Eliminación de sobrecarga cognitiva: sin banners publicitarios ni prosa innecesaria.
-->
[Describe aquí los criterios de identidad visual y diseño de interfaz...]

### Experiencia Móvil (PWA)
<!--
- Aplicación Web Progresiva instalable con comportamiento y rendimiento equivalentes a una aplicación nativa.
- Ergonomía adaptada a interacción con una sola mano y áreas táctiles que respetan el estándar de 44px.
-->
[Describe aquí la implementación móvil y PWA...]

### Accesibilidad (WCAG 2.2 AA)
<!--
- Navegación íntegramente operable mediante teclado.
- Ratios de contraste de color superiores a 4.5:1 en todos los elementos de texto y controles.
- Semántica HTML estricta y compatibilidad con tecnologías de asistencia.
-->
[Describe aquí los estándares de accesibilidad aplicados...]


---

## 4. Ficha Técnica

| Ámbito | Tecnología / Herramienta | Rol en la Arquitectura |
| :--- | :--- | :--- |
| **Framework Base** | Next.js 15 (App Router) | Renderizado del lado del servidor (RSC), Server Actions y rutas API |
| **Lenguaje** | TypeScript | Tipado estático estricto en la totalidad de la base de código |
| **Base de Datos** | PostgreSQL (Supabase) | Modelo relacional, funciones almacenadas y políticas Row Level Security |
| **Autenticación** | Supabase Auth | Flujo de credenciales mediante OAuth 2.0 y enlaces mágicos |
| **Estilos** | Tailwind CSS | Sistema de diseño basado en tokens de diseño corporativos |
| **Validación** | Zod | Validación de esquemas y tipos en el borde de entrada |
| **Testing** | Node Test Runner / Playwright | Pruebas unitarias, de integración, accesibilidad y extremo a extremo |
| **Despliegue** | Vercel | Infraestructura cloud edge con despliegue continuo (CI/CD) |


---

## 5. Memoria Técnica de Arquitectura

Para una revisión técnica exhaustiva que cubre los diagramas de arquitectura C4, especificación del modelo relacional, políticas de seguridad Zero Trust (RLS), mecanismos de sincronización e ingesta de datos deportivos y la suite de pruebas del sistema:

Consulte la memoria técnica completa:  
**[Documentación Técnica de Ingeniería &rarr;](docs/TECHNICAL_DOCS.md)**


---

## 6. Autor

**Marco Lorenzo Martínez**  
Ingeniero Informático  

- **Despliegue:** [mareona.vercel.app](https://mareona.vercel.app)
- **GitHub:** [@MarcoLorenzoMartinez](https://github.com/MarcoLorenzoMartinez)
- **LinkedIn:** [Enlace a perfil profesional]
- **Contacto:** [Correo electrónico profesional]
