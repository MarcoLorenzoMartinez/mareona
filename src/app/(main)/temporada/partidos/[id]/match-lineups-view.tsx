"use client";
// Client: Match lineups view with player statistics dialog interaction

import { useState } from "react";
import type {
  DomainMatchDetail,
  DomainLineupPlayer,
  DomainPlayerMatchStats,
} from "@/lib/sports-api/types";
import { getDictionary } from "@/i18n";
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

  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 items-start">
        <LineupTeamColumn
          lineup={match.homeLineup}
          team={match.homeTeam}
          playerStats={playerStats}
          tacticalLineup={match.advancedStats?.tacticalLineups?.home}
          onSelectPlayer={(player, stats, team, teamColor, textColor) =>
            setSelected({ player, stats, team, teamColor, textColor })
          }
        />
        <LineupTeamColumn
          lineup={match.awayLineup}
          team={match.awayTeam}
          playerStats={playerStats}
          tacticalLineup={match.advancedStats?.tacticalLineups?.away}
          onSelectPlayer={(player, stats, team, teamColor, textColor) =>
            setSelected({ player, stats, team, teamColor, textColor })
          }
        />
      </div>

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
    </>
  );
}
