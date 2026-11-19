import type { DailyTrafficPoint } from "@/lib/admin/types";

export type TrafficPeriod = "14d" | "30d" | "6m" | "1y" | "custom";

export interface PeriodConfig {
  readonly key: TrafficPeriod;
  readonly label: string;
}

export const TRAFFIC_PERIODS: readonly PeriodConfig[] = [
  { key: "14d", label: "14 días" },
  { key: "30d", label: "Último mes" },
  { key: "6m", label: "6 meses" },
  { key: "1y", label: "1 año" },
  { key: "custom", label: "Fechas" },
];

const SPANISH_MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

/**
 * Builds a contiguous daily series for the last `days` calendar days using strictly real data.
 * Days without recorded visits are filled with 0 (zero mock data).
 */
function buildTrailingDaysData(
  source: readonly DailyTrafficPoint[],
  days: number
): readonly DailyTrafficPoint[] {
  const byDate = new Map(source.map((p) => [p.date, p]));
  const anchorIso = source[source.length - 1]?.date;
  const endDate = anchorIso ? new Date(`${anchorIso}T12:00:00Z`) : new Date();
  const result: DailyTrafficPoint[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(endDate.getTime() - i * 86400000);
    const iso = d.toISOString().split("T")[0];
    const existing = byDate.get(iso);
    if (existing) {
      result.push(existing);
    } else {
      result.push({
        date: iso,
        label: `${d.getUTCDate()} ${SPANISH_MONTHS[d.getUTCMonth()]}`,
        visits: 0,
        uniqueVisitors: 0,
      });
    }
  }

  return result;
}

/**
 * Aggregates real daily points into monthly buckets for the last `months` calendar months.
 */
function buildMonthlyData(
  source: readonly DailyTrafficPoint[],
  months: number
): readonly DailyTrafficPoint[] {
  const monthlyTotals = new Map<string, { visits: number; uniqueVisitors: number }>();

  for (const p of source) {
    const monthKey = p.date.slice(0, 7); // YYYY-MM
    const current = monthlyTotals.get(monthKey) ?? { visits: 0, uniqueVisitors: 0 };
    monthlyTotals.set(monthKey, {
      visits: current.visits + p.visits,
      uniqueVisitors: current.uniqueVisitors + p.uniqueVisitors,
    });
  }

  const anchorIso = source[source.length - 1]?.date;
  const anchor = anchorIso ? new Date(`${anchorIso}T12:00:00Z`) : new Date();
  const result: DailyTrafficPoint[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth() - i, 1));
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    const totals = monthlyTotals.get(key) ?? { visits: 0, uniqueVisitors: 0 };
    result.push({
      date: key,
      label: SPANISH_MONTHS[d.getUTCMonth()],
      visits: totals.visits,
      uniqueVisitors: totals.uniqueVisitors,
    });
  }

  return result;
}

/**
 * Generates contiguous daily points between two ISO dates (YYYY-MM-DD) using strictly real data.
 * Days without recorded visits default to 0.
 */
export function getPointsForDateRange(
  source: readonly DailyTrafficPoint[],
  startDate: string,
  endDate: string
): readonly DailyTrafficPoint[] {
  let [start, end] = [new Date(`${startDate}T12:00:00Z`), new Date(`${endDate}T12:00:00Z`)];
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return source;
  if (start > end) [start, end] = [end, start];

  const byDate = new Map(source.map((p) => [p.date, p]));
  const points: DailyTrafficPoint[] = [];
  const current = new Date(start);
  const maxDays = 120; // Bound queries to prevent performance degradation

  let count = 0;
  while (current <= end && count < maxDays) {
    const y = current.getUTCFullYear();
    const m = current.getUTCMonth();
    const d = current.getUTCDate();
    const isoDate = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const existing = byDate.get(isoDate);

    points.push(
      existing ?? {
        date: isoDate,
        label: `${d} ${SPANISH_MONTHS[m]}`,
        visits: 0,
        uniqueVisitors: 0,
      }
    );

    current.setUTCDate(current.getUTCDate() + 1);
    count++;
  }

  return points.length > 0 ? points : source;
}

/**
 * Returns point array corresponding to the selected period or custom date range.
 */
export function getPointsForPeriod(
  base14: readonly DailyTrafficPoint[],
  period: TrafficPeriod,
  customStart?: string,
  customEnd?: string,
  allDaily?: readonly DailyTrafficPoint[]
): readonly DailyTrafficPoint[] {
  const realSource = allDaily && allDaily.length > 0 ? allDaily : base14;

  switch (period) {
    case "14d":
      return base14;
    case "30d":
      return buildTrailingDaysData(realSource, 30);
    case "6m":
      return buildMonthlyData(realSource, 6);
    case "1y":
      return buildMonthlyData(realSource, 12);
    case "custom":
      return getPointsForDateRange(
        realSource,
        customStart ?? base14[0]?.date ?? new Date().toISOString().split("T")[0],
        customEnd ?? base14[base14.length - 1]?.date ?? new Date().toISOString().split("T")[0]
      );
  }
}

/**
 * Determines whether a label on the X axis should be rendered to maintain readable spacing.
 */
export function shouldShowLabel(period: TrafficPeriod, index: number, total: number): boolean {
  if (period === "6m" || period === "1y") return true;
  if (total <= 14) return index % 2 === 0 || index === total - 1;
  if (total <= 35) return index % 5 === 0 || index === total - 1;
  return index % 10 === 0 || index === total - 1;
}
