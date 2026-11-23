import type { WhoAreYaPlayer } from './types';

export const WHO_ARE_YA_INAUGURAL_PLAYER_ID = 3268; // Quini (2026-11-13 launch)

/**
 * Curated BDFutbol IDs eligible as daily mystery targets in Who Are Ya (172 players).
 * Search/autocomplete keeps the full 323-player catalog so users can still guess any player as a clue.
 */
export const WHO_ARE_YA_TARGET_IDS: ReadonlySet<number> = new Set([
  // Modern & recent era (2006-2027, 100 players)
  4601, 6172, 354, 6222, 1140, 27072, 14000, 22496, 5643, 1942,
  1582, 22624, 4695, 22661, 4138, 101315, 12496, 100261, 571, 400206,
  20443, 2148, 4902, 8741, 8510, 21156, 1193, 5623, 200433, 100148,
  201014, 101843, 25942, 4122, 5618, 1687, 6287, 43015, 43018, 43013,
  6170, 22414, 4884, 101311, 398, 12494, 22623, 72, 12658, 2487,
  6848, 5626, 23584, 101314, 4996, 2493, 5627, 4597, 21167, 5034,
  201298, 23124, 43126, 25059, 8624, 2121, 20047, 101119, 4533, 200503,
  300028, 329, 201102, 101313, 102277, 889, 1585, 12495, 569, 2152,
  2150, 9416, 28644, 2498, 97538, 300472, 4030, 21483, 102278, 8678,
  24313, 1744, 8621, 40509, 301767, 102276, 43155, 82086, 8622, 9436,

  // Late 1990s & early 2000s (1995-2005, 34 players)
  1612, 658, 2179, 1083, 1691, 552, 2553, 605, 1910, 4260,
  1662, 1262, 2301, 1124, 4377, 300, 348, 2287, 1123, 1484,
  4378, 2322, 73, 2149, 554, 1869, 2654, 1655, 4187, 1145,
  2660, 1711, 2249, 4372,

  // Club legends (< 1995, 20 players)
  1284, 1860, 3268, 3665, 3266, 2973, 3746, 3577, 3572, 3849,
  3136, 3457, 3749, 3747, 5, 1456, 1207, 1581, 2974, 1799,

  // Balanced historical challenges (18 players)
  701, 2740, 615, 1483, 1283, 2124, 392, 1681, 3578, 3374,
  998, 2032, 1019, 3666, 5229, 9590, 9591, 14260,
]);

/**
 * Filters a player catalog down to the curated daily target pool.
 * Falls back to the full catalog if none of the provided entries match the curated IDs
 * (for example in isolated unit tests with synthetic fixtures).
 *
 * @param catalog Full catalog of Who Are Ya players
 * @returns Non-empty list of eligible daily target players
 */
export function getWhoAreYaTargetPool(catalog: WhoAreYaPlayer[]): WhoAreYaPlayer[] {
  const curated = catalog.filter((player) => WHO_ARE_YA_TARGET_IDS.has(player.bdfId));
  return curated.length > 0 ? curated : catalog;
}
