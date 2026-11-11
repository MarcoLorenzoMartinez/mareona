/**
 * Canonical dictionary for historical opponent normalization.
 * Consolidates historical spelling variants (Franco-era vs modern co-official),
 * temporary II Republic names without royal titles ("Madrid" -> "Real Madrid",
 * "Donostia" -> "Real Sociedad", "Unión Irún" -> "Real Unión"), historical
 * mergers, and filial evolutions into single canonical sporting identities.
 */
export const CANONICAL_OPPONENT_MAP: Readonly<Record<string, string>> = {
  // II Republic era (1931-1939) titles without "Real"
  Madrid: "Real Madrid",
  Donostia: "Real Sociedad",
  "Unión Irún": "Real Unión",

  // Filials & historical names
  Castilla: "Real Madrid Castilla",

  // Franco era vs modern Catalan / Galician spellings & mergers
  Gerona: "Girona FC",
  Girona: "Girona FC",
  Tarrasa: "Terrassa FC",
  Terrassa: "Terrassa FC",
  "Gimnástico de Tarragona": "Gimnàstic de Tarragona",
  Orense: "CD Ourense",
  Ourense: "CD Ourense",
  Baracaldo: "Barakaldo CF",
  "Baracaldo Oriamendi": "Barakaldo CF",
  Xerez: "Xerez CD",
  "Xerez Club": "Xerez CD",
  "España Industrial": "CD Condal",
  Condal: "CD Condal",
  "Deportivo Torrelavega": "Gimnástica de Torrelavega",
  Catalunya: "CE Europa",
};

/**
 * Modern sports API and contemporary naming aliases mapped to canonical historical names.
 */
export const MODERN_OPPONENT_ALIASES: Readonly<Record<string, string>> = {
  // Reserve / filial teams mapping to canonical historical identities
  "real sociedad ii": "Real Sociedad B",
  "real sociedad 2": "Real Sociedad B",
  "real sociedad b": "Real Sociedad B",
  "sanse": "Real Sociedad B",
  "fc barcelona ii": "FC Barcelona Atlètic",
  "fc barcelona b": "FC Barcelona Atlètic",
  "barcelona ii": "FC Barcelona Atlètic",
  "barcelona b": "FC Barcelona Atlètic",
  "barcelona atletic": "FC Barcelona Atlètic",
  "barcelona atlètic": "FC Barcelona Atlètic",
  "real madrid castilla": "Real Madrid Castilla",
  "real madrid ii": "Real Madrid Castilla",
  "real madrid b": "Real Madrid Castilla",
  "sevilla atletico": "Sevilla Atlético",
  "sevilla atlético": "Sevilla Atlético",
  "sevilla ii": "Sevilla Atlético",
  "sevilla b": "Sevilla Atlético",
  "villarreal cf b": "Villarreal CF B",
  "villarreal cf ii": "Villarreal CF B",
  "villarreal b": "Villarreal CF B",
  "villarreal ii": "Villarreal CF B",
  "valencia mestalla": "Valencia Mestalla",
  "valencia b": "Valencia Mestalla",
  "valencia ii": "Valencia Mestalla",
  "atletico madrid b": "Atlético Madrileño",
  "atletico de madrid b": "Atlético Madrileño",
  "atletico madrileño": "Atlético Madrileño",
  "athletic b": "Bilbao Athletic",
  "athletic club b": "Bilbao Athletic",
  "athletic club ii": "Bilbao Athletic",
  "celta fortuna": "RC Celta Fortuna",
  "celta b": "RC Celta Fortuna",
  "rc celta fortuna": "RC Celta Fortuna",
  "rc celta b": "RC Celta Fortuna",
  "osasuna b": "Osasuna Promesas",
  "osasuna promesas": "Osasuna Promesas",

  // First teams
  "deportivo la coruña": "RC Deportivo",
  "deportivo de la coruña": "RC Deportivo",
  "rc deportivo de la coruña": "RC Deportivo",
  "rc deportivo la coruña": "RC Deportivo",
  "cd eldense": "Eldense",
  "atletico madrid": "Atlético de Madrid",
  "atlético madrid": "Atlético de Madrid",
  "athletic bilbao": "Athletic Club",
  "racing santander": "Racing de Santander",
  "racing de ferrol": "Racing de Ferrol",
  "racing ferrol": "Racing de Ferrol",
  "rayo": "Rayo Vallecano",
  "celta": "RC Celta",
  "celta vigo": "RC Celta",
  "celta de vigo": "RC Celta",
  "alaves": "Deportivo Alavés",
  "deportivo alaves": "Deportivo Alavés",
  "leganes": "CD Leganés",
  "betis": "Real Betis",
  "espanyol": "RCD Espanyol",
  "mallorca": "RCD Mallorca",
  "osasuna": "CA Osasuna",
  "sporting de gijon": "Real Sporting",
  "sporting gijon": "Real Sporting",
};

/**
 * Returns the canonical opponent name, consolidating historical variants into
 * the recognized institutional identity.
 *
 * @param rawName Opponent name as recorded in raw historical match records.
 * @returns Canonicalized team name.
 */
export function canonicalizeOpponentName(rawName: string): string {
  const trimmed = rawName.trim();
  return CANONICAL_OPPONENT_MAP[trimmed] ?? trimmed;
}
