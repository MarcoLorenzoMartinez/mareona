import type { DomainMatchEvent } from "@/lib/sports-api/types";

export interface PositionedMomentumEvent {
  readonly event: DomainMatchEvent;
  readonly minute: number;
  readonly axisX: number;
  readonly markerPct: number;
  readonly tier: number;
}

/**
 * Parses match event minute string (e.g. "45'", "90+2'") to an integer minute.
 */
export function parseEventMinute(minStr: string): number {
  const parts = minStr.replace(/'/g, "").split("+");
  return (parseInt(parts[0] || "0", 10) || 0) + (parts[1] ? parseInt(parts[1], 10) || 0 : 0);
}

/**
 * Resolves collisions between event markers by stacking them vertically in tiers (Tier 0, 1, 2...).
 * Keeps the horizontal position strictly at the exact minute on the X axis so the guide line
 * remains 100% straight and vertical, accommodating any number of simultaneous or rapid events.
 *
 * @param events Key match events for one team (home or away).
 * @param totalWidth Total width units of the SVG coordinate space.
 * @param getMarkerX Function mapping minute to SVG X coordinate.
 * @param minGapPct Minimum percentage separation before stacking vertically.
 * @returns Array of positioned events with exact axisX, markerPct, and vertical tier.
 */
export function layoutMomentumEvents(
  events: readonly DomainMatchEvent[],
  totalWidth: number,
  getMarkerX: (minute: number) => number,
  minGapPct: number = 7.5
): readonly PositionedMomentumEvent[] {
  if (events.length === 0) return [];

  const parsed = events
    .map((event) => ({
      event,
      minute: parseEventMinute(event.minute),
    }))
    .sort((a, b) => a.minute - b.minute);

  const positioned: PositionedMomentumEvent[] = [];

  for (let i = 0; i < parsed.length; i++) {
    const { event, minute } = parsed[i];
    const axisX = getMarkerX(minute);
    const markerPct = Math.max(3, Math.min(97, (axisX / totalWidth) * 100));

    // Collect all tiers currently occupied by horizontally overlapping previous events
    const usedTiers = new Set<number>();
    for (let j = 0; j < positioned.length; j++) {
      if (Math.abs(markerPct - positioned[j].markerPct) < minGapPct) {
        usedTiers.add(positioned[j].tier);
      }
    }

    // Assign lowest available non-negative integer tier (0, 1, 2, ...)
    let tier = 0;
    while (usedTiers.has(tier)) {
      tier++;
    }

    positioned.push({
      event,
      minute,
      axisX,
      markerPct,
      tier,
    });
  }

  return positioned;
}
