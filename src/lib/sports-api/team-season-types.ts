/**
 * Domain model for Real Sporting's collective season statistics.
 * Extracted from official league performance data.
 */

export interface TeamMetricItem {
  readonly key: string;
  readonly label: string;
  readonly value: number;
  readonly displayValue: string;
  readonly rank: number | null;
  readonly unit?: string;
}

export interface TeamSeasonStatsSplit {
  readonly played: number;
  readonly wins: number;
  readonly draws: number;
  readonly losses: number;
  readonly goalsFor: number;
  readonly goalsAgainst: number;
  readonly points: number;
  readonly rank: number;
}

export interface TeamSeasonStats {
  readonly seasonYear: number;
  readonly competition: string;
  readonly matchesPlayed: number;
  readonly rating: number;
  readonly ratingRank: number | null;
  // Attack
  readonly goalsPerMatch: number;
  readonly goalsPerMatchRank: number | null;
  readonly expectedGoals: number;
  readonly expectedGoalsRank: number | null;
  readonly shotsOnTargetPerMatch: number;
  readonly shotsOnTargetRank: number | null;
  readonly bigChances: number;
  readonly bigChancesRank: number | null;
  readonly touchesInOppBox: number;
  readonly touchesInOppBoxRank: number | null;
  readonly setPieceGoals: number;
  readonly cornersTaken: number;
  // Possession & Play
  readonly averagePossession: number;
  readonly possessionRank: number | null;
  readonly accuratePassesPerMatch: number;
  readonly accuratePassesRank: number | null;
  readonly accurateLongBallsPerMatch: number;
  readonly accurateCrossesPerMatch: number;
  readonly accurateCrossesRank: number | null;
  // Defense & Goalkeeping
  readonly goalsConcededPerMatch: number;
  readonly goalsConcededRank: number | null;
  readonly expectedGoalsConceded: number;
  readonly xGConcededRank: number | null;
  readonly cleanSheets: number;
  readonly cleanSheetsRank: number | null;
  readonly interceptionsPerMatch: number;
  readonly interceptionsRank: number | null;
  readonly tacklesPerMatch: number;
  readonly clearancesPerMatch: number;
  readonly possessionWonAttackingThirdPerMatch: number;
  readonly savesPerMatch: number;
  // Stadium & Discipline
  readonly homeAttendance: number;
  readonly attendanceRank: number | null;
  readonly yellowCards: number;
  readonly redCards: number;
  readonly foulsPerMatch: number;
  // Splits
  readonly homeSplit: TeamSeasonStatsSplit;
  readonly awaySplit: TeamSeasonStatsSplit;
}
