/**
 * Date formatting utilities for sports fixtures in Europe/Madrid timezone.
 * Handles both confirmed kickoffs and unconfirmed matchdays where LaLiga has not yet
 * scheduled the exact day and hour.
 */

/**
 * Computes the estimated date range for a LaLiga matchday before exact date/time is confirmed.
 * Weekend matchdays span Friday through Monday. Midweek matchdays span Tuesday through Thursday.
 *
 * @param date - The tentative date assigned to the matchday (typically Sunday for weekends).
 * @returns Start and end dates of the matchday window.
 */
export function getMatchdayDateRange(date: Date): { start: Date; end: Date } {
  const dayOfWeek = date.getDay();
  const isMidweek = dayOfWeek >= 2 && dayOfWeek <= 4;

  const start = new Date(date.getTime());
  const end = new Date(date.getTime());

  if (isMidweek) {
    const diffToTuesday = dayOfWeek - 2;
    start.setDate(start.getDate() - diffToTuesday);
    const diffToThursday = 4 - dayOfWeek;
    end.setDate(end.getDate() + diffToThursday);
  } else {
    // Days offset from Friday:
    // Sunday (0) -> 2 days after Friday
    // Monday (1) -> 3 days after Friday
    // Friday (5) -> 0 days after Friday
    // Saturday (6) -> 1 day after Friday
    const offsetFromFriday = (dayOfWeek + 2) % 7;
    start.setDate(start.getDate() - offsetFromFriday);
    end.setDate(start.getDate() + 3);
  }

  return { start, end };
}

/**
 * Formats a match date for UI presentation.
 * If kickoff date/time is confirmed, displays weekday, day and month (e.g. "dom, 17 ene 2027").
 * If kickoff date/time is unconfirmed, displays the candidate days range (e.g. "15/18 ene 2027" or "15/18 ene").
 *
 * @param dateStr - ISO date string.
 * @param isTimeConfirmed - Whether kickoff date and time have been officially scheduled.
 * @param includeYear - Whether to append the full year (useful in match header).
 */
export function formatMatchDate(
  dateStr: string,
  isTimeConfirmed: boolean,
  includeYear: boolean = false
): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";

    if (!isTimeConfirmed) {
      const { start, end } = getMatchdayDateRange(d);
      const startDay = start.getDate();
      const endDay = end.getDate();

      const startMonth = new Intl.DateTimeFormat("es-ES", {
        timeZone: "Europe/Madrid",
        month: "short",
      }).format(start);

      const endMonth = new Intl.DateTimeFormat("es-ES", {
        timeZone: "Europe/Madrid",
        month: "short",
      }).format(end);

      const yearSuffix = includeYear ? ` ${end.getFullYear()}` : "";

      if (startMonth === endMonth) {
        return `${startDay}/${endDay} ${endMonth}${yearSuffix}`;
      }

      return `${startDay} ${startMonth} / ${endDay} ${endMonth}${yearSuffix}`;
    }

    return new Intl.DateTimeFormat("es-ES", {
      timeZone: "Europe/Madrid",
      weekday: "short",
      day: "numeric",
      month: "short",
      ...(includeYear ? { year: "numeric" as const } : {}),
    }).format(d);
  } catch {
    return "";
  }
}

/**
 * Formats match kickoff time (HH:mm) according to Europe/Madrid timezone.
 */
export function formatMatchTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "--:--";
    return new Intl.DateTimeFormat("es-ES", {
      timeZone: "Europe/Madrid",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return "--:--";
  }
}
