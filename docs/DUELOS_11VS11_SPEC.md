# Especificación Técnica y Funcional: Duelos 11 vs 11 (Liga de Cromos)

> **Estado:** Planificado para Fase Post-Lanzamiento (Fase 6 / Retención).  
> **Condición de activación:** NO implementar ni mostrar antes del lanzamiento inicial. Requiere una base activa de usuarios y un volumen de cartas medio por usuario suficiente (≥ 30–40 cartas) para garantizar una experiencia competitiva sólida.

---

## 1. Visión y Justificación de Producto

### 1.1. Propósito
El modo **Duelos 11 vs 11** es la capa de progresión y jugabilidad competitiva ("endgame") del álbum de cromos históricos *Memoria Rojiblanca*. Permite a los usuarios conformar un once titular estratégico utilizando los cromos que han obtenido en sobres y competir contra otros onces o contra escuadras históricas del club.

### 1.2. Justificación del aplazamiento post-lanzamiento
1. **Problema de arranque en frío (Cold-Start Matchmaking):** Un sistema multijugador síncrono (en tiempo real) con pocos usuarios concurrentes iniciales provoca colas de espera eternas y sensación de juego abandonado.
2. **Economía de cartas inmadura el Día 1:** Al registrarse, un usuario dispone únicamente de los sobres de bienvenida (15–20 cartas). La gran mayoría carece de 11 cartas compatibles por posición (portero, defensas, centrocampistas y delanteros). Forzar el juego de entrada generaría frustración o requeriría rellenar con cartas provisionales ficticias (lo cual vulnera las reglas de AGENTS.md sobre cero datos falsos).
3. **Pico de reactivación (Re-engagement Loop):** Reservar este modo permite lanzarlo como la «Primera Gran Actualización de Temporada» a las 2–3 semanas del estreno de la web, recuperando usuarios y reavivando el interés cuando la comunidad empiece a demandar utilidad para sus cromos repetidos o de alta valoración (OVR).

---

## 2. Arquitectura de Juego y Solución al Matchmaking

Para eliminar completamente el riesgo de salas vacías o tiempos de espera, el sistema se fundamenta en tres modalidades independientes de la concurrencia en directo:

### 2.1. Modo A: Retos de Leyenda (PvE / Campaña en Solitario)
* **Concepto:** El usuario se enfrenta a escuadras legendarias predefinidas de la historia del Real Sporting de Gijón (ej. *El EuroSporting de 1980*, *El Sporting de los 100 goles de 1951*, *Los Guajes de Preciado de 2008*).
* **Ventaja:** 100 % disponible las 24 horas, sin necesidad de que haya otro usuario conectado.
* **Recompensas:** Superar cada reto histórico desbloquea sobres especiales (Rojiblanco / Leyenda) o insignias conmemorativas para el perfil.

### 2.2. Modo B: Duelos Asíncronos ("Squad Battles")
* **Concepto:** Cada usuario configura y guarda en su perfil su **«Once de Gala»** con formación táctica y capitanes.
* **Mecánica:** Cuando un jugador busca un duelo, el servidor selecciona un Once guardado de otro usuario de rango de valoración similar y ejecuta el enfrentamiento jugada a jugada o por cálculo táctico.
* **Ventaja:** Cero colas de espera, resolución fluida y asíncrona.

### 2.3. Modo C: Reto Directo por Enlace
* **Concepto:** El usuario puede compartir un enlace privado (WhatsApp, Twitter/X, Telegram) retando a un amigo: *«He desafiado a tu 11 histórico en Mareona, haz clic para resolver el partido»*.

---

## 3. Modelo de Datos y Tipos Reutilizados

El juego se apoya en los tipos ya estandarizados en `src/lib/cards/types.ts`:

* **Formaciones tácticas permitidas:**
  * `TacticalFormation`: `"4-3-3" | "4-4-2" | "3-5-2" | "4-5-1" | "3-4-3" | "5-3-2" | "5-2-3" | "4-2-3-1"`.
* **Requisitos por ranura (`TacticalSlotRequirement`):**
  * Validación estricta de posición de cartas (`goalkeeper`, `defender`, `midfielder`, `forward`).
* **Atributos de resolución de duelos (`CardStatKey`):**
  * `attack_power`: Potencia ofensiva / remate.
  * `defense_power`: Solvencia defensiva / repliegue.
  * `ovr`: Valoración media general de la carta.
  * `matches_played`: Experiencia / partidos oficiales disputados con la camiseta rojiblanca.
* **Estructura de turno y resolución:**
  * Modelada con `DuelRoundCardChoice` y `DuelRoundResolution`.

---

## 4. Estrategia de Teaser y Comunicación Futura

### 4.1. Criterios de activación del Teaser (Pre-lanzamiento del modo)
El teaser visual **NO debe mostrarse en la web durante el estreno inicial**.  
Se activará únicamente cuando se cumplan las siguientes condiciones en producción:
1. Mínimo de 10–14 días naturales tras la apertura pública de Mareona.
2. Al menos un 40 % de los usuarios registrados activos hayan acumulado ≥ 25 cartas en su inventario.

### 4.2. Ubicación prevista para el Teaser
1. **En `/juegos`:**
   * Una tarjeta con la etiqueta `tag: 'Estrategia'`, badge `Próximamente` y estilo sobrio (desactivada para interacción táctil).
   * Texto de intriga: *«Duelos 11 vs 11: Alinea tu once histórico y desafía a leyendas y rivales»*.
2. **En `/juegos/album` (pestaña Mis Sobres o Barra superior):**
   * Píldora o aviso informativo sutil: *«Consigue más cromos para completar tu plantilla de cara a los futuros duelos tácticos»*.
