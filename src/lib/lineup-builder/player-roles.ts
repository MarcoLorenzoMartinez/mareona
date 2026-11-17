import type { TacticalRole } from "./types.ts";
import { normalizePlayerSearchKey } from "../sports-api/player-stats-matcher.ts";

export interface TacticalPlayerProfile {
  readonly naturalRole: TacticalRole;
  readonly secondaryRoles?: readonly TacticalRole[];
}

/**
 * Curated natural and secondary tactical roles for Sporting Gijón squad and academy players.
 * Keys are normalized search keys (lowercase, unaccented).
 */
const CANONICAL_SPORTING_ROLES: Readonly<Record<string, TacticalPlayerProfile>> = {
  // Goalkeepers
  "ruben yanez": { naturalRole: "POR" },
  "yanez": { naturalRole: "POR" },
  "christian joel": { naturalRole: "POR" },
  "elmo henriksson": { naturalRole: "POR" },

  // Right Backs / Right Wingbacks
  "guille rosas": { naturalRole: "LD", secondaryRoles: ["CAD"] },
  "rosas": { naturalRole: "LD", secondaryRoles: ["CAD"] },
  "kevin vazquez": { naturalRole: "LD", secondaryRoles: ["CAD"] },
  "kevin": { naturalRole: "LD", secondaryRoles: ["CAD"] },
  "iker martinez": { naturalRole: "LD", secondaryRoles: ["CAD"] },

  // Left Backs / Left Wingbacks
  "cote": { naturalRole: "LI", secondaryRoles: ["CAI"] },
  "jose angel": { naturalRole: "LI", secondaryRoles: ["CAI"] },
  "jose angel valdes": { naturalRole: "LI", secondaryRoles: ["CAI"] },
  "pablo garcia": { naturalRole: "LI", secondaryRoles: ["CAI"] },
  "carlos hernandez": { naturalRole: "LI", secondaryRoles: ["CAI"] },

  // Center Backs
  "andres cuenca": { naturalRole: "DFC", secondaryRoles: ["LI"] },
  "cuenca": { naturalRole: "DFC", secondaryRoles: ["LI"] },
  "diego sanchez": { naturalRole: "DFC", secondaryRoles: ["LI"] },
  "eric curbelo": { naturalRole: "DFC" },
  "curbelo": { naturalRole: "DFC" },
  "rober pier": { naturalRole: "DFC", secondaryRoles: ["MCD"] },
  "pier": { naturalRole: "DFC", secondaryRoles: ["MCD"] },
  "pablo vazquez": { naturalRole: "DFC" },
  "vazquez": { naturalRole: "DFC" },
  "p. vazquez": { naturalRole: "DFC" },
  "unai dunabeitia": { naturalRole: "DFC" },
  "dunabeitia": { naturalRole: "DFC" },
  "bruno rubio": { naturalRole: "DFC" },
  "bruno": { naturalRole: "DFC" },
  "nikola maras": { naturalRole: "DFC" },
  "maras": { naturalRole: "DFC" },
  "yann kembo": { naturalRole: "DFC" },
  "kembo": { naturalRole: "DFC" },
  "pierre mbemba": { naturalRole: "DFC", secondaryRoles: ["MCD"] },
  "mbemba": { naturalRole: "DFC", secondaryRoles: ["MCD"] },
  "borja montes": { naturalRole: "DFC" },
  "alex diego": { naturalRole: "DFC", secondaryRoles: ["LI"] },

  // Defensive Midfielders
  "lander olaetxea": { naturalRole: "MCD", secondaryRoles: ["MC", "DFC"] },
  "olaetxea": { naturalRole: "MCD", secondaryRoles: ["MC", "DFC"] },
  "nacho martin": { naturalRole: "MCD", secondaryRoles: ["MC"] },
  "nacho m.": { naturalRole: "MCD", secondaryRoles: ["MC"] },
  "jesus bernal": { naturalRole: "MCD", secondaryRoles: ["MC"] },
  "bernal": { naturalRole: "MCD", secondaryRoles: ["MC"] },

  // Central Midfielders & Playmakers
  "nacho mendez": { naturalRole: "MC", secondaryRoles: ["MCO"] },
  "cesar gelabert": { naturalRole: "MCO", secondaryRoles: ["MC", "EI"] },
  "gelabert": { naturalRole: "MCO", secondaryRoles: ["MC", "EI"] },
  "manu rodriguez": { naturalRole: "MC" },
  "manu r.": { naturalRole: "MC" },
  "aaron quintana": { naturalRole: "MC" },
  "christian ferreres": { naturalRole: "MCO", secondaryRoles: ["MC"] },
  "ferreres": { naturalRole: "MCO", secondaryRoles: ["MC"] },

  // Wingers & Wide Attackers
  "gaspar campos": { naturalRole: "EI", secondaryRoles: ["MCO", "ED"] },
  "gaspar": { naturalRole: "EI", secondaryRoles: ["MCO", "ED"] },
  "dani queipo": { naturalRole: "EI", secondaryRoles: ["ED", "MCO"] },
  "queipo": { naturalRole: "EI", secondaryRoles: ["ED", "MCO"] },
  "jonathan dubasin": { naturalRole: "ED", secondaryRoles: ["DC"] },
  "dubasin": { naturalRole: "ED", secondaryRoles: ["DC"] },
  "nikita iosifov": { naturalRole: "ED", secondaryRoles: ["EI"] },
  "iosifov": { naturalRole: "ED", secondaryRoles: ["EI"] },
  "konrad de la fuente": { naturalRole: "EI", secondaryRoles: ["ED"] },
  "konrad": { naturalRole: "EI", secondaryRoles: ["ED"] },
  "alex oyon": { naturalRole: "MCO", secondaryRoles: ["EI", "DC"] },
  "oyon": { naturalRole: "MCO", secondaryRoles: ["EI", "DC"] },

  // Strikers / Forwards
  "juan otero": { naturalRole: "DC", secondaryRoles: ["ED"] },
  "otero": { naturalRole: "DC", secondaryRoles: ["ED"] },
  "jordy caicedo": { naturalRole: "DC" },
  "caicedo": { naturalRole: "DC" },
  "victor campuzano": { naturalRole: "DC" },
  "campuzano": { naturalRole: "DC" },
  "esteban lozano": { naturalRole: "DC" },
  "enol prendes": { naturalRole: "DC" },
  "enol": { naturalRole: "DC" },
  "franco ferrari": { naturalRole: "DC" },
  "ferrari": { naturalRole: "DC" },
  "diego matabuena": { naturalRole: "DC" },
  "mata": { naturalRole: "DC" },
  "miguel conde": { naturalRole: "DC" },
};

/**
 * Resolves natural tactical roles and secondary capabilities for any squad player.
 *
 * @param player Player identification data
 * @returns Tactical profile with natural role and optional secondary roles
 */
export function resolvePlayerTacticalProfile(player: {
  readonly displayName?: string | null;
  readonly fullName?: string | null;
  readonly defaultPosition: "POR" | "DEF" | "MED" | "DEL";
}): TacticalPlayerProfile {
  if (player.displayName) {
    const key = normalizePlayerSearchKey(player.displayName);
    const profile = CANONICAL_SPORTING_ROLES[key];
    if (profile) return profile;
  }

  if (player.fullName) {
    const key = normalizePlayerSearchKey(player.fullName);
    const profile = CANONICAL_SPORTING_ROLES[key];
    if (profile) return profile;
  }

  // Fallback defaults from generic position category
  switch (player.defaultPosition) {
    case "POR":
      return { naturalRole: "POR" };
    case "DEF":
      return { naturalRole: "DFC", secondaryRoles: ["LI", "LD"] };
    case "MED":
      return { naturalRole: "MC", secondaryRoles: ["MCD", "MCO"] };
    case "DEL":
      return { naturalRole: "DC", secondaryRoles: ["EI", "ED"] };
  }
}
