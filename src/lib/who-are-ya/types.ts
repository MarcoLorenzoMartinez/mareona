export interface WhoAreYaPlayer {
  bdfId: number;
  name: string;
  fullName: string;
  position: string;
  nationality: string;
  startYear: number;
  endYear: number;
  totalPlayed: number;
  totalGoals: number;
  photoUrl: string;
}

export type StatComparison = 'equal' | 'higher' | 'lower';

export interface PlayerGuessResult {
  player: WhoAreYaPlayer;
  isCorrect: boolean;
  nationalityMatch: boolean;
  positionMatch: boolean;
  matchesPlayed: {
    value: number;
    comparison: StatComparison;
  };
  goals: {
    value: number;
    comparison: StatComparison;
  };
  startYear: {
    value: number;
    comparison: StatComparison;
  };
  endYear: {
    value: number;
    comparison: StatComparison;
  };
}
