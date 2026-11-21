import type { HistoricalSeason, HistoricalZone } from "./types.ts";

export interface ZoneBadgeStyle {
  readonly barClass: string;
  readonly label: string;
}

export interface ZoneLegendItem {
  readonly label: string;
  readonly barClass: string;
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
  if (year >= 1999 || (year >= 1968 && year <= 1986)) {
    if (pos <= 3) return "promotion-direct";
    return pos > total - 4 ? "relegation" : "neutral";
  }
  if (year >= 1987 && year <= 1998) {
    if (pos <= 2) return "promotion-direct";
    if (pos <= 4) return "promotion-playoff";
    return pos > total - 4 ? "relegation" : "neutral";
  }
  if (year >= 1950 && year <= 1967) {
    if (pos === 1) return "promotion-direct";
    if (pos === 2) return "promotion-playoff";
    return pos > total - 2 ? "relegation" : "neutral";
  }
  if (year >= 1933 && year <= 1949) {
    if (pos <= 2) return "promotion-direct";
    return pos > total - 2 ? "relegation" : "neutral";
  }
  if (year === 1928) {
    return pos === 1 ? "promotion-playoff" : "neutral";
  }
  // 1929 to 1932: Only 1st placed team promotes directly to Primera
  if (pos === 1) return "promotion-direct";
  return pos >= total || raw === "relegation" ? "relegation" : "neutral";
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
  if (year >= 1971) {
    if (raw === "uefa" || (pos >= 2 && pos <= 4)) return "uefa";
    return pos >= 16 ? "relegation" : "neutral";
  }
  if (year >= 1950) {
    if (pos === 13 || pos === 14) return "relegation-playoff";
    return pos >= 15 ? "relegation" : "neutral";
  }
  if (year >= 1941) {
    if (pos === 11 || pos === 12) return "relegation-playoff";
    return pos >= 13 ? "relegation" : "neutral";
  }
  return pos >= total ? "relegation" : "neutral";
}

/**
 * Returns accessible visual styling and readable description for any standing zone.
 * Uses a refined vertical 3px accent bar indicator (Google Sports / FotMob style).
 */
export function getZoneBadgeStyle(zone: HistoricalZone): ZoneBadgeStyle {
  switch (zone) {
    case "champion":
      return { barClass: "bg-[#16a34a]", label: "Campeón" };
    case "champions-league":
      return { barClass: "bg-[#1d4ed8]", label: "Champions League" };
    case "europa-league":
      return { barClass: "bg-[#ea580c]", label: "Europa League" };
    case "conference-league":
      return { barClass: "bg-[#0d9488]", label: "Conference League" };
    case "uefa":
      return { barClass: "bg-[#ea580c]", label: "Copa de la UEFA" };
    case "promotion-direct":
    case "promotion":
      return { barClass: "bg-[#16a34a]", label: "Ascenso directo" };
    case "promotion-playoff":
      return { barClass: "bg-[#2563eb]", label: "Playoff de ascenso" };
    case "relegation-playoff":
      return { barClass: "bg-[#f59e0b]", label: "Promoción permanencia" };
    case "relegation":
      return { barClass: "bg-[#dc2626]", label: "Descenso" };
    default:
      return { barClass: "", label: "Permanencia" };
  }
}

/**
 * Generates an active, context-aware legend reflecting the specific season format.
 */
export function getZoneLegendItems(season: HistoricalSeason): readonly ZoneLegendItem[] {
  if (season.tier === 2) {
    const year = season.startYear;
    const hasPlayoff = year >= 2010 || (year >= 1987 && year <= 1998) || (year >= 1950 && year <= 1967) || year === 1928;
    const isSinglePromo = year >= 1929 && year <= 1932;
    return [
      { label: isSinglePromo ? "Campeón (Ascenso)" : "Ascenso directo", barClass: "bg-[#16a34a]" },
      ...(hasPlayoff ? [{ label: year >= 2010 ? "Playoff de ascenso" : "Promoción de ascenso", barClass: "bg-[#2563eb]" }] : []),
      { label: "Descenso", barClass: "bg-[#dc2626]" },
    ];
  }

  const items: ZoneLegendItem[] = [{ label: "Campeón", barClass: "bg-[#16a34a]" }];
  if (season.startYear >= 1997) items.push({ label: "Champions League", barClass: "bg-[#1d4ed8]" });
  if (season.startYear >= 2009) {
    items.push({ label: "Europa League", barClass: "bg-[#ea580c]" });
  } else if (season.startYear >= 1971) {
    items.push({ label: "Copa de la UEFA", barClass: "bg-[#ea580c]" });
  }
  if (season.startYear >= 2021) items.push({ label: "Conference League", barClass: "bg-[#0d9488]" });
  if ((season.startYear >= 1987 && season.startYear <= 1998) || (season.startYear >= 1941 && season.startYear <= 1970)) {
    items.push({ label: "Promoción permanencia", barClass: "bg-[#f59e0b]" });
  }
  items.push({ label: "Descenso", barClass: "bg-[#dc2626]" });
  return items;
}
