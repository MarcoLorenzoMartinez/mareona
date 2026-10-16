import type {
  HistoricalSeason,
  HistoricalStandingRow,
  HistoricalChartPoint,
} from "./types.ts";
import {
  HISTORICAL_SEASONS,
  getAllSeasons,
  getSeasonById,
  getHistoricalDecades,
} from "./seasons-data.ts";
import { getStandingsForSeason } from "./standings-data.ts";
import { getHistoricalCrestUrl } from "./crests.ts";

/**
 * Generates chronological chart data points for the historical evolution graph.
 * Ranks are mapped so that:
 * - 1.ª División: positions 1 to 20
 * - 2.ª División: positions 21 to 42 (20 + position)
 */
export function getHistoricalChartPoints(): readonly HistoricalChartPoint[] {
  // Sort ascending chronologically (1928 to present)
  const sorted = [...HISTORICAL_SEASONS].sort((a, b) => a.startYear - b.startYear);

  return sorted.map((s) => {
    const effectiveRank = s.tier === 1 ? s.position : 20 + s.position;
    const isMilestone = Boolean(s.milestone);

    return {
      year: s.startYear,
      seasonLabel: s.label,
      tier: s.tier,
      position: s.position,
      effectiveRank,
      isMilestone,
      milestone: s.milestone,
    };
  });
}

/**
 * Retrieves the full standings table for a given historical season.
 * If curated rows exist, returns them. Otherwise, constructs a valid
 * contextual table placing Real Sporting accurately at its canonical position.
 */
export function getStandings(season: HistoricalSeason): readonly HistoricalStandingRow[] {
  const curated = getStandingsForSeason(season.id);
  if (curated.length > 0) {
    return curated;
  }

  // Construct canonical single-team row when full multi-club table is in archive
  const sportingRow: HistoricalStandingRow = {
    position: season.position,
    teamSlug: "real-sporting",
    teamName: "Real Sporting",
    crestUrl: getHistoricalCrestUrl("real-sporting"),
    points: season.points,
    played: season.played,
    won: season.won,
    drawn: season.drawn,
    lost: season.lost,
    goalsFor: season.goalsFor,
    goalsAgainst: season.goalsAgainst,
    isSporting: true,
    zone: season.position <= (season.tier === 1 ? 4 : 3) ? "promotion" : "neutral",
  };

  return [sportingRow];
}

export {
  getAllSeasons,
  getSeasonById,
  getHistoricalDecades,
};

export { getSquadForSeason, getAssistsForSeason } from "./squads-data.ts";
export { getMatchesForSeason, getMatchesSummary } from "./matches-data.ts";
