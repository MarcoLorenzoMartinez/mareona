"use server";

import { getEphemeridesForDay } from "@/lib/historical/ephemerides-service";
import type { DayEphemeridesResult } from "@/lib/historical/ephemerides-types";

/**
 * Server Action: Fetches all official matches, balance, and milestones for a given day and month.
 *
 * @param month Calendar month (1-12).
 * @param day Calendar day (1-31).
 * @returns Complete DayEphemeridesResult for that day.
 */
export async function fetchEphemeridesForDayAction(
  month: number,
  day: number
): Promise<DayEphemeridesResult> {
  const safeMonth = Math.min(12, Math.max(1, month));
  const safeDay = Math.min(31, Math.max(1, day));
  return getEphemeridesForDay(safeMonth, safeDay);
}
