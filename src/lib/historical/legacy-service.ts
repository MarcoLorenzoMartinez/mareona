import rawSquads from "../../data/historical/squads.json" with { type: "json" };
import seasonsData from "../../data/historical/seasons.json" with { type: "json" };
import legendsData from "../../data/historical/legends.json" with { type: "json" };
import type {
  CoachRecord,
  IndividualAward,
  LegacyPlayerRecord,
  LegendProfile,
  TempleMilestone,
} from "./legacy-types";

interface RawPlayer {
  readonly alias?: string;
  readonly name?: string;
  readonly fullName?: string;
  readonly position?: string;
  readonly played?: number;
  readonly goals?: number;
  readonly minutes?: number;
  readonly photoUrl?: string | null;
}

interface RawSeason {
  readonly id: string;
  readonly label: string;
  readonly played: number;
  readonly coach?: string;
}

/**
 * Computes all-time player rankings by appearances (matches played).
 */
export function getTopAppearancesPlayers(limit = 20): LegacyPlayerRecord[] {
  const aggregated = aggregateAllPlayers();
  aggregated.sort((a, b) => b.totalPlayed - a.totalPlayed);

  return aggregated.slice(0, limit).map((p, index) => ({
    ...p,
    rank: index + 1,
  }));
}

/**
 * Computes all-time player rankings by goals scored.
 */
export function getTopScorersPlayers(limit = 20): LegacyPlayerRecord[] {
  const aggregated = aggregateAllPlayers();
  aggregated.sort((a, b) => b.totalGoals - a.totalGoals);

  return aggregated.slice(0, limit).map((p, index) => ({
    ...p,
    rank: index + 1,
  }));
}

/**
 * Computes all-time player rankings by number of seasons in the first team.
 */
export function getTopSeasonsPlayers(limit = 20): LegacyPlayerRecord[] {
  const aggregated = aggregateAllPlayers();
  aggregated.sort((a, b) => b.seasonCount - a.seasonCount);

  return aggregated.slice(0, limit).map((p, index) => ({
    ...p,
    rank: index + 1,
  }));
}

/**
 * Returns all verified individual awards (Pichichis, Zamoras).
 */
export function getIndividualAwards(): IndividualAward[] {
  return legendsData.awards as unknown as IndividualAward[];
}

/**
 * Returns historical milestones of El Molinón and Mareo.
 */
export function getTempleMilestones(): TempleMilestone[] {
  const list = legendsData.templeMilestones as unknown as TempleMilestone[];
  return [...list].sort((a, b) => a.year - b.year);
}

/**
 * Returns verified legendary profiles for the Legends Wall.
 */
export function getLegendProfiles(): LegendProfile[] {
  return legendsData.legends as unknown as LegendProfile[];
}

/**
 * Computes all-time coaches ranking by seasons and matches directed.
 */
export function getTopCoaches(limit = 15): CoachRecord[] {
  const coachMap = new Map<string, { seasons: string[]; games: number; photoUrl?: string }>();

  for (const s of seasonsData as RawSeason[]) {
    if (!s.coach) continue;
    const names = s.coach.split("/").map((n) => n.trim());
    for (const name of names) {
      if (!name) continue;
      const existing = coachMap.get(name) ?? { seasons: [], games: 0 };
      existing.seasons.push(s.label);
      existing.games += Math.round(s.played / names.length);
      coachMap.set(name, existing);
    }
  }

  const list: CoachRecord[] = Array.from(coachMap.entries()).map(([name, data]) => ({
    rank: 0,
    name,
    seasonsCount: data.seasons.length,
    seasonsList: data.seasons,
  }));

  list.sort((a, b) => b.seasonsCount - a.seasonsCount);

  return list.slice(0, limit).map((c, idx) => ({
    ...c,
    rank: idx + 1,
  }));
}

/**
 * Helper: aggregates 900+ players from squads.json.
 */
function aggregateAllPlayers(): Omit<LegacyPlayerRecord, "rank">[] {
  const playerMap = new Map<string, {
    name: string;
    fullName: string;
    position: string;
    photoUrl: string | null;
    totalPlayed: number;
    totalGoals: number;
    totalMinutes: number;
    seasons: Set<string>;
  }>();

  const squadsRecord = rawSquads as unknown as Record<string, { players?: readonly RawPlayer[] } | readonly RawPlayer[]>;

  for (const [season, squad] of Object.entries(squadsRecord)) {
    const list = Array.isArray(squad)
      ? squad
      : "players" in squad && Array.isArray(squad.players)
      ? squad.players
      : [];
    if (!Array.isArray(list) || list.length === 0) continue;

    for (const p of list) {
      const alias = p.alias || p.name || p.fullName;
      if (!alias) continue;

      // Unique player key
      const key = (p.fullName || alias).toLowerCase();

      const existing = playerMap.get(key) ?? {
        name: alias,
        fullName: p.fullName || alias,
        position: p.position || "Jugador",
        photoUrl: p.photoUrl || null,
        totalPlayed: 0,
        totalGoals: 0,
        totalMinutes: 0,
        seasons: new Set<string>(),
      };

      existing.totalPlayed += p.played || 0;
      existing.totalGoals += p.goals || 0;
      existing.totalMinutes += p.minutes || 0;
      existing.seasons.add(season);

      if (p.photoUrl && !existing.photoUrl) existing.photoUrl = p.photoUrl;
      if (p.position && existing.position === "Jugador") existing.position = p.position;

      playerMap.set(key, existing);
    }
  }

  return Array.from(playerMap.values()).map((p) => {
    const seasonsList = Array.from(p.seasons).sort((a, b) => a.localeCompare(b));
    return {
      name: p.name,
      fullName: p.fullName,
      position: p.position,
      photoUrl: p.photoUrl,
      totalPlayed: p.totalPlayed,
      totalGoals: p.totalGoals,
      totalMinutes: p.totalMinutes,
      seasonCount: p.seasons.size,
      startSeason: seasonsList[0] ?? "",
      endSeason: seasonsList[seasonsList.length - 1] ?? "",
      seasonsList,
    };
  });
}
