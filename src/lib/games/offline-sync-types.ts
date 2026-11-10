import { z } from "zod";

export const gameTypeSchema = z.enum(["wordle", "who_are_ya", "trivia", "higher_lower"]);
export type GameType = z.infer<typeof gameTypeSchema>;

export const queuedGameEventSchema = z.object({
  id: z.string().min(1),
  gameType: gameTypeSchema,
  challengeDate: z.string().min(1),
  won: z.boolean(),
  score: z.number().int().nonnegative().optional(),
  completedAt: z.string().min(1),
  userId: z.string().uuid().optional(),
});

export type QueuedGameEvent = z.infer<typeof queuedGameEventSchema>;

export const syncOfflineGamesInputSchema = z.object({
  events: z.array(queuedGameEventSchema).max(50),
});

export type SyncOfflineGamesInput = z.infer<typeof syncOfflineGamesInputSchema>;

export interface SyncFlushResult {
  readonly success: boolean;
  readonly syncedCount: number;
  readonly failedIds: readonly string[];
}
