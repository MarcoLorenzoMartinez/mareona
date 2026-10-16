import type { HistoricalStandingRow, HistoricalZone } from "./types.ts";
import { getHistoricalCrestUrl } from "./crests.ts";
import rawStandings from "../../data/historical/standings.json" with { type: "json" };

interface RawStandingItem {
  readonly position: number;
  readonly teamSlug: string;
  readonly teamName: string;
  readonly points: number;
  readonly played: number;
  readonly won: number;
  readonly drawn: number;
  readonly lost: number;
  readonly goalsFor: number;
  readonly goalsAgainst: number;
  readonly isSporting: boolean;
  readonly zone: HistoricalZone;
}

const STANDINGS_DATA = rawStandings as Readonly<Record<string, readonly RawStandingItem[]>>;

/**
 * Returns full official standings table for the requested season,
 * decorating each team row with canonical club crest assets.
 *
 * @param seasonId Identifier string such as '1978-79', '2014-15' or '2023-24'.
 * @returns Array of complete HistoricalStandingRow items.
 */
export function getStandingsForSeason(seasonId: string): readonly HistoricalStandingRow[] {
  const rows = STANDINGS_DATA[seasonId];
  if (!rows || rows.length === 0) {
    return [];
  }

  return rows.map((r) => ({
    ...r,
    crestUrl: getHistoricalCrestUrl(r.teamSlug),
  }));
}
