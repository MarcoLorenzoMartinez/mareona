import type { createClient } from "@/lib/supabase/server";

export const TTL_STANDINGS_MS = 60 * 60 * 1000; // 1 hour
export const TTL_FIXTURES_MS = 12 * 60 * 60 * 1000; // 12 hours
export const TTL_LIVE_MS = 60 * 1000; // 1 minute

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Checks whether a given cache timestamp is still within its validity window.
 *
 * @param expiresAt ISO date string representing expiry.
 * @returns True if current time is before expiresAt.
 */
export function isCacheValid(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() > Date.now();
}

/**
 * Retrieves a cached JSON payload from Supabase external_api_cache if not expired.
 *
 * @param supabase Scoped Supabase server client.
 * @param cacheKey Unique deterministic cache key.
 * @returns The cached payload as an object, or null if missed/expired.
 */
export async function getCachedPayload<T>(
  supabase: SupabaseServerClient,
  cacheKey: string
): Promise<T | null> {
  const { data, error } = await supabase
    .from("external_api_cache")
    .select("payload, expires_at")
    .eq("cache_key", cacheKey)
    .single();

  if (error || !data) {
    return null;
  }

  if (!isCacheValid(data.expires_at)) {
    return null;
  }

  return data.payload as T;
}

/**
 * Stores an API payload into the Supabase external_api_cache table with a specified TTL.
 *
 * @param supabase Scoped Supabase server client.
 * @param cacheKey Unique deterministic cache key.
 * @param payload Serializable JSON payload to persist.
 * @param ttlMs Time-to-live in milliseconds.
 */
export async function setCachedPayload(
  supabase: SupabaseServerClient,
  cacheKey: string,
  payload: Record<string, unknown> | Array<unknown>,
  ttlMs: number
): Promise<void> {
  const expiresAt = new Date(Date.now() + ttlMs).toISOString();

  await supabase.from("external_api_cache").upsert({
    cache_key: cacheKey,
    // Cast to Database Json shape without using any
    payload: payload as unknown as import("@/types/database.types").Json,
    fetched_at: new Date().toISOString(),
    expires_at: expiresAt,
  });
}
