/**
 * Curated stadium asset registry and resolver for LaLiga Hypermotion.
 *
 * Implements the domain layer for stadium visual assets following
 * the strict zero fake data policy: only verified, calibrated stadium imagery
 * is served. Covers all 22 clubs of the competition with deterministic
 * resolution in 0 ms.
 */

export interface StadiumAsset {
  /** Relative web path to the local optimized stadium image. */
  readonly imagePath: string;
  /** Full official canonical name of the stadium. */
  readonly canonicalName: string;
}

export interface StadiumQuery {
  /** External API ID of the home team (e.g. ESPN team ID). */
  readonly teamExternalId?: string | null;
  /** Display name of the home team. */
  readonly teamName?: string | null;
  /** Whether the home team is Real Sporting. */
  readonly isSporting?: boolean;
  /** Name of the venue returned by the sports fixture API. */
  readonly venueName?: string | null;
}

/**
 * Complete catalog of all 22 stadiums in LaLiga Hypermotion.
 * Keyed by official ESPN team identifier.
 */
const TEAM_STADIUM_REGISTRY: Readonly<Record<string, StadiumAsset>> = {
  // Real Sporting de Gijón — El Molinón
  "3788": {
    imagePath: "/stadiums/el-molinon.jpg",
    canonicalName: "Estadio El Molinón-Enrique Castro Quini",
  },
  // Albacete Balompié — Carlos Belmonte
  "2737": {
    imagePath: "/stadiums/carlos-belmonte.png",
    canonicalName: "Estadio Carlos Belmonte",
  },
  // Real Oviedo — Carlos Tartiere
  "92": {
    imagePath: "/stadiums/carlos-tartiere.jpg",
    canonicalName: "Estadio Carlos Tartiere",
  },
  // Cádiz CF — Nuevo Mirandilla
  "3842": {
    imagePath: "/stadiums/nuevo-mirandilla.jpg",
    canonicalName: "Estadio Nuevo Mirandilla",
  },
  // SD Eibar — Ipurua
  "3752": {
    imagePath: "/stadiums/ipurua.jpg",
    canonicalName: "Estadio Municipal de Ipurua",
  },
  // UD Almería — Power Horse Stadium (Juegos Mediterráneos)
  "6832": {
    imagePath: "/stadiums/juegos-mediterraneos.jpg",
    canonicalName: "Power Horse Stadium",
  },
  // Burgos CF — El Plantío
  "12597": {
    imagePath: "/stadiums/el-plantio.jpg",
    canonicalName: "Estadio Municipal El Plantío",
  },
  // Real Valladolid — José Zorrilla
  "95": {
    imagePath: "/stadiums/jose-zorrilla.jpg",
    canonicalName: "Estadio José Zorrilla",
  },
  // Granada CF — Nuevo Los Cármenes
  "3747": {
    imagePath: "/stadiums/los-carmenes.jpg",
    canonicalName: "Estadio Nuevo Los Cármenes",
  },
  // UD Las Palmas — Gran Canaria
  "98": {
    imagePath: "/stadiums/gran-canaria.jpg",
    canonicalName: "Estadio de Gran Canaria",
  },
  // RCD Mallorca — Son Moix
  "84": {
    imagePath: "/stadiums/son-moix.jpg",
    canonicalName: "Estadi Mallorca Son Moix",
  },
  // Girona FC — Montilivi
  "9812": {
    imagePath: "/stadiums/montilivi.jpg",
    canonicalName: "Estadi Montilivi",
  },
  // CD Castellón — Castàlia
  "4438": {
    imagePath: "/stadiums/castalia.jpg",
    canonicalName: "Nou Estadi Castàlia",
  },
  // CD Tenerife — Heliodoro Rodríguez López
  "245": {
    imagePath: "/stadiums/heliodoro-rodriguez-lopez.jpg",
    canonicalName: "Estadio Heliodoro Rodríguez López",
  },
  // CD Eldense — Nuevo Pepico Amat
  "7320": {
    imagePath: "/stadiums/pepico-amat.jpg",
    canonicalName: "Estadio Municipal Nuevo Pepico Amat",
  },
  // Córdoba CF — Nuevo Arcángel
  "8447": {
    imagePath: "/stadiums/nuevo-arcangel.jpg",
    canonicalName: "Estadio Nuevo Arcángel",
  },
  // CD Leganés — Butarque
  "17534": {
    imagePath: "/stadiums/butarque.jpg",
    canonicalName: "Estadio Municipal Butarque",
  },
  // AD Ceuta FC — Alfonso Murube
  "5404": {
    imagePath: "/stadiums/alfonso-murube.jpg",
    canonicalName: "Estadio Alfonso Murube",
  },
  // CE Sabadell — Nova Creu Alta
  "11487": {
    imagePath: "/stadiums/nova-creu-alta.jpg",
    canonicalName: "Estadi de la Nova Creu Alta",
  },
  // FC Andorra — Estadi Nacional
  "20179": {
    imagePath: "/stadiums/estadi-nacional.jpg",
    canonicalName: "Estadi Nacional d'Andorra",
  },
  // RC Celta Fortuna — Campo Municipal de Barreiro
  "131858": {
    imagePath: "/stadiums/barreiro.jpg",
    canonicalName: "Campo Municipal de Barreiro",
  },
  // Real Sociedad B — Zubieta
  "20983": {
    imagePath: "/stadiums/zubieta.jpg",
    canonicalName: "Instalaciones de Zubieta",
  },
};

/**
 * Keyword-based lookup fallback when match details provide venue names
 * instead of team external identifiers.
 */
const VENUE_KEYWORD_MAP: readonly { readonly keyword: string; readonly id: string }[] = [
  { keyword: "molinon", id: "3788" },
  { keyword: "belmonte", id: "2737" },
  { keyword: "tartiere", id: "92" },
  { keyword: "mirandilla", id: "3842" },
  { keyword: "carranza", id: "3842" },
  { keyword: "ipurua", id: "3752" },
  { keyword: "mediterraneo", id: "6832" },
  { keyword: "power horse", id: "6832" },
  { keyword: "plantio", id: "12597" },
  { keyword: "zorrilla", id: "95" },
  { keyword: "carmenes", id: "3747" },
  { keyword: "gran canaria", id: "98" },
  { keyword: "son moix", id: "84" },
  { keyword: "montilivi", id: "9812" },
  { keyword: "castalia", id: "4438" },
  { keyword: "heliodoro", id: "245" },
  { keyword: "pepico", id: "7320" },
  { keyword: "arcangel", id: "8447" },
  { keyword: "butarque", id: "17534" },
  { keyword: "murube", id: "5404" },
  { keyword: "creu alta", id: "11487" },
  { keyword: "nacional", id: "20179" },
  { keyword: "barreiro", id: "131858" },
  { keyword: "zubieta", id: "20983" },
];

/**
 * Keyword-based lookup fallback by team display name.
 */
const TEAM_NAME_KEYWORD_MAP: readonly { readonly keyword: string; readonly id: string }[] = [
  { keyword: "sporting", id: "3788" },
  { keyword: "gijon", id: "3788" },
  { keyword: "albacete", id: "2737" },
  { keyword: "oviedo", id: "92" },
  { keyword: "cadiz", id: "3842" },
  { keyword: "cádiz", id: "3842" },
  { keyword: "eibar", id: "3752" },
  { keyword: "almeria", id: "6832" },
  { keyword: "almería", id: "6832" },
  { keyword: "burgos", id: "12597" },
  { keyword: "valladolid", id: "95" },
  { keyword: "granada", id: "3747" },
  { keyword: "palmas", id: "98" },
  { keyword: "mallorca", id: "84" },
  { keyword: "girona", id: "9812" },
  { keyword: "castellon", id: "4438" },
  { keyword: "castellón", id: "4438" },
  { keyword: "tenerife", id: "245" },
  { keyword: "eldense", id: "7320" },
  { keyword: "cordoba", id: "8447" },
  { keyword: "córdoba", id: "8447" },
  { keyword: "leganes", id: "17534" },
  { keyword: "leganés", id: "17534" },
  { keyword: "ceuta", id: "5404" },
  { keyword: "sabadell", id: "11487" },
  { keyword: "andorra", id: "20179" },
  { keyword: "celta", id: "131858" },
  { keyword: "sociedad", id: "20983" },
];

/**
 * Normalizes a venue search string for resilient matching.
 */
function normalizeVenueKeyword(venue: string): string {
  return venue
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Resolves the verified stadium asset for a fixture based on home team or venue details.
 *
 * @param query Match details specifying home team and venue.
 * @returns Verified stadium asset, or null if no verified image is available.
 */
export function getStadiumAsset(query: StadiumQuery): StadiumAsset | null {
  // 1. Sporting home match always maps to El Molinón
  if (query.isSporting) {
    return TEAM_STADIUM_REGISTRY["3788"] ?? null;
  }

  // 2. Lookup by home team external ID
  if (query.teamExternalId && query.teamExternalId in TEAM_STADIUM_REGISTRY) {
    return TEAM_STADIUM_REGISTRY[query.teamExternalId] ?? null;
  }

  // 3. Resilient fallback matching by home team name keyword
  if (query.teamName) {
    const normalizedTeam = normalizeVenueKeyword(query.teamName);
    for (const entry of TEAM_NAME_KEYWORD_MAP) {
      if (normalizedTeam.includes(entry.keyword)) {
        return TEAM_STADIUM_REGISTRY[entry.id] ?? null;
      }
    }
  }

  // 4. Resilient fallback matching by venue name keyword
  if (query.venueName) {
    const normalized = normalizeVenueKeyword(query.venueName);
    for (const entry of VENUE_KEYWORD_MAP) {
      if (normalized.includes(entry.keyword)) {
        return TEAM_STADIUM_REGISTRY[entry.id] ?? null;
      }
    }
  }

  // 5. Graceful degradation: no verified asset available
  return null;
}
