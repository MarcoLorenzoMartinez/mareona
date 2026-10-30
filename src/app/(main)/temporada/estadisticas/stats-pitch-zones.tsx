import type { TeamSeasonStats } from "@/lib/sports-api/team-season-types";

interface StatsPitchZonesProps {
  readonly stats: TeamSeasonStats;
}

export function StatsPitchZones({ stats }: StatsPitchZonesProps) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-white p-5 shadow-2xs">
      <div>
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">
            Presencia y Recuperación en el Campo
          </h2>
          <span className="rounded-full bg-[var(--surface)] px-2.5 py-0.5 text-[10px] font-bold text-[var(--foreground)] border border-[var(--border)]">
            Táctico
          </span>
        </div>

        {/* Tactical Pitch Illustration */}
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-emerald-800 bg-[#2d6a4f] shadow-inner">
          {/* Pitch Lines */}
          <div className="absolute inset-2 border border-white/30 rounded" />
          <div className="absolute inset-y-2 left-1/2 w-px bg-white/30 -translate-x-1/2" />
          <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30" />
          <div className="absolute left-2 top-1/2 h-20 w-10 -translate-y-1/2 border border-white/30 border-l-0" />
          <div className="absolute right-2 top-1/2 h-20 w-10 -translate-y-1/2 border border-white/30 border-r-0" />

          {/* Tactical 3 Zones Overlay */}
          <div className="absolute inset-0 grid grid-cols-3 text-white text-center">
            {/* Defensive Third */}
            <div className="flex flex-col items-center justify-center p-2 bg-emerald-900/30 border-r border-white/10">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-200">
                Propio Campo
              </span>
              <span className="text-base sm:text-lg font-black font-sans tabular-nums mt-1">
                {stats.clearancesPerMatch.toFixed(0)}
              </span>
              <span className="text-[9px] text-emerald-100">Despejes/partido</span>
            </div>

            {/* Middle Third */}
            <div className="flex flex-col items-center justify-center p-2 bg-emerald-900/10 border-r border-white/10">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-200">
                Creación
              </span>
              <span className="text-base sm:text-lg font-black font-sans tabular-nums mt-1">
                {stats.accuratePassesPerMatch.toFixed(0)}
              </span>
              <span className="text-[9px] text-emerald-100">Pases precisos/p.</span>
            </div>

            {/* Attacking Third */}
            <div className="flex flex-col items-center justify-center p-2 bg-emerald-900/40">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-200">
                Área Rival
              </span>
              <span className="text-base sm:text-lg font-black font-sans tabular-nums mt-1">
                {stats.touchesInOppBox}
              </span>
              <span className="text-[9px] text-emerald-100">Toques en el área</span>
            </div>
          </div>
        </div>
      </div>

      {/* Highlights footer */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-xl bg-[var(--surface)] p-2.5">
          <span className="block text-[10px] font-bold text-[var(--foreground-muted)] uppercase">
            Presión Alta
          </span>
          <span className="text-sm font-black text-[var(--foreground)] font-sans tabular-nums">
            {stats.possessionWonAttackingThirdPerMatch.toFixed(1)} robos/partido
          </span>
          <span className="text-[10px] text-[var(--foreground-muted)]">en último tercio</span>
        </div>

        <div className="rounded-xl bg-[var(--surface)] p-2.5">
          <span className="block text-[10px] font-bold text-[var(--foreground-muted)] uppercase">
            Centros al Área
          </span>
          <span className="text-sm font-black text-[var(--foreground)] font-sans tabular-nums">
            {stats.accurateCrossesPerMatch.toFixed(1)} precisos/p.
          </span>
          <span className="text-[10px] text-[var(--foreground-muted)]">
            {stats.accurateCrossesRank ? `#${stats.accurateCrossesRank} en la liga` : "con éxito"}
          </span>
        </div>
      </div>
    </div>
  );
}
