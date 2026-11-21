import { z } from "zod";

const WORDLE_PREFIX = "mareona_wordle_v2_state_";
const TRIVIA_PREFIX = "mareona_trivia_";
const WHO_ARE_YA_PREFIX = "mareona_who_are_ya_";
const HIGHER_LOWER_KEY = "mareona_higher_lower_stats_v1";
const LINEUP_KEY = "mareona_lineup_state_v1";
const PORRA_CLAIMED_KEY = "mareona_porra_claimed_rewards_v1";

const DATE_SUFFIX_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Checks whether a canonical storage key belongs to the cross-device synced game state set.
 */
export function isSyncedGameStorageKey(key: string): boolean {
  if (key === HIGHER_LOWER_KEY || key === LINEUP_KEY || key === PORRA_CLAIMED_KEY) {
    return true;
  }
  if (key.startsWith(WORDLE_PREFIX)) {
    return DATE_SUFFIX_REGEX.test(key.slice(WORDLE_PREFIX.length));
  }
  if (key.startsWith(TRIVIA_PREFIX)) {
    return DATE_SUFFIX_REGEX.test(key.slice(TRIVIA_PREFIX.length));
  }
  if (key.startsWith(WHO_ARE_YA_PREFIX)) {
    return DATE_SUFFIX_REGEX.test(key.slice(WHO_ARE_YA_PREFIX.length));
  }
  return false;
}

export const syncedGameStorageMapSchema = z
  .record(z.string().max(120), z.string().max(30000))
  .optional();

export const syncedPorraPredictionSchema = z.object({
  matchId: z.string().min(1).max(80),
  homeScore: z.number().int().min(0).max(99),
  awayScore: z.number().int().min(0).max(99),
  sportingScorers: z.array(z.string().max(120)).max(30),
  submittedAt: z.string(),
});

export const syncedPorraPredictionsMapSchema = z
  .record(z.string().max(80), syncedPorraPredictionSchema)
  .optional();

export type SyncedPorraPrediction = z.infer<typeof syncedPorraPredictionSchema>;

/**
 * Merges a single storage entry value between server and client deterministically.
 */
function mergeSingleStorageValue(
  key: string,
  serverRaw: string | undefined,
  clientRaw: string | undefined,
  mode: "reconcile" | "push"
): string | undefined {
  if (!serverRaw) return clientRaw;
  if (!clientRaw) return serverRaw;
  if (serverRaw === clientRaw) return serverRaw;

  try {
    if (key.startsWith(WORDLE_PREFIX)) {
      const s = JSON.parse(serverRaw) as { guesses?: unknown[]; status?: string };
      const c = JSON.parse(clientRaw) as { guesses?: unknown[]; status?: string };
      const sDone = s.status === "WON" || s.status === "LOST";
      const cDone = c.status === "WON" || c.status === "LOST";
      if (cDone && !sDone) return clientRaw;
      if (sDone && !cDone) return serverRaw;
      const sLen = Array.isArray(s.guesses) ? s.guesses.length : 0;
      const cLen = Array.isArray(c.guesses) ? c.guesses.length : 0;
      if (cLen !== sLen) return cLen > sLen ? clientRaw : serverRaw;
      return mode === "push" ? clientRaw : serverRaw;
    }

    if (key.startsWith(WHO_ARE_YA_PREFIX)) {
      const s = JSON.parse(serverRaw) as Array<{ isCorrect?: boolean }>;
      const c = JSON.parse(clientRaw) as Array<{ isCorrect?: boolean }>;
      const sArr = Array.isArray(s) ? s : [];
      const cArr = Array.isArray(c) ? c : [];
      const sWon = sArr.some((g) => g?.isCorrect);
      const cWon = cArr.some((g) => g?.isCorrect);
      if (cWon && !sWon) return clientRaw;
      if (sWon && !cWon) return serverRaw;
      if (cArr.length !== sArr.length) return cArr.length > sArr.length ? clientRaw : serverRaw;
      return mode === "push" ? clientRaw : serverRaw;
    }

    if (key.startsWith(TRIVIA_PREFIX)) {
      return serverRaw;
    }

    if (key === HIGHER_LOWER_KEY) {
      const s = JSON.parse(serverRaw) as {
        bestScoreByMode?: Record<string, number>;
        totalGamesPlayed?: number;
      };
      const c = JSON.parse(clientRaw) as {
        bestScoreByMode?: Record<string, number>;
        totalGamesPlayed?: number;
      };
      const merged = {
        bestScoreByMode: {
          matches: Math.max(s.bestScoreByMode?.matches ?? 0, c.bestScoreByMode?.matches ?? 0),
          goals: Math.max(s.bestScoreByMode?.goals ?? 0, c.bestScoreByMode?.goals ?? 0),
          minutes: Math.max(s.bestScoreByMode?.minutes ?? 0, c.bestScoreByMode?.minutes ?? 0),
        },
        totalGamesPlayed: Math.max(s.totalGamesPlayed ?? 0, c.totalGamesPlayed ?? 0),
      };
      return JSON.stringify(merged);
    }

    if (key === PORRA_CLAIMED_KEY) {
      const s = JSON.parse(serverRaw) as unknown;
      const c = JSON.parse(clientRaw) as unknown;
      const sArr = Array.isArray(s) ? s.filter((x): x is string => typeof x === "string") : [];
      const cArr = Array.isArray(c) ? c.filter((x): x is string => typeof x === "string") : [];
      return JSON.stringify(Array.from(new Set([...sArr, ...cArr])));
    }

    if (key === LINEUP_KEY) {
      return mode === "push" ? clientRaw : serverRaw;
    }
  } catch {
    return mode === "push" ? clientRaw : serverRaw;
  }

  return mode === "push" ? clientRaw : serverRaw;
}

/**
 * Merges server and client maps of synced game storage entries.
 *
 * @param serverEntries - Existing storage map from Supabase.
 * @param clientEntries - Incoming storage map from current device.
 * @param mode - Sync operation mode ("reconcile" or "push").
 * @returns Merged storage entry map filtered to valid keys.
 */
export function mergeSyncedGameStorageEntries(
  serverEntries: Readonly<Record<string, string>> | undefined,
  clientEntries: Readonly<Record<string, string>> | undefined,
  mode: "reconcile" | "push"
): Record<string, string> {
  const sMap = serverEntries ?? {};
  const cMap = clientEntries ?? {};
  const allKeys = new Set([...Object.keys(sMap), ...Object.keys(cMap)]);
  const result: Record<string, string> = {};

  for (const key of allKeys) {
    if (!isSyncedGameStorageKey(key)) continue;
    const mergedVal = mergeSingleStorageValue(key, sMap[key], cMap[key], mode);
    if (typeof mergedVal === "string" && mergedVal.length > 0) {
      result[key] = mergedVal;
    }
  }

  return result;
}
