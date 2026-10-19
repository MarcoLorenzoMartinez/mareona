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
