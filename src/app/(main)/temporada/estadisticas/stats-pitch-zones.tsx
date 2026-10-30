import type { TeamSeasonStats } from "@/lib/sports-api/team-season-types";

interface StatsPitchZonesProps {
  readonly stats: TeamSeasonStats;
}

export function StatsPitchZones({ stats }: StatsPitchZonesProps) {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-[var(--border)] bg-white p-5 shadow-2xs">
      <div>
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
            Distribución Táctica en el Campo
          </h2>
          <span className="text-xs font-semibold text-[var(--foreground-muted)]">
            Medias por partido
          </span>
        </div>

        {/* Tactical Pitch Illustration */}
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-emerald-900/40 bg-[#1e5a3c] shadow-xs">
          {/* Pitch Lines */}
          <div className="absolute inset-2 border border-white/20 rounded" />
          <div className="absolute inset-y-2 left-1/2 w-px bg-white/20 -translate-x-1/2" />
          <div className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />
          <div className="absolute left-2 top-1/2 h-16 w-8 -translate-y-1/2 border border-white/20 border-l-0" />
          <div className="absolute right-2 top-1/2 h-16 w-8 -translate-y-1/2 border border-white/20 border-r-0" />

          {/* Tactical 3 Zones Overlay */}
          <div className="absolute inset-0 grid grid-cols-3 text-white text-center">
            {/* Defensive Third */}
            <div className="flex flex-col items-center justify-center p-2 bg-emerald-950/20 border-r border-white/10">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-300">
                Campo Propio
              </span>
              <span className="text-lg font-black font-sans tabular-nums mt-0.5">
                {stats.clearancesPerMatch.toFixed(0)}
              </span>
              <span className="text-[10px] text-emerald-200">despejes</span>
            </div>

            {/* Middle Third */}
            <div className="flex flex-col items-center justify-center p-2 border-r border-white/10">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-300">
                Construcción
              </span>
              <span className="text-lg font-black font-sans tabular-nums mt-0.5">
                {stats.accuratePassesPerMatch.toFixed(0)}
              </span>
              <span className="text-[10px] text-emerald-200">pases precisos</span>
            </div>

            {/* Attacking Third */}
            <div className="flex flex-col items-center justify-center p-2 bg-emerald-950/20">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-300">
                Área Rival
              </span>
              <span className="text-lg font-black font-sans tabular-nums mt-0.5">
                {stats.touchesInOppBox}
              </span>
              <span className="text-[10px] text-emerald-200">toques en área</span>
            </div>
          </div>
        </div>
      </div>

      {/* Highlights footer */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg bg-[var(--surface)] p-2.5">
          <span className="block text-[10px] font-bold text-[var(--foreground-muted)] uppercase">
            Presión en Último Tercio
          </span>
          <span className="text-sm font-bold text-[var(--foreground)] font-sans tabular-nums">
            {stats.possessionWonAttackingThirdPerMatch.toFixed(1)} robos/partido
          </span>
        </div>

        <div className="rounded-lg bg-[var(--surface)] p-2.5">
          <span className="block text-[10px] font-bold text-[var(--foreground-muted)] uppercase">
            Centros al Área
          </span>
          <span className="text-sm font-bold text-[var(--foreground)] font-sans tabular-nums">
            {stats.accurateCrossesPerMatch.toFixed(1)} con éxito/partido
          </span>
        </div>
      </div>
    </div>
  );
}
