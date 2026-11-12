/**
 * Canonical mapping between current 2026-27 Real Sporting squad players
 * (from sports API matchday lineups) and their respective active collection Card slugs.
 */

interface PlayerMatchIdentity {
  readonly name: string;
  readonly shortName?: string | null;
  readonly jersey?: number | null;
}

/**
 * Normalizes text removing accents, punctuation and excess whitespace.
 */
function normalizeKey(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

interface ActiveSquadMapping {
  readonly slug: string;
  readonly primaryJersey: number;
  readonly aliases: readonly string[];
}

/**
 * Registered active 2026-27 Real Sporting players who hold a card in the collection.
 * Former players (e.g. Dani Queipo, Christian Joel, Cote, Nacho Méndez) are excluded
 * so their old squad numbers never collide with current 2026-27 signings.
 */
const ACTIVE_SQUAD_MAPPINGS: readonly ActiveSquadMapping[] = [
  { slug: "ruben-yanez-2023", primaryJersey: 1, aliases: ["ruben yanez", "yanez", "orlando ruben yanez"] },
  { slug: "guille-rosas-2019", primaryJersey: 2, aliases: ["guille rosas", "guillermo rosas", "rosas"] },
  { slug: "pablo-garcia-2020", primaryJersey: 3, aliases: ["pablo garcia", "pablo garcia carrasco"] },
  { slug: "diego-sanchez-2021", primaryJersey: 5, aliases: ["diego sanchez", "diego sanchez perez"] },
  { slug: "nacho-martin-2021", primaryJersey: 6, aliases: ["nacho martin", "ignacio martin gomez"] },
  { slug: "gaspar-campos-2019", primaryJersey: 7, aliases: ["gaspar campos", "gaspar"] },
  { slug: "manu-rodriguez-2025", primaryJersey: 8, aliases: ["manu rodriguez", "manuel rodriguez"] },
  { slug: "cesar-gelabert-2024", primaryJersey: 10, aliases: ["gelabert", "cesar gelabert", "cesar gelabert pina"] },
  { slug: "corredera-2025", primaryJersey: 14, aliases: ["alex corredera", "alexandre corredera", "corredera"] },
  { slug: "pablo-vazquez-2025", primaryJersey: 15, aliases: ["pablo vazquez", "pablo vazquez perez"] },
  { slug: "juan-otero-2022", primaryJersey: 19, aliases: ["juan otero", "otero", "juan ferney otero"] },
];

/**
 * Resolves an official lineup player to their active Card slug.
 *
 * @param player - Player identity data from sports API lineup.
 * @returns Card slug if identified as an active squad card, null otherwise.
 */
export function resolveCardSlugForPlayer(player: PlayerMatchIdentity): string | null {
  const normName = normalizeKey(player.name);
  const normShort = player.shortName ? normalizeKey(player.shortName) : "";

  for (const mapping of ACTIVE_SQUAD_MAPPINGS) {
    for (const alias of mapping.aliases) {
      if (normName === alias || normName.includes(alias) || normShort === alias) {
        return mapping.slug;
      }
    }
  }

  return null;
}
