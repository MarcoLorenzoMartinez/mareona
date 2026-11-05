import { z } from "zod";

/**
 * Team statistics that can be quoted from Temporada > Estadísticas.
 * Keep in sync with `STAT_DEFINITIONS` (the compiler enforces completeness there).
 */
export const STAT_KEYS = [
  "goalsPerMatch",
  "expectedGoals",
  "shotsOnTargetPerMatch",
  "bigChances",
  "setPieceGoals",
  "cornersTaken",
  "averagePossession",
  "accuratePassesPerMatch",
  "accurateLongBallsPerMatch",
  "accurateCrossesPerMatch",
  "touchesInOppBox",
  "goalsConcededPerMatch",
  "expectedGoalsConceded",
  "interceptionsPerMatch",
  "tacklesPerMatch",
  "clearancesPerMatch",
  "setPieceGoalsConceded",
  "foulsPerMatch",
  "yellowCards",
  "redCards",
  "penaltiesConceded",
  "savesPerMatch",
] as const;

export type StatKey = (typeof STAT_KEYS)[number];

/**
 * Reference to a piece of Mareona data attached to a post. Only the reference is stored;
 * display data is always resolved from the live caches so it can never go stale or be forged.
 */
export const attachmentRefSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("stat"), key: z.enum(STAT_KEYS) }),
  z.object({ type: z.literal("player"), playerId: z.string().min(1).max(40) }),
  z.object({ type: z.literal("match"), matchId: z.string().min(1).max(40) }),
  z.object({
    type: z.literal("historical_match"),
    seasonId: z.string().regex(/^\d{4}-\d{2}$/),
    matchId: z.string().min(1).max(60),
  }),
]);

export type AttachmentRef = z.infer<typeof attachmentRefSchema>;
