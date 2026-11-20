/**
 * Spanish ¿Quién es? (Who Are Ya) minigame dictionary entries.
 */
export const esWhoAreYa = {
  metadata: {
    title: "¿Quién es?",
    description:
      "Adivina el futbolista histórico o actual del Real Sporting en 6 intentos.",
  },
  header: {
    backAria: "Volver a juegos",
    title: "¿Quién es?",
    archiveAria: "Abrir archivo de retos",
    archiveLabel: "Archivo",
    statsAria: "Ver estadísticas del usuario",
    statsLabel: "Estadísticas",
  },
  arenaAria: "Zona de juego",
  searchPlaceholder: "Busca un jugador del Real Sporting...",
  selectorDefaultPlaceholder: "Escribe para buscar...",
  clearSearchAria: "Limpiar búsqueda",
  attemptPrefix: "Intento",
  attemptOf: "de",
  mysteryPhoto: {
    unavailable: "Foto no disponible",
    pixelatedAria: "Jugador misterioso pixelado",
  },
  grid: {
    higherAria: "Más alto",
    lowerAria: "Más bajo",
    country: "País",
    position: "Posición",
    matches: "Partidos",
    goals: "Goles",
    debut: "Debut",
  },
  statsModal: {
    title: "Estadísticas",
    closeAria: "Cerrar estadísticas",
    closeModalAria: "Cerrar modal",
    played: "Partidas",
    winRate: "Aciertos",
    currentStreak: "Racha",
    maxStreak: "Máxima",
    distributionTitle: "Distribución de intentos",
    backToGames: "Volver a Juegos",
    playArchive: "Jugar archivo",
  },
} as const;
