/**
 * Spanish La Pregunta del Día (trivia) minigame dictionary entries.
 */
export const esTrivia = {
  metadata: {
    title: "La Pregunta del Día",
    description:
      "Desafío diario de historia y curiosidades del Real Sporting de Gijón.",
  },
  header: {
    backAria: "Volver a juegos",
    title: "La Pregunta del Día",
    archiveAria: "Abrir archivo de preguntas",
    archiveLabel: "Archivo",
    statsAria: "Ver estadísticas del usuario",
    statsLabel: "Estadísticas",
  },
  emptyAnswerError: "Por favor escribe o selecciona una respuesta.",
  confirmAnswerButton: "Confirmar Respuesta",
  inputs: {
    seasonStartAria: "Año de inicio de temporada",
    seasonEndAria: "Año de fin de temporada",
    seasonStartPlaceholder: "XXXX",
    seasonEndPlaceholder: "XX",
    homeGoalsAria: "Goles Sporting",
    awayGoalsAria: "Goles rival",
    defaultPlaceholder: "Escribe tu respuesta...",
    playerPlaceholder: "Escribe el nombre o alias...",
  },
  solvedCard: {
    yourAnswerPrefix: "Tu respuesta:",
    viewStatsButton: "Ver mis Estadísticas",
  },
  resultModal: {
    title: "Estadísticas",
    closeAria: "Cerrar modal",
    played: "Partidas",
    winRate: "Aciertos",
    currentStreak: "Racha",
    maxStreak: "Máxima",
    backToGames: "Volver a Juegos",
    playArchive: "Jugar archivo",
    acceptButton: "Aceptar",
  },
} as const;
