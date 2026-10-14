/**
 * Canonical club primary colors registry for LaLiga Hypermotion teams.
 * Used for comparative statistical visual bars and club identity accents.
 */

interface TeamColorQuery {
  readonly teamExternalId?: string | null;
  readonly teamName?: string | null;
  readonly isSporting?: boolean;
}

const SPORTING_RED = "#e2001a";
const DEFAULT_NEUTRAL_COLOR = "#475569";

/**
 * Registry of primary club colors keyed by ESPN team ID.
 */
const TEAM_COLOR_BY_ID: Readonly<Record<string, string>> = {
  // Real Sporting de Gijón (Rojiblanco)
  "3788": SPORTING_RED,
  "731": SPORTING_RED,
  // Cádiz CF (Amarillo)
  "3842": "#eab308",
  // Real Oviedo (Azul carbayón)
  "92": "#004b93",
  // Albacete Balompié (Blanco / Granate)
  "2737": "#7a1b28",
  // SD Eibar (Armero azulgrana)
  "3752": "#851b34",
  // UD Almería (Rojiblanco indálico)
  "6832": "#cc0000",
  // Burgos CF (Blanquinegro)
  "12597": "#1e293b",
  // Real Valladolid (Blanquivioleta)
  "95": "#68257f",
  // Granada CF (Rojiblanco horizontal)
  "3747": "#a61022",
  // UD Las Palmas (Amarillo)
  "98": "#eab308",
  // CD Tenerife (Blanquiazul)
  "245": "#0055a5",
  // CD Castellón (Albinegro)
  "4438": "#1e293b",
  // Córdoba CF (Verdiblanco)
  "8447": "#007a33",
  // CD Eldense (Azulgrana)
  "7320": "#851b34",
  // Real Zaragoza (Blanquillo)
  "99": "#0047ab",
  // Racing de Santander (Verdiblanco)
  "91": "#007a3d",
  // Levante UD (Granota)
  "85": "#851b34",
  // Elche CF (Franjiverde)
  "88": "#007a33",
  // Málaga CF (Blanquiazul)
  "87": "#1e73be",
  // Deportivo de La Coruña (Blanquiazul)
  "89": "#0055a5",
  // Racing de Ferrol (Verde)
  "3753": "#007a33",
  // SD Huesca (Azulgrana)
  "7328": "#002f6c",
  // CD Mirandés (Rojillo)
  "9811": "#cc0000",
  // FC Cartagena (Albinegro)
  "6831": "#1e293b",
};

/**
 * Keyword-based color resolution fallback when ID is unmapped.
 */
const TEAM_NAME_COLOR_KEYWORDS: readonly { readonly keyword: string; readonly color: string }[] = [
  { keyword: "sporting", color: SPORTING_RED },
  { keyword: "gijon", color: SPORTING_RED },
  { keyword: "gijón", color: SPORTING_RED },
  { keyword: "cadiz", color: "#eab308" },
  { keyword: "cádiz", color: "#eab308" },
  { keyword: "oviedo", color: "#004b93" },
  { keyword: "albacete", color: "#7a1b28" },
  { keyword: "eibar", color: "#851b34" },
  { keyword: "almeria", color: "#cc0000" },
  { keyword: "almería", color: "#cc0000" },
  { keyword: "burgos", color: "#1e293b" },
  { keyword: "valladolid", color: "#68257f" },
  { keyword: "granada", color: "#a61022" },
  { keyword: "palmas", color: "#eab308" },
  { keyword: "tenerife", color: "#0055a5" },
  { keyword: "castellon", color: "#1e293b" },
  { keyword: "castellón", color: "#1e293b" },
  { keyword: "cordoba", color: "#007a33" },
  { keyword: "córdoba", color: "#007a33" },
  { keyword: "zaragoza", color: "#0047ab" },
  { keyword: "santander", color: "#007a3d" },
  { keyword: "levante", color: "#851b34" },
  { keyword: "elche", color: "#007a33" },
  { keyword: "malaga", color: "#1e73be" },
  { keyword: "málaga", color: "#1e73be" },
  { keyword: "coruña", color: "#0055a5" },
  { keyword: "deportivo", color: "#0055a5" },
  { keyword: "ferrol", color: "#007a33" },
  { keyword: "huesca", color: "#002f6c" },
  { keyword: "mirandes", color: "#cc0000" },
  { keyword: "mirandés", color: "#cc0000" },
  { keyword: "cartagena", color: "#1e293b" },
];

/**
 * Resolves the primary official hex color for a given football club.
 */
export function getTeamPrimaryColor(query: TeamColorQuery): string {
  if (query.isSporting) {
    return SPORTING_RED;
  }

  if (query.teamExternalId && TEAM_COLOR_BY_ID[query.teamExternalId]) {
    return TEAM_COLOR_BY_ID[query.teamExternalId];
  }

  if (query.teamName) {
    const normalized = query.teamName.toLowerCase();
    for (const item of TEAM_NAME_COLOR_KEYWORDS) {
      if (normalized.includes(item.keyword)) {
        return item.color;
      }
    }
  }

  return DEFAULT_NEUTRAL_COLOR;
}
