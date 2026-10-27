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
}

export interface PorraLeaderboardEntry {
  rank: number;
  userName: string;
  avatarSeed: string;
  totalPoints: number;
  exactScoresCount: number;
  outcomesCount: number;
  isCurrentUser?: boolean;
}
