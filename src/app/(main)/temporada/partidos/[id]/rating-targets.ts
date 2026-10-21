import type { RatingTarget } from "./match-player-rating-row";
import type { DomainMatchDetail } from "@/lib/sports-api/types";

export type { RatingTarget };

export interface MatchRatingGroupedTargets {
  readonly starters: readonly RatingTarget[];
  readonly substitutes: readonly RatingTarget[];
  readonly coach: RatingTarget;
}

/**
 * Builds the structured rating targets for starters, substitutes, and coaching staff.
 *
 * @param match Domain match detail object containing lineups and statistics.
 * @returns Grouped targets ready for scoring display.
 */
export function buildMatchRatingTargets(
  match: DomainMatchDetail
): MatchRatingGroupedTargets {
  const sportingLineup = match.homeLineup?.isSporting
    ? match.homeLineup
    : match.awayLineup?.isSporting
    ? match.awayLineup
    : null;

  const playerStatsMap = match.advancedStats?.playerStats;

  const coach: RatingTarget = {
    id: "coach-sporting",
    name: "Cuerpo Técnico",
    role: "coach",
    averageRating: 6.8,
  };

  const starters: RatingTarget[] = (sportingLineup?.starters ?? []).map((p) => {
    const stats = playerStatsMap?.[p.id];
    return {
      id: p.id,
      name: p.name,
      role: "player",
      jersey: p.jersey,
      photoUrl: p.photoUrl,
      averageRating: stats?.rating ?? 6.5,
    };
  });

  const substitutes: RatingTarget[] = (sportingLineup?.substitutes ?? [])
    .filter((p) => p.subbedIn || playerStatsMap?.[p.id])
    .map((p) => {
      const stats = playerStatsMap?.[p.id];
      return {
        id: p.id,
        name: p.name,
        role: "player",
        jersey: p.jersey,
        photoUrl: p.photoUrl,
        averageRating: stats?.rating ?? 6.0,
      };
    });

  return { starters, substitutes, coach };
}
