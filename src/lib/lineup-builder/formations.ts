import type {
  TacticalFormationKey,
  TacticalFormation,
  PitchCoordinate,
  TacticalRole,
} from "./types.ts";

/**
 * Standard pitch coordinate layouts for supported formations.
 * In vertical pitch perspective:
 * - y: 88 is goalkeeper
 * - y: 70 is defensive line
 * - y: 48-56 is midfield
 * - y: 30-36 is attacking midfield / wingers
 * - y: 15-20 is forward line / striker
 */
export const TACTICAL_FORMATIONS: Readonly<Record<TacticalFormationKey, TacticalFormation>> = {
  "4-2-3-1": {
    key: "4-2-3-1",
    label: "4-2-3-1",
    slots: [
      { id: "s-por", defaultRole: "POR", label: "POR", defaultCoord: { x: 50, y: 88 } },
      { id: "s-li", defaultRole: "LI", label: "LI", defaultCoord: { x: 16, y: 69 } },
      { id: "s-dfc1", defaultRole: "DFC", label: "DFC", defaultCoord: { x: 38, y: 71 } },
      { id: "s-dfc2", defaultRole: "DFC", label: "DFC", defaultCoord: { x: 62, y: 71 } },
      { id: "s-ld", defaultRole: "LD", label: "LD", defaultCoord: { x: 84, y: 69 } },
      { id: "s-mcd1", defaultRole: "MCD", label: "MCD", defaultCoord: { x: 36, y: 53 } },
      { id: "s-mcd2", defaultRole: "MCD", label: "MCD", defaultCoord: { x: 64, y: 53 } },
      { id: "s-ei", defaultRole: "EI", label: "EI", defaultCoord: { x: 18, y: 34 } },
      { id: "s-mco", defaultRole: "MCO", label: "MCO", defaultCoord: { x: 50, y: 36 } },
      { id: "s-ed", defaultRole: "ED", label: "ED", defaultCoord: { x: 82, y: 34 } },
      { id: "s-dc", defaultRole: "DC", label: "DC", defaultCoord: { x: 50, y: 16 } },
    ],
  },
  "4-4-2": {
    key: "4-4-2",
    label: "4-4-2",
    slots: [
      { id: "s-por", defaultRole: "POR", label: "POR", defaultCoord: { x: 50, y: 88 } },
      { id: "s-li", defaultRole: "LI", label: "LI", defaultCoord: { x: 16, y: 69 } },
      { id: "s-dfc1", defaultRole: "DFC", label: "DFC", defaultCoord: { x: 38, y: 71 } },
      { id: "s-dfc2", defaultRole: "DFC", label: "DFC", defaultCoord: { x: 62, y: 71 } },
      { id: "s-ld", defaultRole: "LD", label: "LD", defaultCoord: { x: 84, y: 69 } },
      { id: "s-mi", defaultRole: "EI", label: "MI", defaultCoord: { x: 16, y: 46 } },
      { id: "s-mc1", defaultRole: "MC", label: "MC", defaultCoord: { x: 38, y: 48 } },
      { id: "s-mc2", defaultRole: "MC", label: "MC", defaultCoord: { x: 62, y: 48 } },
      { id: "s-md", defaultRole: "ED", label: "MD", defaultCoord: { x: 84, y: 46 } },
      { id: "s-dc1", defaultRole: "DC", label: "DC", defaultCoord: { x: 36, y: 18 } },
      { id: "s-dc2", defaultRole: "DC", label: "DC", defaultCoord: { x: 64, y: 18 } },
    ],
  },
  "4-3-3": {
    key: "4-3-3",
    label: "4-3-3",
    slots: [
      { id: "s-por", defaultRole: "POR", label: "POR", defaultCoord: { x: 50, y: 88 } },
      { id: "s-li", defaultRole: "LI", label: "LI", defaultCoord: { x: 16, y: 69 } },
      { id: "s-dfc1", defaultRole: "DFC", label: "DFC", defaultCoord: { x: 38, y: 71 } },
      { id: "s-dfc2", defaultRole: "DFC", label: "DFC", defaultCoord: { x: 62, y: 71 } },
      { id: "s-ld", defaultRole: "LD", label: "LD", defaultCoord: { x: 84, y: 69 } },
      { id: "s-mcd", defaultRole: "MCD", label: "MCD", defaultCoord: { x: 50, y: 55 } },
      { id: "s-mc1", defaultRole: "MC", label: "MC", defaultCoord: { x: 32, y: 42 } },
      { id: "s-mc2", defaultRole: "MC", label: "MC", defaultCoord: { x: 68, y: 42 } },
      { id: "s-ei", defaultRole: "EI", label: "EI", defaultCoord: { x: 18, y: 22 } },
      { id: "s-dc", defaultRole: "DC", label: "DC", defaultCoord: { x: 50, y: 16 } },
      { id: "s-ed", defaultRole: "ED", label: "ED", defaultCoord: { x: 82, y: 22 } },
    ],
  },
  "5-3-2": {
    key: "5-3-2",
    label: "5-3-2",
    slots: [
      { id: "s-por", defaultRole: "POR", label: "POR", defaultCoord: { x: 50, y: 88 } },
      { id: "s-cai", defaultRole: "CAI", label: "CAI", defaultCoord: { x: 14, y: 64 } },
      { id: "s-dfc1", defaultRole: "DFC", label: "DFC", defaultCoord: { x: 31, y: 72 } },
      { id: "s-dfc2", defaultRole: "DFC", label: "DFC", defaultCoord: { x: 50, y: 73 } },
      { id: "s-dfc3", defaultRole: "DFC", label: "DFC", defaultCoord: { x: 69, y: 72 } },
      { id: "s-cad", defaultRole: "CAD", label: "CAD", defaultCoord: { x: 86, y: 64 } },
      { id: "s-mc1", defaultRole: "MC", label: "MC", defaultCoord: { x: 28, y: 46 } },
      { id: "s-mcd", defaultRole: "MCD", label: "MCD", defaultCoord: { x: 50, y: 51 } },
      { id: "s-mc2", defaultRole: "MC", label: "MC", defaultCoord: { x: 72, y: 46 } },
      { id: "s-dc1", defaultRole: "DC", label: "DC", defaultCoord: { x: 36, y: 18 } },
      { id: "s-dc2", defaultRole: "DC", label: "DC", defaultCoord: { x: 64, y: 18 } },
    ],
  },
  "3-4-3": {
    key: "3-4-3",
    label: "3-4-3",
    slots: [
      { id: "s-por", defaultRole: "POR", label: "POR", defaultCoord: { x: 50, y: 88 } },
      { id: "s-dfc1", defaultRole: "DFC", label: "DFC", defaultCoord: { x: 26, y: 72 } },
      { id: "s-dfc2", defaultRole: "DFC", label: "DFC", defaultCoord: { x: 50, y: 73 } },
      { id: "s-dfc3", defaultRole: "DFC", label: "DFC", defaultCoord: { x: 74, y: 72 } },
      { id: "s-cai", defaultRole: "CAI", label: "MI", defaultCoord: { x: 14, y: 47 } },
      { id: "s-mc1", defaultRole: "MC", label: "MC", defaultCoord: { x: 38, y: 50 } },
      { id: "s-mc2", defaultRole: "MC", label: "MC", defaultCoord: { x: 62, y: 50 } },
      { id: "s-cad", defaultRole: "CAD", label: "MD", defaultCoord: { x: 86, y: 47 } },
      { id: "s-ei", defaultRole: "EI", label: "EI", defaultCoord: { x: 20, y: 22 } },
      { id: "s-dc", defaultRole: "DC", label: "DC", defaultCoord: { x: 50, y: 16 } },
      { id: "s-ed", defaultRole: "ED", label: "ED", defaultCoord: { x: 80, y: 22 } },
    ],
  },
  "3-5-2": {
    key: "3-5-2",
    label: "3-5-2",
    slots: [
      { id: "s-por", defaultRole: "POR", label: "POR", defaultCoord: { x: 50, y: 88 } },
      { id: "s-dfc1", defaultRole: "DFC", label: "DFC", defaultCoord: { x: 26, y: 72 } },
      { id: "s-dfc2", defaultRole: "DFC", label: "DFC", defaultCoord: { x: 50, y: 73 } },
      { id: "s-dfc3", defaultRole: "DFC", label: "DFC", defaultCoord: { x: 74, y: 72 } },
      { id: "s-cai", defaultRole: "CAI", label: "CAI", defaultCoord: { x: 14, y: 48 } },
      { id: "s-mcd1", defaultRole: "MCD", label: "MCD", defaultCoord: { x: 37, y: 54 } },
      { id: "s-mcd2", defaultRole: "MCD", label: "MCD", defaultCoord: { x: 63, y: 54 } },
      { id: "s-mco", defaultRole: "MCO", label: "MCO", defaultCoord: { x: 50, y: 38 } },
      { id: "s-cad", defaultRole: "CAD", label: "CAD", defaultCoord: { x: 86, y: 48 } },
      { id: "s-dc1", defaultRole: "DC", label: "DC", defaultCoord: { x: 36, y: 18 } },
      { id: "s-dc2", defaultRole: "DC", label: "DC", defaultCoord: { x: 64, y: 18 } },
    ],
  },
};

/**
 * Clamps coordinates strictly within the visible boundaries of the grass pitch.
 *
 * @param coord Raw input coordinate
 * @returns Clamped coordinate between margins
 */
export function clampPitchCoordinate(coord: PitchCoordinate): PitchCoordinate {
  const safeX = Math.max(10, Math.min(90, Number.isFinite(coord.x) ? coord.x : 50));
  const safeY = Math.max(10, Math.min(90, Number.isFinite(coord.y) ? coord.y : 50));
  return { x: Math.round(safeX * 10) / 10, y: Math.round(safeY * 10) / 10 };
}

/**
 * Infers tactical role from vertical coordinate (y) when a slot is moved:
 * - y < 38: Attacking line (DC / Delantera)
 * - 38 <= y < 62: Midfield line (MC / Mediocampo)
 * - y >= 62: Defensive line (DFC / Defensa)
 *
 * Preserves specific roles (e.g. LI, LD, MCD, EI, ED) if the token remains inside
 * its natural line; updates to the line's standard role when dragged to a different line.
 * The designated goalkeeper slot (s-por) always remains POR.
 */
export function inferRoleFromHeight(
  coordY: number,
  slotId: string,
  defaultRole: TacticalRole
): TacticalRole {
  if (slotId === "s-por") return "POR";

  let targetZone: "DEL" | "MED" | "DEF";
  if (coordY < 38) {
    targetZone = "DEL";
  } else if (coordY < 62) {
    targetZone = "MED";
  } else {
    targetZone = "DEF";
  }

  const isDel = defaultRole === "DC" || defaultRole === "EI" || defaultRole === "ED";
  const isMed = defaultRole === "MC" || defaultRole === "MCD" || defaultRole === "MCO";
  const isDef =
    defaultRole === "DFC" ||
    defaultRole === "LI" ||
    defaultRole === "LD" ||
    defaultRole === "CAD" ||
    defaultRole === "CAI";

  if (targetZone === "DEL" && isDel) return defaultRole;
  if (targetZone === "MED" && isMed) return defaultRole;
  if (targetZone === "DEF" && isDef) return defaultRole;

  switch (targetZone) {
    case "DEL":
      return "DC";
    case "MED":
      return "MC";
    case "DEF":
      return "DFC";
  }
}
