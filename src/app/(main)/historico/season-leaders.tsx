import type { HistoricalTopScorer, HistoricalPlayer } from "@/lib/historical/types";
import { PlayerPhoto } from "@/components/media/player-photo";

interface SeasonLeadersProps {
  readonly topScorers: readonly HistoricalTopScorer[];
  readonly assists: readonly { readonly name: string; readonly assists: number; readonly played: number }[];
  readonly players: readonly HistoricalPlayer[];
  readonly seasonLabel: string;
}

interface StatRowProps {
  readonly rank: number;
  readonly name: string;
  readonly value: string | number;
  readonly sub?: string;
  readonly photoUrl?: string | null;
}

function StatRow({ rank, name, value, sub, photoUrl }: StatRowProps) {
  return (
    <div className="flex items-center justify-between text-xs py-1.5 border-b border-[var(--border)] last:border-0">
      <div className="flex items-center gap-2 min-w-0 pr-2">
        <span className="font-bold text-[11px] text-[var(--foreground-muted)] tabular-nums w-3.5 shrink-0">{rank}.</span>
        <PlayerPhoto
          photoUrl={photoUrl}
          playerName={name}
          size="sm"
          className="h-6 w-6 rounded-full border border-[var(--border)] object-cover object-top shrink-0 bg-neutral-100"
        />
        <span className="font-semibold text-[var(--foreground)] truncate">{name}</span>
      </div>
      <div className="flex items-baseline gap-1 shrink-0 tabular-nums">
        <span className="font-black text-sm text-[var(--foreground)]">{value}</span>
        {sub && <span className="text-[10px] text-[var(--foreground-muted)]">{sub}</span>}
      </div>
    </div>
  );
}

/**
 * Modern minimalist card showcasing top goalscorers, minute leaders,
 * and key assist or appearance leaders for Real Sporting in a chosen season.
 */
export function HistoricalSeasonLeaders({
  topScorers,
  assists,
  players,
  seasonLabel,
}: SeasonLeadersProps) {
  const appearances = [...players].sort((a, b) => b.played - a.played || b.minutes - a.minutes).slice(0, 5);
  const minuteLeaders = [...players].sort((a, b) => b.minutes - a.minutes || b.played - a.played).slice(0, 5);
  const hasAssists = assists.length > 0;
  const hasMinutes = minuteLeaders.some((p) => p.minutes > 0);

  return (
    <section
      aria-label={`Líderes deportivos del Real Sporting ${seasonLabel}`}
      className={`grid grid-cols-1 gap-4 ${hasAssists ? "md:grid-cols-3" : "md:grid-cols-2"}`}
    >
      {/* 1. Más Minutos / Regularidad */}
      <div className="rounded-xl border border-[var(--border)] bg-white p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
        <h4 className="text-sm font-bold text-[var(--foreground)]">
          {hasMinutes ? "Más Minutos Jugados" : "Más Partidos Jugados"}
        </h4>
        <div className="mt-3 flex flex-col gap-1">
          {(hasMinutes ? minuteLeaders : appearances).map((p, i) => (
            <StatRow
              key={p.alias}
              rank={i + 1}
              name={p.alias}
              value={hasMinutes ? `${p.minutes.toLocaleString("es-ES")}'` : `${p.played} PJ`}
              photoUrl={p.photoUrl}
            />
          ))}
          {players.length === 0 && <span className="text-xs text-[var(--foreground-muted)]">Sin datos</span>}
        </div>
      </div>

      {/* 2. Máximos Goleadores */}
      <div className="rounded-xl border border-[var(--border)] bg-white p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
        <h4 className="text-sm font-bold text-[var(--foreground)]">Máximos Goleadores</h4>
        <div className="mt-3 flex flex-col gap-1">
          {topScorers.slice(0, 5).map((s, i) => (
            <StatRow
              key={s.name}
              rank={i + 1}
              name={s.name}
              value={s.goals}
              photoUrl={s.photoUrl}
            />
          ))}
          {topScorers.length === 0 && <span className="text-xs text-[var(--foreground-muted)]">Sin goles registrados</span>}
        </div>
      </div>

      {/* 3. Máximos Asistentes (solo si hay datos oficiales) */}
      {hasAssists && (
        <div className="rounded-xl border border-[var(--border)] bg-white p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
          <h4 className="text-sm font-bold text-[var(--foreground)]">Máximos Asistentes</h4>
          <div className="mt-3 flex flex-col gap-1">
            {assists.slice(0, 5).map((a, i) => {
              const playerObj = players.find((p) => p.alias === a.name || p.fullName.includes(a.name));
              return (
                <StatRow
                  key={a.name}
                  rank={i + 1}
                  name={a.name}
                  value={a.assists}
                  photoUrl={playerObj?.photoUrl}
                />
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
