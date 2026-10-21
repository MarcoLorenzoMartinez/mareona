"use server";

import { createClient } from "@/lib/supabase/server";
import { fetchMatchDetail } from "@/lib/sports-api/client";
import type { DomainMatchDetail } from "@/lib/sports-api/types";

/**
 * Server Action to fetch live match updates.
 * Leverages the Supabase 15-second TTL cache for matches currently in play.
 *
 * @param matchId External match identifier.
 * @returns Latest DomainMatchDetail or null.
 */
export async function getLiveMatchUpdate(
  matchId: string
): Promise<DomainMatchDetail | null> {
  const supabase = await createClient();
  return fetchMatchDetail(matchId, supabase);
}
