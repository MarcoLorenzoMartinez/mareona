import type { RivalH2HSummary, RivalScopeFilter, RivalSortOption } from "./rivals-types";

function matchesSearchQuery(text: string | undefined | null, query: string): boolean {
  if (!text) return false;
  const normText = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const normQuery = query.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  return normText.includes(normQuery);
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
 * Uses `competitionsBreakdown` when `matches` were stripped for lightweight RSC payloads.
 */
export function computeScopedSummary(
  rival: RivalH2HSummary,
  scope: RivalScopeFilter
): RivalH2HSummary | null {
  if (scope === "all") return rival;

  const sourceMatches = rival.allMatches && rival.allMatches.length > 0 ? rival.allMatches : rival.matches;
  const scopedBreakdown = rival.competitionsBreakdown.filter((c) => isMatchInScope(c.competition, scope));

  if (sourceMatches.length === 0) {
    if (scopedBreakdown.length === 0) return null;
    const played = scopedBreakdown.reduce((s, c) => s + c.played, 0);
    if (played === 0) return null;
    const won = scopedBreakdown.reduce((s, c) => s + c.won, 0);
    const drawn = scopedBreakdown.reduce((s, c) => s + c.drawn, 0);
    const lost = scopedBreakdown.reduce((s, c) => s + c.lost, 0);
    const goalsFor = scopedBreakdown.reduce((s, c) => s + c.goalsFor, 0);
    const goalsAgainst = scopedBreakdown.reduce((s, c) => s + c.goalsAgainst, 0);
    return {
      ...rival,
      played,
      won,
      drawn,
      lost,
      goalsFor,
      goalsAgainst,
      goalDiff: goalsFor - goalsAgainst,
      winPercentage: Math.round((won / played) * 100),
      competitionsBreakdown: scopedBreakdown,
      matches: [],
    };
  }

  const scopedMatches = sourceMatches.filter((m) => isMatchInScope(m.competition, scope));
  if (scopedMatches.length === 0) return null;

  let won = 0;
  let drawn = 0;
  let lost = 0;
  let goalsFor = 0;
  let goalsAgainst = 0;

  for (const m of scopedMatches) {
    if (m.outcome === "V") won++;
    else if (m.outcome === "E") drawn++;
    else if (m.outcome === "D") lost++;
    goalsFor += m.isHome ? (m.homeScore ?? 0) : (m.awayScore ?? 0);
    goalsAgainst += m.isHome ? (m.awayScore ?? 0) : (m.homeScore ?? 0);
  }

  const played = scopedMatches.length;
  return {
    ...rival,
    played,
    won,
    drawn,
    lost,
    goalsFor,
    goalsAgainst,
    goalDiff: goalsFor - goalsAgainst,
    winPercentage: played > 0 ? Math.round((won / played) * 100) : 0,
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
    if (trimmedQuery) {
      const hit =
        matchesSearchQuery(r.name, trimmedQuery) ||
        matchesSearchQuery(r.province, trimmedQuery) ||
        matchesSearchQuery(r.community, trimmedQuery) ||
        matchesSearchQuery(r.country, trimmedQuery);
      if (!hit) continue;
    }

    if (scope === "all") {
      result.push(r);
    } else {
      const scoped = computeScopedSummary(r, scope);
      if (scoped) result.push(scoped);
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
