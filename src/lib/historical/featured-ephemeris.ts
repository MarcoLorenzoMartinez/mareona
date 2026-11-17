import fs from "node:fs";
import path from "node:path";
import type { DayEphemeridesResult, DayMatchItem, EphemerisCategory } from "./ephemerides-types.ts";
import type { HistoricalMatchDetail } from "./types.ts";

export interface FeaturedEphemeris {
  readonly year: number | null;
  readonly title: string;
  readonly detail: string;
  readonly photoUrl?: string | null;
  readonly figure?: string;
  readonly categoryLabel?: string;
  readonly isMatch?: boolean;
  readonly venue?: string;
  readonly sportingScorers?: readonly string[];
  readonly opponentScorers?: readonly string[];
}

const CATEGORY_PRIORITY: Readonly<Record<EphemerisCategory, number>> = {
  triumph: 0,
  legend: 1,
  milestone: 2,
  signing: 3,
};

/**
 * Resolves the calendar day in the club's timezone, so the daily content flips
 * at Spanish midnight regardless of where the server runs.
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

/**
 * Calculates a balanced merit score for historical matches to pick an exciting,
 * meaningful fixture without drowning out humble opposition or classic eras.
 */
export function calculateMatchScore(match: DayMatchItem): number {
  let score = 0;

  // 1. Base outcome: victories strongly preferred, followed by honorable draws
  if (match.outcome === "V") score += 100;
  else if (match.outcome === "E") score += 35;

  // 2. Goal margin: diminishing return with a cap to prevent blowout bias
  const diff = match.isHome ? match.homeScore - match.awayScore : match.awayScore - match.homeScore;
  if (diff >= 3) score += 20;
  else if (diff === 2) score += 14;
  else if (diff === 1) score += 8;

  // 3. Competition category and round
  const comp = (match.competition || "").toLowerCase();
  const round = (match.round || "").toLowerCase();

  if (comp.includes("uefa") || comp.includes("europa")) {
    score += 40;
  } else if (comp.includes("promoci") || round.includes("promoci") || round.includes("playoff")) {
    score += 30;
  } else if (comp.includes("copa")) {
    if (round.includes("final") || round.includes("semi")) score += 35;
    else if (round.includes("1/4") || round.includes("cuartos") || round.includes("1/8") || round.includes("octavos")) score += 20;
    else score += 5; // Early preliminary rounds
  } else if (comp.includes("1") || comp.includes("primera") || comp === "laliga" || comp === "liga") {
    score += 25;
  } else if (comp.includes("2") || comp.includes("segunda")) {
    score += 15;
  }

  const opp = (match.opponent || "").toLowerCase().trim();
  const isReserve = /atl[eè]tic$|atl[eé]tico$|castilla$|\bb\b/.test(opp);
  const isBigClassic = /^(real madrid|fc barcelona|barcelona|atl[eé]tico de madrid|athletic club|athletic de bilbao)/.test(opp);

  if (opp.includes("oviedo")) score += 35; // Derbi Asturiano
  else if (isBigClassic) score += 30; // Grandes clásicos
  else if (!isReserve && /valencia|sevilla|betis|real sociedad|celta|deportivo|zaragoza|espanyol|racing de santander/.test(opp)) {
    score += 12; // Historic first-tier clubs
  }

  return score + (match.year - 1928) / 16;
}

function loadMatchScorers(match: DayMatchItem): {
  venue?: string;
  sportingScorers: string[];
  opponentScorers: string[];
} {
  if (!match.bdfMatchId || !match.season) {
    return { venue: match.venue, sportingScorers: [], opponentScorers: [] };
  }

  try {
    const detailsPath = path.join(process.cwd(), "src", "data", "historical", "match-details", `${match.season}.json`);
    if (!fs.existsSync(detailsPath)) return { venue: match.venue, sportingScorers: [], opponentScorers: [] };

    const seasonRecord = JSON.parse(fs.readFileSync(detailsPath, "utf8")) as Record<string, HistoricalMatchDetail>;
    const detail = seasonRecord[match.bdfMatchId];
    if (!detail) return { venue: match.venue, sportingScorers: [], opponentScorers: [] };

    const groupScorers = (list: typeof detail.goals) => {
      const byScorer = new Map<string, string[]>();
      for (const g of list) {
        const mins = byScorer.get(g.scorer) ?? [];
        mins.push(`${g.minuteDisplay || g.minute}'`);
        byScorer.set(g.scorer, mins);
      }
      return Array.from(byScorer.entries()).map(([name, mins]) => `${name} (${mins.join(", ")})`);
    };

    return {
      venue: detail.venue || match.venue,
      sportingScorers: groupScorers(detail.goals.filter((g) => (match.isHome ? g.isHome : !g.isHome))),
      opponentScorers: groupScorers(detail.goals.filter((g) => (match.isHome ? !g.isHome : g.isHome))),
    };
  } catch {
    return { venue: match.venue, sportingScorers: [], opponentScorers: [] };
  }
}

function describeMatch(match: DayMatchItem): FeaturedEphemeris {
  const { venue, sportingScorers, opponentScorers } = loadMatchScorers(match);

  return {
    year: match.year,
    title: `${match.homeTeam} ${match.homeScore}–${match.awayScore} ${match.awayTeam}`,
    detail: match.round ? `${match.competition} · ${match.round}` : match.competition,
    photoUrl: match.isHome ? match.awayCrestUrl : match.homeCrestUrl,
    figure: match.opponent,
    categoryLabel: match.competition,
    isMatch: true,
    venue,
    sportingScorers,
    opponentScorers,
  };
}

/**
 * Picks the single most relevant historical fact for a day. Milestones win over
 * plain results so the card tells a story; among results, the balanced scoring formula is applied.
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
      isMatch: false,
    };
  }

  const [match] = [...result.matches].sort(
    (a, b) => calculateMatchScore(b) - calculateMatchScore(a)
  );

  return match ? describeMatch(match) : null;
}
