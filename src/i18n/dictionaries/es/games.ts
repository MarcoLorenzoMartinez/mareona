import { esPorra } from "./games-porra.ts";
import { esWordle } from "./games-wordle.ts";
import { esTrivia } from "./games-trivia.ts";
import { esWhoAreYa } from "./games-who-are-ya.ts";
import { esHigherLower } from "./games-higher-lower.ts";
import { esAlbum } from "./games-album.ts";

/**
 * Spanish games hub, shared archive calendar, and minigame dictionary entries.
 */
export const esGames = {
  hub: {
    metadata: {
      title: "Juegos",
      description: "Pasatiempos y retos diarios del Real Sporting de Gijón.",
    },
    srTitle: "Juegos y Pasatiempos",
    gridAria: "Zona de juegos",
    requiresNetworkBadge: "Requiere red",
    previews: {
      countryShort: "PAÍS",
      posShort: "POS",
      matchesShort: "PART ▲",
      goalsShort: "GOL ▼",
      debutShort: "DEB",
      higherLabel: "▲ MÁS",
      lowerLabel: "▼ MENOS",
    },
    items: {
      album: {
        title: "Memoria Rojiblanca",
        tag: "Colección",
      },
      porra: {
        title: "La Porra de la Mareona",
        tag: "Jornada",
      },
      wordle: {
        title: "Wordle",
        tag: "Diario",
      },
      "pregunta-del-dia": {
        title: "La Pregunta del Día",
        tag: "Diario",
      },
      "quien-es": {
        title: "¿Quién es?",
        tag: "Diario",
      },
      "mas-o-menos": {
        title: "¿Más o Menos?",
        tag: "Récord",
      },
    },
  },
  archive: {
    title: "Calendario de Retos",
    closeAria: "Cerrar calendario",
    prevMonthAria: "Mes anterior",
    nextMonthAria: "Mes siguiente",
    months: [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ] as const,
    weekdays: ["L", "M", "X", "J", "V", "S", "D"] as const,
    notAvailableTitle: "No disponible",
    playChallengePrefix: "Jugar reto del",
    dayAriaPrefix: "Día",
    selectedAriaSuffix: ", seleccionado",
    legendWon: "Superado",
    legendLost: "Fallado",
    legendPending: "Pendiente",
  },
  porra: esPorra,
  wordle: esWordle,
  trivia: esTrivia,
  whoAreYa: esWhoAreYa,
  higherLower: esHigherLower,
  album: esAlbum,
} as const;
