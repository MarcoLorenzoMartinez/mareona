import { z } from "zod";

export const CARD_POSITIONS = [
  "goalkeeper",
  "defender",
  "midfielder",
  "forward",
] as const;

export const CARD_DECADES = [
  "1920s",
  "1930s",
  "1940s",
  "1950s",
  "1960s",
  "1970s",
  "1980s",
  "1990s",
  "2000s",
  "2010s",
  "2020s",
] as const;

export const CARD_STAT_KEYS = [
  "matches_played",
  "attack_power",
  "defense_power",
  "ovr",
] as const;

export const TACTICAL_FORMATIONS = [
  "4-3-3",
  "4-4-2",
  "3-5-2",
  "4-5-1",
  "3-4-3",
  "5-3-2",
  "5-2-3",
  "4-2-3-1",
] as const;

export const cardSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1).max(100),
  kind: z.enum(["player", "crest", "moment", "coach"]).default("player"),
  fullName: z.string().min(1).max(120),
  knownAs: z.string().min(1).max(60),
  decade: z.enum(CARD_DECADES),
  eraLabel: z.string().min(1).max(60),
  position: z.enum(CARD_POSITIONS).optional(),
  matchesPlayed: z.number().int().nonnegative().optional(),
  attackPower: z.number().int().min(30).max(99).optional(),
  defensePower: z.number().int().min(30).max(99).optional(),
  ovr: z.number().int().min(50).max(99).optional(),
  photoUrl: z.string().min(1),
  historicalCrestUrl: z.string().nullable().optional(),
  historicalCrestEra: z.enum(["1905", "republic", "classic_1950", "golden_1980", "modern"]),
  bioSnippet: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
  year: z.number().int().optional(),
});

export const openPackInputSchema = z.object({
  packId: z.string().uuid(),
});

export const duelChallengeInputSchema = z.object({
  mode: z.enum(["quick_3", "lineup_11"]),
  formation: z.enum(TACTICAL_FORMATIONS).optional(),
  selectedCardIds: z.array(z.string().uuid()).min(3).max(11),
});

export const duelRoundMoveSchema = z.object({
  duelId: z.string().uuid(),
  roundNumber: z.number().int().positive(),
  cardId: z.string().uuid(),
  statKey: z.enum(CARD_STAT_KEYS),
});

export const duelDefenseResponseSchema = z.object({
  duelId: z.string().uuid(),
  roundNumber: z.number().int().positive(),
  cardId: z.string().uuid(),
});
