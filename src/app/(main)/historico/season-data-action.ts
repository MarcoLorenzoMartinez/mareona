"use server";

import {
  getAllSeasons,
  getStandings,
  getSquadForSeason,
  getAssistsForSeason,
  getMatchesForSeason,
} from "@/lib/historical/service";

export interface HistoricalSeasonBundle {
  readonly standings: ReturnType<typeof getStandings>;
  readonly squad: ReturnType<typeof getSquadForSeason>;
  readonly assists: ReturnType<typeof getAssistsForSeason>;
  readonly matches: ReturnType<typeof getMatchesForSeason>;
}

/**
 * Fetches standings, squad, assists, and matches for a single historical season on demand,
 * keeping the 95-season JSON datasets out of the client JS bundle.
 */
export async function getHistoricalSeasonDataAction(
  seasonId: string
): Promise<HistoricalSeasonBundle | null> {
  if (!/^\d{4}-\d{2}$/.test(seasonId)) return null;
  const season = getAllSeasons().find((s) => s.id === seasonId);
  if (!season) return null;

  return {
    standings: getStandings(season),
    squad: getSquadForSeason(season.id),
    assists: getAssistsForSeason(season.id),
    matches: getMatchesForSeason(season.id),
  };
}
