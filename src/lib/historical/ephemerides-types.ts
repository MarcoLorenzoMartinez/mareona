export type EphemerisCategory = "milestone" | "legend" | "triumph" | "signing";

export interface EphemerisMilestone {
  readonly id: string;
  readonly month: number;
  readonly day: number;
  readonly year?: number;
  readonly category: EphemerisCategory;
  readonly categoryLabel: string;
  readonly title: string;
  readonly description: string;
  readonly figure?: string;
}

export interface DayMatchItem {
  readonly id: string;
  readonly season: string;
  readonly date: string;
  readonly year: number;
  readonly competition: string;
  readonly round: string;
  readonly homeTeam: string;
  readonly awayTeam: string;
  readonly homeScore: number;
  readonly awayScore: number;
  readonly isHome: boolean;
  readonly outcome: "V" | "E" | "D";
  readonly opponent: string;
  readonly venue?: string;
  readonly homeCrestUrl: string | null;
  readonly awayCrestUrl: string | null;
}

export interface DayMatchesBalance {
  readonly played: number;
  readonly won: number;
  readonly drawn: number;
  readonly lost: number;
  readonly goalsFor: number;
  readonly goalsAgainst: number;
}

export interface DayEphemeridesResult {
  readonly month: number;
  readonly day: number;
  readonly dateLabel: string;
  readonly matches: readonly DayMatchItem[];
  readonly milestones: readonly EphemerisMilestone[];
  readonly balance: DayMatchesBalance;
}
