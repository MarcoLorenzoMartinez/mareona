/**
 * Core domain types for Historical Legacy, Legends Wall, Stadium and Records.
 * Strict typing with zero mock data and compliant with WCAG 2.2 AA.
 */

export type LegacyTab = "records" | "legends" | "temples" | "coaches";

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

export interface LegendProfile {
  readonly id: string;
  readonly name: string;
  readonly fullName: string;
  readonly alias: string;
  readonly role: "player" | "coach" | "president" | "icon";
  readonly position?: string;
  readonly era: "pioneers" | "golden" | "nineties" | "modern";
  readonly eraLabel: string;
  readonly yearsActive: string;
  readonly totalPlayed?: number;
  readonly totalGoals?: number;
  readonly titles?: readonly string[];
  readonly photoUrl: string;
  readonly summary: string;
  readonly highlights: readonly string[];
}

export interface IndividualAward {
  readonly season: string;
  readonly awardName: string;
  readonly division: "1.ª División" | "2.ª División";
  readonly winnerName: string;
  readonly photoUrl: string;
  readonly statLabel: string;
}

export interface TempleMilestone {
  readonly year: number;
  readonly title: string;
  readonly temple: "molinon" | "mareo";
  readonly description: string;
  readonly photoUrl?: string;
}

export interface CoachRecord {
  readonly rank: number;
  readonly name: string;
  readonly seasonsCount: number;
  readonly seasonsList: readonly string[];
  readonly photoUrl?: string;
  readonly milestone?: string;
}
