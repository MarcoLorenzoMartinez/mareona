import type { PlayerSeasonMatchLog } from "./fotmob-player-profile-types.ts";

export interface SportingTeamFixtureItem {
  readonly id: number;
  readonly status?: {
    readonly utcTime?: string;
    readonly finished?: boolean;
  };
  readonly tournament?: {
    readonly name?: string;
  };
  readonly home?: {
    readonly id?: number;
    readonly name?: string;
    readonly score?: number;
  };
  readonly away?: {
    readonly id?: number;
    readonly name?: string;
    readonly score?: number;
  };
}

const FOTMOB_SPORTING_ID = 9869;

/**
 * Merges official Sporting completed season fixtures with player match logs.
 * Unplayed matches are marked with playedInMatch: false and null rating.
 * Sorts all matches in ascending chronological order (oldest to newest).
 */
export function mergePlayerSeasonMatches(
  teamFixtures: readonly SportingTeamFixtureItem[],
  playerMatches: readonly PlayerSeasonMatchLog[]
): readonly PlayerSeasonMatchLog[] {
  const playerMap = new Map<number, PlayerSeasonMatchLog>();
  const playerDateMap = new Map<string, PlayerSeasonMatchLog>();
  for (const m of playerMatches) {
    playerMap.set(m.matchId, m);
    if (m.date) {
      playerDateMap.set(m.date.slice(0, 10), m);
    }
  }

  const finishedOfficialFixtures = teamFixtures.filter((f) => {
    const isFinished = Boolean(f.status?.finished);
    const time = f.status?.utcTime ?? "";
    const isSeason2627 = time >= "2026-08-01";
    const isNotFriendly = f.tournament?.name !== "Club Friendlies";
    return isFinished && isSeason2627 && isNotFriendly;
  });

  if (finishedOfficialFixtures.length === 0) {
    return [...playerMatches].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  const merged: PlayerSeasonMatchLog[] = finishedOfficialFixtures.map((f) => {
    const dateKey = (f.status?.utcTime ?? "").slice(0, 10);
    const existing = playerMap.get(f.id) ?? (dateKey ? playerDateMap.get(dateKey) : undefined);
    if (existing) {
      return existing;
    }

    const isHome =
      f.home?.id === FOTMOB_SPORTING_ID ||
      (f.home?.name ?? "").toLowerCase().includes("sporting");
    const homeScore = f.home?.score ?? 0;
    const awayScore = f.away?.score ?? 0;
    const teamScore = isHome ? homeScore : awayScore;
    const oppScore = isHome ? awayScore : homeScore;
    const result: "W" | "D" | "L" =
      teamScore > oppScore ? "W" : teamScore === oppScore ? "D" : "L";

    return {
      matchId: f.id,
      date: f.status?.utcTime ?? "",
      opponentName: (isHome ? f.away?.name : f.home?.name) ?? "Rival",
      opponentTeamId: (isHome ? f.away?.id : f.home?.id) ?? 0,
      isHome,
      homeScore,
      awayScore,
      result,
      minutesPlayed: 0,
      goals: 0,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
      rating: null,
      isTopRating: false,
      onBench: false,
      playedInMatch: false,
    };
  });

  return merged.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}
