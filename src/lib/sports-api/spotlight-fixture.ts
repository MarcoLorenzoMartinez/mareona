import type { DomainMatchSummary } from "./types.ts";

/**
 * Extracts date components in the official Spanish football time zone (Europe/Madrid).
 */
export function getMadridDateParts(date: Date): {
  year: number;
  month: number;
  day: number;
  dayOfWeek: number; // 0 = Sun, 1 = Mon, ..., 6 = Sat
} {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    weekday: "short",
  });
  const parts = formatter.formatToParts(date);
  let year = 0;
  let month = 0;
  let day = 0;
  for (const p of parts) {
    if (p.type === "year") year = parseInt(p.value, 10);
    if (p.type === "month") month = parseInt(p.value, 10);
    if (p.type === "day") day = parseInt(p.value, 10);
  }
  const weekdayStr = parts.find((p) => p.type === "weekday")?.value ?? "";
  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  const dayOfWeek = weekdayMap[weekdayStr] ?? date.getUTCDay();
  return { year, month, day, dayOfWeek };
}

/**
 * Computes the UTC timestamp corresponding to 00:00:00 in Europe/Madrid for a given calendar date.
 */
export function getMadridMidnight(year: number, month: number, day: number): number {
  const m = String(month).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  const str = `${year}-${m}-${d}T00:00:00`;
  const guess = new Date(`${str}Z`);
  const offsetFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Madrid",
    timeZoneName: "shortOffset",
  });
  const tzPart = offsetFormatter.formatToParts(guess).find((p) => p.type === "timeZoneName")?.value;
  const match = tzPart?.match(/GMT([+-]\d+)/);
  const offsetHours = match ? parseInt(match[1], 10) : 1;
  const offsetSign = offsetHours >= 0 ? "+" : "-";
  const offsetStr = `${offsetSign}${String(Math.abs(offsetHours)).padStart(2, "0")}:00`;
  return new Date(`${str}${offsetStr}`).getTime();
}

/**
 * Safely adds N days to a calendar date using UTC boundaries to avoid timezone/clock drift.
 */
export function addDaysToDate(
  year: number,
  month: number,
  day: number,
  daysToAdd: number
): { year: number; month: number; day: number } {
  const d = new Date(Date.UTC(year, month - 1, day + daysToAdd));
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
  };
}

/**
 * Computes the exact timestamp (always at 00:00:00 Europe/Madrid) when the spotlight
 * should transition from the last finished match to the next upcoming match.
 *
 * Rules:
 * 1. Weekend match (Fri, Sat, Sun) -> Shows result until Monday night; transitions Tuesday at 00:00.
 * 2. Monday match -> Shows result until Tuesday night; transitions Wednesday at 00:00.
 * 3. Midweek match (Tue, Wed, Thu) -> Shows result match day and next full day; transitions 00:00 of 2nd day.
 * 4. Priority safeguard for close upcoming matches -> Transitions at latest on 00:00 of the eve of next match.
 *
 * @param finishedKickoffAt ISO kickoff timestamp of the last finished match.
 * @param nextKickoffAt Optional ISO kickoff timestamp of the next upcoming fixture.
 * @returns Timestamp in ms of the 00:00 transition.
 */
export function computeSpotlightTransitionAt(
  finishedKickoffAt: string,
  nextKickoffAt?: string | null
): number {
  const finishedDate = new Date(finishedKickoffAt);
  const p = getMadridDateParts(finishedDate);

  let daysToAdd = 2;
  if (p.dayOfWeek === 5) daysToAdd = 4; // Fri -> Tue
  else if (p.dayOfWeek === 6) daysToAdd = 3; // Sat -> Tue
  else if (p.dayOfWeek === 0) daysToAdd = 2; // Sun -> Tue
  else if (p.dayOfWeek === 1) daysToAdd = 2; // Mon -> Wed
  else daysToAdd = 2; // Tue -> Thu, Wed -> Fri, Thu -> Sat

  const targetDate = addDaysToDate(p.year, p.month, p.day, daysToAdd);
  let transitionAt = getMadridMidnight(targetDate.year, targetDate.month, targetDate.day);

  // Safeguard: if next match is very close, transition at latest on 00:00 of the eve of the match
  if (nextKickoffAt) {
    const nextDate = new Date(nextKickoffAt);
    const nextParts = getMadridDateParts(nextDate);
    const eveDate = addDaysToDate(nextParts.year, nextParts.month, nextParts.day, -1);
    const eveMidnight = getMadridMidnight(eveDate.year, eveDate.month, eveDate.day);
    if (eveMidnight < transitionAt && eveMidnight > finishedDate.getTime()) {
      transitionAt = eveMidnight;
    }
  }

  return transitionAt;
}

/**
 * Resolves which match should be spotlighted on the home hero card.
 *
 * 1. Live match: always takes absolute precedence.
 * 2. If recent finished match is within its post-match window (up to Tuesday 00:00 for weekends, etc.):
 *    spotlights the finished match with its result.
 * 3. Otherwise: spotlights the next upcoming match.
 *
 * @param seasonMatches Sorted list of all season matches.
 * @param now Current timestamp in ms (defaults to Date.now()).
 * @returns DomainMatchSummary to feature in the hero card, or null if no matches.
 */
export function resolveSpotlightFixture(
  seasonMatches: readonly DomainMatchSummary[],
  now: number = Date.now()
): DomainMatchSummary | null {
  if (!seasonMatches || seasonMatches.length === 0) {
    return null;
  }

  // 1. Live match in progress takes absolute priority
  const liveMatch = seasonMatches.find((m) => m.status === "live");
  if (liveMatch) {
    return liveMatch;
  }

  const finishedMatches = seasonMatches.filter((m) => m.status === "finished");
  const upcomingMatches = seasonMatches.filter((m) => m.status !== "finished");

  const lastFinished =
    finishedMatches.length > 0 ? finishedMatches[finishedMatches.length - 1] : null;
  const nextUpcoming = upcomingMatches.length > 0 ? upcomingMatches[0] : null;

  if (!lastFinished) {
    return nextUpcoming;
  }
  if (!nextUpcoming) {
    return lastFinished;
  }

  const transitionAt = computeSpotlightTransitionAt(
    lastFinished.kickoffAt,
    nextUpcoming.kickoffAt
  );

  return now < transitionAt ? lastFinished : nextUpcoming;
}
