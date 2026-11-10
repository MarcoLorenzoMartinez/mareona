import type { PitchAssignedPlayer, PitchCoordinate } from "./types.ts";

/**
 * Vertical threshold in percentage to consider two positions as belonging to the same horizontal line.
 */
const TACTICAL_LINE_Y_TOLERANCE = 8;

/**
 * Compares two pitch coordinates to order them:
 * 1. From bottom to top (higher y to lower y).
 * 2. From right to left (higher x to lower x) when on the same tactical line.
 *
 * @param a First slot coordinate
 * @param b Second slot coordinate
 * @returns Negative if a comes before b, positive if b comes before a
 */
export function comparePitchSlotsBottomToTopRightToLeft(
  aCoord: PitchCoordinate,
  bCoord: PitchCoordinate
): number {
  const yDiff = bCoord.y - aCoord.y;
  // If slots belong to clearly distinct vertical lines, the lower one (higher y) comes first
  if (Math.abs(yDiff) > TACTICAL_LINE_Y_TOLERANCE) {
    return yDiff;
  }
  // On the same tactical line, right flank (higher x) comes before left flank (lower x)
  return bCoord.x - aCoord.x;
}

/**
 * Finds the next empty slot following the canonical football progression:
 * bottom to top (goalkeeper -> defense -> midfield -> forwards)
 * and right to left (right flank -> center -> left flank).
 *
 * @param slots List of assigned pitch slots
 * @param currentSlotId Currently active slot being assigned
 * @returns The slotId of the next slot to select, or null if all filled
 */
export function findNextSlotBottomToTop(
  slots: readonly PitchAssignedPlayer[],
  currentSlotId: string | null
): string | null {
  const emptySlots = slots.filter(
    (slot) => slot.slotId !== currentSlotId && !slot.player
  );

  if (emptySlots.length === 0) return null;

  const sorted = [...emptySlots].sort((a, b) =>
    comparePitchSlotsBottomToTopRightToLeft(a.coord, b.coord)
  );

  return sorted[0]?.slotId ?? null;
}
