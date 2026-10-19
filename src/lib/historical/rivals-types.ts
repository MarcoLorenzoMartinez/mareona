/**
 * Core domain types for Historical Rivals and Head-to-Head (H2H) analysis.
 * Strictly typed with zero mock data and compliant with WCAG 2.2 AA.
 */

export type RivalScopeFilter =
  | "all"
  | "primera"
  | "segunda"
  | "copa"
  | "uefa"
  | "promocion";

export type RivalSortOption =
  | "played"
  | "alpha"
  | "won"
  | "winRate"
  | "diff";

export type RivalLayoutMode = "grid" | "table";

export interface RivalGeoInfo {
  readonly name: string;
  readonly crestUrl: string | null;
  readonly community: string;
  readonly province: string;
  readonly country: string;
}

export interface CompetitionStats {
  readonly competition: string;
  readonly played: number;
  readonly won: number;
  readonly drawn: number;
  readonly lost: number;
  readonly goalsFor: number;
  readonly goalsAgainst: number;
}

export interface RivalH2HMatch {
  readonly id: string;
  readonly bdfMatchId: string;
  readonly season: string;
  readonly date: string;
  readonly year: number;
  readonly competition: string;
  readonly round: string;
  readonly homeTeam: string;
  readonly awayTeam: string;
  readonly homeScore: number | null;
  readonly awayScore: number | null;
  readonly isHome: boolean;
  readonly outcome: "V" | "E" | "D" | "PENDIENTE";
  readonly venue: string;
  readonly homeCrestUrl?: string;
  readonly awayCrestUrl?: string;
}

export interface RivalH2HSummary {
  readonly name: string;
  readonly crestUrl: string | null;
  readonly community: string;
  readonly province: string;
  readonly country: string;
  readonly isInternational: boolean;
  readonly played: number;
  readonly won: number;
  readonly drawn: number;
  readonly lost: number;
  readonly goalsFor: number;
  readonly goalsAgainst: number;
  readonly goalDiff: number;
  readonly winPercentage: number;
  readonly competitionsBreakdown: readonly CompetitionStats[];
  readonly matches: readonly RivalH2HMatch[];
  readonly firstMatchDate?: string;
  readonly lastMatchDate?: string;
}

export interface RegionRivalSummary {
  readonly regionId: string;
  readonly regionName: string;
  readonly isCountry: boolean;
  readonly totalRivals: number;
  readonly totalMatches: number;
  readonly won: number;
  readonly drawn: number;
  readonly lost: number;
  readonly goalsFor: number;
  readonly goalsAgainst: number;
  readonly rivals: readonly RivalH2HSummary[];
}
