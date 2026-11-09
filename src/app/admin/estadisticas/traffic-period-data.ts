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
 * Generates deterministic realistic trend data for 30 days based on 14-day sample.
 */
function generate30DaysData(base14: readonly DailyTrafficPoint[]): readonly DailyTrafficPoint[] {
  const result: DailyTrafficPoint[] = [];
  const startDay = 11; // Oct 11 to Nov 9

  for (let i = 0; i < 30; i++) {
    const day = startDay + i;
    const isOct = day <= 31;
    const displayDay = isOct ? day : day - 31;
    const month = isOct ? "Oct" : "Nov";
    const dateStr = `2026-${isOct ? "10" : "11"}-${String(displayDay).padStart(2, "0")}`;
    const label = `${displayDay} ${month}`;

    // Existing point in base 14 days
    const existing = base14.find((p) => p.date === dateStr);
    if (existing) {
      result.push(existing);
      continue;
    }

    // Previous days simulation
    const isMatch = i % 7 === 3;
    const visits = isMatch ? 115 + (i % 3) * 8 : 52 + ((i * 17) % 32);
    const uniqueVisitors = Math.round(visits * 0.7);

    result.push({
      date: dateStr,
      label,
      visits,
      uniqueVisitors,
      isMatchDay: isMatch,
    });
  }

  return result;
}

const SIX_MONTHS_DATA: readonly DailyTrafficPoint[] = [
  { date: "2026-06", label: "Jun", visits: 1120, uniqueVisitors: 780, isMatchDay: false },
  { date: "2026-07", label: "Jul", visits: 890, uniqueVisitors: 620, isMatchDay: false },
  { date: "2026-08", label: "Ago", visits: 1650, uniqueVisitors: 1120, isMatchDay: true },
  { date: "2026-09", label: "Sep", visits: 1980, uniqueVisitors: 1350, isMatchDay: true },
  { date: "2026-10", label: "Oct", visits: 2150, uniqueVisitors: 1480, isMatchDay: true },
  { date: "2026-11", label: "Nov", visits: 1054, uniqueVisitors: 748, isMatchDay: true },
];

const ONE_YEAR_DATA: readonly DailyTrafficPoint[] = [
  { date: "2025-12", label: "Dic", visits: 1240, uniqueVisitors: 840, isMatchDay: true },
  { date: "2026-01", label: "Ene", visits: 1380, uniqueVisitors: 920, isMatchDay: true },
  { date: "2026-02", label: "Feb", visits: 1450, uniqueVisitors: 980, isMatchDay: true },
  { date: "2026-03", label: "Mar", visits: 1620, uniqueVisitors: 1100, isMatchDay: true },
  { date: "2026-04", label: "Abr", visits: 1850, uniqueVisitors: 1250, isMatchDay: true },
  { date: "2026-05", label: "May", visits: 2050, uniqueVisitors: 1390, isMatchDay: true },
  { date: "2026-06", label: "Jun", visits: 1120, uniqueVisitors: 780, isMatchDay: false },
  { date: "2026-07", label: "Jul", visits: 890, uniqueVisitors: 620, isMatchDay: false },
  { date: "2026-08", label: "Ago", visits: 1650, uniqueVisitors: 1120, isMatchDay: true },
  { date: "2026-09", label: "Sep", visits: 1980, uniqueVisitors: 1350, isMatchDay: true },
  { date: "2026-10", label: "Oct", visits: 2150, uniqueVisitors: 1480, isMatchDay: true },
  { date: "2026-11", label: "Nov", visits: 1054, uniqueVisitors: 748, isMatchDay: true },
];

/**
 * Generates contiguous daily points between two ISO dates (YYYY-MM-DD).
 * Reuses base points where available, simulating deterministic values for historical dates.
 */
export function getPointsForDateRange(
  base14: readonly DailyTrafficPoint[],
  startDate: string,
  endDate: string
): readonly DailyTrafficPoint[] {
  let [start, end] = [new Date(startDate), new Date(endDate)];
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return base14;
  if (start > end) [start, end] = [end, start];

  const points: DailyTrafficPoint[] = [];
  const current = new Date(start);
  const maxDays = 120; // Bound queries to prevent performance degradation

  let count = 0;
  while (current <= end && count < maxDays) {
    const y = current.getFullYear();
    const m = current.getMonth();
    const d = current.getDate();
    const isoDate = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const label = `${d} ${SPANISH_MONTHS[m]}`;

    const existing = base14.find((p) => p.date === isoDate);
    if (existing) {
      points.push(existing);
    } else {
      const dayOfWeek = current.getDay();
      const isMatch = dayOfWeek === 0 && d % 2 === 0;
      const seed = Math.abs(current.getTime() / 86400000) % 50;
      const visits = isMatch
        ? 118 + Math.round((seed % 6) * 4)
        : dayOfWeek === 0 || dayOfWeek === 6
        ? 75 + Math.round((seed % 8) * 2)
        : 52 + Math.round((seed % 10) * 2);

      points.push({
        date: isoDate,
        label,
        visits,
        uniqueVisitors: Math.round(visits * 0.68),
        isMatchDay: isMatch,
      });
    }

    current.setDate(current.getDate() + 1);
    count++;
  }

  return points.length > 0 ? points : base14;
}

/**
 * Returns point array corresponding to the selected period or custom date range.
 */
export function getPointsForPeriod(
  base14: readonly DailyTrafficPoint[],
  period: TrafficPeriod,
  customStart?: string,
  customEnd?: string
): readonly DailyTrafficPoint[] {
  switch (period) {
    case "14d":
      return base14;
    case "30d":
      return generate30DaysData(base14);
    case "6m":
      return SIX_MONTHS_DATA;
    case "1y":
      return ONE_YEAR_DATA;
    case "custom":
      return getPointsForDateRange(
        base14,
        customStart ?? "2026-10-27",
        customEnd ?? "2026-11-09"
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
