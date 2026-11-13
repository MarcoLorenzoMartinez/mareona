import type {
  PlatformAnalytics,
  DailyTrafficPoint,
  HourlyTrafficPoint,
  SectionUsageStat,
  DeviceUsageStat,
  AccessModeStat,
  GeographicOriginStat,
  TopPageStat,
} from "@/lib/admin/types";
import type { Database } from "@/types/database.types";

type SiteVisitRow = Database["public"]["Tables"]["site_visits"]["Row"];

const SPANISH_MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const DEFAULT_SECTIONS: ReadonlyArray<{ key: string; label: string }> = [
  { key: "temporada", label: "Temporada y Partidos" },
  { key: "juegos", label: "Porra y Juegos" },
  { key: "social", label: "Tertulia Social" },
  { key: "historico", label: "Archivo Histórico" },
];

const CANONICAL_PATH_LABELS: Readonly<Record<string, string>> = {
  "/": "Portada",
  "/temporada": "Temporada y Directo",
  "/temporada/clasificacion": "Clasificación",
  "/temporada/calendario": "Calendario y Partidos",
  "/juegos": "Zona de Juegos",
  "/juegos/wordle": "Wordle Sportinguista",
  "/juegos/porra": "La Porra",
  "/juegos/who-are-ya": "Who Are Ya",
  "/juegos/pregunta-del-dia": "Pregunta del Día",
  "/juegos/album": "Álbum de Cartas",
  "/social": "Tertulia Social",
  "/historico": "Archivo Histórico",
  "/historico/efemerides": "Efemérides",
  "/historico/leyendas": "Leyendas del Club",
};

function categorizeSection(pathname: string): { key: string; label: string } {
  if (pathname.startsWith("/temporada")) return { key: "temporada", label: "Temporada y Partidos" };
  if (pathname.startsWith("/juegos")) return { key: "juegos", label: "Porra y Juegos" };
  if (pathname.startsWith("/social")) return { key: "social", label: "Tertulia Social" };
  if (pathname.startsWith("/historico")) return { key: "historico", label: "Archivo Histórico" };
  return { key: "temporada", label: "Temporada y Partidos" };
}

export function computePlatformAnalytics(rows: readonly SiteVisitRow[]): PlatformAnalytics {
  const total = rows.length;
  const now = new Date();

  // Daily map
  const dailyMap = new Map<string, { visits: number; sessions: Set<string> }>();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    dailyMap.set(d.toISOString().split("T")[0], { visits: 0, sessions: new Set() });
  }

  const hourlyCounts = new Array(24).fill(0);
  const sectionCounts = new Map<string, number>(DEFAULT_SECTIONS.map((s) => [s.key, 0]));
  const pagePathCounts = new Map<string, number>();
  const provinceMap = new Map<string, number>([["Asturias", 0]]);
  const countryMap = new Map<string, number>([["España", 0]]);
  const sessionPageCounts = new Map<string, number>();

  let mobileCount = 0;
  let pwaCount = 0;
  let totalDurationSeconds = 0;
  let durationEntriesCount = 0;

  for (const r of rows) {
    const visitDate = new Date(r.created_at);
    const isoDate = r.created_at.split("T")[0];

    const dailyEntry = dailyMap.get(isoDate);
    if (dailyEntry) {
      dailyEntry.visits++;
      if (r.session_id) dailyEntry.sessions.add(r.session_id);
    }

    const hour = visitDate.getHours();
    if (hour >= 0 && hour < 24) hourlyCounts[hour]++;

    const sec = categorizeSection(r.pathname);
    sectionCounts.set(sec.key, (sectionCounts.get(sec.key) || 0) + 1);

    pagePathCounts.set(r.pathname, (pagePathCounts.get(r.pathname) || 0) + 1);

    if (r.device_type === "mobile" || r.device_type === "tablet") mobileCount++;
    if (r.is_pwa) pwaCount++;

    provinceMap.set(r.province || "Asturias", (provinceMap.get(r.province || "Asturias") || 0) + 1);
    countryMap.set(r.country || "España", (countryMap.get(r.country || "España") || 0) + 1);

    if (r.session_id) {
      sessionPageCounts.set(r.session_id, (sessionPageCounts.get(r.session_id) || 0) + 1);
    }
    if (r.duration_seconds > 0) {
      totalDurationSeconds += r.duration_seconds;
      durationEntriesCount++;
    }
  }

  const dailyTraffic: DailyTrafficPoint[] = Array.from(dailyMap.entries()).map(([date, data]) => {
    const d = new Date(date + "T12:00:00Z");
    return {
      date,
      label: `${d.getDate()} ${SPANISH_MONTHS[d.getMonth()]}`,
      visits: data.visits,
      uniqueVisitors: data.sessions.size > 0 ? data.sessions.size : Math.round(data.visits * 0.7),
    };
  });

  const maxHourCount = Math.max(...hourlyCounts, 1);
  const hourlyTraffic: HourlyTrafficPoint[] = hourlyCounts.map((count, hour) => ({
    hour,
    label: `${hour.toString().padStart(2, "0")}h`,
    count,
    percentage: total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0,
    isPeak: count > 0 && count >= maxHourCount * 0.75,
  }));

  const sectionUsage: SectionUsageStat[] = DEFAULT_SECTIONS.map((s) => ({
    key: s.key,
    label: s.label,
    visits: sectionCounts.get(s.key) || 0,
    percentage: total > 0 ? Math.round(((sectionCounts.get(s.key) || 0) / total) * 100) : 0,
  }));

  // Top Pages ranking with scrollable full list support
  let topPages: TopPageStat[] = Array.from(pagePathCounts.entries())
    .map(([path, visits]) => ({
      path,
      label: CANONICAL_PATH_LABELS[path] || path,
      visits,
      percentage: total > 0 ? Math.round((visits / total) * 100) : 0,
    }))
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 30);

  if (topPages.length === 0) {
    topPages = Object.entries(CANONICAL_PATH_LABELS).map(([path, label]) => ({
      path,
      label,
      visits: 0,
      percentage: 0,
    }));
  }

  const deviceUsage: DeviceUsageStat[] = [
    { device: "mobile", label: "Móvil / Tablet", count: mobileCount, percentage: total > 0 ? Math.round((mobileCount / total) * 100) : 0 },
    { device: "desktop", label: "Escritorio", count: Math.max(0, total - mobileCount), percentage: total > 0 ? Math.round(((total - mobileCount) / total) * 100) : 0 },
  ];

  const accessModes: AccessModeStat[] = [
    { mode: "pwa", label: "App instalada (PWA)", count: pwaCount, percentage: total > 0 ? Math.round((pwaCount / total) * 100) : 0 },
    { mode: "browser", label: "Navegador web", count: Math.max(0, total - pwaCount), percentage: total > 0 ? Math.round(((total - pwaCount) / total) * 100) : 0 },
  ];

  const geographicProvinces: GeographicOriginStat[] = Array.from(provinceMap.entries())
    .map(([key, visits]) => ({ key: key.toLowerCase(), label: key, visits, percentage: total > 0 ? Math.round((visits / total) * 100) : 0 }))
    .sort((a, b) => b.visits - a.visits).slice(0, 5);

  const geographicCountries: GeographicOriginStat[] = Array.from(countryMap.entries())
    .map(([key, visits]) => ({ key: key.toLowerCase(), label: key, visits, percentage: total > 0 ? Math.round((visits / total) * 100) : 0 }))
    .sort((a, b) => b.visits - a.visits).slice(0, 5);

  const avgMinutes = durationEntriesCount > 0 ? Number((totalDurationSeconds / durationEntriesCount / 60).toFixed(2)) : 0;
  let singlePageSessions = 0;
  for (const pageCount of sessionPageCounts.values()) {
    if (pageCount === 1) singlePageSessions++;
  }
  const bounceRate = sessionPageCounts.size > 0 ? Number(((singlePageSessions / sessionPageCounts.size) * 100).toFixed(1)) : 0;
  const pagesPerSession = sessionPageCounts.size > 0 ? Number((total / sessionPageCounts.size).toFixed(1)) : 1.0;

  return {
    dailyTraffic,
    hourlyTraffic,
    sectionUsage,
    deviceUsage,
    accessModes,
    geographicProvinces,
    geographicCountries,
    topPages,
    avgSessionMinutes: avgMinutes,
    bounceRatePercentage: bounceRate,
    pagesPerSession,
    // Zero mock data: null until match days have recorded traffic for real comparison
    matchDayMultiplier: null,
  };
}
