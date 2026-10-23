/**
 * Canonical mapping between current Sporting squad players (from sports API matchday lineups)
 * and their respective active collection Card slugs.
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
 * Registered active Sporting players who hold a card in the historical collection.
 */
const ACTIVE_SQUAD_MAPPINGS: readonly ActiveSquadMapping[] = [
  { slug: "ruben-yanez-2023", primaryJersey: 1, aliases: ["ruben yanez", "yanez", "orlando ruben yanez"] },
  { slug: "guille-rosas-2019", primaryJersey: 2, aliases: ["guille rosas", "guillermo rosas", "rosas"] },
  { slug: "cote-2008", primaryJersey: 3, aliases: ["cote", "jose angel", "jose angel valdes"] },
  { slug: "rober-pier-2023", primaryJersey: 4, aliases: ["rober pier", "roberto suarez pier", "pier"] },
  { slug: "pablo-garcia-2020", primaryJersey: 5, aliases: ["pablo garcia", "pablo garcia carrasco"] },
  { slug: "nacho-martin-2021", primaryJersey: 6, aliases: ["nacho martin", "ignacio martin gomez"] },
  { slug: "gaspar-campos-2019", primaryJersey: 7, aliases: ["gaspar campos", "gaspar"] },
  { slug: "bernal-2024", primaryJersey: 8, aliases: ["jesus bernal", "bernal", "jesus jose bernal"] },
  { slug: "dani-queipo-2021", primaryJersey: 9, aliases: ["dani queipo", "daniel queipo", "queipo"] },
  { slug: "nacho-mendez-2017", primaryJersey: 10, aliases: ["nacho mendez", "ignacio mendez"] },
  { slug: "campuzano-2020", primaryJersey: 11, aliases: ["campuzano", "victor campuzano"] },
  { slug: "christian-joel-2018", primaryJersey: 13, aliases: ["christian joel", "christian joel sanchez"] },
  { slug: "olaetxea-2024", primaryJersey: 14, aliases: ["olaetxea", "lander olaetxea"] },
  { slug: "kevin-vazquez-2024", primaryJersey: 15, aliases: ["kevin vazquez", "kevin vazquez comesana"] },
  { slug: "caicedo-2024", primaryJersey: 17, aliases: ["caicedo", "jordy caicedo", "jordy josue caicedo"] },
  { slug: "juan-otero-2022", primaryJersey: 19, aliases: ["juan otero", "otero", "juan ferney otero"] },
  { slug: "dubasin-2024", primaryJersey: 21, aliases: ["dubasin", "jonathan dubasin"] },
  { slug: "cesar-gelabert-2024", primaryJersey: 22, aliases: ["gelabert", "cesar gelabert", "cesar gelabert pina"] },
  { slug: "curbelo-2024", primaryJersey: 23, aliases: ["curbelo", "eric curbelo"] },
  { slug: "diego-sanchez-2021", primaryJersey: 24, aliases: ["diego sanchez", "diego sanchez perez"] },
  { slug: "alex-oyon-2021", primaryJersey: 27, aliases: ["alex oyon", "oyon", "alejandro oyon"] },
  { slug: "alex-lozano-2022", primaryJersey: 28, aliases: ["alex lozano", "lozano", "alejandro lozano"] },
  { slug: "kembo-2023", primaryJersey: 29, aliases: ["kembo", "yann kembo", "yann mael kembo"] },
  { slug: "mbemba-2023", primaryJersey: 32, aliases: ["mbemba", "pierre mbemba", "pierre noble mbemba"] },
  { slug: "marcos-2022", primaryJersey: 34, aliases: ["marcos", "marcos fernandez"] },
  { slug: "amadou-2024", primaryJersey: 35, aliases: ["amadou", "amadou coundoul"] },
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

  // 1. Direct match by name or shortName alias
  for (const mapping of ACTIVE_SQUAD_MAPPINGS) {
    for (const alias of mapping.aliases) {
      if (normName === alias || normName.includes(alias) || normShort === alias) {
        return mapping.slug;
      }
    }
  }

  // 2. Fallback by official squad jersey number if recognized in Sporting
  if (player.jersey !== null && player.jersey !== undefined) {
    const byJersey = ACTIVE_SQUAD_MAPPINGS.find((m) => m.primaryJersey === player.jersey);
    if (byJersey) {
      return byJersey.slug;
    }
  }

  return null;
}
