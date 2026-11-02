import React from "react";

interface LeagueRankBadgeProps {
  readonly rank: number | null | undefined;
  /** When true, lower volume (e.g. fewer fouls/cards) represents better performance */
  readonly invertPolarity?: boolean;
  readonly className?: string;
}

/**
 * Visual chromatic scale for league rankings (22 teams in LaLiga Hypermotion):
 * - 1st (Oro): Warm metallic gold tone
 * - 2nd (Plata): Crisp silver platinum tone
 * - 3rd (Bronce): Warm bronze tone
 * - 4th – 7th (Zona Alta / Playoff): Soft emerald green indicating strong performance
 * - 8th – 14th (Zona Media): Clean neutral slate tone
 * - 15th – 22nd (Zona Baja): Soft red tone indicating room for improvement
 */
function getRankStyle(effectiveRank: number): string {
  if (effectiveRank === 1) {
    // 1º Oro
    return "border border-amber-300 bg-amber-50 text-amber-900 font-bold";
  }
  if (effectiveRank === 2) {
    // 2º Plata
    return "border border-slate-300 bg-slate-100 text-slate-800 font-bold";
  }
  if (effectiveRank === 3) {
    // 3º Bronce
    return "border border-orange-300 bg-orange-50 text-orange-950 font-bold";
  }
  if (effectiveRank <= 7) {
    // 4º - 7º Zona alta / Élite
    return "border border-emerald-300 bg-emerald-50 text-emerald-800 font-bold";
  }
  if (effectiveRank <= 14) {
    // 8º - 14º Zona media
    return "border border-neutral-200 bg-neutral-100 text-neutral-700 font-semibold";
  }
  // 15º - 22º Zona baja
  return "border border-red-200 bg-red-50 text-[#9b0012] font-semibold";
}

export function LeagueRankBadge({ rank, invertPolarity = false, className = "" }: LeagueRankBadgeProps) {
  if (rank === null || rank === undefined || rank <= 0) {
    return null;
  }

  // En una liga de 22 equipos, para métricas donde menos es mejor (faltas, tarjetas),
  // el mérito deportivo (color) se calcula respecto a los menos infractores (23 - rank).
  const effectiveRankForColor = invertPolarity ? Math.max(1, 23 - rank) : rank;
  const rankStyle = getRankStyle(effectiveRankForColor);

  return (
    <span
      className={`inline-flex items-center justify-center min-w-[34px] rounded-full px-1.5 py-0.5 text-[11px] font-sans tabular-nums tracking-tight transition-colors ${rankStyle} ${className}`}
    >
      {rank}.º
    </span>
  );
}
