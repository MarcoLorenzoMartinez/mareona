"use server";

import { createClient } from "@/lib/supabase/server";
import { fetchSpotlightFixture, fetchSportingSeasonMatches } from "@/lib/sports-api/client";
import type { DomainMatchSummary } from "@/lib/sports-api/types";

/**
 * Server Action to fetch live updates for the spotlighted next/current fixture.
 * Leverages the 15-second live TTL when a match is in play.
 */
export async function getLiveNextFixtureUpdate(): Promise<DomainMatchSummary | null> {
  const supabase = await createClient();
  return fetchSpotlightFixture(supabase);
}

/**
 * Server Action to fetch live updates for the full season fixtures list.
 * Automatically updates scores and live status when matches are in progress.
 */
export async function getLiveSeasonMatchesUpdate(): Promise<readonly DomainMatchSummary[]> {
  const supabase = await createClient();
  return fetchSportingSeasonMatches(supabase);
}
