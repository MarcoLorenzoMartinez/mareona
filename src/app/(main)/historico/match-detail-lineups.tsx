// Client: Visualización táctica de alineaciones, banquillo y entrenadores con fotos
"use client";

import type {
  HistoricalMatchPlayer,
  HistoricalMatchCoach,
} from "@/lib/historical/types";
import { PlayerPhoto } from "@/components/media/player-photo";

interface MatchDetailLineupsProps {
  readonly homeTeam: string;
  readonly awayTeam: string;
  readonly homeStarters: readonly HistoricalMatchPlayer[];
  readonly awayStarters: readonly HistoricalMatchPlayer[];
  readonly homeBench: readonly HistoricalMatchPlayer[];
  readonly awayBench: readonly HistoricalMatchPlayer[];
  readonly homeCoach?: HistoricalMatchCoach | null;
  readonly awayCoach?: HistoricalMatchCoach | null;
}

function StarterCard({ player }: { readonly player: HistoricalMatchPlayer }) {
  return (
    <div className="flex items-center justify-between gap-1.5 py-1 px-2 rounded-lg bg-[var(--surface)]/70 border border-[var(--border)] text-xs hover:bg-[var(--surface)] transition-colors min-w-0">
      <div className="flex items-center gap-2 min-w-0">
        <PlayerPhoto
          photoUrl={player.photoUrl}
          playerName={player.name}
          size="sm"
          className="h-6 w-6 rounded-full border border-[var(--border)] object-cover object-top shrink-0 bg-neutral-100"
        />
        <span className="font-semibold text-[var(--foreground)] truncate">{player.name}</span>
      </div>

      <div className="flex items-center gap-1 shrink-0 tabular-nums text-[10px] font-bold">
        {player.yellowCard && (
          <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300" title={`Tarjeta amarilla minuto ${player.yellowCard}`}>
            <span className="w-1.5 h-2.5 bg-amber-400 rounded-2xs inline-block" />
            {player.yellowCard}&apos;
          </span>
        )}
        {player.redCard && (
          <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-red-100 text-red-800 border border-red-300" title={`Tarjeta roja minuto ${player.redCard}`}>
            <span className="w-1.5 h-2.5 bg-red-600 rounded-2xs inline-block" />
            {player.redCard}&apos;
          </span>
        )}
      </div>
    </div>
  );
}

function BenchChip({ player }: { readonly player: HistoricalMatchPlayer }) {
  return (
    <div className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-white border border-[var(--border)] text-xs shadow-2xs hover:bg-[var(--surface)] transition-colors">
      <PlayerPhoto
        photoUrl={player.photoUrl}
        playerName={player.name}
        size="sm"
        className="h-5 w-5 rounded-full border border-[var(--border)] object-cover object-top shrink-0 bg-neutral-100"
      />
      <span className="font-medium text-[var(--foreground)]">{player.name}</span>
      {player.yellowCard && (
        <span className="w-1.5 h-2.5 bg-amber-400 rounded-2xs inline-block ml-0.5 shrink-0" title={`Amarilla ${player.yellowCard}'`} />
      )}
      {player.redCard && (
        <span className="w-1.5 h-2.5 bg-red-600 rounded-2xs inline-block ml-0.5 shrink-0" title={`Roja ${player.redCard}'`} />
      )}
    </div>
  );
}

function TeamLineupColumn({
  teamName,
  starters,
  bench,
  coach,
}: {
  readonly teamName: string;
  readonly starters: readonly HistoricalMatchPlayer[];
  readonly bench: readonly HistoricalMatchPlayer[];
  readonly coach?: HistoricalMatchCoach | null;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-2 gap-2">
        <h4 className="text-sm font-bold text-[var(--foreground)] truncate">{teamName}</h4>
        {coach && (
          <div className="flex items-center gap-1.5 shrink-0">
            <PlayerPhoto
              photoUrl={coach.photoUrl}
              playerName={coach.name}
              size="sm"
              className="h-6 w-6 rounded-full border border-[var(--border)] object-cover object-top shrink-0 bg-neutral-100"
            />
            <span className="text-[11px] text-[var(--foreground-muted)]">
              DT: <strong className="font-semibold text-[var(--foreground)]">{coach.name}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Titulares en Grid compacto de 2 columnas */}
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--foreground-muted)] mb-1.5">
          Titulares
        </div>
        {starters.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {starters.map((p) => (
              <StarterCard key={p.name} player={p} />
            ))}
          </div>
        ) : (
          <div className="p-3 text-center text-xs text-[var(--foreground-muted)] bg-[var(--surface)]/50 rounded-lg">
            Alineación no disponible
          </div>
        )}
      </div>

      {/* Banquillo en Chips continuos tipo cápsula */}
      {bench.length > 0 && (
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--foreground-muted)] mb-1.5">
            Banquillo
          </div>
          <div className="flex flex-wrap gap-1.5">
            {bench.map((p) => (
              <BenchChip key={p.name} player={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Lineup rosters and technical benches for both teams in an official match.
 */
export function HistoricalMatchLineups({
  homeTeam,
  awayTeam,
  homeStarters,
  awayStarters,
  homeBench,
  awayBench,
  homeCoach,
  awayCoach,
}: MatchDetailLineupsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4 pt-3 border-t border-[var(--border)]">
      <TeamLineupColumn
        teamName={homeTeam}
        starters={homeStarters}
        bench={homeBench}
        coach={homeCoach}
      />
      <TeamLineupColumn
        teamName={awayTeam}
        starters={awayStarters}
        bench={awayBench}
        coach={awayCoach}
      />
    </div>
  );
}
