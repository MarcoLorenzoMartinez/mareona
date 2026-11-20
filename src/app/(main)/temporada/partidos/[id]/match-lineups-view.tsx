// Client: Match lineups view with mobile vertical pitch toggle and desktop horizontal pitch board
"use client";

import { useState } from "react";
import type {
  DomainMatchDetail,
  DomainLineupPlayer,
  DomainPlayerMatchStats,
} from "@/lib/sports-api/types";
import { getDictionary } from "@/i18n";
import { MatchLineupsTacticalCard } from "./match-lineups-tactical-card";
import { LineupBenchCard } from "./lineup-bench-card";
import { LineupTeamColumn } from "./lineup-team-column";
import { PlayerMatchStatsModal } from "./player-match-stats-modal";
import { generateFallbackTacticalLineup } from "@/lib/sports-api/tactical-lineup-fallback";

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

  // Default mobile view to Real Sporting if away, otherwise home
  const defaultMobileTeam: "home" | "away" = match.awayTeam.isSporting ? "away" : "home";
  const [activeMobileTeam, setActiveMobileTeam] = useState<"home" | "away">(defaultMobileTeam);

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
  const homeTactical =
    match.tacticalLineups?.home ??
    match.advancedStats?.tacticalLineups?.home ??
    (match.homeLineup
      ? generateFallbackTacticalLineup(
          match.homeLineup.starters,
          match.homeLineup.formation,
          match.homeTeam.isSporting
        )
      : null);

  const awayTactical =
    match.tacticalLineups?.away ??
    match.advancedStats?.tacticalLineups?.away ??
    (match.awayLineup
      ? generateFallbackTacticalLineup(
          match.awayLineup.starters,
          match.awayLineup.formation,
          match.awayTeam.isSporting
        )
      : null);

  const hasUnifiedTactical = Boolean(
    homeTactical?.starters?.length &&
      awayTactical?.starters?.length &&
      match.homeLineup &&
      match.awayLineup
  );

  const handleSelectPlayer = (
    player: DomainLineupPlayer,
    stats: DomainPlayerMatchStats | null,
    team: { readonly name: string; readonly crestUrl?: string | null; readonly isSporting: boolean },
    teamColor: string,
    textColor: string
  ) => setSelected({ player, stats, team, teamColor, textColor });

  return (
    <div className="flex flex-col gap-6">
      {hasUnifiedTactical && match.homeLineup && match.awayLineup && homeTactical && awayTactical ? (
        <MatchLineupsTacticalCard
          match={match}
          homeTactical={homeTactical}
          awayTactical={awayTactical}
          activeMobileTeam={activeMobileTeam}
          onSelectMobileTeam={setActiveMobileTeam}
          playerStats={playerStats}
          onSelectPlayer={handleSelectPlayer}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 items-start">
          <LineupTeamColumn
            lineup={match.homeLineup}
            team={match.homeTeam}
            playerStats={playerStats}
            onSelectPlayer={handleSelectPlayer}
          />
          <LineupTeamColumn
            lineup={match.awayLineup}
            team={match.awayTeam}
            playerStats={playerStats}
            onSelectPlayer={handleSelectPlayer}
          />
        </div>
      )}

      {/* Banquillos en 2 columnas */}
      {hasUnifiedTactical && match.homeLineup && match.awayLineup && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <LineupBenchCard
            team={match.homeTeam}
            substitutes={match.homeLineup.substitutes}
            playerStats={playerStats}
            onSelectPlayer={handleSelectPlayer}
          />
          <LineupBenchCard
            team={match.awayTeam}
            substitutes={match.awayLineup.substitutes}
            playerStats={playerStats}
            onSelectPlayer={handleSelectPlayer}
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
