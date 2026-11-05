import type { StatKey } from "./schemas.ts";
import type { TeamSeasonStats } from "../../sports-api/team-season-types.ts";

export type StatCategory = "Ataque" | "Posesión" | "Defensa" | "Disciplina";

export interface StatItem {
  readonly key: StatKey;
  readonly category: StatCategory;
  readonly label: string;
  /** Formatted value, ready to render (e.g. "54.3%"). */
  readonly value: string;
  /** League rank among the 22 teams, or null when unavailable. */
  readonly rank: number | null;
  /** True when a lower number is better (fouls, cards, goals conceded). */
  readonly lowerIsBetter: boolean;
}

interface StatDefinition {
  readonly category: StatCategory;
  readonly label: string;
  readonly lowerIsBetter?: boolean;
  readonly read: (s: TeamSeasonStats) => { readonly value: string; readonly rank: number | null };
}

const one = (n: number) => n.toFixed(1);

/** Labels mirror the ones rendered in /temporada/estadisticas so quotes match the page. */
const STAT_DEFINITIONS: Readonly<Record<StatKey, StatDefinition>> = {
  goalsPerMatch: { category: "Ataque", label: "Goles por partido", read: (s) => ({ value: one(s.goalsPerMatch), rank: s.goalsPerMatchRank }) },
  expectedGoals: { category: "Ataque", label: "Goles esperados (xG)", read: (s) => ({ value: one(s.expectedGoals), rank: s.expectedGoalsRank }) },
  shotsOnTargetPerMatch: { category: "Ataque", label: "Tiros a puerta por partido", read: (s) => ({ value: one(s.shotsOnTargetPerMatch), rank: s.shotsOnTargetRank }) },
  bigChances: { category: "Ataque", label: "Grandes ocasiones creadas", read: (s) => ({ value: String(s.bigChances), rank: s.bigChancesRank }) },
  setPieceGoals: { category: "Ataque", label: "Goles a balón parado", read: (s) => ({ value: String(s.setPieceGoals), rank: s.setPieceGoalsRank }) },
  cornersTaken: { category: "Ataque", label: "Córners lanzados", read: (s) => ({ value: String(s.cornersTaken), rank: s.cornersTakenRank }) },
  averagePossession: { category: "Posesión", label: "Posesión media", read: (s) => ({ value: `${one(s.averagePossession)}%`, rank: s.possessionRank }) },
  accuratePassesPerMatch: { category: "Posesión", label: "Pases precisos por partido", read: (s) => ({ value: one(s.accuratePassesPerMatch), rank: s.accuratePassesRank }) },
  accurateLongBallsPerMatch: { category: "Posesión", label: "Balones largos con éxito por partido", read: (s) => ({ value: one(s.accurateLongBallsPerMatch), rank: s.accurateLongBallsRank }) },
  accurateCrossesPerMatch: { category: "Posesión", label: "Centros completados por partido", read: (s) => ({ value: one(s.accurateCrossesPerMatch), rank: s.accurateCrossesRank }) },
  touchesInOppBox: { category: "Posesión", label: "Toques en área contraria", read: (s) => ({ value: String(s.touchesInOppBox), rank: s.touchesInOppBoxRank }) },
  goalsConcededPerMatch: { category: "Defensa", label: "Goles encajados por partido", lowerIsBetter: true, read: (s) => ({ value: one(s.goalsConcededPerMatch), rank: s.goalsConcededRank }) },
  expectedGoalsConceded: { category: "Defensa", label: "xG en contra concedido", lowerIsBetter: true, read: (s) => ({ value: one(s.expectedGoalsConceded), rank: s.xGConcededRank }) },
  interceptionsPerMatch: { category: "Defensa", label: "Intercepciones por partido", read: (s) => ({ value: one(s.interceptionsPerMatch), rank: s.interceptionsRank }) },
  tacklesPerMatch: { category: "Defensa", label: "Entradas con éxito por partido", read: (s) => ({ value: one(s.tacklesPerMatch), rank: s.tacklesRank }) },
  clearancesPerMatch: { category: "Defensa", label: "Despejes por partido", read: (s) => ({ value: one(s.clearancesPerMatch), rank: s.clearancesRank }) },
  setPieceGoalsConceded: { category: "Defensa", label: "Goles concedidos a balón parado", lowerIsBetter: true, read: (s) => ({ value: String(s.setPieceGoalsConceded), rank: s.setPieceGoalsConcededRank }) },
  foulsPerMatch: { category: "Disciplina", label: "Faltas cometidas por partido", lowerIsBetter: true, read: (s) => ({ value: one(s.foulsPerMatch), rank: s.foulsRank }) },
  yellowCards: { category: "Disciplina", label: "Tarjetas amarillas totales", lowerIsBetter: true, read: (s) => ({ value: String(s.yellowCards), rank: s.yellowCardsRank }) },
  redCards: { category: "Disciplina", label: "Tarjetas rojas totales", lowerIsBetter: true, read: (s) => ({ value: String(s.redCards), rank: s.redCardsRank }) },
  penaltiesConceded: { category: "Disciplina", label: "Penaltis cometidos", lowerIsBetter: true, read: (s) => ({ value: String(s.penaltiesConceded), rank: s.penaltiesConcededRank }) },
  savesPerMatch: { category: "Disciplina", label: "Paradas del guardameta por partido", read: (s) => ({ value: one(s.savesPerMatch), rank: s.savesRank }) },
};

/**
 * Builds a quotable stat from the season statistics.
 *
 * @param stats - Team season stats as shown on /temporada/estadisticas.
 * @param key - Statistic identifier.
 * @returns Display-ready stat item.
 */
export function buildStatItem(stats: TeamSeasonStats, key: StatKey): StatItem {
  const def = STAT_DEFINITIONS[key];
  const { value, rank } = def.read(stats);
  return {
    key,
    category: def.category,
    label: def.label,
    value,
    rank: rank !== null && rank > 0 ? rank : null,
    lowerIsBetter: def.lowerIsBetter ?? false,
  };
}

/**
 * Lists every quotable stat for the picker.
 *
 * @param stats - Team season stats.
 * @returns Items in the same order as the stats page.
 */
export function buildStatItems(stats: TeamSeasonStats): readonly StatItem[] {
  return (Object.keys(STAT_DEFINITIONS) as StatKey[]).map((key) => buildStatItem(stats, key));
}
