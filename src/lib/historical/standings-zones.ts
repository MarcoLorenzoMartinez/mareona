import type { HistoricalSeason, HistoricalZone } from "./types.ts";

export interface ZoneBadgeStyle {
  readonly badgeClass: string;
  readonly label: string;
}

export interface ZoneLegendItem {
  readonly label: string;
  readonly dotClass: string;
}

/**
 * Resolves the precise historical zone for a team row based on
 * official league regulations and division formats of each era.
 */
export function resolveHistoricalZone(
  season: HistoricalSeason,
  position: number,
  totalTeams: number,
  rawZone?: HistoricalZone
): HistoricalZone {
  if (season.tier === 2) {
    return resolveSegundaZone(season.startYear, position, totalTeams, rawZone);
  }
  return resolvePrimeraZone(season.startYear, position, totalTeams, rawZone);
}

function resolveSegundaZone(year: number, pos: number, total: number, raw?: HistoricalZone): HistoricalZone {
  if (year >= 2010) {
    if (pos <= 2) return "promotion-direct";
    if (pos <= 6) return "promotion-playoff";
    return pos > total - 4 ? "relegation" : "neutral";
  }
  if (year >= 1999) {
    if (pos <= 3) return "promotion-direct";
    return pos > total - 4 ? "relegation" : "neutral";
  }
  if (year >= 1987) {
    if (pos <= 2) return "promotion-direct";
    if (pos <= 4) return "promotion-playoff";
    return pos > total - 4 ? "relegation" : "neutral";
  }
  if (raw === "champion" || (raw === "promotion" && pos <= 2)) return "promotion-direct";
  if (raw === "promotion") return "promotion-playoff";
  return raw === "relegation" ? "relegation" : "neutral";
}

function resolvePrimeraZone(year: number, pos: number, total: number, raw?: HistoricalZone): HistoricalZone {
  if (pos === 1) return "champion";
  if (year >= 2021) {
    if (pos <= 4) return "champions-league";
    if (pos <= 6) return "europa-league";
    if (pos === 7) return "conference-league";
    return pos > total - 3 ? "relegation" : "neutral";
  }
  if (year >= 2009) {
    if (pos <= 4) return "champions-league";
    if (pos <= 6) return "europa-league";
    return pos > total - 3 ? "relegation" : "neutral";
  }
  if (year >= 1999) {
    if (pos <= 4) return "champions-league";
    if (pos <= 6) return "uefa";
    return pos > total - 3 ? "relegation" : "neutral";
  }
  if (year >= 1987) {
    if (year >= 1997 && pos === 2) return "champions-league";
    if (raw === "uefa" || (pos >= 2 && pos <= 4)) return "uefa";
    if (pos === 17 || pos === 18) return "relegation-playoff";
    return pos > total - 2 ? "relegation" : "neutral";
  }
  if (raw === "uefa" || (pos >= 2 && pos <= 4 && year >= 1971)) return "uefa";
  return raw === "relegation" || pos > total - 3 ? "relegation" : "neutral";
}

/**
 * Returns accessible visual styling and readable description for any standing zone.
 */
export function getZoneBadgeStyle(zone: HistoricalZone): ZoneBadgeStyle {
  switch (zone) {
    case "champion":
      return { badgeClass: "bg-amber-500 text-white shadow-2xs", label: "Campeón" };
    case "champions-league":
      return { badgeClass: "bg-blue-600 text-white shadow-2xs", label: "Champions League" };
    case "europa-league":
      return { badgeClass: "bg-orange-600 text-white shadow-2xs", label: "Europa League" };
    case "conference-league":
      return { badgeClass: "bg-teal-600 text-white shadow-2xs", label: "Conference League" };
    case "uefa":
      return { badgeClass: "bg-orange-600 text-white shadow-2xs", label: "Copa de la UEFA" };
    case "promotion-direct":
    case "promotion":
      return { badgeClass: "bg-emerald-600 text-white shadow-2xs", label: "Ascenso directo" };
    case "promotion-playoff":
      return {
        badgeClass: "bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold",
        label: "Playoff de ascenso",
      };
    case "relegation-playoff":
      return {
        badgeClass: "bg-amber-100 text-amber-900 border border-amber-300 font-bold",
        label: "Promoción permanencia",
      };
    case "relegation":
      return { badgeClass: "bg-rose-700 text-white shadow-2xs", label: "Descenso" };
    default:
      return { badgeClass: "text-[var(--foreground-muted)]", label: "Permanencia" };
  }
}

/**
 * Generates an active, context-aware legend reflecting the specific season format.
 */
export function getZoneLegendItems(season: HistoricalSeason): readonly ZoneLegendItem[] {
  if (season.tier === 2) {
    const hasPlayoff = season.startYear >= 2010 || (season.startYear >= 1987 && season.startYear <= 1998);
    return [
      { label: "Ascenso directo", dotClass: "bg-emerald-600" },
      ...(hasPlayoff ? [{ label: "Playoff de ascenso", dotClass: "bg-emerald-100 border border-emerald-400" }] : []),
      { label: "Descenso", dotClass: "bg-rose-700" },
    ];
  }

  const items: ZoneLegendItem[] = [{ label: "Campeón", dotClass: "bg-amber-500" }];
  if (season.startYear >= 1997) items.push({ label: "Champions League", dotClass: "bg-blue-600" });
  if (season.startYear >= 2009) {
    items.push({ label: "Europa League", dotClass: "bg-orange-600" });
  } else if (season.startYear >= 1971) {
    items.push({ label: "Copa de la UEFA", dotClass: "bg-orange-600" });
  }
  if (season.startYear >= 2021) items.push({ label: "Conference League", dotClass: "bg-teal-600" });
  if (season.startYear >= 1987 && season.startYear <= 1998) {
    items.push({ label: "Promoción permanencia", dotClass: "bg-amber-100 border border-amber-400" });
  }
  items.push({ label: "Descenso", dotClass: "bg-rose-700" });
  return items;
}
