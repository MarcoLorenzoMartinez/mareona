import type { HistoricalMatch } from "./types.ts";
import { getHistoricalCrestUrl } from "./crests.ts";
import rawMatches from "../../data/historical/matches.json" with { type: "json" };

const MATCHES_DATA = rawMatches as Readonly<Record<string, readonly HistoricalMatch[]>>;

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Returns all official matches played by Real Sporting in a given season,
 * ordered chronologically and decorated with club crests.
 *
 * @param seasonId Identifier string such as '1978-79' or '2023-24'.
 * @returns Array of official matches, or empty array if not found.
 */
export function getMatchesForSeason(seasonId: string): readonly HistoricalMatch[] {
  const matches = MATCHES_DATA[seasonId];
  if (!matches || matches.length === 0) return [];
  return matches.map((m) => {
    const homeCrest = getHistoricalCrestUrl(toSlug(m.homeTeam)) ?? m.bdfHomeCrest ?? null;
    const awayCrest = getHistoricalCrestUrl(toSlug(m.awayTeam)) ?? m.bdfAwayCrest ?? null;

    return {
      ...m,
      homeCrestUrl: homeCrest,
      awayCrestUrl: awayCrest,
    };
  });
}

/**
 * Computes performance summary for a specific list of historical matches.
 */
export function getMatchesSummary(matches: readonly HistoricalMatch[]) {
  let wins = 0;
  let draws = 0;
  let losses = 0;
  let goalsFor = 0;
  let goalsAgainst = 0;

  for (const m of matches) {
    if (m.outcome === "V") wins++;
    else if (m.outcome === "E") draws++;
    else losses++;

    if (m.isHome) {
      goalsFor += m.homeScore;
      goalsAgainst += m.awayScore;
    } else {
      goalsFor += m.awayScore;
      goalsAgainst += m.homeScore;
    }
  }

  return {
    total: matches.length,
    wins,
    draws,
    losses,
    goalsFor,
    goalsAgainst,
    goalDiff: goalsFor - goalsAgainst,
  };
}
