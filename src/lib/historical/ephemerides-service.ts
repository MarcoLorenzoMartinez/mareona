import rawMatches from "../../data/historical/matches.json" with { type: "json" };
import rawEphemerides from "../../data/historical/ephemerides.json" with { type: "json" };
import {
  type DayEphemeridesResult,
  type DayMatchItem,
  type DayMatchesBalance,
  type EphemerisMilestone,
  formatDayMonthLabel,
} from "./ephemerides-types.ts";

export { formatDayMonthLabel };

interface RawMatch {
  readonly id: string;
  readonly date: string;
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
  readonly bdfHomeCrest?: string;
  readonly bdfAwayCrest?: string;
  readonly bdfMatchId?: string;
}

const MATCHES_DATA = rawMatches as Readonly<Record<string, readonly RawMatch[]>>;
const EPHEMERIDES_DATA = rawEphemerides as readonly EphemerisMilestone[];

/**
 * Parses four-digit year from date string 'DD/MM/YYYY'.
 */
function parseMatchYear(dateStr: string): number {
  const parts = dateStr.split("/");
  return parts.length === 3 ? parseInt(parts[2]!, 10) : 0;
}

/**
 * Fetches all official matches and milestones that occurred on a specific calendar day (DD/MM)
 * across all historical seasons of Real Sporting de Gijón.
 *
 * @param month Calendar month (1-12).
 * @param day Calendar day (1-31).
 * @returns Complete DayEphemeridesResult with matches, balance, and milestones.
 */
export function getEphemeridesForDay(month: number, day: number): DayEphemeridesResult {
  const safeMonth = Math.min(12, Math.max(1, month));
  const safeDay = Math.min(31, Math.max(1, day));

  const dayPrefix = `${safeDay < 10 ? `0${safeDay}` : safeDay}/${safeMonth < 10 ? `0${safeMonth}` : safeMonth}/`;
  const matchedGames: DayMatchItem[] = [];

  let won = 0;
  let drawn = 0;
  let lost = 0;
  let goalsFor = 0;
  let goalsAgainst = 0;

  for (const seasonId of Object.keys(MATCHES_DATA)) {
    const list = MATCHES_DATA[seasonId] ?? [];
    for (const m of list) {
      if (!m.date || !m.date.startsWith(dayPrefix)) continue;

      const scored = m.isHome ? m.homeScore : m.awayScore;
      const conceded = m.isHome ? m.awayScore : m.homeScore;

      goalsFor += scored;
      goalsAgainst += conceded;

      if (m.outcome === "V") won++;
      else if (m.outcome === "E") drawn++;
      else lost++;

      matchedGames.push({
        id: m.id,
        season: seasonId,
        date: m.date,
        year: parseMatchYear(m.date),
        competition: m.competition,
        round: m.round,
        homeTeam: m.homeTeam,
        awayTeam: m.awayTeam,
        homeScore: m.homeScore,
        awayScore: m.awayScore,
        isHome: m.isHome,
        outcome: m.outcome,
        opponent: m.opponent,
        venue: m.venue,
        homeCrestUrl: m.bdfHomeCrest ?? null,
        awayCrestUrl: m.bdfAwayCrest ?? null,
        bdfMatchId: m.bdfMatchId,
      });
    }
  }

  // Sort matches from newest to oldest
  matchedGames.sort((a, b) => b.year - a.year);

  const milestones = EPHEMERIDES_DATA.filter((e) => e.month === safeMonth && e.day === safeDay);

  const balance: DayMatchesBalance = {
    played: matchedGames.length,
    won,
    drawn,
    lost,
    goalsFor,
    goalsAgainst,
  };

  return {
    month: safeMonth,
    day: safeDay,
    dateLabel: formatDayMonthLabel(safeMonth, safeDay),
    matches: matchedGames,
    milestones,
    balance,
  };
}
