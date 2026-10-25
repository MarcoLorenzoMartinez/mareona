import type { DomainPlayer } from "../sports-api/types.ts";
import { normalizePlayerSearchKey } from "../sports-api/player-stats-matcher.ts";
import type { LineupPlayer } from "./types.ts";
import { ACADEMY_SPORTING_PLAYERS } from "./academy-players.ts";

/**
 * Maps a canonical DomainPlayer from the first team into a unified LineupPlayer.
 *
 * @param player Domain player from sports API
 * @returns Unified LineupPlayer
 */
export function mapDomainPlayerToLineupPlayer(player: DomainPlayer): LineupPlayer {
  let mappedPosition: "POR" | "DEF" | "MED" | "DEL" = "MED";
  if (player.position === "goalkeeper") mappedPosition = "POR";
  else if (player.position === "defender") mappedPosition = "DEF";
  else if (player.position === "midfielder") mappedPosition = "MED";
  else if (player.position === "forward") mappedPosition = "DEL";

  return {
    id: `first-team-${player.id}`,
    displayName: player.displayName || player.fullName,
    fullName: player.fullName,
    shirtNumber: player.shirtNumber,
    defaultPosition: mappedPosition,
    category: "first_team",
    photoUrl: player.photoUrl,
    isCustom: false,
  };
}

/**
 * Combines first-team players fetched from sports API with filial and youth academy prospects.
 * Automatically deduplicates any player present in the first team (e.g. academy debutants
 * registered dynamically like Enol Prendes, Mata, etc.) to ensure zero duplicated entries.
 *
 * @param firstTeamSquad List of first-team DomainPlayers
 * @returns Complete deduplicated unified roster sorted by category, position and shirt number
 */
export function buildUnifiedRoster(firstTeamSquad: readonly DomainPlayer[]): readonly LineupPlayer[] {
  const firstTeamLineup = firstTeamSquad.map(mapDomainPlayerToLineupPlayer);

  // Set of normalized identities already present in the first team
  const seenFirstTeamNames = new Set<string>();
  const seenFirstTeamDorsals = new Set<number>();

  for (const p of firstTeamLineup) {
    if (p.displayName) seenFirstTeamNames.add(normalizePlayerSearchKey(p.displayName));
    if (p.fullName) seenFirstTeamNames.add(normalizePlayerSearchKey(p.fullName));
    if (p.shirtNumber !== null && p.shirtNumber !== undefined) {
      seenFirstTeamDorsals.add(p.shirtNumber);
    }
  }

  // Filter out any academy prospect that already appears in the first team roster
  const filteredAcademy = ACADEMY_SPORTING_PLAYERS.filter((academyPlayer) => {
    const normDisplay = normalizePlayerSearchKey(academyPlayer.displayName);
    const normFull = normalizePlayerSearchKey(academyPlayer.fullName);

    const matchesName = seenFirstTeamNames.has(normDisplay) || seenFirstTeamNames.has(normFull);
    const matchesDorsalAndName =
      academyPlayer.shirtNumber !== null &&
      seenFirstTeamDorsals.has(academyPlayer.shirtNumber) &&
      matchesName;

    return !matchesName && !matchesDorsalAndName;
  });

  return [...firstTeamLineup, ...filteredAcademy];
}
