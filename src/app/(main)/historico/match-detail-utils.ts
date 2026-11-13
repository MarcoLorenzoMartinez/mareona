/**
 * Formats historical match date strings (e.g. DD/MM/YYYY or ISO) into Spanish long dates.
 *
 * @param dateStr Raw date string from historical dataset.
 * @returns Human-readable date like "15 de mayo de 1981".
 */
export function formatHistoricalDate(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("/");
  let d: Date;
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    d = new Date(year, month, day);
  } else {
    d = new Date(dateStr);
  }
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
