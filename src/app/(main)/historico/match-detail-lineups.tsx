// Client: Visualización táctica de alineaciones, banquillo y entrenadores por líneas
"use client";

import { useMemo } from "react";
import type { HistoricalMatchPlayer, HistoricalMatchCoach } from "@/lib/historical/types";
import { PlayerPhoto } from "@/components/media/player-photo";
import { getTeamPrimaryColor } from "@/lib/sports-api/team-colors";
import { StarterCard, BenchChip } from "./match-lineup-cards";

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

const POSITION_LINES = [
  { key: "Portero", label: "Portero" },
  { key: "Defensa", label: "Defensas" },
  { key: "Centrocampista", label: "Centrocampistas" },
  { key: "Delantero", label: "Delanteros" },
] as const;

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
  const isSporting = teamName === "Real Sporting";
  const teamColor = useMemo(() => getTeamPrimaryColor({ teamName, isSporting }), [teamName, isSporting]);

  const groupedStarters = useMemo(() => {
    const hasKnownPositions = starters.some((p) => p.position);
    if (!hasKnownPositions) {
      return [{ label: "Once Titular", players: [...starters] }];
    }
    const groups: { label: string; players: HistoricalMatchPlayer[] }[] = [];
    for (const line of POSITION_LINES) {
      const list = starters.filter((p) => p.position === line.key);
      if (list.length > 0) groups.push({ label: line.label, players: list });
    }
    const unassigned = starters.filter((p) => !p.position);
    if (unassigned.length > 0) groups.push({ label: "Jugadores", players: unassigned });
    return groups;
  }, [starters]);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-neutral-50/40 p-3 sm:p-4">
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs" style={{ backgroundColor: teamColor }} aria-hidden="true" />
          <h4 className="text-sm font-bold text-[var(--foreground)] truncate">{teamName}</h4>
        </div>
        {coach && (
          <div className="flex items-center gap-1.5 shrink-0 bg-white px-2 py-0.5 rounded-full border border-[var(--border)] shadow-2xs">
            <PlayerPhoto
              photoUrl={coach.photoUrl}
              playerName={coach.name}
              size="custom"
              teamColor={teamColor}
              className="h-5 w-5 rounded-full border border-neutral-200 object-cover object-top shrink-0 bg-neutral-100"
            />
            <span className="text-[11px] text-[var(--foreground-muted)]">
              DT: <strong className="font-semibold text-[var(--foreground)]">{coach.name}</strong>
            </span>
          </div>
        )}
      </div>

      {groupedStarters.length > 0 ? (
        <div className="space-y-2.5 my-1">
          {groupedStarters.map((group) => (
            <div key={group.label} className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-[var(--border)]/60" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground-muted)] px-2 py-0.5 rounded-full bg-white border border-[var(--border)]/80 shadow-2xs">
                  {group.label}
                </span>
                <div className="h-px flex-1 bg-[var(--border)]/60" />
              </div>
              <div className="flex justify-center items-center gap-1.5 sm:gap-2 flex-wrap">
                {group.players.map((p) => (
                  <StarterCard key={p.name} player={p} teamColor={teamColor} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-3 text-center text-xs text-[var(--foreground-muted)] bg-white rounded-lg border border-[var(--border)]">
          Alineación no disponible
        </div>
      )}

      {bench.length > 0 && (
        <div className="pt-2 border-t border-[var(--border)]/70">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground-muted)] mb-1.5">
            Banquillo
          </div>
          <div className="flex flex-wrap gap-1.5">
            {bench.map((p) => (
              <BenchChip key={p.name} player={p} teamColor={teamColor} />
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mt-4 pt-3 border-t border-[var(--border)]">
      <TeamLineupColumn teamName={homeTeam} starters={homeStarters} bench={homeBench} coach={homeCoach} />
      <TeamLineupColumn teamName={awayTeam} starters={awayStarters} bench={awayBench} coach={awayCoach} />
    </div>
  );
}
