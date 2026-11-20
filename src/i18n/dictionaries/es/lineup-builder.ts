/**
 * Spanish Mi Once (tactical lineup builder) dictionary entries.
 */
export const esLineupBuilder = {
  toolbar: {
    formationLabel: "Esquema:",
    formationAria: "Esquema táctico",
    resetButton: "Reiniciar",
    generating: "Generando...",
    downloadButton: "Descargar Imagen",
    shareButton: "Compartir Once",
  },
  customPlayerModal: {
    invalidDataFallback: "Datos inválidos",
    title: "Añadir canterano / jugador",
    subtitle:
      "Añade a un canterano o jugador que no aparezca en las listas oficiales.",
    nameLabel: "Nombre o Apodo",
    namePlaceholder: "Ej. Pelayo o Mateo",
    numberLabel: "Dorsal (opcional)",
    numberPlaceholder: "Ej. 34",
    lineLabel: "Línea",
    positions: {
      goalkeeper: "Portero",
      defender: "Defensa",
      midfielder: "Centrocampista",
      forward: "Delantero",
    },
    cancelButton: "Cancelar",
    submitButton: "Añadir a la lista",
  },
  roster: {
    asideAria: "Selección de plantilla",
    title: "Plantilla",
    closeAria: "Cerrar selección de plantilla",
    searchPlaceholder: "Buscar por nombre o dorsal...",
    otherPositionsAria: "Resto de la plantilla",
    otherPositionsLabel: "Otras posiciones",
    emptySearch: "No se encontraron jugadores con ese filtro",
    addPlayerButton: "+ Añadir jugador",
    modalAria: "Selección de jugador para la alineación",
    categoryAria: "Filtrar por categoría",
    categories: {
      all: "Todos",
      firstTeam: "1er Equipo",
      filial: "Sporting At.",
      juvenil: "Juvenil DH",
    },
    positionAria: "Filtrar por línea táctica",
    allPositionsLabel: "Líneas",
  },
  shareModal: {
    matchPrefix: "Partido vs",
    nextMatchFallback: "Próximo partido",
    title: "Compartir Once",
    closeAria: "Cerrar modal",
    socialLabel: "Social",
    shareAction: "Compartir",
    opponentFallback: "Rival",
  },
  attachment: {
    removeAria: "Quitar alineación adjunta",
    pitchAria: "Alineación táctica en Mareona",
  },
} as const;
