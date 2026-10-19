import matchesData from "../../data/historical/matches.json" with { type: "json" };
import rivalsGeoData from "../../data/historical/rivals-geo.json" with { type: "json" };
import seasonsData from "../../data/historical/seasons.json" with { type: "json" };
import type {
  CompetitionStats,
  RegionRivalSummary,
  RivalGeoInfo,
  RivalH2HMatch,
  RivalH2HSummary,
  RivalScopeFilter,
  RivalSortOption,
} from "./rivals-types";

interface RawMatch {
  readonly id: string;
  readonly bdfMatchId?: string;
  readonly date: string;
  readonly competition: string;
  readonly round: string;
  readonly homeTeam: string;
  readonly awayTeam: string;
  readonly homeScore: number | null;
  readonly awayScore: number | null;
  readonly isHome: boolean;
  readonly outcome: string;
  readonly opponent: string;
  readonly venue: string;
  readonly bdfHomeCrest?: string;
  readonly bdfAwayCrest?: string;
}

const geoLookup = new Map<string, RivalGeoInfo>();
for (const item of rivalsGeoData as RivalGeoInfo[]) {
  geoLookup.set(item.name.toLowerCase(), item);
}

const seasonTierMap = new Map<string, string>();
for (const s of seasonsData as Array<{ readonly id: string; readonly tierName: string }>) {
  seasonTierMap.set(s.id, s.tierName);
}

/**
 * Resolves the refined competition category (1.ª División, 2.ª División, etc.).
 */
function resolveRefinedCompetition(competition: string, season: string): string {
  if (competition === "Liga") {
    return seasonTierMap.get(season) ?? "1.ª División";
  }
  return competition;
}

/**
 * Returns all verified historical rivals with geographic context and aggregated H2H record.
 */
export function getAllRivalsSummaries(): RivalH2HSummary[] {
  const matchesByRival = new Map<string, RivalH2HMatch[]>();

  for (const [season, rawList] of Object.entries(matchesData as Record<string, readonly RawMatch[]>)) {
    if (!Array.isArray(rawList)) continue;

    for (const m of rawList) {
      const opp = m.opponent;
      if (!opp) continue;

      const refinedComp = resolveRefinedCompetition(m.competition, season);
      const parsedYear = parseInt(m.date.split("/")[2] ?? "0", 10);

      const parsedMatch: RivalH2HMatch = {
        id: m.id,
        bdfMatchId: m.bdfMatchId ?? "",
        season,
        date: m.date,
        year: parsedYear,
        competition: refinedComp,
        round: m.round,
        homeTeam: m.homeTeam,
        awayTeam: m.awayTeam,
        homeScore: m.homeScore,
        awayScore: m.awayScore,
        isHome: m.isHome,
        outcome: (m.outcome === "V" || m.outcome === "E" || m.outcome === "D") ? m.outcome : "PENDIENTE",
        venue: m.venue,
        homeCrestUrl: m.bdfHomeCrest,
        awayCrestUrl: m.bdfAwayCrest,
      };

      const existing = matchesByRival.get(opp);
      if (existing) {
        existing.push(parsedMatch);
      } else {
        matchesByRival.set(opp, [parsedMatch]);
      }
    }
  }

  const summaries: RivalH2HSummary[] = [];

  for (const [oppName, rawMatches] of matchesByRival.entries()) {
    const geo = geoLookup.get(oppName.toLowerCase()) ?? {
      name: oppName,
      crestUrl: rawMatches[0]?.isHome ? rawMatches[0].awayCrestUrl ?? null : rawMatches[0]?.homeCrestUrl ?? null,
      community: "Desconocida",
      province: "Desconocida",
      country: "España",
    };

    let won = 0;
    let drawn = 0;
    let lost = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;

    const compMap = new Map<string, { won: number; drawn: number; lost: number; gf: number; ga: number; played: number }>();

    for (const m of rawMatches) {
      if (m.outcome === "V") won++;
      else if (m.outcome === "E") drawn++;
      else if (m.outcome === "D") lost++;

      const scFor = m.isHome ? (m.homeScore ?? 0) : (m.awayScore ?? 0);
      const scAgainst = m.isHome ? (m.awayScore ?? 0) : (m.homeScore ?? 0);
      goalsFor += scFor;
      goalsAgainst += scAgainst;

      const compStat = compMap.get(m.competition) ?? { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0 };
      compStat.played++;
      if (m.outcome === "V") compStat.won++;
      else if (m.outcome === "E") compStat.drawn++;
      else if (m.outcome === "D") compStat.lost++;
      compStat.gf += scFor;
      compStat.ga += scAgainst;
      compMap.set(m.competition, compStat);
    }

    const competitionsBreakdown: CompetitionStats[] = Array.from(compMap.entries()).map(([comp, st]) => ({
      competition: comp,
      played: st.played,
      won: st.won,
      drawn: st.drawn,
      lost: st.lost,
      goalsFor: st.gf,
      goalsAgainst: st.ga,
    })).sort((a, b) => b.played - a.played);

    // Sort matches chronologically descending
    const sortedMatches = [...rawMatches].sort((a, b) => {
      const partsA = a.date.split("/").map(Number);
      const partsB = b.date.split("/").map(Number);
      const dateA = new Date(partsA[2] ?? 0, (partsA[1] ?? 1) - 1, partsA[0] ?? 1).getTime();
      const dateB = new Date(partsB[2] ?? 0, (partsB[1] ?? 1) - 1, partsB[0] ?? 1).getTime();
      return dateB - dateA;
    });

    const played = rawMatches.length;
    const winPercentage = played > 0 ? Math.round((won / played) * 100) : 0;
    const isInternational = geo.country !== "España";

    summaries.push({
      name: geo.name,
      crestUrl: geo.crestUrl,
      community: geo.community,
      province: geo.province,
      country: geo.country,
      isInternational,
      played,
      won,
      drawn,
      lost,
      goalsFor,
      goalsAgainst,
      goalDiff: goalsFor - goalsAgainst,
      winPercentage,
      competitionsBreakdown,
      matches: sortedMatches,
      firstMatchDate: sortedMatches[sortedMatches.length - 1]?.date,
      lastMatchDate: sortedMatches[0]?.date,
    });
  }

  return summaries.sort((a, b) => a.name.localeCompare(b.name, "es"));
}

/**
 * Filter rival summaries by scope and search query.
 */
export function filterRivals(
  rivals: readonly RivalH2HSummary[],
  query: string,
  scope: RivalScopeFilter
): RivalH2HSummary[] {
  const normalizedQuery = query.trim().toLowerCase();

  return rivals.filter((r) => {
    // Search query matching by team name, province, or community
    if (normalizedQuery) {
      const matchName = r.name.toLowerCase().includes(normalizedQuery);
      const matchProvince = r.province.toLowerCase().includes(normalizedQuery);
      const matchCommunity = r.community.toLowerCase().includes(normalizedQuery);
      const matchCountry = r.country.toLowerCase().includes(normalizedQuery);
      if (!matchName && !matchProvince && !matchCommunity && !matchCountry) {
        return false;
      }
    }

    // Scope filter
    if (scope === "all") return true;
    if (scope === "primera") {
      return r.competitionsBreakdown.some((c) => c.competition.includes("1.ª"));
    }
    if (scope === "segunda") {
      return r.competitionsBreakdown.some((c) => c.competition.includes("2.ª"));
    }
    if (scope === "copa") {
      return r.competitionsBreakdown.some((c) => c.competition.includes("Copa"));
    }
    if (scope === "uefa") {
      return r.isInternational || r.competitionsBreakdown.some((c) => c.competition.includes("UEFA"));
    }
    if (scope === "promocion") {
      return r.competitionsBreakdown.some((c) => c.competition.includes("Promoción"));
    }

    return true;
  });
}

/**
 * Sorts rival summaries by specified criterion (played, alpha, won, winRate, goalDiff).
 */
export function sortRivals(
  rivals: readonly RivalH2HSummary[],
  sortOption: RivalSortOption
): RivalH2HSummary[] {
  const list = [...rivals];
  switch (sortOption) {
    case "played":
      return list.sort((a, b) => b.played - a.played || a.name.localeCompare(b.name, "es"));
    case "won":
      return list.sort((a, b) => b.won - a.won || b.played - a.played);
    case "winRate":
      return list.sort((a, b) => b.winPercentage - a.winPercentage || b.played - a.played);
    case "diff":
      return list.sort((a, b) => b.goalDiff - a.goalDiff || b.played - a.played);
    case "alpha":
    default:
      return list.sort((a, b) => a.name.localeCompare(b.name, "es"));
  }
}

/**
 * Aggregate rivals by Spanish Autonomous Community.
 */
export function getSummariesByCommunity(rivals: readonly RivalH2HSummary[]): RegionRivalSummary[] {
  const map = new Map<string, RivalH2HSummary[]>();

  for (const r of rivals) {
    if (r.country !== "España" || r.community === "Internacional") continue;
    const list = map.get(r.community) ?? [];
    list.push(r);
    map.set(r.community, list);
  }

  const results: RegionRivalSummary[] = [];

  for (const [communityName, communityRivals] of map.entries()) {
    let totalMatches = 0;
    let won = 0;
    let drawn = 0;
    let lost = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;

    for (const r of communityRivals) {
      totalMatches += r.played;
      won += r.won;
      drawn += r.drawn;
      lost += r.lost;
      goalsFor += r.goalsFor;
      goalsAgainst += r.goalsAgainst;
    }

    results.push({
      regionId: communityName.toLowerCase().replace(/\s+/g, "-"),
      regionName: communityName,
      isCountry: false,
      totalRivals: communityRivals.length,
      totalMatches,
      won,
      drawn,
      lost,
      goalsFor,
      goalsAgainst,
      rivals: [...communityRivals].sort((a, b) => b.played - a.played),
    });
  }

  return results.sort((a, b) => b.totalMatches - a.totalMatches);
}

/**
 * Aggregate rivals by Country (for world map and international overview).
 */
export function getSummariesByCountry(rivals: readonly RivalH2HSummary[]): RegionRivalSummary[] {
  const map = new Map<string, RivalH2HSummary[]>();

  for (const r of rivals) {
    const list = map.get(r.country) ?? [];
    list.push(r);
    map.set(r.country, list);
  }

  const results: RegionRivalSummary[] = [];

  for (const [countryName, countryRivals] of map.entries()) {
    let totalMatches = 0;
    let won = 0;
    let drawn = 0;
    let lost = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;

    for (const r of countryRivals) {
      totalMatches += r.played;
      won += r.won;
      drawn += r.drawn;
      lost += r.lost;
      goalsFor += r.goalsFor;
      goalsAgainst += r.goalsAgainst;
    }

    results.push({
      regionId: countryName.toLowerCase().replace(/\s+/g, "-"),
      regionName: countryName,
      isCountry: true,
      totalRivals: countryRivals.length,
      totalMatches,
      won,
      drawn,
      lost,
      goalsFor,
      goalsAgainst,
      rivals: [...countryRivals].sort((a, b) => b.played - a.played),
    });
  }

  return results.sort((a, b) => b.totalMatches - a.totalMatches);
}
