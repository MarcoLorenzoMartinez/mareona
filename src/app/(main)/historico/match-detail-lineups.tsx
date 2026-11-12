// Client: Visualización táctica de alineaciones, banquillo y entrenadores por líneas
"use client";

import { useMemo } from "react";
import type { HistoricalMatchPlayer, HistoricalMatchCoach } from "@/lib/historical/types";
import { getTeamPrimaryColor } from "@/lib/sports-api/team-colors";
import { TeamCrest } from "@/components/media/team-crest";
import { PlayerPhoto } from "@/components/media/player-photo";
import { StarterCard, BenchRow } from "./match-lineup-cards";

interface MatchDetailLineupsProps {
  readonly homeTeam: string;
  readonly awayTeam: string;
  readonly homeCrestUrl?: string | null;
  readonly awayCrestUrl?: string | null;
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
  crestUrl,
  starters,
  bench,
  coach,
}: {
  readonly teamName: string;
  readonly crestUrl?: string | null;
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
    <div className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-white p-2.5 sm:p-4 shadow-2xs">
      {/* Header: Crest + Team Name on Left, Coach on Right */}
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <TeamCrest crestUrl={crestUrl} teamName={teamName} size="sm" isSporting={isSporting} />
          <h4 className="text-sm sm:text-base font-bold text-[var(--foreground)] truncate tracking-tight">
            {teamName}
          </h4>
        </div>
        {coach && (
          <div className="flex items-center gap-2 shrink-0">
            <PlayerPhoto
              photoUrl={coach.photoUrl}
              playerName={coach.name}
              size="custom"
              teamColor={teamColor}
              className="h-7 w-7 rounded-full border border-neutral-300 object-cover object-top shrink-0 bg-white"
            />
            <div className="text-left leading-none">
              <span className="text-[10px] uppercase font-semibold text-neutral-400 block tracking-wider mb-0.5">
                Entrenador
              </span>
              <span className="text-xs font-bold text-neutral-800">
                {coach.name}
              </span>
            </div>
          </div>
        )}
      </div>

      {groupedStarters.length > 0 ? (
        <div className="space-y-3 my-1">
          {groupedStarters.map((group) => (
            <div key={group.label} className="space-y-1 pt-1">
              <div className="text-center">
                <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-neutral-400 select-none">
                  {group.label}
                </span>
              </div>
              <div className="flex justify-center items-center gap-1 sm:gap-2 flex-wrap py-1">
                {group.players.map((p) => (
                  <StarterCard
                    key={p.name}
                    player={p}
                    teamColor={teamColor}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-3 text-center text-xs text-[var(--foreground-muted)] bg-neutral-50 rounded-lg border border-[var(--border)]">
          Alineación no disponible
        </div>
      )}

      {bench.length > 0 && (
        <div className="pt-3 border-t border-[var(--border)]/70">
          <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
            Banquillo
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-0.5">
            {bench.map((p) => (
              <BenchRow key={p.name} player={p} teamColor={teamColor} />
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
  homeCrestUrl,
  awayCrestUrl,
  homeStarters,
  awayStarters,
  homeBench,
  awayBench,
  homeCoach,
  awayCoach,
}: MatchDetailLineupsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mt-4 pt-3 border-t border-[var(--border)]">
      <TeamLineupColumn
        teamName={homeTeam}
        crestUrl={homeCrestUrl}
        starters={homeStarters}
        bench={homeBench}
        coach={homeCoach}
      />
      <TeamLineupColumn
        teamName={awayTeam}
        crestUrl={awayCrestUrl}
        starters={awayStarters}
        bench={awayBench}
        coach={awayCoach}
      />
    </div>
  );
}
