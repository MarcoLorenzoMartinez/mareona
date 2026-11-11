import matchesData from "../../data/historical/matches.json" with { type: "json" };
import rivalsGeoData from "../../data/historical/rivals-geo.json" with { type: "json" };
import seasonsData from "../../data/historical/seasons.json" with { type: "json" };
import { canonicalizeOpponentName, MODERN_OPPONENT_ALIASES } from "./canonical-opponents.ts";
import { matchesSearchQuery } from "../utils/search-utils.ts";
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
  const canonName = canonicalizeOpponentName(item.name);
  geoLookup.set(canonName.toLowerCase(), { ...item, name: canonName });
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

let cachedAllRivals: RivalH2HSummary[] | null = null;

/**
 * Returns all verified historical rivals with geographic context and aggregated H2H record.
 */
export function getAllRivalsSummaries(): RivalH2HSummary[] {
  if (cachedAllRivals) {
    return cachedAllRivals;
  }
  const matchesByRival = new Map<string, RivalH2HMatch[]>();

  for (const [season, rawList] of Object.entries(matchesData as Record<string, readonly RawMatch[]>)) {
    if (!Array.isArray(rawList)) continue;

    for (const m of rawList) {
      const opp = canonicalizeOpponentName(m.opponent);
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
        homeTeam: canonicalizeOpponentName(m.homeTeam),
        awayTeam: canonicalizeOpponentName(m.awayTeam),
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
      allMatches: sortedMatches,
      firstMatchDate: sortedMatches[sortedMatches.length - 1]?.date,
      lastMatchDate: sortedMatches[0]?.date,
    });
  }

  cachedAllRivals = summaries.sort((a, b) => a.name.localeCompare(b.name, "es"));
  return cachedAllRivals;
}

/**
 * Normalizes a text string by removing diacritical accents and lowercase formatting.
 */
function normalizeString(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

const RESERVE_TEAM_REGEX = /\b(b|ii|2|promesas|atletic|atlètic|castilla|mestalla|filial|sanse)\b/i;

/**
 * Checks whether a team name indicates a reserve or filial team.
 */
function isReserveTeam(name: string): boolean {
  return RESERVE_TEAM_REGEX.test(name);
}

/**
 * Resolves the historical H2H summary for a rival by team name.
 * Robust against minor spelling, prefix variants (e.g. CD, RC, Real)
 * and contemporary sports API naming.
 * Strictly isolates first teams from reserve/filial teams to prevent false positives.
 *
 * @param opponentName Team name to resolve.
 * @returns Complete RivalH2HSummary if historical matches exist, or null if no records are found.
 */
export function findRivalH2H(opponentName: string): RivalH2HSummary | null {
  if (!opponentName || !opponentName.trim()) return null;

  const all = getAllRivalsSummaries();
  const raw = opponentName.trim();
  const lower = raw.toLowerCase();
  const targetIsReserve = isReserveTeam(raw);

  // 1. Direct alias dictionary lookup (e.g. "Real Sociedad II" -> "Real Sociedad B")
  const aliased = MODERN_OPPONENT_ALIASES[lower];
  if (aliased) {
    const found = all.find((r) => r.name.toLowerCase() === aliased.toLowerCase());
    if (found) return found;
  }

  // 2. Exact match (case-insensitive)
  const exact = all.find((r) => r.name.toLowerCase() === lower);
  if (exact) return exact;

  // 3. Historical canonical map resolution
  const canon = canonicalizeOpponentName(raw);
  const foundCanon = all.find((r) => r.name.toLowerCase() === canon.toLowerCase());
  if (foundCanon) return foundCanon;

  // 4. Accent-normalized matching
  const normTarget = normalizeString(raw);
  const foundNorm = all.find((r) => {
    if (targetIsReserve !== isReserveTeam(r.name)) return false;
    return normalizeString(r.name) === normTarget;
  });
  if (foundNorm) return foundNorm;

  // 5. Containment matching (only when both are reserves, or both are first teams)
  for (const r of all) {
    if (targetIsReserve !== isReserveTeam(r.name)) {
      continue;
    }

    const rNorm = normalizeString(r.name);
    if (
      (normTarget.length >= 5 && rNorm.includes(normTarget)) ||
      (rNorm.length >= 5 && normTarget.includes(rNorm))
    ) {
      return r;
    }
  }

  return null;
}

/**
 * Determines whether a match competition matches the selected scope filter.
 */
export function isMatchInScope(competition: string, scope: RivalScopeFilter): boolean {
  switch (scope) {
    case "primera":
      return competition.includes("1.ª");
    case "segunda":
      return competition.includes("2.ª");
    case "copa":
      return competition.includes("Copa") && !competition.includes("UEFA");
    case "uefa":
      return competition.includes("UEFA");
    case "promocion":
      return competition.includes("Promoción");
    case "all":
    default:
      return true;
  }
}

/**
 * Re-computes a rival's H2H summary restricted to the matches of a specific competition scope.
 * Returns null if the rival never faced Sporting in that competition scope.
 */
export function computeScopedSummary(
  rival: RivalH2HSummary,
  scope: RivalScopeFilter
): RivalH2HSummary | null {
  if (scope === "all") return rival;

  const sourceMatches = rival.allMatches && rival.allMatches.length > 0 ? rival.allMatches : rival.matches;
  const scopedMatches = sourceMatches.filter((m) => isMatchInScope(m.competition, scope));

  if (scopedMatches.length === 0) {
    return null;
  }

  let won = 0;
  let drawn = 0;
  let lost = 0;
  let goalsFor = 0;
  let goalsAgainst = 0;

  for (const m of scopedMatches) {
    if (m.outcome === "V") won++;
    else if (m.outcome === "E") drawn++;
    else if (m.outcome === "D") lost++;

    const scFor = m.isHome ? (m.homeScore ?? 0) : (m.awayScore ?? 0);
    const scAgainst = m.isHome ? (m.awayScore ?? 0) : (m.homeScore ?? 0);
    goalsFor += scFor;
    goalsAgainst += scAgainst;
  }

  const played = scopedMatches.length;
  const winPercentage = played > 0 ? Math.round((won / played) * 100) : 0;
  const scopedBreakdown = rival.competitionsBreakdown.filter((c) =>
    isMatchInScope(c.competition, scope)
  );

  return {
    ...rival,
    played,
    won,
    drawn,
    lost,
    goalsFor,
    goalsAgainst,
    goalDiff: goalsFor - goalsAgainst,
    winPercentage,
    competitionsBreakdown: scopedBreakdown.length > 0 ? scopedBreakdown : rival.competitionsBreakdown,
    matches: scopedMatches,
    allMatches: sourceMatches,
    firstMatchDate: scopedMatches[scopedMatches.length - 1]?.date,
    lastMatchDate: scopedMatches[0]?.date,
  };
}

/**
 * Filter rival summaries by scope and search query, recalculating contextual metrics when scoped.
 */
export function filterRivals(
  rivals: readonly RivalH2HSummary[],
  query: string,
  scope: RivalScopeFilter
): RivalH2HSummary[] {
  const trimmedQuery = query.trim();
  const result: RivalH2HSummary[] = [];

  for (const r of rivals) {
    // Search query matching by team name, province, community, or country (accent & case insensitive)
    if (trimmedQuery) {
      const matchName = matchesSearchQuery(r.name, trimmedQuery);
      const matchProvince = matchesSearchQuery(r.province, trimmedQuery);
      const matchCommunity = matchesSearchQuery(r.community, trimmedQuery);
      const matchCountry = matchesSearchQuery(r.country, trimmedQuery);
      if (!matchName && !matchProvince && !matchCommunity && !matchCountry) {
        continue;
      }
    }

    if (scope === "all") {
      result.push(r);
    } else {
      const scoped = computeScopedSummary(r, scope);
      if (scoped) {
        result.push(scoped);
      }
    }
  }

  return result;
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
