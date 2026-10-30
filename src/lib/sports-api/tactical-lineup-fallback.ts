import type {
  DomainLineupPlayer,
  DomainTacticalLineup,
  DomainTacticalStarter,
} from "./types.ts";

/**
 * Standard relative longitudinal Y positions (0 = bottom goal, 1 = top goal).
 */
const Y_GOALKEEPER = 0.1;
const Y_DEFENDERS = 0.29;
const Y_DEF_MIDFIELDERS = 0.48;
const Y_ATT_MIDFIELDERS = 0.68;
const Y_STRIKERS = 0.88;

/**
 * Generates horizontal X positions (0 = right flank, 1 = left flank) for a row of N players.
 */
function getRowXPositions(count: number): number[] {
  if (count <= 1) return [0.5];
  const step = 0.76 / (count - 1);
  return Array.from({ length: count }, (_, i) => +(0.12 + i * step).toFixed(3));
}

/**
 * Parses a formation string like "4-2-3-1" or "4-4-2" into row counts [4, 2, 3, 1].
 */
function parseFormationRows(formation: string): number[] {
  const parts = formation
    .split("-")
    .map((p) => parseInt(p.trim(), 10))
    .filter((n) => !Number.isNaN(n) && n > 0);

  if (parts.length > 0 && parts.reduce((a, b) => a + b, 0) === 10) {
    return parts;
  }
  return [4, 2, 3, 1]; // Default fallback
}

/**
 * Generates a DomainTacticalLineup with spatial (x, y) coordinates for any team
 * that has official starters, even when advanced provider coordinates are absent.
 *
 * @param starters Official domain lineup players
 * @param formation Formation string (e.g. "4-2-3-1")
 * @param isSporting Whether the team is Real Sporting
 * @returns DomainTacticalLineup or null if starters is insufficient (< 7)
 */
export function generateFallbackTacticalLineup(
  starters: readonly DomainLineupPlayer[],
  formation: string = "4-2-3-1",
  isSporting: boolean = false
): DomainTacticalLineup | null {
  if (!starters || starters.length < 7) return null;

  const rows = parseFormationRows(formation);
  const rowYCoordinates: number[] = [];

  if (rows.length === 3) {
    rowYCoordinates.push(Y_DEFENDERS, (Y_DEF_MIDFIELDERS + Y_ATT_MIDFIELDERS) / 2, Y_STRIKERS);
  } else if (rows.length === 4) {
    rowYCoordinates.push(Y_DEFENDERS, Y_DEF_MIDFIELDERS, Y_ATT_MIDFIELDERS, Y_STRIKERS);
  } else {
    const minY = Y_DEFENDERS;
    const maxY = Y_STRIKERS;
    const step = (maxY - minY) / (rows.length - 1);
    rows.forEach((_, idx) => rowYCoordinates.push(+(minY + idx * step).toFixed(3)));
  }

  // Separate GK and field players
  const gk = starters.find((p) => p.position === "goalkeeper") ?? starters[0];
  const fieldPlayers = starters.filter((p) => p.id !== gk.id);

  const tacticalStarters: DomainTacticalStarter[] = [
    {
      id: parseInt(gk.id, 10) || 1,
      name: gk.name,
      shirtNumber: String(gk.jersey ?? ""),
      x: 0.5,
      y: Y_GOALKEEPER,
      photoUrl:
        isSporting && gk.jersey
          ? `/images/players/${gk.jersey}.png`
          : gk.photoUrl ?? "",
    },
  ];

  let playerIndex = 0;
  rows.forEach((rowCount, rowIndex) => {
    const y = rowYCoordinates[rowIndex] ?? Y_DEF_MIDFIELDERS;
    const xPositions = getRowXPositions(rowCount);

    xPositions.forEach((x) => {
      const p = fieldPlayers[playerIndex];
      if (p) {
        tacticalStarters.push({
          id: parseInt(p.id, 10) || playerIndex + 2,
          name: p.name,
          shirtNumber: String(p.jersey ?? ""),
          x,
          y,
          photoUrl:
            isSporting && p.jersey
              ? `/images/players/${p.jersey}.png`
              : p.photoUrl ?? "",
        });
        playerIndex++;
      }
    });
  });

  // If any remaining players weren't mapped into the formation, append them
  while (playerIndex < fieldPlayers.length) {
    const p = fieldPlayers[playerIndex];
    tacticalStarters.push({
      id: parseInt(p.id, 10) || playerIndex + 2,
      name: p.name,
      shirtNumber: String(p.jersey ?? ""),
      x: 0.5,
      y: Y_DEF_MIDFIELDERS,
      photoUrl:
        isSporting && p.jersey
          ? `/images/players/${p.jersey}.png`
          : p.photoUrl ?? "",
    });
    playerIndex++;
  }

  return {
    formation,
    starters: tacticalStarters,
  };
}
