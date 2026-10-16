import type { HistoricalCoach } from "@/lib/historical/types";
import { PlayerPhoto } from "@/components/media/player-photo";

interface SeasonCoachesProps {
  readonly coaches: readonly HistoricalCoach[];
  readonly seasonLabel: string;
}

/**
 * Calculates win percentage or points efficiency for a coach record.
 */
function calculateWinRate(matches?: number, won?: number): string {
  if (!matches || matches <= 0 || won === undefined) return "—";
  const pct = Math.round((won / matches) * 100);
  return `${pct}%`;
}

/**
 * Official technical coaching staff roster and performance breakdown
 * displaying matches directed, won, drawn, lost, and win efficiency.
 */
export function HistoricalSeasonCoaches({ coaches, seasonLabel }: SeasonCoachesProps) {
  if (!coaches || coaches.length === 0) return null;

  return (
    <section
      aria-label={`Cuerpo técnico del Real Sporting ${seasonLabel}`}
      className="w-full rounded-xl border border-[var(--border)] bg-white p-4 sm:p-5 shadow-2xs"
    >
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
        <div>
          <span className="text-[11px] font-semibold tracking-wider text-[var(--foreground-muted)] uppercase">
            Banquillo
          </span>
          <h3 className="text-base font-bold text-[var(--foreground)]">Cuerpo Técnico</h3>
        </div>
        <span className="rounded-full bg-[var(--surface)] px-2.5 py-0.5 text-xs font-semibold text-[var(--foreground-muted)] border border-[var(--border)] tabular-nums">
          {coaches.length} {coaches.length === 1 ? "entrenador" : "entrenadores"}
        </span>
      </div>

      <div className="overflow-x-auto mt-2">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-xs font-semibold text-[var(--foreground-muted)] uppercase select-none">
              <th scope="col" className="py-2.5 pl-2 pr-3">
                Entrenador
              </th>
              <th scope="col" className="py-2.5 px-2 text-center hidden sm:table-cell">
                Etapa / Jornadas
              </th>
              <th scope="col" className="w-14 py-2.5 text-center font-bold">
                PJ
              </th>
              <th scope="col" className="w-14 py-2.5 text-center font-bold text-emerald-700">
                PG
              </th>
              <th scope="col" className="w-14 py-2.5 text-center font-bold text-neutral-600">
                PE
              </th>
              <th scope="col" className="w-14 py-2.5 text-center font-bold text-neutral-500">
                PP
              </th>
              <th scope="col" className="w-16 py-2.5 pr-2 text-right font-black">
                % Vict.
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {coaches.map((coach) => (
              <tr
                key={`${coach.fullName}-${coach.rounds ?? coach.matches}`}
                className="hover:bg-[var(--surface)] transition-colors text-sm"
              >
                <td className="py-2.5 pl-2 pr-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <PlayerPhoto
                      photoUrl={coach.photoUrl}
                      playerName={coach.fullName}
                      size="sm"
                      className="h-8 w-8 rounded-full border border-[var(--border)] object-cover object-top shrink-0 bg-neutral-100"
                    />
                    <div className="min-w-0">
                      <span className="font-bold text-[var(--foreground)] block truncate">{coach.alias}</span>
                      <span className="text-[11px] text-[var(--foreground-muted)] block truncate">{coach.fullName}</span>
                    </div>
                  </div>
                </td>
                <td className="py-2.5 px-2 text-center hidden sm:table-cell">
                  {coach.rounds ? (
                    <span className="rounded-full bg-[var(--surface)] px-2.5 py-0.5 text-[11px] font-semibold text-neutral-700 border border-[var(--border)] tabular-nums">
                      {coach.rounds}
                    </span>
                  ) : (
                    <span className="text-xs text-[var(--foreground-muted)]">Temporada completa</span>
                  )}
                </td>
                <td className="py-2.5 text-center tabular-nums font-bold text-[var(--foreground)]">
                  {coach.matches ?? "—"}
                </td>
                <td className="py-2.5 text-center tabular-nums font-bold text-emerald-700">
                  {coach.won !== undefined ? coach.won : "—"}
                </td>
                <td className="py-2.5 text-center tabular-nums font-semibold text-neutral-600">
                  {coach.drawn !== undefined ? coach.drawn : "—"}
                </td>
                <td className="py-2.5 text-center tabular-nums font-semibold text-neutral-500">
                  {coach.lost !== undefined ? coach.lost : "—"}
                </td>
                <td className="py-2.5 pr-2 text-right tabular-nums font-black text-sm text-[var(--foreground)]">
                  {calculateWinRate(coach.matches, coach.won)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
