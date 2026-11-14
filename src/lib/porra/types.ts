import type { PackTier } from '../cards/types.ts';

export interface PorraMatch {
  id: string;
  roundName: string;
  matchday?: number;
  homeTeam: {
    name: string;
    crestUrl?: string;
    isSporting: boolean;
  };
  awayTeam: {
    name: string;
    crestUrl?: string;
    isSporting: boolean;
  };
  kickoffAt: string;
  isFinished: boolean;
  actualHomeScore?: number;
  actualAwayScore?: number;
  actualSportingScorers?: string[];
}

export interface PorraPrediction {
  matchId: string;
  homeScore: number;
  awayScore: number;
  sportingScorers: string[];
  submittedAt: string;
}

export interface PorraEvaluation {
  points: number;
  exactScoreMatch: boolean;
  outcomeMatch: boolean;
  scorersMatchCount: number;
  rewardTier: PackTier | null;
}

export interface PorraUnclaimedReward {
  readonly match: PorraMatch;
  readonly prediction: PorraPrediction;
  readonly evaluation: PorraEvaluation;
  readonly rewardTier: PackTier;
}

export interface PorraCurrentPredictionSummary {
  readonly homeScore: number;
  readonly awayScore: number;
  readonly sportingScorers: readonly string[];
}

export interface PorraLeaderboardEntry {
  rank: number;
  userId?: string;
  userName: string;
  avatarSeed: string;
  totalPoints: number;
  exactScoresCount: number;
  outcomesCount: number;
  lastMatchPoints?: number;
  currentPrediction?: PorraCurrentPredictionSummary | null;
  isCurrentUser?: boolean;
  isFriend?: boolean;
}
