import type { DomainPlayer } from "./types.ts";

/**
 * Builds the canonical unique profile href for a Real Sporting squad member.
 * Always prefers `externalId` (or `id`) over `shirtNumber` so players sharing a
 * reserve jersey number (e.g. #34) never collide onto the same detail page.
 *
 * @param player - DomainPlayer entity.
 * @returns App route path `/temporada/plantilla/<id>`.
 */
export function buildPlayerProfileHref(
  player: Pick<DomainPlayer, "id" | "externalId" | "shirtNumber">
): string {
  const uniqueSlug = player.externalId || player.id;
  if (uniqueSlug) {
    return `/temporada/plantilla/${encodeURIComponent(uniqueSlug)}`;
  }
  return `/temporada/plantilla/${player.shirtNumber ?? "sin-dorsal"}`;
}

/**
 * Resolves a squad player from the route `[id]` parameter.
 * Prioritizes unique ID matches (`externalId`, `id`, name slug) before falling
 * back to legacy `shirtNumber` links so duplicate jersey numbers stay distinguishable.
 *
 * @param squad - Active Real Sporting squad array.
 * @param paramId - Raw `[id]` route segment.
 * @returns Matching `DomainPlayer` or `undefined`.
 */
export function resolveSquadPlayerByParam(
  squad: readonly DomainPlayer[],
  paramId: string
): DomainPlayer | undefined {
  const decoded = decodeURIComponent(paramId).trim();
  if (!decoded) return undefined;

  const byUniqueId = squad.find(
    (p) => p.externalId === decoded || p.id === decoded
  );
  if (byUniqueId) return byUniqueId;

  const lowerSlug = decoded.toLowerCase();
  const bySlug = squad.find(
    (p) => p.displayName.toLowerCase().replace(/\s+/g, "-") === lowerSlug
  );
  if (bySlug) return bySlug;

  return squad.find((p) => String(p.shirtNumber) === decoded);
}
