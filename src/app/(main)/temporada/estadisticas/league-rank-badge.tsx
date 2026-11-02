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
export function LeagueRankBadge({ rank, className = "" }: LeagueRankBadgeProps) {
  if (rank === null || rank === undefined || rank <= 0) {
    return null;
  }

  const isPodium = rank <= 3;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-sans font-bold tabular-nums tracking-tight transition-colors ${
        isPodium
          ? "border border-red-200 bg-red-50 text-[#e2001a]"
          : "border border-neutral-200 bg-neutral-100 text-neutral-700"
      } ${className}`}
    >
      {rank}º en liga
    </span>
  );
}
