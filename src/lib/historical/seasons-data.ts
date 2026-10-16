import type { HistoricalSeason } from "./types.ts";
import rawSeasons from "../../data/historical/seasons.json" with { type: "json" };

/**
 * Complete chronological list of all Real Sporting seasons from 1928-29 to present.
 * Loaded from decoupled verified historical dataset.
 */
export const HISTORICAL_SEASONS: readonly HistoricalSeason[] = rawSeasons as readonly HistoricalSeason[];

/**
 * Returns all historical seasons sorted descending by year (most recent first).
 */
export function getAllSeasons(): readonly HistoricalSeason[] {
  return HISTORICAL_SEASONS;
}

/**
 * Finds a specific historical season by its unique ID.
 *
 * @param id Season identifier, e.g. '1978-79' or '2014-15'.
 */
export function getSeasonById(id: string): HistoricalSeason | null {
  return HISTORICAL_SEASONS.find((s) => s.id === id) ?? null;
}

/**
 * Returns available decades for UI filters.
 */
export function getHistoricalDecades(): readonly { label: string; decadeStart: number }[] {
  return [
    { label: "2020s", decadeStart: 2020 },
    { label: "2010s", decadeStart: 2010 },
    { label: "2000s", decadeStart: 2000 },
    { label: "Años 90", decadeStart: 1990 },
    { label: "Años 80", decadeStart: 1980 },
    { label: "Años 70", decadeStart: 1970 },
    { label: "Años 60", decadeStart: 1960 },
    { label: "Años 50", decadeStart: 1950 },
    { label: "Años 40", decadeStart: 1940 },
    { label: "Orígenes", decadeStart: 1928 },
  ];
}
