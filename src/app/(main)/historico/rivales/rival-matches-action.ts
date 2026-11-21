"use server";

import { getAllRivalsSummaries } from "@/lib/historical/rivals-service";
import type { RivalH2HMatch } from "@/lib/historical/rivals-types";

/**
 * Loads the full chronological H2H match list for a single rival on demand,
 * avoiding multi-megabyte RSC serialization on `/historico/rivales`.
 */
export async function getRivalMatchesAction(
  rivalName: string
): Promise<readonly RivalH2HMatch[]> {
  if (!rivalName || typeof rivalName !== "string") return [];
  const rival = getAllRivalsSummaries().find(
    (r) => r.name.toLowerCase() === rivalName.trim().toLowerCase()
  );
  return rival?.matches ?? [];
}
