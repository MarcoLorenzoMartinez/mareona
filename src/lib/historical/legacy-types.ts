/**
 * Core domain types for Historical Legacy: Player Records, Coaches and Awards.
 * Strict typing with zero mock data and compliant with WCAG 2.2 AA.
 */

export interface LegacyPlayerRecord {
  readonly rank: number;
  readonly name: string;
  readonly fullName: string;
  readonly position: string;
  readonly photoUrl: string | null;
  readonly totalPlayed: number;
  readonly totalGoals: number;
  readonly totalMinutes: number;
  readonly seasonCount: number;
  readonly startSeason: string;
  readonly endSeason: string;
  readonly seasonsList: readonly string[];
}

export interface IndividualAward {
  readonly season: string;
  readonly awardName: string;
  readonly division: "1.ª División" | "2.ª División";
  readonly winnerName: string;
  readonly photoUrl: string;
  readonly statLabel: string;
}

export interface LegacyCoachRecord {
  readonly rank: number;
  readonly name: string;
  readonly fullName: string;
  readonly matches: number;
  readonly won: number;
  readonly drawn: number;
  readonly lost: number;
  readonly seasonsCount: number;
  readonly startSeason: string;
  readonly endSeason: string;
  readonly eras: readonly string[];
  readonly photoUrl?: string | null;
}
