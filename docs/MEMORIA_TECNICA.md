# Mareona - Memoria Técnica

> **Estado:** plantilla (esquema de contenidos). Cada sección indica qué se va a explicar, qué diagramas llevará y de dónde se sacará la información. Las secciones se irán redactando una a una y se sustituirá la descripción por el texto final.
>
> Este documento no sustituye a [TECHNICAL_DOCS.md](TECHNICAL_DOCS.md), que se mantiene como material de apoyo.

## Criterios de redacción

- Frases cortas y directas, en español, en primera persona del plural o impersonal, como en la memoria del TFG.
- Cada decisión se explica con el problema, las alternativas consideradas y el motivo de la elección.
- Sin adjetivos grandilocuentes ni listas de relleno. Si algo se entiende con un diagrama, se pone el diagrama.
- Diagramas en Mermaid (se ven directamente en GitHub y en el editor). Capturas reales de la aplicación en `docs/screenshots/`.
- Los términos técnicos que se usen se explican la primera vez que aparecen.
- Longitud objetivo: unas 40-60 páginas en total.

## Capítulos del TFG que se usan y cuáles se descartan

| Capítulo del TFG | Decisión | Motivo |
| :--- | :--- | :--- |
| 1. Memoria del proyecto | **Se adapta** | Da la visión global y el mapa del documento |
| 2. Introducción | **Se adapta** (reducido) | Justificación, objetivos y alternativas tecnológicas |
| 3. Aspectos teóricos | **Se descarta** | Los conceptos necesarios se explican donde se usan (RLS, PWA, RSC...) |
| 4. Planificación y presupuesto iniciales | **Se descarta** | Proyecto sin presupuesto; el stack es 100 % gratuito |
| 5. Análisis | **Se adapta** | Requisitos, actores, casos de uso y subsistemas |
| 6. Diseño | **Se adapta** (es el núcleo) | Arquitectura, base de datos, interacción e interfaz |
| 7. Implementación | **Se adapta** | Estándares, herramientas y problemas encontrados |
| 8. Pruebas | **Se adapta** (reducido) | Unitarias, integración, E2E, accesibilidad, carga y código |
| 9. Manuales | **Solo manual de usuario** y un manual del programador corto | Instalación y ejecución se resumen en el programador |
| 10. Conclusiones y ampliaciones | **Se adapta** | Valoración y líneas futuras |
| 11. Planificación y presupuesto finales | **Se descarta** | Igual que el 4 |
| 12. Referencias | **Se adapta** | Lista corta de fuentes y documentación oficial |

---

## Índice propuesto

1. [Memoria del proyecto](#1-memoria-del-proyecto)
2. [Introducción](#2-introducción)
3. [Análisis](#3-análisis)
4. [Diseño del sistema](#4-diseño-del-sistema)
5. [Implementación](#5-implementación)
6. [Pruebas](#6-pruebas)
7. [Manuales](#7-manuales)
8. [Conclusiones y ampliaciones](#8-conclusiones-y-ampliaciones)
9. [Referencias](#9-referencias)

---

## 1. Memoria del proyecto

*Equivale al capítulo 1 del TFG. Una o dos páginas.*

- **1.1 Motivación, objetivos y alcance.** Qué es Mareona (plataforma web y PWA para la afición del Real Sporting), por qué se hace, qué queda dentro y fuera del alcance.
- **1.2 Resumen de los capítulos.** Una línea por capítulo, igual que en el TFG.
- **1.3 El proyecto en cifras.** Tabla corta: número de pantallas, tablas de BD, migraciones, tests por nivel, fuentes de datos externas.

**Diagrama:** mapa de módulos de la aplicación (Inicio, Temporada, Social, Histórico, Juegos, Perfil, Administración).
**Fuentes:** `README.md`, `docs/PROJECT_SPEC.md` (sección 1).

## 2. Introducción

*Equivale al capítulo 2 del TFG, sin el estudio extenso de mercado.*

- **2.1 Justificación.** Qué echa en falta la afición hoy: datos dispersos, sin comunidad propia, sin histórico accesible.
- **2.2 Objetivos.** Objetivos funcionales (datos, comunidad, juegos, histórico) y técnicos (coste cero, accesibilidad WCAG 2.2 AA, PWA, seguridad).
- **2.3 Situación actual.** Comparativa breve con apps y webs existentes (tabla de funcionalidades).
- **2.4 Alternativas tecnológicas.** Por cada decisión grande, tabla con opciones y motivo de la elección:
  - Framework: Next.js (App Router) frente a otras opciones.
  - Backend: Supabase (PostgreSQL, Auth, Storage) frente a backend propio.
  - Despliegue: Vercel.
  - Fuente de datos deportivos: ESPN, FotMob y datos históricos propios.
  - Estilos y componentes: Tailwind CSS 4, shadcn/Radix.

**Diagrama:** tabla comparativa (no diagrama).
**Fuentes:** `TECHNICAL_DOCS.md` §1, `PROJECT_SPEC.md` §1.3-1.4.

## 3. Análisis

*Equivale al capítulo 5 del TFG, simplificado: no se hace la especificación completa caso por caso.*

- **3.1 Definición y alcance del sistema.**
- **3.2 Actores.** Visitante sin cuenta, usuario registrado (email y Google), moderador, administrador. Qué puede hacer cada uno.
- **3.3 Requisitos.**
  - Funcionales agrupados por módulo, con identificador (RF-01...).
  - No funcionales: rendimiento, accesibilidad, seguridad, privacidad (RGPD), disponibilidad offline, coste.
- **3.4 Casos de uso.** Un diagrama por módulo y una tabla resumen. Solo se detallan los casos más importantes (registro e inicio de sesión, enviar porra, publicar con moderación, abrir un sobre, jugar a un juego diario).
- **3.5 Subsistemas.** Descripción de cada uno y sus interfaces:
  - Datos deportivos (ingesta y caché)
  - Temporada (partidos, clasificación, estadísticas, pizarra táctica)
  - Archivo histórico
  - Social (muro, encuestas, amistades, mensajes directos, La Grada)
  - Moderación y reportes
  - Juegos (Wordle, ¿Quién es?, Más o menos, trivia) y coleccionismo de cartas
  - Duelos 11 vs 11
  - Administración, auditoría y telemetría
  - PWA y modo offline
- **3.6 Modelo de dominio.** Entidades principales y relaciones, antes de entrar en la base de datos.
- **3.7 Navegabilidad.** Mapa de rutas de la aplicación.
- **3.8 Relación requisitos - casos de uso.** Tabla de trazabilidad.

**Diagramas:** casos de uso por módulo, subsistemas con sus dependencias, modelo de dominio, mapa de navegación.
**Fuentes:** `PROJECT_SPEC.md` §1.2 y §3, `DUELOS_11VS11_SPEC.md`, estructura de `src/app`.

## 4. Diseño del sistema

*Equivale al capítulo 6 del TFG. Es el capítulo más importante y el que más diagramas lleva.*

### 4.1 Arquitectura

- **4.1.1 Visión general.** Diagrama de bloques: navegador, Vercel (Next.js), Supabase, APIs deportivas.
- **4.1.2 Capas y reglas de dependencia.** `app` → `components` → `lib` → `types`. Qué capa puede importar a cuál y cómo se comprueba (test de arquitectura).
- **4.1.3 Server Components y Client Components.** Cuándo se usa cada uno y por qué.
- **4.1.4 Despliegue e infraestructura.** Diagrama de despliegue: cliente, edge/servidor de Vercel, base de datos, almacenamiento, servicios externos.
- **4.1.5 Sesión y autenticación.** Proxy de sesión, callback OAuth, cookies.

**Diagramas:** bloques generales, capas, componentes, despliegue.

### 4.2 Base de datos

- **4.2.1 Elección y uso de PostgreSQL con Supabase.**
- **4.2.2 Diagrama entidad-relación.** Dividido por bloques (usuarios, social, cartas, moderación y administración, caché deportiva) para que se lea bien.
- **4.2.3 Diccionario de datos.** Tabla resumida por entidad con sus campos clave.
- **4.2.4 Row Level Security.** Qué política tiene cada tabla y por qué. Tabla de políticas.
- **4.2.5 Funciones y triggers.** Qué lógica vive en la base de datos y por qué (por ejemplo, borrado de cuenta, bloqueo mutuo, sincronización de cartas).
- **4.2.6 Migraciones.** Cómo se versionan y la regla de no modificar las ya aplicadas.

**Fuentes:** `supabase/migrations/` (16 migraciones), `TECHNICAL_DOCS.md` §3.

### 4.3 Diseño de los subsistemas

Un apartado corto por subsistema, con el mismo formato: **problema → diseño → diagrama → decisiones**.

- **4.3.1 Datos deportivos.** Adaptadores, normalización de nombres (`normalizeTeamName`), caché en Supabase y por qué nunca se llama a la API desde el cliente. *Diagrama de secuencia: petición → caché → API externa.*
- **4.3.2 Temporada.** Partidos, partido en directo (polling), clasificación (tabla, distancia real, evolución), estadísticas, mapas de disparos y momentum.
- **4.3.3 Archivo histórico.** Origen de los datos, formato y mapas SVG.
- **4.3.4 Social.** Muro, encuestas, amistades y mensajes directos con borrado lógico.
- **4.3.5 Moderación.** Flujo de un post: validación, moderación automática, bloqueo, reporte, revisión. *Diagrama de estados del post y de actividad de moderación.*
- **4.3.6 Juegos y cartas.** Motor de cada juego, palabra o jugador del día (permutación diaria), sobres, inventario y álbum. *Diagrama de estados de un sobre.*
- **4.3.7 Porra.** Corte antes del partido, cálculo de puntos y ranking. *Diagrama de secuencia.*
- **4.3.8 Duelos 11 vs 11.** Pizarra táctica, formaciones y resolución del duelo.
- **4.3.9 Administración, auditoría y telemetría.** Roles, registro de acciones, visitas y errores del cliente.
- **4.3.10 PWA y offline.** Service Worker, cola de sincronización, instalación por plataforma. *Diagrama de secuencia de una acción sin conexión.*

### 4.4 Seguridad y privacidad

- Cabeceras HTTP y límite de peticiones.
- Validación de toda entrada externa con Zod.
- Separación de variables sensibles (`server-only`) y `user_id` siempre desde la sesión.
- Privacidad: borrado de cuenta, custodia legal de mensajes, textos legales, cookies.
- Escudos y fotografías: licencias y uso de `<TeamCrest>` y `<PlayerPhoto>`.

**Diagrama:** cadena de seguridad de una petición (cliente → proxy → validación → RLS).
**Fuentes:** `TECHNICAL_DOCS.md` §6, `LEGAL-ASSETS.md`.

### 4.5 Diseño de la interfaz

- **4.5.1 Identidad visual.** Rojo y blanco, tipografía, tokens de `DESIGN.md`.
- **4.5.2 Principios.** Una pregunta por pantalla, sin prosa explicativa, sin iconos decorativos.
- **4.5.3 Componentes reutilizables.** Píldoras, tablas, tarjetas, modales.
- **4.5.4 Versión móvil.** Navegación inferior, áreas táctiles de 44 px.
- **4.5.5 Accesibilidad.** Cómo se aplica WCAG 2.2 AA en el diseño: foco, contraste, teclado.

**Imágenes:** capturas de `docs/screenshots/`.
**Fuentes:** `DESIGN.md`, `TECHNICAL_DOCS.md` §7.

## 5. Implementación

*Equivale al capítulo 7 del TFG.*

- **5.1 Estándares y normas seguidos.** WCAG 2.2 AA, RGPD/LOPDGDD, Conventional Commits, TSDoc, reglas de `AGENTS.md`.
- **5.2 Lenguajes y tecnologías.** TypeScript estricto, SQL (PostgreSQL), CSS con Tailwind. Versiones usadas.
- **5.3 Herramientas.** Editor, Node, ESLint, Playwright, Lighthouse, Supabase CLI, Vercel. Tabla con propósito de cada una.
- **5.4 Estructura del código.** Árbol de carpetas comentado.
- **5.5 Calidad del código.** TypeScript sin `any`, límite de 180 líneas por componente, `npm run check`, test de arquitectura.
- **5.6 Problemas encontrados y soluciones.** Esta sección tiene el mismo papel que el 7.4.1 del TFG. Se redactará **a partir del historial de commits y de lo que el autor recuerde**. Candidatos iniciales:
  - Fuentes de datos deportivas inestables o con nombres distintos del club.
  - Caché y límites de las APIs externas.
  - Login con Google dentro de una PWA instalada.
  - Funcionamiento sin conexión y sincronización.
  - Rendimiento de las páginas con muchos datos (auditoría con Lighthouse).
  - Moderación automática de contenido.

## 6. Pruebas

*Equivale al capítulo 8 del TFG, más corto.*

- **6.1 Estrategia.** Pirámide de pruebas del proyecto con el número de tests por nivel.
- **6.2 Unitarias.** Motores de juego, porra, formatos de fecha, parsers, esquemas Zod.
- **6.3 Integración.** Acciones del servidor del muro social y de La Grada.
- **6.4 Extremo a extremo (Playwright).** Navegación pública, porra, muro social, seguridad de administración y offline.
- **6.5 Accesibilidad.** Contraste WCAG, estándares de modales, revisión manual.
- **6.6 Carga y resiliencia.** Pruebas de concurrencia y auditoría de rendimiento (Lighthouse).
- **6.7 Pruebas de código.** Reglas de arquitectura y límites de tamaño.
- **6.8 Defectos detectados y mejoras aplicadas.**

**Diagrama:** pirámide de pruebas.
**Fuentes:** carpeta `tests/`, `package.json`, `scripts/audit-performance.mjs`.

## 7. Manuales

*Equivale al capítulo 9 del TFG, centrado en el manual de usuario.*

- **7.1 Manual de usuario.** Con capturas reales, siguiendo el recorrido de un aficionado:
  - Registro e inicio de sesión (email y Google)
  - Inicio
  - Temporada: partidos, clasificación, estadísticas
  - Histórico
  - Juegos y álbum de cartas
  - Social: muro, amigos, mensajes
  - Perfil y borrado de cuenta
  - Instalación como app
  - Funciones de administrador y moderador
- **7.2 Manual del programador (breve).**
  - Requisitos, variables de entorno (`.env.example`) y puesta en marcha en local
  - Comandos principales (`dev`, `build`, `test`, `check`)
  - Cómo añadir una migración, un juego o una fuente de datos

**Fuentes:** `docs/screenshots/`, `EMAIL-SETUP.md`, `GOOGLE-LOGIN-SETUP.md`, `README.md`.

## 8. Conclusiones y ampliaciones

*Equivale al capítulo 10 del TFG.*

- **8.1 Conclusiones.** Qué se ha conseguido frente a los objetivos del capítulo 2 y qué conocimientos se han aplicado.
- **8.2 Ampliaciones.** Ideas futuras (a confirmar con el autor).

## 9. Referencias

Documentación oficial de Next.js, React, Supabase, WCAG 2.2, RGPD y las APIs o fuentes de datos usadas.

---

## Resumen de diagramas previstos

| Nº | Diagrama | Sección | Tipo |
| :-- | :--- | :--- | :--- |
| 1 | Mapa de módulos | 1 | Bloques |
| 2 | Casos de uso por módulo | 3.4 | Casos de uso |
| 3 | Subsistemas y dependencias | 3.5 | Bloques |
| 4 | Modelo de dominio | 3.6 | Clases |
| 5 | Mapa de navegación | 3.7 | Flujo |
| 6 | Arquitectura general | 4.1.1 | Bloques |
| 7 | Capas y reglas de dependencia | 4.1.2 | Flujo |
| 8 | Despliegue | 4.1.4 | Despliegue |
| 9 | Entidad-relación (por bloques) | 4.2.2 | ER |
| 10 | Ingesta y caché deportiva | 4.3.1 | Secuencia |
| 11 | Estados de un post | 4.3.5 | Estados |
| 12 | Flujo de moderación | 4.3.5 | Actividad |
| 13 | Estados de un sobre de cartas | 4.3.6 | Estados |
| 14 | Envío de porra | 4.3.7 | Secuencia |
| 15 | Acción sin conexión y sincronización | 4.3.10 | Secuencia |
| 16 | Cadena de seguridad de una petición | 4.4 | Flujo |
| 17 | Pirámide de pruebas | 6.1 | Gráfico |

## Pendiente de confirmar con el autor

1. ¿Se incluye una sección de problemas encontrados (5.6)? Necesito que aportes los que recuerdes, además de lo que saque del historial de git.
2. ¿Las ampliaciones futuras (8.2) las defines tú o propongo una lista?
3. ¿Quieres que los diagramas sean Mermaid (editables y visibles en GitHub) o imágenes exportadas como en el TFG?
4. ¿Se menciona el uso de herramientas de IA en el desarrollo en el capítulo 5?
