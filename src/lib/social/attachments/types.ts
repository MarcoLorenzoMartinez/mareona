import type { StatCategory } from "./stat-catalog";

export interface ResolvedStatAttachment {
  readonly type: "stat";
  readonly href: string;
  readonly category: StatCategory;
  readonly label: string;
  readonly value: string;
  readonly rank: number | null;
  readonly lowerIsBetter: boolean;
  readonly seasonLabel: string;
}

export interface ResolvedPlayerAttachment {
  readonly type: "player";
  readonly href: string;
  readonly name: string;
  readonly shirtNumber: number | null;
  readonly positionLabel: string;
  readonly photoUrl: string | null;
  readonly appearances: number;
  readonly goals: number;
  readonly assists: number;
}

export interface ResolvedMatchAttachment {
  readonly type: "match";
  /** Historical matches have no standalone page, so this opens the season's match list. */
  readonly href: string;
  readonly isHistorical: boolean;
  readonly competition: string;
  readonly roundLabel: string | null;
  readonly kickoffAt: string;
  readonly status: "scheduled" | "live" | "finished";
  readonly homeName: string;
  readonly awayName: string;
  readonly homeCrestUrl: string | null;
  readonly awayCrestUrl: string | null;
  readonly homeScore: number | null;
  readonly awayScore: number | null;
  readonly sportingIsHome: boolean;
}

/** Shown when the referenced data cannot be loaded right now; never replaced by fake data. */
export interface UnavailableAttachment {
  readonly type: "unavailable";
}

export type ResolvedAttachment =
  | ResolvedStatAttachment
  | ResolvedPlayerAttachment
  | ResolvedMatchAttachment
  | UnavailableAttachment;
