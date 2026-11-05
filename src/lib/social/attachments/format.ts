const DATE_FORMAT = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Europe/Madrid",
});

/**
 * Formats a match date for attachments (e.g. "12 mar 2026").
 *
 * @param iso - ISO date or datetime.
 * @returns Spanish short date, or an empty string when the input is not a valid date.
 */
export function formatAttachmentDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : DATE_FORMAT.format(date).replace(/\./g, "");
}

/**
 * Builds the one-line score label used in the picker and accessible names.
 *
 * @returns "Local 2-0 Visitante" when played, otherwise "Local vs Visitante".
 */
export function formatScoreLine(
  homeName: string,
  awayName: string,
  homeScore: number | null,
  awayScore: number | null
): string {
  if (homeScore === null || awayScore === null) return `${homeName} vs ${awayName}`;
  return `${homeName} ${homeScore}-${awayScore} ${awayName}`;
}
