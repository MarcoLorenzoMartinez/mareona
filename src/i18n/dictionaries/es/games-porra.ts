/**
 * Spanish La Porra minigame dictionary entries.
 */
export const esPorra = {
  metadata: {
    title: "La Porra",
    description:
      "Pronostica el marcador y los goleadores del Real Sporting en cada jornada.",
  },
  fallbackOpponent: "Próximo Rival",
  header: {
    backAria: "Volver a juegos",
    title: "La Porra de la Mareona",
    rewardsButton: "Recompensas",
  },
  matchCard: {
    minusHomeAria: "Restar gol local",
    plusHomeAria: "Añadir gol local",
    minusAwayAria: "Restar gol visitante",
    plusAwayAria: "Añadir gol visitante",
    vs: "VS",
    signInToPredict: "Iniciar sesión para pronosticar",
    predictionSaved: "Pronóstico registrado",
    predictionClosed: "Plazo de pronóstico cerrado",
    confirmPrediction: "Confirmar pronóstico",
  },
  scorers: {
    title: "Goleadores del Real Sporting",
    selectAriaPrefix: "Goleador",
    placeholder: "Selecciona un goleador...",
  },
  toasts: {
    predictionConfirmed: "Pronóstico confirmado para esta jornada.",
    onePackAdded: "+1 sobre añadido a tu inventario del Álbum.",
    manyPacksPrefix: "+",
    manyPacksSuffix: "sobres añadidos a tu inventario del Álbum.",
  },
  pendingRewards: {
    oneClaimed: "1 sobre reclamado y guardado en tu inventario.",
    manyClaimedSuffix: "sobres reclamados y guardados en tu inventario.",
    openInAlbum: "Abrir en el Álbum →",
    claimOne: "Reclamar sobre",
    claimManyPrefix: "Reclamar sobres",
    sectionAria: "Recompensas pendientes de La Porra",
    onePendingTitle: "Tienes 1 recompensa por reclamar",
    manyPendingPrefix: "Tienes",
    manyPendingSuffix: "recompensas acumuladas",
    yourPredictionPrefix: "Tu pronóstico:",
    pointSingular: "pt",
    pointPlural: "pts",
  },
  rewardsModal: {
    title: "Recompensas por jornada",
    closeAria: "Cerrar ventana de recompensas",
    packPrefixToStrip: "Sobre ",
    cardsSuffix: "cromos",
    rules: {
      exactScore: "Marcador exacto",
      outcome: "Signo 1X2",
      scorer: "Por cada goleador acertado",
    },
    pointsLabel: {
      low: "1 – 2 pts",
      mid: "3 – 4 pts",
      high: "5+ pts",
    },
  },
  leaderboard: {
    sectionAria: "Clasificación de La Porra",
    title: "Clasificación",
    yourPointsPrefix: "Tus puntos:",
    goToMyPositionPrefix: "Ir a mi posición (#",
    filterAria: "Filtro de clasificación",
    tabs: {
      all: "Todos",
      friends: "Amigos",
    },
    emptyFriends:
      "Aún no tienes amigos añadidos para comparar vuestros pronósticos.",
    findFriendsInSocial: "Buscar amigos en Social",
    emptyAll:
      "Aún no hay puntuaciones registradas. Envía tu pronóstico para estrenar la tabla.",
    prevPage: "Anterior",
    nextPage: "Siguiente",
    pagePrefix: "Página",
    pageOf: "de",
    ptsUnit: "pts",
  },
} as const;
