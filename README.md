<div align="center">

<img src="public/logo.png" alt="Logo de Mareona" width="100" height="100" />

# Mareona

**Plataforma web y PWA para la afición del Real Sporting de Gijón**

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

Este proyecto ofrece a la afición del Real Sporting de Gijón una plataforma integral en la que consultar datos actuales e históricos con rigor, debatir con otros aficionados y divertirse con juegos sobre la historia del club.

Frente a portales deportivos saturados de publicidad intrusiva, lentitud de carga e interfaces impersonales, Mareona nace como un punto de encuentro digital para la comunidad sportinguista: una experiencia de usuario ágil, segura y centrada en el contenido relevante, construida con una arquitectura *Server-First*, datos sincronizados en tiempo real y una identidad visual sobria y accesible.

---

## 2. Módulos y Funcionalidades del Sistema

### 2.1. Inicio (`/`)
Punto de entrada principal a la experiencia Mareona. Ofrece una panorámica de la actualidad del club:
- **Hero Card del partido:** Muestra el próximo encuentro oficial con cuenta atrás o el marcador y minuto en directo si el partido está en juego.
- **Accesos rápidos:** Conexión directa con la clasificación, la porra de la jornada y el debate más activo de la comunidad.
- **Pulso de la actualidad:** Resumen visual del estado del equipo y la clasificación para estar al día de un solo vistazo.

---

### 2.2. Temporada (`/temporada`)

#### Partidos (`/temporada/partidos` y `/temporada/partidos/[id]`)
Calendario completo de todos los partidos oficiales de la temporada (LaLiga Hypermotion y Copa del Rey), incluyendo resultados, fechas y horarios confirmados. Cada encuentro cuenta con su propia ficha de detalle que incorpora previa, alineaciones oficiales con esquema táctico, eventos y cronología en directo, estadísticas colectivas y un espacio social específico para que los aficionados compartan sus impresiones antes, durante y después del choque.

#### Clasificación (`/temporada/clasificacion`)
Tabla de clasificación oficial que se actualiza automáticamente con los resultados de los partidos y permite seguir la posición del Real Sporting y de sus rivales en tiempo real. Se estructura en tres modalidades de visualización complementarias:
- **Tabla:** Clasificación tradicional ordenada por posición, con puntos, partidos jugados, victorias, empates, derrotas, goles a favor/en contra y racha reciente, identificando puestos de ascenso directo, playoff y descenso.
- **Distancia real:** Representación escalonada según la puntuación exacta de cada equipo, permitiendo dimensionar visualmente la brecha real de puntos entre el Real Sporting y los diferentes grupos de la tabla.
- **Evolución:** Gráfico histórico de la trayectoria jornada a jornada que traza la posición clasificatoria del equipo y los puntos acumulados a lo largo del campeonato.

#### Estadísticas (`/temporada/estadisticas`)
Panel de analítica del rendimiento colectivo de la temporada. Cada métrica cuenta con un indicador de posición relativa respecto al resto de clubes de la categoría, reforzado con una escala de color que ubica al equipo en la zona alta, media o baja de la tabla para cada estadística.
Asimismo, integra visualizaciones espaciales como mapas de ocupación posicional en el campo, zonas de mayor volumen de pase, carriles de ataque prioritarios y ubicación exacta de los disparos convertidos en gol, facilitando un análisis comprensible para cualquier aficionado.

#### Plantilla (`/temporada/plantilla` y `/temporada/plantilla/[id]`)
Directorio de la plantilla oficial clasificada por demarcaciones (porteros, defensas, centrocampistas y delanteros). Cada jugador dispone de una ficha individual con datos biográficos, dorsal, trayectoria y un desglose detallado de sus estadísticas de rendimiento en la temporada (minutos, partidos, goles, asistencias y tarjetas).

#### Mi Once (`/temporada/pizarra`)
Pizarra táctica interactiva que permite a los aficionados confeccionar y compartir su once inicial ideal. Ofrece esquemas tácticos predefinidos (4-4-2, 4-2-3-1, 4-3-3, 5-3-2, entre otros) con total libertad para desplazar y recolocar a los futbolistas sobre el césped. La selección incluye a jugadores del primer equipo, del filial (Sporting Atlético) y del Juvenil División de Honor. El once diseñado puede descargarse como imagen de alta resolución o publicarse directamente en la Tertulia social o en la Grada del próximo partido para abrir debate.

---

### 2.3. Histórico (`/historico`)

#### Trayectoria (`/historico`)
Registro interactivo de la trayectoria histórica del Real Sporting en competiciones oficiales desde sus orígenes hasta la actualidad. Presenta un gráfico evolutivo de la categoría y posición alcanzada en cada campaña. Al seleccionar cualquier temporada, se despliega una vista con la clasificación final, todos los resultados de los partidos y la plantilla completa que defendió la camiseta rojiblanca ese año.

#### Efemérides (`/historico/efemerides`)
Calendario histórico que recopila efemérides, hitos y partidos disputados por el club en cada día del año. Por defecto muestra los acontecimientos ocurridos en la fecha actual, permitiendo al usuario navegar libremente por cualquier día del calendario para revivir fechas señaladas, goleadas memorables o aniversarios de figuras ilustres.

#### Rivales (`/historico/rivales`)
Base de datos del balance histórico de enfrentamientos frente a todos los clubes a los que se ha medido el Real Sporting. Permite filtrar por competición o categoría, ordenar por victorias o partidos y alternar entre vista de cuadrícula y lista. Cada rival cuenta con una ficha propia con el balance pormenorizado (victorias, empates, derrotas, goles) y el listado de partidos históricos jugados entre ambos.
Se complementa con un mapa interactivo de España y un mapa mundial para visualizar la distribución geográfica de los rivales históricos y filtrar estadísticas por regiones.

#### Legado (`/historico/legado`)
Cuadro de honor que rinde homenaje a los protagonistas de la historia centenaria del club a través de registros oficiales de todas las competiciones del primer equipo:
- **Más partidos:** Futbolistas con mayor número de participaciones oficiales.
- **Máximos goleadores:** Mayores artilleros de la historia del club.
- **Más temporadas:** Jugadores con más cursos en el primer equipo.
- **Entrenadores:** Técnicos con mayor número de encuentros dirigidos en el banquillo rojiblanco.

---

### 2.4. Social (`/social`)

#### La Tertulia (`/social`)
Plaza pública para el debate de la comunidad sportinguista. Los usuarios registrados pueden compartir reflexiones y comentarios de actualidad (con un límite de 500 caracteres), adjuntando encuestas interactivas o sus pizarras tácticas de *Mi Once*. La interfaz incorpora interacciones de valoración (*me gusta*), réplicas y opción de compartir en plataformas externas. Cuenta con filtros para alternar entre el muro global (*Todos*) y las publicaciones de las personas seguidas (*Amigos*).

#### Hilos de Conversación
Estructura en árbol que organiza las respuestas y contrarréplicas de manera anidada y cronológica, facilitando el seguimiento de debates complejos sin perder el contexto del mensaje original.

#### Mensajería Directa
Canal de mensajería privada entre usuarios registrados. Permite conversaciones individuales y bidireccionales con cifrado y privacidad, dotado de herramientas de seguridad para reportar posibles conductas inadecuadas.

#### Red de Amistades
Sistema de seguimiento y conexiones mutuas mediante envío y aceptación de solicitudes de amistad. La red de amistades se integra transversalmente en la aplicación: permite filtrar el feed social para leer únicamente a los conocidos y habilita clasificaciones privadas dentro de la Porra.

#### Moderación y Convivencia Comunitaria
Sistema combinado de moderación automatizada y supervisión manual. La plataforma incorpora un filtro algorítmico asistido por Inteligencia Artificial que detecta lenguaje ofensivo o inapropiado antes de su difusión, bloqueando publicaciones lesivas y remitiendo avisos al panel de administración para su revisión.

---

### 2.5. Juegos (`/juegos`)

#### Memoria Rojiblanca (`/juegos/album`)
Colección de cromos digitales del Real Sporting de Gijón. Reúne cromos de futbolistas históricos y actuales, entrenadores, escudos y momentos legendarios distribuidos en distintas categorías y rarezas (básica, especial, histórica y legendaria). El objetivo es completar el álbum recopilando todos los cromos de la colección.

Los usuarios pueden desbloquear sobres de cromos mediante diversas vías de participación activa:
- **Bienvenida a nuevos usuarios:** Al registrarse por primera vez con su cuenta, el aficionado recibe un lote inicial de bienvenida compuesto por 1 Sobre Aficionado y 1 Sobre Rojiblanco.
- **Visita diaria:** 1 Sobre Aficionado gratuito disponible cada día simplemente por iniciar sesión en la plataforma.
- **Reto diario de juegos:** Al acertar cualquiera de los pasatiempos diarios del día (Pregunta del Día, Wordle o ¿Quién es?), el usuario obtiene 1 Sobre Rojiblanco (máximo un sobre por día). Además, mantener una racha semanal de 7 días consecutivos superando el reto diario mejora la recompensa del séptimo día, otorgando 1 Sobre Leyenda.
- **La Porra de la jornada:** Pronosticar el partido oficial del Real Sporting premia el acierto según el baremo de puntuación (+5 pts por marcador exacto, +2 pts por signo 1X2 y +1 pt por cada goleador acertado):
  - *1 a 2 puntos:* Otorga 1 Sobre Aficionado.
  - *3 a 4 puntos:* Otorga 1 Sobre Rojiblanco.
  - *5 o más puntos (pleno o marcador exacto):* Otorga 1 Sobre Leyenda.
- **Taco de repetidos (Reciclaje):** Permite canjear los cromos duplicados que el usuario vaya acumulando al abrir sobres. Al reunir 10 cromos repetidos en el taco, el usuario puede reciclarlos para forjar directamente 1 Sobre Rojiblanco nuevo y seguir avanzando en su colección.

#### La Porra de la Mareona (`/juegos/porra`)
Espacio donde los aficionados pronostican el resultado exacto y los goleadores rojiblancos del próximo partido oficial del Real Sporting antes del pitido inicial. El sistema calcula automáticamente la puntuación al término del encuentro en función de los aciertos (signo 1X2, marcador exacto y goleadores), alimentando una tabla clasificatoria que puede filtrarse también por el círculo de amigos.

#### Wordle (`/juegos/wordle`)
Adaptación sportinguista del popular reto de palabras. El usuario dispone de 6 intentos para descubrir un término oculto de 5 o 6 letras relacionado con el Real Sporting (apellidos de futbolistas históricos, rivales clásicos o expresiones rojiblancas). Incorpora teclado interactivo, código de color para las pistas (verde para posición correcta, amarillo para letra existente en otra posición y gris para descarte), estadísticas de rachas y archivo para jugar retos de fechas anteriores.

#### La Pregunta del Día (`/juegos/pregunta-del-dia`)
Trivia diario con preguntas de dificultad variable sobre hitos, anécdotas, récords y fechas célebres del club. Permite responder mediante un buscador predictivo o selección guiada, ofreciendo al resolver una reseña histórica explicativa que aporta contexto y valor divulgativo. Incluye estadísticas personales y archivo cronológico de preguntas.

#### ¿Quién es? (`/juegos/quien-es`)
Juego diario de deducción donde el aficionado debe adivinar el futbolista rojiblanco misterioso a partir de pistas progresivas. La imagen del jugador comienza muy pixelada y gana nitidez con cada intento. En cada ensayo, el sistema evalúa atributos clave (nacionalidad, posición, década de actividad y dorsal) indicando aciertos y aproximaciones para orientar la respuesta dentro de un límite de intentos.

#### ¿Más o Menos? (`/juegos/mas-o-menos`)
Minijuego de comparativa estadística que enfrenta de manera consecutiva a dos futbolistas de la historia del club bajo una métrica concreta (partidos jugados, goles anotados o temporadas en el club). El usuario debe acertar si el segundo jugador supera o no las cifras del primero, buscando encadenar la mayor racha de aciertos consecutivos posible.

---

### 2.6. Perfil (`/perfil`)

Espacio personal y centro de control del usuario en la plataforma:
- **Autenticación sin contraseñas:** Acceso seguro mediante Google OAuth 2.0 y enlaces mágicos (*Magic Link*) por correo electrónico, gestionado íntegramente en servidor con Supabase Auth.
- **Identidad en la comunidad:** Personalización de nombre de usuario, biografía y selector de avatar, con la posibilidad exclusiva de lucir como imagen de perfil cualquiera de los cromos históricos conseguidos en el álbum.
- **Historial y actividad:** Muro con el histórico de publicaciones y réplicas en La Tertulia, registro de pronósticos y puntos en La Porra, estado de avance de la colección de cromos y gestión de la red de amistades.

---

## 3. Principios de Ingeniería y Diseño

### Identidad Visual y Experiencia
- **Rojo y blanco corporativos:** Paleta sobria basada estrictamente en los colores del Real Sporting (`#E2001A` y blanco puro), erradicando fondos oscuros artificiales y colores discordantes.
- **Tipografía y alineación tabular:** Empleo de tipografía sans-serif limpia con espaciado numérico tabular (`tabular-nums`) para resultados, minutos, dorsales y clasificaciones, erradicando fuentes monoespaciadas de consola en la interfaz pública.
- **Cero ruido:** Diseño directo orientado al dato deportivo y a la interacción comunitaria, sin elementos de distracción que generen ruido visual ni una sobrecarga de información.

### Experiencia Móvil, PWA y Resiliencia Offline
- **PWA instalable:** Aplicación Web Progresiva con manifiesto y Service Worker que ofrece un comportamiento, fluidez y respuesta equivalentes a una aplicación nativa instalada.
- **Instalador guiado (`/instalar`):** Asistente dinámico paso a paso que detecta el entorno del usuario (iOS Safari, Android Chrome o escritorio) y explica cómo añadir Mareona a la pantalla de inicio.
- **Resiliencia sin conexión (`/offline`):** Página de cortesía nativa que informa con transparencia al usuario en caso de pérdida o interrupción de la conectividad de red.
- **Ergonomía táctil:** Áreas de pulsación optimizadas (≥44px) para uso ergonómico con una sola mano y barra de navegación inferior adaptada a pulgar en terminales móviles.

### Accesibilidad (WCAG 2.2 AA)
- **Navegación total por teclado:** Foco visible contrastado (`--ring` corporativo) en todos los elementos interactivos, diálogos modales y formularios.
- **Contraste de color certificado:** Ratios de contraste superiores a 4.5:1 en todos los textos y controles sobre el fondo claro.
- **Semántica web rigurosa:** Estructura HTML accesible, etiquetas ARIA semánticas y compatibilidad garantizada con lectores de pantalla.


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

Para una revisión técnica exhaustiva que cubre todos los aspectos más técnicos y profesionales del sistema:

Consulte la memoria técnica completa:  
**[Documentación Técnica de Ingeniería &rarr;](docs/TECHNICAL_DOCS.md)**


---

## 6. Aviso Legal y Atribución Deportiva

Mareona es un proyecto formativo y comunitario independiente, desarrollado sin ánimo de lucro con fines divulgativos y deportivos. No existe vinculación societaria ni patrocinio comercial con el Real Sporting de Gijón, S.A.D. ni con los organismos rectores de las competiciones oficiales.

Todos los escudos, logotipos, imágenes históricas y marcas comerciales referenciadas pertenecen exclusivamente a sus respectivos titulares legales y se emplean bajo amparo de uso legítimo e ilustrativo.


---

## 7. Autor

**Marco Lorenzo Martínez**  
Ingeniero Informático del Software 

- **Despliegue:** [mareona.vercel.app](https://mareona.vercel.app)
- **GitHub:** [@MarcoLorenzoMartinez](https://github.com/MarcoLorenzoMartinez)
- **LinkedIn:** [Marco Lorenzo Martínez](https://www.linkedin.com/in/marco-lorenzo-mart%C3%ADnez/)
- **Contacto:** [marcolorenzomart@gmail.com]
