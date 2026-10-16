import type { HistoricalCoach, HistoricalTopScorer, HistoricalPlayer } from "@/lib/historical/types";

interface SeasonLeadersProps {
  readonly coaches: readonly HistoricalCoach[];
  readonly topScorers: readonly HistoricalTopScorer[];
  readonly assists: readonly { readonly name: string; readonly assists: number; readonly played: number }[];
  readonly players: readonly HistoricalPlayer[];
  readonly seasonLabel: string;
}

function StatRow({ rank, name, value, sub }: { rank: number; name: string; value: string | number; sub: string; color?: string }) {
  return (
    <div className="flex items-center justify-between text-xs py-1 border-b border-[var(--border)] last:border-0">
      <div className="flex items-center gap-2 min-w-0 pr-2">
        <span className="font-bold text-[11px] text-[var(--foreground-muted)] tabular-nums w-3.5">{rank}.</span>
        <span className="font-semibold text-[var(--foreground)] truncate">{name}</span>
      </div>
      <div className="flex items-baseline gap-1 shrink-0 tabular-nums">
        <span className="font-black text-sm text-[var(--foreground)]">{value}</span>
        <span className="text-[10px] text-[var(--foreground-muted)]">{sub}</span>
      </div>
    </div>
  );
}

/**
 * Modern minimalist card showcasing technical staff, top goalscorers,
 * and key assist or appearance leaders for Real Sporting in a chosen season.
 */
export function HistoricalSeasonLeaders({
  coaches,
  topScorers,
  assists,
  players,
  seasonLabel,
}: SeasonLeadersProps) {
  const appearances = [...players].sort((a, b) => b.played - a.played || b.minutes - a.minutes).slice(0, 4);
  const hasAssists = assists.length > 0;

  return (
    <section aria-label={`Líderes y cuerpo técnico del Real Sporting ${seasonLabel}`} className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 1. Dirección Técnica */}
      <div className="rounded-xl border border-[var(--border)] bg-white p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
        <div>
          <span className="text-[11px] font-semibold tracking-wider text-[var(--foreground-muted)] uppercase">Banquillo</span>
          <h4 className="mt-1 text-sm font-bold text-[var(--foreground)]">Dirección Técnica</h4>
        </div>
        <div className="mt-3 flex flex-col gap-2">
          {coaches.map((c) => (
            <div key={c.fullName} className="flex items-center justify-between rounded-lg bg-[var(--surface)] px-3 py-1.5 text-xs">
              <span className="font-bold text-[var(--foreground)] truncate">{c.alias}</span>
              {c.matches !== undefined && (
                <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-[var(--foreground-muted)] border border-[var(--border)] tabular-nums">
                  {c.matches} PJ
                </span>
              )}
            </div>
          ))}
          {coaches.length === 0 && <span className="text-xs text-[var(--foreground-muted)]">Sin registro oficial</span>}
        </div>
      </div>

      {/* 2. Máximos Goleadores */}
      <div className="rounded-xl border border-[var(--border)] bg-white p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
        <div>
          <span className="text-[11px] font-semibold tracking-wider text-[var(--foreground-muted)] uppercase">Anotadores</span>
          <h4 className="mt-1 text-sm font-bold text-[var(--foreground)]">Máximos Goleadores</h4>
        </div>
        <div className="mt-3 flex flex-col gap-1">
          {topScorers.slice(0, 4).map((s, i) => (
            <StatRow key={s.name} rank={i + 1} name={s.name} value={s.goals} sub={`(${s.played} PJ)`} />
          ))}
          {topScorers.length === 0 && <span className="text-xs text-[var(--foreground-muted)]">Sin goles registrados</span>}
        </div>
      </div>

      {/* 3. Asistencias o Más Partidos */}
      <div className="rounded-xl border border-[var(--border)] bg-white p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
        <div>
          <span className="text-[11px] font-semibold tracking-wider text-[var(--foreground-muted)] uppercase">
            {hasAssists ? "Pases de Gol" : "Participación"}
          </span>
          <h4 className="mt-1 text-sm font-bold text-[var(--foreground)]">
            {hasAssists ? "Máximos Asistentes" : "Más Partidos Jugados"}
          </h4>
        </div>
        <div className="mt-3 flex flex-col gap-1">
          {hasAssists
            ? assists.slice(0, 4).map((a, i) => (
                <StatRow key={a.name} rank={i + 1} name={a.name} value={a.assists} sub={`(${a.played} PJ)`} />
              ))
            : appearances.map((p, i) => (
                <StatRow key={p.alias} rank={i + 1} name={p.alias} value={p.played} sub={`PJ (${p.minutes > 0 ? `${p.minutes}'` : p.position})`} />
              ))}
        </div>
      </div>
    </section>
  );
}
