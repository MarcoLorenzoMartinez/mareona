import type { DayEphemeridesResult, DayMatchItem, EphemerisCategory } from "./ephemerides-types.ts";

export interface FeaturedEphemeris {
  readonly year: number | null;
  readonly title: string;
  readonly detail: string;
  readonly photoUrl?: string | null;
  readonly figure?: string;
  readonly categoryLabel?: string;
}

const CATEGORY_PRIORITY: Readonly<Record<EphemerisCategory, number>> = {
  triumph: 0,
  legend: 1,
  milestone: 2,
  signing: 3,
};

const OUTCOME_PRIORITY: Readonly<Record<DayMatchItem["outcome"], number>> = { V: 0, E: 1, D: 2 };

/**
 * Resolves the calendar day in the club's timezone, so the daily content flips
 * at Spanish midnight regardless of where the server runs.
 *
 * @param now Reference instant.
 * @returns Month (1-12) and day (1-31) in Europe/Madrid.
 */
export function getMadridMonthDay(now: Date = new Date()): { month: number; day: number } {
  const parts = new Intl.DateTimeFormat("es-ES", {
    timeZone: "Europe/Madrid",
    month: "numeric",
    day: "numeric",
  }).formatToParts(now);
  const pick = (type: "month" | "day") => Number(parts.find((part) => part.type === type)?.value);
  return { month: pick("month"), day: pick("day") };
}

function sportingGoalDifference(match: DayMatchItem): number {
  return match.isHome ? match.homeScore - match.awayScore : match.awayScore - match.homeScore;
}

function describeMatch(match: DayMatchItem): FeaturedEphemeris {
  return {
    year: match.year,
    title: `${match.homeTeam} ${match.homeScore}–${match.awayScore} ${match.awayTeam}`,
    detail: match.round ? `${match.competition} · ${match.round}` : match.competition,
    photoUrl: match.isHome ? match.awayCrestUrl : match.homeCrestUrl,
    figure: match.opponent,
    categoryLabel: match.competition,
  };
}

/**
 * Picks the single most relevant historical fact for a day. Milestones win over
 * plain results so the card tells a story; among results, the widest Sporting win
 * (then the most recent one) is preferred.
 *
 * @param result Ephemerides for the day.
 * @returns One item to display, or null when the club has no record for that day.
 */
export function pickFeaturedEphemeris(result: DayEphemeridesResult): FeaturedEphemeris | null {
  const [milestone] = [...result.milestones].sort(
    (a, b) => CATEGORY_PRIORITY[a.category] - CATEGORY_PRIORITY[b.category]
  );
  if (milestone) {
    return {
      year: milestone.year ?? null,
      title: milestone.title,
      detail: milestone.description,
      photoUrl: milestone.photoUrl ?? null,
      figure: milestone.figure,
      categoryLabel: milestone.categoryLabel,
    };
  }

  const [match] = [...result.matches].sort(
    (a, b) =>
      OUTCOME_PRIORITY[a.outcome] - OUTCOME_PRIORITY[b.outcome] ||
      sportingGoalDifference(b) - sportingGoalDifference(a) ||
      b.year - a.year
  );
  return match ? describeMatch(match) : null;
}
