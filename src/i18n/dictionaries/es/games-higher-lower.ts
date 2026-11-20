/**
 * Spanish ¿Más o Menos? (Higher or Lower) minigame dictionary entries.
 */
export const esHigherLower = {
  metadata: {
    title: "¿Más o Menos?",
    description:
      "Compara futbolistas del Real Sporting por partidos, goles y minutos.",
  },
  header: {
    backAria: "Volver a juegos",
    title: "¿Más o Menos?",
    streakLabel: "Racha",
    bestLabel: "Récord",
  },
  arenaAria: "Área de comparación",
  vs: "VS",
  modeSelector: {
    aria: "Modo de juego",
    matches: "Partidos",
    goals: "Goles",
    minutes: "Minutos",
  },
  card: {
    metrics: {
      goals: "Goles Oficiales",
      minutes: "Minutos Disputados",
      matches: "Partidos Oficiales",
    },
    correctFeedback: "¡Acierto! +1",
    wrongFeedback: "¡Fin de racha!",
  },
  controls: {
    metricNames: {
      goals: "goles",
      minutes: "minutos",
      matches: "partidos",
    },
    higherButton: "Más",
    lowerButton: "Menos",
    voteHigherPrefix: "Votar que",
    voteHigherMid: "tiene más",
    voteLowerPrefix: "Votar que",
    voteLowerMid: "tiene menos",
  },
  gameOver: {
    newRecord: "¡Nuevo Récord!",
    gameModeEyebrow: "Modo de juego",
    modes: {
      goals: "Goles oficiales",
      minutes: "Minutos jugados",
      matches: "Partidos disputados",
    },
    streakLabel: "Racha",
    bestStreakLabel: "Mejor racha",
    backToGames: "Volver a juegos",
    playAgain: "Jugar de nuevo",
  },
} as const;
