export type HistoricalTier = 1 | 2;

export type HistoricalPointsSystem = 2 | 3;

export type HistoricalZone =
  | "champion"
  | "champions-league"
  | "europa-league"
  | "conference-league"
  | "uefa"
  | "promotion-direct"
  | "promotion-playoff"
  | "promotion"
  | "relegation-playoff"
  | "relegation"
  | "neutral";

export interface HistoricalSeason {
  readonly id: string;
  readonly label: string;
  readonly startYear: number;
  readonly endYear: number;
  readonly tier: HistoricalTier;
  readonly tierName: "1.ª División" | "2.ª División";
  readonly position: number;
  readonly totalTeams: number;
  readonly points: number;
  readonly pointsSystem: HistoricalPointsSystem;
  readonly played: number;
  readonly won: number;
  readonly drawn: number;
  readonly lost: number;
  readonly goalsFor: number;
  readonly goalsAgainst: number;
  readonly coach: string;
  readonly topScorer: string;
  readonly milestone?: string;
}

export interface HistoricalStandingRow {
  readonly position: number;
  readonly teamSlug: string;
  readonly teamName: string;
  readonly crestUrl: string | null;
  readonly points: number;
  readonly played: number;
  readonly won: number;
  readonly drawn: number;
  readonly lost: number;
  readonly goalsFor: number;
  readonly goalsAgainst: number;
  readonly isSporting: boolean;
  readonly zone: HistoricalZone;
}

export interface HistoricalChartPoint {
  readonly year: number;
  readonly seasonLabel: string;
  readonly tier: HistoricalTier;
  readonly position: number;
  /** Effective numeric rank: 1-20 for Tier 1, 21-42 for Tier 2 */
  readonly effectiveRank: number;
  readonly isMilestone: boolean;
  readonly milestone?: string;
}

export interface HistoricalCoach {
  readonly alias: string;
  readonly fullName: string;
  readonly matches?: number;
  readonly rounds?: string;
  readonly won?: number;
  readonly drawn?: number;
  readonly lost?: number;
  readonly photoUrl?: string | null;
}

export interface HistoricalPlayer {
  readonly dorsal: number | null;
  readonly alias: string;
  readonly fullName: string;
  readonly position: "Portero" | "Defensa" | "Centrocampista" | "Delantero";
  readonly played: number;
  readonly minutes: number | null;
  readonly goals: number;
  readonly photoUrl?: string | null;
}

export interface HistoricalTopScorer {
  readonly name: string;
  readonly fullName: string;
  readonly goals: number;
  readonly played: number;
  readonly photoUrl?: string | null;
}

export interface HistoricalSeasonSquad {
  readonly coaches: readonly HistoricalCoach[];
  readonly topScorers: readonly HistoricalTopScorer[];
  readonly players: readonly HistoricalPlayer[];
}

export type HistoricalMatchOutcome = "V" | "E" | "D";

export interface HistoricalMatch {
  readonly id: string;
  readonly date: string;
  readonly competition: string;
  readonly round: string;
  readonly homeTeam: string;
  readonly homeCrestUrl?: string | null;
  readonly awayTeam: string;
  readonly awayCrestUrl?: string | null;
  readonly homeScore: number;
  readonly awayScore: number;
  readonly isHome: boolean;
  readonly outcome: HistoricalMatchOutcome;
  readonly opponent: string;
  readonly venue?: string;
  readonly bdfHomeCrest?: string;
  readonly bdfAwayCrest?: string;
  readonly bdfMatchId?: string;
}

export interface HistoricalMatchGoal {
  readonly score: string;
  readonly scorer: string;
  readonly minute: number;
  readonly minuteDisplay?: string;
  readonly isHome?: boolean;
  readonly isPenalty?: boolean;
  readonly isOwnGoal?: boolean;
}

export interface HistoricalMatchPlayer {
  readonly name: string;
  readonly photoUrl?: string | null;
  position?: string;
  readonly subIn?: number;
  readonly subOut?: number;
  readonly yellowCard?: number;
  readonly redCard?: number;
}

export interface HistoricalMatchCoach {
  readonly name: string;
  readonly photoUrl?: string | null;
}

export interface HistoricalMatchReferee {
  readonly name: string;
  readonly photoUrl?: string | null;
}

export interface HistoricalMatchDetail {
  readonly bdfMatchId: string;
  readonly venue?: string;
  readonly referee?: HistoricalMatchReferee | null;
  readonly goals: readonly HistoricalMatchGoal[];
  readonly homeStarters: readonly HistoricalMatchPlayer[];
  readonly awayStarters: readonly HistoricalMatchPlayer[];
  readonly homeBench: readonly HistoricalMatchPlayer[];
  readonly awayBench: readonly HistoricalMatchPlayer[];
  readonly homeCoach?: HistoricalMatchCoach | null;
  readonly awayCoach?: HistoricalMatchCoach | null;
}
