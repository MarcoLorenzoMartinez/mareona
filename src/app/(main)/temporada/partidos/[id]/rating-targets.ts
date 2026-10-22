import type { RatingTarget } from "./match-player-rating-row";
import type {
  DomainMatchDetail,
  DomainLineupPlayer,
  DomainTacticalStarter,
} from "@/lib/sports-api/types";

export type { RatingTarget };

export interface MatchRatingGroupedTargets {
  readonly starters: readonly RatingTarget[];
  readonly substitutes: readonly RatingTarget[];
  readonly coach: RatingTarget;
}

function getFallbackPositionRank(p: DomainLineupPlayer): number {
  const sub = (p.subposition ?? "").toUpperCase();
  const pos = p.position;

  // 1. Portero
  if (pos === "goalkeeper" || sub.includes("POR") || sub.includes("GK")) return 100;

  // 2. Defensas (de derecha a izquierda)
  if (sub.includes("LD") || sub.includes("RB") || sub.includes("RWB")) return 210;
  if (sub.includes("DFC") || sub.includes("CB")) {
    if (sub.includes("R") || sub.includes("D")) return 220;
    if (sub.includes("L") || sub.includes("I")) return 240;
    return 230;
  }
  if (sub.includes("LI") || sub.includes("LB") || sub.includes("LWB")) return 250;
  if (pos === "defender") return 230;

  // 3. Centrocampistas (de derecha a izquierda)
  if (sub.includes("MD") || sub.includes("RM") || sub.includes("RW")) return 310;
  if (sub.includes("MCD") || sub.includes("DM")) return 320;
  if (sub.includes("MC") || sub.includes("CM")) return 330;
  if (sub.includes("MP") || sub.includes("AM") || sub.includes("CAM")) return 340;
  if (sub.includes("MI") || sub.includes("LM") || sub.includes("LW")) return 350;
  if (pos === "midfielder") return 330;

  // 4. Delanteros (de derecha a izquierda)
  if (sub.includes("ED") || sub.includes("RF")) return 410;
  if (sub.includes("DC") || sub.includes("CF") || sub.includes("ST")) return 420;
  if (sub.includes("EI") || sub.includes("LF")) return 430;
  if (pos === "forward") return 420;

  return 500;
}

function calculateStarterSortKey(
  player: DomainLineupPlayer,
  tacticalStarters: readonly DomainTacticalStarter[] | undefined
): number {
  if (tacticalStarters && tacticalStarters.length > 0) {
    const matched = tacticalStarters.find(
      (ts) =>
        (player.jersey !== null && String(ts.shirtNumber) === String(player.jersey)) ||
        ts.name.toLowerCase() === player.name.toLowerCase() ||
        String(ts.id) === player.id
    );

    if (matched && typeof matched.x === "number" && typeof matched.y === "number") {
      let bucket = 400;
      if (matched.y < 0.18) bucket = 100;
      else if (matched.y < 0.40) bucket = 200;
      else if (matched.y < 0.70) bucket = 300;

      // x va de 0.15 (derecha) a 0.85 (izquierda)
      return bucket + matched.x * 50;
    }
  }

  return getFallbackPositionRank(player);
}

/**
 * Builds the structured rating targets for starters, substitutes, and coaching staff.
 * Starters are sorted tactically from Goalkeeper to Forwards, and within each line from Right to Left.
 *
 * @param match Domain match detail object containing lineups and statistics.
 * @returns Grouped targets ready for scoring display.
 */
export function buildMatchRatingTargets(
  match: DomainMatchDetail
): MatchRatingGroupedTargets {
  const isHomeSporting = Boolean(match.homeLineup?.isSporting);
  const sportingLineup = isHomeSporting
    ? match.homeLineup
    : match.awayLineup?.isSporting
    ? match.awayLineup
    : null;

  const sportingTactical = isHomeSporting
    ? match.advancedStats?.tacticalLineups?.home
    : match.awayLineup?.isSporting
    ? match.advancedStats?.tacticalLineups?.away
    : null;

  const playerStatsMap = match.advancedStats?.playerStats;

  const coach: RatingTarget = {
    id: "coach-sporting",
    name: "Cuerpo Técnico",
    role: "coach",
    averageRating: 6.8,
  };

  const rawStarters = sportingLineup?.starters ?? [];
  const tacticalStarters = sportingTactical?.starters;

  const sortedStarters = [...rawStarters].sort((a, b) => {
    const keyA = calculateStarterSortKey(a, tacticalStarters);
    const keyB = calculateStarterSortKey(b, tacticalStarters);
    return keyA - keyB;
  });

  const starters: RatingTarget[] = sortedStarters.map((p) => {
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

  const rawSubstitutes = (sportingLineup?.substitutes ?? [])
    .filter((p) => p.subbedIn || playerStatsMap?.[p.id]);

  const sortedSubstitutes = [...rawSubstitutes].sort((a, b) => {
    return getFallbackPositionRank(a) - getFallbackPositionRank(b);
  });

  const substitutes: RatingTarget[] = sortedSubstitutes.map((p) => {
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
