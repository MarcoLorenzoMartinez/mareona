import type { Card } from "../types.ts";
import { MOMENTS_CLASSIC } from "./moments-classic.ts";
import { MOMENTS_MODERN } from "./moments-modern.ts";

/**
 * Commemorative historical moments and mythical matches collection.
 * Non-competitive cards. Name and year without ratings, conforming strictly to instructions.
 */
export const HISTORICAL_MOMENTS: readonly Card[] = [
  ...MOMENTS_CLASSIC,
  ...MOMENTS_MODERN,
] as const;
