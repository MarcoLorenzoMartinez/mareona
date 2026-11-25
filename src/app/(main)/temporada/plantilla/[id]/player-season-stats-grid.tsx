import type { PlayerProfileStatGroup } from "@/lib/sports-api/fotmob-player-profile-types";

interface PlayerSeasonStatsGridProps {
  readonly statsGroups: readonly PlayerProfileStatGroup[];
  readonly matchesPlayed: number;
  readonly minutesPlayed: number;
  readonly averageRating: number | null;
}

export function PlayerSeasonStatsGrid({
  statsGroups,
  matchesPlayed,
  minutesPlayed,
  averageRating,
}: PlayerSeasonStatsGridProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Tarjetas resumen superior de impacto */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-4 text-center shadow-xs">
          <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
            Partidos
          </div>
          <div className="mt-1 text-2xl font-black text-neutral-900 tabular-nums">
            {matchesPlayed}
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-white p-4 text-center shadow-xs">
          <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
            Minutos
          </div>
          <div className="mt-1 text-2xl font-black text-neutral-900 tabular-nums">
            {minutesPlayed}&apos;
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-white p-4 text-center shadow-xs">
          <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
            Nota media
          </div>
          <div className="mt-1 text-2xl font-black text-[var(--primary)] tabular-nums">
            {averageRating !== null ? averageRating.toFixed(2) : "—"}
          </div>
        </div>
      </div>

      {/* Desglose estadístico por categorías */}
      {statsGroups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {statsGroups.map((group) => (
            <div
              key={group.title}
              className="flex flex-col rounded-3xl border border-[var(--border)] bg-white p-5 shadow-xs"
            >
              <h3 className="text-xs font-black uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-3">
                {group.title}
              </h3>

              <div className="flex flex-col divide-y divide-neutral-100 pt-1">
                {group.items.map((stat) => (
                  <div
                    key={stat.title}
                    className="flex items-center justify-between py-2.5 text-xs"
                  >
                    <span className="font-medium text-neutral-600">
                      {stat.title}
                    </span>

                    <div className="flex items-baseline gap-2 text-right">
                      <span className="font-black text-neutral-900 tabular-nums">
                        {stat.statValue}
                      </span>
                      <span
                        aria-hidden={stat.per90 <= 0 ? true : undefined}
                        className="w-16 shrink-0 whitespace-nowrap text-right text-[10px] font-semibold text-neutral-400 tabular-nums"
                      >
                        {stat.per90 > 0 ? `(${stat.per90} /90')` : ""}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-white p-8 text-center text-xs text-neutral-400">
          No se dispone de desglose estadístico acumulado para este jugador en la temporada actual.
        </div>
      )}
    </div>
  );
}
