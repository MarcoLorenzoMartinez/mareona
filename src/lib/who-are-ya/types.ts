export type WhoAreYaGameMode = 'players' | 'kits';

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

export interface WhoAreYaKit {
  id: string;
  label: string;
  season: string;
  type: string;
  year: number;
  sponsor?: string;
  details: string;
  image: string;
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

export interface KitGuessResult {
  kit: WhoAreYaKit;
  isCorrect: boolean;
  seasonMatch: boolean;
  typeMatch: boolean;
  yearComparison: StatComparison;
}
