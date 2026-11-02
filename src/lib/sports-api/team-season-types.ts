/**
 * Domain model for Real Sporting's collective season statistics.
 * Extracted from official league performance data.
 */

import type {
  TacticalAttackingZones,
  TacticalPassTerritory,
  HeatmapPoint,
} from "./tactical-field-types";

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

export interface TeamSeasonPatterns {
  readonly cleanSheetsCount: number;
  readonly withoutScoringCount: number;
  readonly bothTeamsScoredCount: number;
  readonly highScoringMatchesCount: number; // 3 o más goles
  readonly tightMatchesCount: number; // Marcadores cortos (0-2 goles)
}

export interface TeamSeasonGoalItem {
  readonly id: number;
  readonly matchId: number;
  readonly playerName: string;
  readonly rivalName: string;
  readonly isHome: boolean;
  readonly minute: number;
  readonly expectedGoals: number;
  readonly expectedGoalsOnTarget?: number;
  readonly shotType?: string;
  readonly situation?: string;
  readonly x: number;
  readonly y: number;
  readonly onGoalX?: number;
  readonly onGoalY?: number;
}

export interface TeamSeasonStats {
  readonly seasonYear: number;
  readonly competition: string;
  readonly matchesPlayed: number;
  readonly rating: number;
  readonly ratingRank: number | null;
  // Season Goals Collection
  readonly seasonGoals: readonly TeamSeasonGoalItem[];
  // Efficiency & Expected Points
  readonly actualPoints: number;
  readonly expectedPoints: number;
  readonly expectedPointsDiff: number;
  readonly expectedStandingsRank: number | null;
  readonly patterns: TeamSeasonPatterns;
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
  readonly setPieceGoalsRank: number | null;
  readonly cornersTaken: number;
  readonly cornersTakenRank: number | null;
  // Possession & Play
  readonly averagePossession: number;
  readonly possessionRank: number | null;
  readonly accuratePassesPerMatch: number;
  readonly accuratePassesRank: number | null;
  readonly accurateLongBallsPerMatch: number;
  readonly accurateLongBallsRank: number | null;
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
  readonly clearancesRank: number | null;
  readonly tacklesRank: number | null;
  readonly setPieceGoalsConceded: number;
  readonly setPieceGoalsConcededRank: number | null;
  readonly penaltiesConceded: number;
  readonly penaltiesConcededRank: number | null;
  readonly possessionWonAttackingThirdPerMatch: number;
  readonly savesPerMatch: number;
  readonly savesRank: number | null;
  // Stadium & Discipline
  readonly homeAttendance: number;
  readonly attendanceRank: number | null;
  readonly yellowCards: number;
  readonly yellowCardsRank: number | null;
  readonly redCards: number;
  readonly redCardsRank: number | null;
  readonly foulsPerMatch: number;
  readonly foulsRank: number | null;
  // Splits
  readonly homeSplit: TeamSeasonStatsSplit;
  readonly awaySplit: TeamSeasonStatsSplit;
  // Spatial & Tactical Field Data
  readonly attackingZones?: TacticalAttackingZones;
  readonly passTerritory?: TacticalPassTerritory;
  readonly collectiveHeatmap?: readonly HeatmapPoint[];
  readonly heatmapCirclesSvg?: string;
}
