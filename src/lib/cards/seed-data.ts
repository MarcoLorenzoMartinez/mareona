import type { Card } from "./types.ts";
import { HISTORICAL_CARDS_CLASSIC } from "./seed-data-classic.ts";
import { HISTORICAL_CARDS_MODERN } from "./seed-data-modern.ts";

/**
 * Curated authentic historical card seeds for Real Sporting across all decades.
 * 0% fictitious or mock data. Conforms strictly to AGENTS.md rules.
 */
export const HISTORICAL_CARDS_SEED: readonly Card[] = [
  ...HISTORICAL_CARDS_CLASSIC,
  ...HISTORICAL_CARDS_MODERN,
] as const;

export { HISTORICAL_CARDS_CLASSIC } from "./seed-data-classic.ts";
export { HISTORICAL_CARDS_MODERN } from "./seed-data-modern.ts";
