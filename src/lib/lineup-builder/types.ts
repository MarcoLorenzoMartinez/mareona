import { z } from "zod";

/**
 * Player squad tier category for filtering in lineup builder.
 */
export type PlayerCategory = "first_team" | "filial" | "juvenil" | "custom";

/**
 * Tactical role positions on the pitch.
 */
export type TacticalRole =
  | "POR"
  | "DFC"
  | "LI"
  | "LD"
  | "CAD"
  | "CAI"
  | "MCD"
  | "MC"
  | "MCO"
  | "EI"
  | "ED"
  | "DC";

/**
 * Supported tactical formations.
 */
export type TacticalFormationKey =
  | "4-2-3-1"
  | "4-4-2"
  | "4-3-3"
  | "5-3-2"
  | "3-4-3"
  | "3-5-2";

/**
 * Relative normalized position on a vertical football pitch.
 * x: 0 to 100 (% horizontal, 50 is center)
 * y: 0 to 100 (% vertical, 10 is striker near opponent goal, 90 is goalkeeper near own goal)
 */
export interface PitchCoordinate {
  readonly x: number;
  readonly y: number;
}

/**
 * Slot definition within a tactical formation.
 */
export interface FormationSlot {
  readonly id: string;
  readonly defaultRole: TacticalRole;
  readonly label: string;
  readonly defaultCoord: PitchCoordinate;
}

/**
 * Formation configuration structure.
 */
export interface TacticalFormation {
  readonly key: TacticalFormationKey;
  readonly label: string;
  readonly slots: readonly FormationSlot[];
}

/**
 * Unified player item selectable for the tactical pitch board.
 */
export interface LineupPlayer {
  readonly id: string;
  readonly displayName: string;
  readonly fullName: string;
  readonly shirtNumber: number | null;
  readonly defaultPosition: "POR" | "DEF" | "MED" | "DEL";
  readonly category: PlayerCategory;
  readonly photoUrl: string | null;
  readonly isCustom?: boolean;
}

/**
 * Assigned player node on the field.
 */
export interface PitchAssignedPlayer {
  readonly slotId: string;
  readonly role: TacticalRole;
  readonly coord: PitchCoordinate;
  readonly player: LineupPlayer | null;
}

/**
 * Complete lineup draft state.
 */
export interface TacticalLineupState {
  readonly formationKey: TacticalFormationKey;
  readonly starters: readonly PitchAssignedPlayer[];
  readonly substitutes: readonly LineupPlayer[];
}

/**
 * Zod schema for validating user-created custom players (e.g. youth academy debutants).
 */
export const customPlayerSchema = z.object({
  displayName: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(25, "El nombre no puede superar 25 caracteres"),
  shirtNumber: z.number().int().min(1).max(99).nullable().optional(),
  defaultPosition: z.enum(["POR", "DEF", "MED", "DEL"]),
  category: z.literal("custom").default("custom"),
});

export type CustomPlayerInput = z.infer<typeof customPlayerSchema>;
