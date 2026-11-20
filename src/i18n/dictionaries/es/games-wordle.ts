/**
 * Spanish Wordle Sportinguista minigame dictionary entries.
 */
export const esWordle = {
  metadata: {
    title: "Wordle Sportinguista",
    description: "Adivina la palabra del Real Sporting de hoy en 6 intentos.",
  },
  header: {
    backAria: "Volver a juegos",
    title: "Wordle",
    archiveAria: "Abrir archivo de palabras",
    archiveLabel: "Archivo",
    statsAria: "Ver estadísticas del usuario",
    statsLabel: "Estadísticas",
  },
  board: {
    gridAria: "Tablero de Wordle",
  },
  keyboard: {
    aria: "Teclado virtual",
    deleteAria: "Borrar letra",
    enterAria: "Enviar palabra",
  },
  statsModal: {
    title: "Estadísticas",
    closeAria: "Cerrar estadísticas",
    played: "Partidas",
    winRate: "Aciertos",
    currentStreak: "Racha",
    maxStreak: "Máxima",
    distributionTitle: "Distribución de intentos",
    backToGames: "Volver a juegos",
    playArchive: "Jugar anteriores",
    closeButton: "Cerrar",
    resetStats: "Reiniciar mis partidas y estadísticas",
  },
} as const;
