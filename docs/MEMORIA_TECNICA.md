# Mareona - Memoria Técnica

> **Estado:** plantilla (esquema de contenidos). Cada sección indica qué se va a explicar, qué diagramas llevará y de dónde se sacará la información. Las secciones se irán redactando una a una y se sustituirá la descripción por el texto final.
>
> Este documento no sustituye a [TECHNICAL_DOCS.md](TECHNICAL_DOCS.md), que se mantiene como material de apoyo.

## Enfoque

Esta memoria presenta **cómo es y cómo funciona** Mareona. No cuenta cómo fue el desarrollo (sin problemas encontrados, planificación ni presupuesto) ni incluye apartados pensados para un tribunal.

## Criterios de redacción

- Frases cortas y directas, en español, como en la memoria del TFG.
- Cada decisión se explica con el problema, las alternativas consideradas y el motivo de la elección.
- Sin adjetivos grandilocuentes ni listas de relleno. Si algo se entiende con un diagrama, se pone el diagrama.
- Diagramas en **Mermaid**. Capturas reales de la aplicación en `docs/screenshots/`.
- Los términos técnicos se explican la primera vez que aparecen.
- Longitud objetivo: unas 40-50 páginas.

## Capítulos del TFG que se usan y cuáles se descartan

| Capítulo del TFG | Decisión | Motivo |
| :--- | :--- | :--- |
| Resumen, palabras clave, abstract | **Se descarta** | Propio de un trabajo académico |
| 1. Memoria del proyecto | **Se adapta** | Visión global y mapa del documento |
| 2. Introducción | **Se adapta** (reducido) | Justificación, objetivos y alternativas tecnológicas |
| 3. Aspectos teóricos | **Se descarta** | Los conceptos se explican donde se usan |
| 4. Planificación y presupuesto iniciales | **Se descarta** | No aplica |
| 5. Análisis | **Se adapta** (muy reducido) | Actores, lista de requisitos y subsistemas |
| 6. Diseño | **Se adapta** (es el núcleo) | Arquitectura, base de datos, funcionamiento e interfaz |
| 7. Implementación | **Se adapta** (reducido) | Tecnologías, herramientas, estructura y calidad del código |
| 8. Pruebas | **Se adapta** (reducido) | Qué se prueba y cómo, sin tablas de defectos |
| 9. Manuales | **Solo manual de usuario** | El proyecto es privado |
| 10. Conclusiones y ampliaciones | **Se adapta** | Las ampliaciones las aporta el autor |
| 11. Planificación y presupuesto finales | **Se descarta** | No aplica |
| 12. Referencias | **Se adapta** | Lista corta de fuentes citadas |
| 13. Apéndices | **Se adapta** | Glosario y licencias de activos de terceros |

---

## Índice propuesto

1. [Memoria del proyecto](#1-memoria-del-proyecto)
2. [Introducción](#2-introducción)
3. [Análisis](#3-análisis)
4. [Diseño del sistema](#4-diseño-del-sistema)
5. [Implementación](#5-implementación)
6. [Pruebas](#6-pruebas)
7. [Manual de usuario](#7-manual-de-usuario)
8. [Conclusiones y ampliaciones](#8-conclusiones-y-ampliaciones)
9. [Referencias](#9-referencias)
10. [Apéndices](#10-apéndices)

---

## 1. Memoria del proyecto

*Equivale al capítulo 1 del TFG. Una o dos páginas.*

- **1.1 Motivación, objetivos y alcance.** Qué es Mareona (plataforma web y PWA para la afición del Real Sporting), por qué se hace, qué queda dentro y fuera del alcance.
- **1.2 Resumen de los capítulos.** Una línea por capítulo.
- **1.3 El proyecto en cifras.** Tabla corta: pantallas, tablas de BD, migraciones, tests, fuentes de datos externas.

**Diagrama:** mapa de módulos (Inicio, Temporada, Social, Histórico, Juegos, Perfil, Administración).
**Fuentes:** `README.md`, `PROJECT_SPEC.md` §1.

## 2. Introducción

*Equivale al capítulo 2 del TFG, sin estudio extenso de mercado.*

- **2.1 Justificación.** Qué echa en falta la afición hoy: datos dispersos, sin comunidad propia, sin histórico accesible.
- **2.2 Objetivos.** Funcionales (datos, comunidad, juegos, histórico) y técnicos (coste cero, accesibilidad WCAG 2.2 AA, PWA, seguridad).
- **2.3 Situación actual.** Comparativa breve con apps y webs existentes.
- **2.4 Alternativas tecnológicas.** Por cada decisión grande, tabla con opciones y motivo de la elección:
  - Framework: Next.js (App Router)
  - Backend: Supabase (PostgreSQL, Auth, Storage)
  - Despliegue: Vercel
  - Datos deportivos: ESPN, FotMob y datos históricos propios
  - Estilos y componentes: Tailwind CSS 4, shadcn/Radix

**Fuentes:** `TECHNICAL_DOCS.md` §1, `PROJECT_SPEC.md` §1.3-1.4.

## 3. Análisis

*Capítulo corto. Solo lo necesario para entender qué hace el sistema y para quién.*

- **3.1 Alcance del sistema.**
- **3.2 Actores.** Visitante sin cuenta, usuario registrado (email y Google), moderador, administrador. Qué puede hacer cada uno.
- **3.3 Requisitos.** Dos listas sencillas, sin identificadores jerárquicos:
  - Funcionales, agrupados por módulo.
  - No funcionales: rendimiento, accesibilidad, seguridad, privacidad, uso sin conexión, coste.
- **3.4 Casos de uso.** Un diagrama por módulo. Sin tablas de escenarios.
- **3.5 Subsistemas.** Qué hace cada uno y cómo se relacionan:
  - Datos deportivos (ingesta y caché)
  - Temporada (partidos, clasificación, estadísticas, pizarra táctica)
  - Archivo histórico
  - Social (muro, encuestas, amistades, mensajes directos, La Grada)
  - Moderación y reportes
  - Juegos (Wordle, ¿Quién es?, Más o menos, trivia) y cartas
  - Duelos 11 vs 11
  - Administración, auditoría y telemetría
  - PWA y modo offline
- **3.6 Mapa de navegación.** Rutas de la aplicación.

**Diagramas:** casos de uso por módulo, subsistemas y dependencias, mapa de navegación.
**Fuentes:** `PROJECT_SPEC.md` §1.2 y §3, `DUELOS_11VS11_SPEC.md`, estructura de `src/app`.

## 4. Diseño del sistema

*Equivale al capítulo 6 del TFG. Es el capítulo más importante y el que más diagramas lleva.*

### 4.1 Arquitectura

- **4.1.1 Visión general.** Diagrama de bloques: navegador, Vercel (Next.js), Supabase, APIs deportivas.
- **4.1.2 Capas y reglas de dependencia.** `app` → `components` → `lib` → `types`. Qué capa puede importar a cuál y cómo se comprueba.
- **4.1.3 Server Components y Client Components.** Cuándo se usa cada uno y por qué.
- **4.1.4 Despliegue e infraestructura.** Diagrama de despliegue.
- **4.1.5 Sesión y autenticación.** Proxy de sesión, callback OAuth, cookies.

### 4.2 Base de datos

- **4.2.1 PostgreSQL con Supabase.**
- **4.2.2 Diagrama entidad-relación,** dividido por bloques (usuarios, social, cartas, moderación y administración, caché deportiva).
- **4.2.3 Diccionario de datos.** Tabla resumida por entidad.
- **4.2.4 Row Level Security.** Política de cada tabla y su motivo.
- **4.2.5 Funciones y triggers.** Qué lógica vive en la base de datos y por qué.
- **4.2.6 Migraciones.** Cómo se versionan.

**Fuentes:** `supabase/migrations/` (16 migraciones), `TECHNICAL_DOCS.md` §3.

### 4.3 Diseño de los subsistemas

Un apartado corto por subsistema: **qué hace → cómo está diseñado → diagrama → decisiones**.

- **4.3.1 Datos deportivos.** Adaptadores, `normalizeTeamName`, caché en Supabase y por qué nunca se llama a la API desde el cliente.
- **4.3.2 Temporada.** Partidos, directo, clasificación (tabla, distancia real, evolución), estadísticas, mapa de disparos y momentum.
- **4.3.3 Archivo histórico.** Origen de los datos, formato y mapas SVG.
- **4.3.4 Social.** Muro, encuestas, amistades y mensajes con borrado lógico.
- **4.3.5 Moderación.** Flujo de un post: validación, moderación automática, bloqueo, reporte y revisión.
- **4.3.6 Juegos y cartas.** Motor de cada juego, elemento del día, sobres, inventario y álbum.
- **4.3.7 Porra.** Corte antes del partido, cálculo de puntos y ranking.
- **4.3.8 Duelos 11 vs 11.** Pizarra táctica, formaciones y resolución.
- **4.3.9 Administración, auditoría y telemetría.**
- **4.3.10 PWA y offline.** Service Worker, cola de sincronización, instalación por plataforma.

### 4.4 Funcionamiento global de la aplicación

Diagramas generales para entender cómo trabaja el conjunto, más que cada pieza por separado:

- **Recorrido de una petición de página:** del navegador al Server Component, a la caché, a Supabase y de vuelta.
- **Recorrido de un dato deportivo:** de la API externa a la caché y a la pantalla.
- **Ciclo de vida de un usuario:** visitante, registro, sesión, uso, borrado de cuenta.
- **Escritura de un usuario** (Server Action): validación, sesión, RLS, base de datos.
- **Estados principales:** post, sobre de cartas, partido y porra.
- **Funcionamiento sin conexión:** qué pasa cuando se pierde la red y al recuperarla.

### 4.5 Seguridad y privacidad

- Cabeceras HTTP y límite de peticiones.
- Validación con Zod de toda entrada externa.
- Variables sensibles solo en servidor (`server-only`) y `user_id` siempre desde la sesión.
- Privacidad: borrado de cuenta, custodia legal de mensajes, textos legales, cookies.
- Escudos y fotografías: licencias y uso de `<TeamCrest>` y `<PlayerPhoto>`.

**Diagrama:** cadena de seguridad de una petición (cliente → proxy → validación → RLS).
**Fuentes:** `TECHNICAL_DOCS.md` §6, `LEGAL-ASSETS.md`.

### 4.6 Diseño de la interfaz

- **4.6.1 Identidad visual.** Rojo y blanco, tipografía, tokens de `DESIGN.md`.
- **4.6.2 Principios.** Una pregunta por pantalla, sin prosa explicativa, sin iconos decorativos.
- **4.6.3 Componentes reutilizables.** Píldoras, tablas, tarjetas, modales.
- **4.6.4 Versión móvil.** Navegación inferior, áreas táctiles de 44 px.
- **4.6.5 Accesibilidad.** Cómo se aplica WCAG 2.2 AA: foco, contraste, teclado.

**Imágenes:** capturas de `docs/screenshots/`.
**Fuentes:** `DESIGN.md`, `TECHNICAL_DOCS.md` §7.

## 5. Implementación

*Equivale al capítulo 7 del TFG, sin la parte de problemas encontrados.*

- **5.1 Estándares y convenciones.** *(Pendiente de decidir el alcance, ver preguntas.)*
- **5.2 Tecnologías.** TypeScript estricto, SQL (PostgreSQL), CSS con Tailwind, con versiones.
- **5.3 Herramientas.** Editor, Node, ESLint, Playwright, Lighthouse, Supabase CLI, Vercel. Tabla con el propósito de cada una.
- **5.4 Estructura del código.** Árbol de carpetas comentado.
- **5.5 Calidad del código.** TypeScript sin `any`, límite de 180 líneas por componente, `npm run check`, test de arquitectura.
- **5.6 Uso de herramientas de IA en el desarrollo.** Qué herramientas se usaron, para qué tareas y qué reglas se les impusieron (`AGENTS.md`, skills en `.agents/skills/`).

## 6. Pruebas

*Equivale al capítulo 8 del TFG, mucho más corto: qué se prueba y cómo, sin tablas de defectos.*

- **6.1 Estrategia.** Pirámide de pruebas con el número de tests por nivel.
- **6.2 Unitarias.** Motores de juego, porra, fechas, parsers, esquemas Zod.
- **6.3 Integración.** Acciones del servidor del muro social y de La Grada.
- **6.4 Extremo a extremo (Playwright).** Navegación pública, porra, muro, seguridad de administración y offline.
- **6.5 Accesibilidad.** Contraste WCAG y estándares de modales.
- **6.6 Carga y rendimiento.** Concurrencia y auditoría con Lighthouse.
- **6.7 Reglas de código.** Test de arquitectura (sin `font-mono`, sin `@ts-ignore`, nombre canónico del club, cabeceras de seguridad, `.env.example` sin secretos), TypeScript estricto y ESLint.

**Fuentes:** carpeta `tests/`, `package.json`, `scripts/audit-performance.mjs`.

## 7. Manual de usuario

*Equivale al apartado 9.3 del TFG.*

Recorrido de un aficionado con capturas reales:

- Registro e inicio de sesión (email y Google)
- Inicio
- Temporada: partidos, clasificación, estadísticas
- Histórico
- Juegos y álbum de cartas
- Social: muro, amigos, mensajes
- Perfil y borrado de cuenta
- Instalación como app en móvil
- Funciones de administrador y moderador

**Fuentes:** `docs/screenshots/`, `README.md`.

## 8. Conclusiones y ampliaciones

- **8.1 Conclusiones.** Qué se ha conseguido frente a los objetivos del capítulo 2 y qué conocimientos se han aplicado.
- **8.2 Ampliaciones.** Las aporta el autor.

## 9. Referencias

Lista corta y numerada, citada en el texto con `[n]`. Solo lo que se cite de verdad: WCAG 2.2, RGPD, documentación oficial de las tecnologías y fuentes de datos.

## 10. Apéndices

- **10.1 Glosario.** RSC, RLS, PWA, Service Worker, caché, polling, WCAG, etc.
- **10.2 Propiedad intelectual y licencias.** Escudos, fotografías y datos de terceros (a partir de `LEGAL-ASSETS.md`).

---

## Resumen de diagramas previstos

| Nº | Diagrama | Sección | Tipo |
| :-- | :--- | :--- | :--- |
| 1 | Mapa de módulos | 1.3 | Bloques |
| 2 | Casos de uso por módulo | 3.4 | Casos de uso |
| 3 | Subsistemas y dependencias | 3.5 | Bloques |
| 4 | Mapa de navegación | 3.6 | Flujo |
| 5 | Arquitectura general | 4.1.1 | Bloques |
| 6 | Capas y reglas de dependencia | 4.1.2 | Flujo |
| 7 | Despliegue | 4.1.4 | Despliegue |
| 8 | Entidad-relación (por bloques) | 4.2.2 | ER |
| 9 | Ingesta y caché deportiva | 4.3.1 | Secuencia |
| 10 | Flujo de moderación | 4.3.5 | Actividad |
| 11 | Envío de porra | 4.3.7 | Secuencia |
| 12 | Petición de página | 4.4 | Secuencia |
| 13 | Dato deportivo de extremo a extremo | 4.4 | Flujo |
| 14 | Ciclo de vida de un usuario | 4.4 | Estados |
| 15 | Escritura de un usuario (Server Action) | 4.4 | Secuencia |
| 16 | Estados de post, sobre, partido y porra | 4.4 | Estados |
| 17 | Funcionamiento sin conexión | 4.4 | Secuencia |
| 18 | Cadena de seguridad de una petición | 4.5 | Flujo |
| 19 | Pirámide de pruebas | 6.1 | Gráfico |

## Pendiente de confirmar con el autor

1. **Estándares (5.1):** tras la explicación, ¿se incluye este apartado o se integra en 5.5 (calidad del código)?
2. **Ampliaciones (8.2):** pásame tu lista cuando llegue ese capítulo.
