import type { Card } from "../types.ts";
import { HISTORICAL_CRESTS } from "./crests.ts";
import { HISTORICAL_MOMENTS } from "./moments.ts";
import { PLAYERS_1920_1949 } from "./players-1920-1949.ts";
import { PLAYERS_1950_1969 } from "./players-1950-1969.ts";
import { PLAYERS_1970_1979 } from "./players-1970-1979.ts";
import { PLAYERS_1980_1989 } from "./players-1980-1989.ts";
import { PLAYERS_1990_1999 } from "./players-1990-1999.ts";
import { PLAYERS_2000_2015 } from "./players-2000-2015.ts";
import { PLAYERS_2016_PRESENT } from "./players-2016-present.ts";

/**
 * Complete official collection of authentic Real Sporting cards (~500 cards).
 * Includes historical crests, iconic club moments, and players from 1920 to present.
 * Strictly 0% mock or fictitious data. Conforms to AGENTS.md rules.
 */
export const HISTORICAL_CARDS_SEED: readonly Card[] = [
  ...HISTORICAL_CRESTS,
  ...HISTORICAL_MOMENTS,
  ...PLAYERS_1920_1949,
  ...PLAYERS_1950_1969,
  ...PLAYERS_1970_1979,
  ...PLAYERS_1980_1989,
  ...PLAYERS_1990_1999,
  ...PLAYERS_2000_2015,
  ...PLAYERS_2016_PRESENT,
] as const;

export { HISTORICAL_CRESTS } from "./crests.ts";
export { HISTORICAL_MOMENTS } from "./moments.ts";
export { PLAYERS_1920_1949 } from "./players-1920-1949.ts";
export { PLAYERS_1950_1969 } from "./players-1950-1969.ts";
export { PLAYERS_1970_1979 } from "./players-1970-1979.ts";
export { PLAYERS_1980_1989 } from "./players-1980-1989.ts";
export { PLAYERS_1990_1999 } from "./players-1990-1999.ts";
export { PLAYERS_2000_2015 } from "./players-2000-2015.ts";
export { PLAYERS_2016_PRESENT } from "./players-2016-present.ts";
