/**
 * Cleanly formats the geographic origin of a rival club, prioritizing
 * the concise province name (or country for international rivals),
 * avoiding robotic administrative concatenations.
 *
 * @param rival Object containing province, community, country and isInternational.
 * @returns Human-readable, concise geographic location string.
 */
export function formatRivalLocation(rival: {
  readonly isInternational?: boolean;
  readonly country?: string;
  readonly province?: string;
  readonly community?: string;
}): string {
  if (rival.isInternational) {
    return rival.country?.trim() || "Internacional";
  }

  const prov = rival.province?.trim() ?? "";
  const comm = rival.community?.trim() ?? "";

  if (prov) return prov;
  if (comm) return comm;
  return "España";
}
