import React from "react";

interface LeagueRankBadgeProps {
  readonly rank: number | null | undefined;
  /** When true, lower volume (e.g. fewer fouls/cards) represents better performance */
  readonly invertPolarity?: boolean;
  readonly className?: string;
}

/**
 * Visual chromatic scale for league rankings (22 teams in LaLiga Hypermotion):
 * - 1st (Oro): Luminous warm gold with subtle amber ring
 * - 2nd (Plata): Crisp metallic silver-platinum tone
 * - 3rd (Bronce): Deep warm metallic bronze tone
 * - 4th – 7th (Zona Alta / Playoff): Defined emerald green indicating strong performance
 * - 8th – 14th (Zona Media): Clean neutral slate tone
 * - 15th – 22nd (Zona Baja): Clear soft red tone indicating room for improvement
 */
function getRankStyle(effectiveRank: number): string {
  if (effectiveRank === 1) {
    // 1º Oro exclusivo
    return "border border-amber-400 bg-amber-100/90 text-amber-950 font-black shadow-2xs";
  }
  if (effectiveRank === 2) {
    // 2º Plata exclusiva
    return "border border-slate-300 bg-slate-200/90 text-slate-900 font-black shadow-2xs";
  }
  if (effectiveRank === 3) {
    // 3º Bronce exclusivo
    return "border border-amber-600/50 bg-amber-100 text-amber-950 font-black shadow-2xs";
  }
  if (effectiveRank <= 7) {
    // 4º - 7º Zona alta / Playoff
    return "border border-emerald-300 bg-emerald-100/80 text-emerald-900 font-bold";
  }
  if (effectiveRank <= 14) {
    // 8º - 14º Zona media
    return "border border-neutral-300 bg-neutral-100 text-neutral-800 font-bold";
  }
  // 15º - 22º Zona baja
  return "border border-red-300 bg-red-100/80 text-red-900 font-bold";
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
