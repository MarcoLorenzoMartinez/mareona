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
  readonly bdfMatchId?: string;
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

const SPANISH_MONTHS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
] as const;

/**
 * Formats calendar month and day into Spanish string (e.g. '17 de octubre').
 */
export function formatDayMonthLabel(month: number, day: number): string {
  const safeMonth = Math.min(12, Math.max(1, month));
  const safeDay = Math.min(31, Math.max(1, day));
  return `${safeDay} de ${SPANISH_MONTHS[safeMonth - 1]}`;
}
