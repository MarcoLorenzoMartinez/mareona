/**
 * Core domain types for Historical Legacy: Player Records and Coaches.
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
  readonly seasonsList?: readonly string[];
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
