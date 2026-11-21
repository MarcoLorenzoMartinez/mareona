/**
 * Formats an ISO date string (YYYY-MM-DD) into a concise, readable Spanish date.
 * E.g., '2026-11-05' -> '5 nov 2026'.
 *
 * @param dateStr ISO date string (YYYY-MM-DD)
 * @returns Formatted human-readable date string
 */
export function formatGameDailyDate(dateStr: string): string {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return '';
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayStr, 10);

  const date = new Date(Date.UTC(year, month, day, 12, 0, 0));
  return new Intl.DateTimeFormat('es-ES', {
    timeZone: 'Europe/Madrid',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Resolves the canonical ISO date string (YYYY-MM-DD) in Europe/Madrid timezone.
 */
export function getTodayMadridIsoDate(customDate: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(customDate);
}

/**
 * Resolves today's Europe/Madrid ISO date string clamped to `epochDate` minimum.
 */
export function resolveClampedMadridDate(epochDate: string, customDate?: Date): string {
  const todayStr = getTodayMadridIsoDate(customDate);
  return todayStr < epochDate ? epochDate : todayStr;
}
