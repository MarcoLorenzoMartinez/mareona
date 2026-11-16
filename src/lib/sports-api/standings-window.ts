import type { DomainStandingRow } from "./types.ts";

export type StandingZone = "promotion" | "playoff" | "relegation" | "none";

/**
 * Picks a contiguous slice of the table centred on Real Sporting so the club is
 * always visible, with the same number of rivals above and below whenever the
 * table allows it. The slice slides against the edges instead of shrinking.
 *
 * @param rows Standings ordered by position.
 * @param size Number of rows to return (odd values keep Sporting centred).
 * @returns Consecutive rows. Falls back to the leading places when Sporting is absent.
 */
export function selectStandingsWindow(
  rows: readonly DomainStandingRow[],
  size = 7
): readonly DomainStandingRow[] {
  if (rows.length <= size) return rows;

  const sportingIndex = rows.findIndex((row) => row.isSporting);
  if (sportingIndex === -1) return rows.slice(0, size);

  const start = Math.min(
    Math.max(sportingIndex - Math.floor(size / 2), 0),
    rows.length - size
  );
  return rows.slice(start, start + size);
}

/**
 * Classifies a position in the current second-division format
 * (2 direct promotions, playoff up to 6th, bottom 4 relegated).
 */
export function resolveStandingZone(position: number, totalTeams: number): StandingZone {
  if (position <= 2) return "promotion";
  if (position <= 6) return "playoff";
  return totalTeams > 4 && position > totalTeams - 4 ? "relegation" : "none";
}
