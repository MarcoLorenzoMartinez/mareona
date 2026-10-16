import type { HistoricalSeasonSquad } from "./types.ts";
import rawSquads from "../../data/historical/squads.json" with { type: "json" };

const SQUADS_DATA = rawSquads as Readonly<Record<string, HistoricalSeasonSquad>>;

/**
 * Modern assist records verified for recent Sporting campaigns (LaLiga/FotMob).
 * For historical campaigns where assists were not tracked by the RFEF, this is empty.
 */
const MODERN_ASSISTS: Readonly<Record<string, readonly { readonly name: string; readonly assists: number; readonly played: number }[]>> = {
  "2024-25": [
    { name: "Cote", assists: 5, played: 26 },
    { name: "Dubasin", assists: 5, played: 24 },
    { name: "Gelabert", assists: 4, played: 24 },
    { name: "Queipo", assists: 4, played: 25 },
    { name: "Otero", assists: 3, played: 29 },
  ],
  "2023-24": [
    { name: "Cote", assists: 8, played: 39 },
    { name: "Hassan", assists: 5, played: 38 },
    { name: "Gaspar", assists: 2, played: 40 },
    { name: "Insua", assists: 2, played: 30 },
    { name: "Otero", assists: 2, played: 38 },
  ],
  "2022-23": [
    { name: "Cote", assists: 5, played: 30 },
    { name: "Pedro Díaz", assists: 4, played: 34 },
    { name: "Otero", assists: 3, played: 41 },
    { name: "Guille Rosas", assists: 2, played: 32 },
  ],
  "2021-22": [
    { name: "Fran Villalba", assists: 5, played: 38 },
    { name: "Kravets", assists: 3, played: 36 },
    { name: "Aitor García", assists: 3, played: 37 },
    { name: "Djuka", assists: 3, played: 31 },
  ],
  "2020-21": [
    { name: "Manu García", assists: 8, played: 35 },
    { name: "Aitor García", assists: 4, played: 39 },
    { name: "Guille Rosas", assists: 3, played: 26 },
    { name: "Saúl García", assists: 3, played: 34 },
  ],
};

/**
 * Returns the official historical squad, coaches and top scorers for a chosen season.
 *
 * @param seasonId Identifier string such as '1978-79', '2014-15' or '2023-24'.
 * @returns HistoricalSeasonSquad or null if unavailable.
 */
export function getSquadForSeason(seasonId: string): HistoricalSeasonSquad | null {
  return SQUADS_DATA[seasonId] ?? null;
}

/**
 * Returns verified official assists for modern seasons, or empty array if not tracked.
 */
export function getAssistsForSeason(seasonId: string): readonly { readonly name: string; readonly assists: number; readonly played: number }[] {
  return MODERN_ASSISTS[seasonId] ?? [];
}
