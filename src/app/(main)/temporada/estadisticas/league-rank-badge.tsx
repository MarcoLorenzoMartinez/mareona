import React from "react";

interface LeagueRankBadgeProps {
  readonly rank: number | null | undefined;
  readonly className?: string;
}

/**
 * Clean, modern editorial badge indicating a team's statistical ranking within the league.
 * Highlights podium positions (1st, 2nd, 3rd) in subtle Sporting brand tones.
 * Follows AGENTS.md rules 2, 3, 5, 8, and 9 (zero mono font, tabular nums, capsule aesthetic).
 */
/**
 * Visual styling rules for league statistical ranking:
 * - 1st (Oro): Warm metallic gold tone
 * - 2nd (Plata): Crisp silver platinum tone
 * - 3rd (Bronce): Warm bronze tone
 * - 4th+: Branded Sporting soft-red tone with noticeable presence
 */
function getRankStyle(rank: number): string {
  if (rank === 1) {
    // Oro
    return "border border-amber-300 bg-amber-50 text-amber-900 font-bold";
  }
  if (rank === 2) {
    // Plata
    return "border border-slate-300 bg-slate-100 text-slate-800 font-bold";
  }
  if (rank === 3) {
    // Bronce
    return "border border-orange-300 bg-orange-50 text-orange-950 font-bold";
  }
  // 4º en adelante: Rojo Sporting sutil pero claramente perceptible
  return "border border-red-200 bg-red-100/70 text-[#9b0012] font-semibold";
}

export function LeagueRankBadge({ rank, className = "" }: LeagueRankBadgeProps) {
  if (rank === null || rank === undefined || rank <= 0) {
    return null;
  }

  const rankStyle = getRankStyle(rank);

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-sans tabular-nums tracking-tight transition-colors ${rankStyle} ${className}`}
    >
      {rank}º en liga
    </span>
  );
}
