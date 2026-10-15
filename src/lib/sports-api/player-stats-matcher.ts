import type { DomainPlayerMatchStats } from "./types.ts";

/**
 * Normalizes a string by stripping diacritics/accents, lowercasing, and trimming.
 * e.g. "Àlex Corredera" -> "alex corredera"
 */
export function normalizePlayerSearchKey(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Robust, resilient lookup for player match statistics across FotMob/ESPN naming differences.
 * Matches by exact FotMob ID, diacritic-stripped name, jersey number, and fuzzy substring.
 *
 * @param player Target player info from domain model.
 * @param playerStats Map of stats indexed by various FotMob keys.
 * @param starterId Optional FotMob starter ID (100% exact match).
 * @returns Matched DomainPlayerMatchStats or null if unavailable.
 */
export function lookupPlayerStats(
  player: { readonly name: string; readonly id?: string | number; readonly jersey?: number | string | null },
  playerStats?: Readonly<Record<string, DomainPlayerMatchStats>> | null,
  starterId?: number | string
): DomainPlayerMatchStats | null {
  if (!playerStats) return null;

  // 1. Exact FotMob starter / player ID
  if (starterId && playerStats[String(starterId)]) {
    return playerStats[String(starterId)] ?? null;
  }
  if (player.id && playerStats[String(player.id)]) {
    return playerStats[String(player.id)] ?? null;
  }

  // 2. Direct name match
  const rawLower = player.name.toLowerCase().trim();
  if (playerStats[rawLower]) {
    return playerStats[rawLower] ?? null;
  }

  // 3. Diacritics stripped match (e.g. "Àlex Corredera" -> "alex corredera")
  const asciiKey = normalizePlayerSearchKey(player.name);
  if (playerStats[asciiKey]) {
    return playerStats[asciiKey] ?? null;
  }

  // 4. Jersey match (e.g. "jersey_14")
  const shirt = player.jersey;
  if (shirt && playerStats[`jersey_${shirt}`]) {
    return playerStats[`jersey_${shirt}`] ?? null;
  }

  // 5. Scan values by normalized name or jersey
  for (const item of Object.values(playerStats)) {
    if (!item) continue;
    const itemAscii = normalizePlayerSearchKey(item.name);
    if (itemAscii === asciiKey || itemAscii.includes(asciiKey) || asciiKey.includes(itemAscii)) {
      return item;
    }
    if (shirt && String(item.shirtNumber) === String(shirt)) {
      return item;
    }
  }

  return null;
}
