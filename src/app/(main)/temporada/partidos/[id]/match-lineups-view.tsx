"use client";
// Client: Match lineups view with unified horizontal tactical pitch and player stats modal

import { useState } from "react";
import type {
  DomainMatchDetail,
  DomainLineupPlayer,
  DomainPlayerMatchStats,
} from "@/lib/sports-api/types";
import { getDictionary } from "@/i18n";
import { TeamCrest } from "@/components/media/team-crest";
import { TacticalPitchBoard } from "./tactical-pitch-board";
import { LineupBenchCard } from "./lineup-bench-card";
import { LineupTeamColumn } from "./lineup-team-column";
import { PlayerMatchStatsModal } from "./player-match-stats-modal";

interface MatchLineupsViewProps {
  readonly match: DomainMatchDetail;
}

interface SelectedPlayerState {
  readonly player: DomainLineupPlayer;
  readonly stats: DomainPlayerMatchStats | null;
  readonly team: { readonly name: string; readonly crestUrl?: string | null; readonly isSporting: boolean };
  readonly teamColor: string;
  readonly textColor: string;
}

export function MatchLineupsView({ match }: MatchLineupsViewProps) {
  const dict = getDictionary();
  const t = dict.season.matchDetail.lineups;
  const [selected, setSelected] = useState<SelectedPlayerState | null>(null);

  const hasLineups = Boolean(match.homeLineup || match.awayLineup);

  if (!hasLineups) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-white p-8 text-center shadow-2xs">
        <p className="text-sm font-medium text-[var(--foreground-muted)]">
          {match.status === "scheduled" ? t.pendingLineups : t.noLineups}
        </p>
      </div>
    );
  }

  const playerStats = match.advancedStats?.playerStats ?? null;
  const homeTactical = match.advancedStats?.tacticalLineups?.home;
  const awayTactical = match.advancedStats?.tacticalLineups?.away;

  const hasUnifiedTactical = Boolean(
    homeTactical?.starters?.length &&
      awayTactical?.starters?.length &&
      match.homeLineup &&
      match.awayLineup
  );

  return (
    <div className="flex flex-col gap-6">
      {hasUnifiedTactical && match.homeLineup && match.awayLineup && homeTactical && awayTactical ? (
        <div className="rounded-2xl border border-[var(--border)] bg-white p-3.5 sm:p-5 shadow-2xs">
          {/* Cabecera del campo con escudos y nombres limpios de los dos clubes */}
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 mb-4">
            {/* Local */}
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 max-w-[44%]">
              <TeamCrest crestUrl={match.homeTeam.crestUrl} teamName={match.homeTeam.name} size="sm" isSporting={match.homeTeam.isSporting} />
              <span className={`text-xs sm:text-sm truncate ${match.homeTeam.isSporting ? "font-bold text-[var(--primary)]" : "font-bold text-[var(--foreground)]"}`}>
                {match.homeTeam.name}
              </span>
            </div>

            {/* VS Separador */}
            <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-[9px] sm:text-[10px] font-bold tracking-wider uppercase text-[var(--foreground-muted)] border border-[var(--border)] shrink-0">
              VS
            </span>

            {/* Visitante */}
            <div className="flex items-center justify-end gap-2 sm:gap-2.5 min-w-0 max-w-[44%] text-right">
              <span className={`text-xs sm:text-sm truncate ${match.awayTeam.isSporting ? "font-bold text-[var(--primary)]" : "font-bold text-[var(--foreground)]"}`}>
                {match.awayTeam.name}
              </span>
              <TeamCrest crestUrl={match.awayTeam.crestUrl} teamName={match.awayTeam.name} size="sm" isSporting={match.awayTeam.isSporting} />
            </div>
          </div>

          {/* Campo horizontal único sin scroll */}
          <TacticalPitchBoard
            homeTactical={homeTactical}
            awayTactical={awayTactical}
            homeTeam={match.homeTeam}
            awayTeam={match.awayTeam}
            homeStarters={match.homeLineup.starters}
            awayStarters={match.awayLineup.starters}
            playerStats={playerStats}
            onSelectPlayer={(player, stats, team, teamColor, textColor) =>
              setSelected({ player, stats, team, teamColor, textColor })
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 items-start">
          <LineupTeamColumn
            lineup={match.homeLineup}
            team={match.homeTeam}
            playerStats={playerStats}
            onSelectPlayer={(player, stats, team, teamColor, textColor) =>
              setSelected({ player, stats, team, teamColor, textColor })
            }
          />
          <LineupTeamColumn
            lineup={match.awayLineup}
            team={match.awayTeam}
            playerStats={playerStats}
            onSelectPlayer={(player, stats, team, teamColor, textColor) =>
              setSelected({ player, stats, team, teamColor, textColor })
            }
          />
        </div>
      )}

      {/* Banquillos en 2 columnas para el campo unificado */}
      {hasUnifiedTactical && match.homeLineup && match.awayLineup && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <LineupBenchCard
            team={match.homeTeam}
            substitutes={match.homeLineup.substitutes}
            playerStats={playerStats}
            onSelectPlayer={(player, stats, team, teamColor, textColor) =>
              setSelected({ player, stats, team, teamColor, textColor })
            }
          />
          <LineupBenchCard
            team={match.awayTeam}
            substitutes={match.awayLineup.substitutes}
            playerStats={playerStats}
            onSelectPlayer={(player, stats, team, teamColor, textColor) =>
              setSelected({ player, stats, team, teamColor, textColor })
            }
          />
        </div>
      )}

      {selected && (
        <PlayerMatchStatsModal
          player={selected.player}
          stats={selected.stats}
          team={selected.team}
          teamColor={selected.teamColor}
          textColor={selected.textColor}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
