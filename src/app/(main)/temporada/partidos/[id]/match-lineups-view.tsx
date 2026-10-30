// Client: Match lineups view with mobile vertical pitch toggle and desktop horizontal pitch board
"use client";

import { useState } from "react";
import type {
  DomainMatchDetail,
  DomainLineupPlayer,
  DomainPlayerMatchStats,
} from "@/lib/sports-api/types";
import { getDictionary } from "@/i18n";
import { TacticalPitchBoard } from "./tactical-pitch-board";
import { TacticalVerticalPitch } from "./tactical-vertical-pitch";
import { LineupsMobileSelector } from "./lineups-mobile-selector";
import { LineupsDesktopHeader } from "./lineups-desktop-header";
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

  const activeMobileTactical = activeMobileTeam === "home" ? homeTactical : awayTactical;
  const activeMobileTeamMeta = activeMobileTeam === "home" ? match.homeTeam : match.awayTeam;
  const activeMobileStarters =
    activeMobileTeam === "home" ? match.homeLineup?.starters : match.awayLineup?.starters;

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
        <div className="rounded-2xl border border-[var(--border)] bg-white p-3.5 sm:p-5 shadow-2xs">
          {/* Mobile View (< md): Team Selector + Dedicated Vertical Tactical Pitch */}
          <div className="flex flex-col gap-3 md:hidden">
            <LineupsMobileSelector
              homeTeam={{
                name: match.homeTeam.name,
                crestUrl: match.homeTeam.crestUrl,
                isSporting: match.homeTeam.isSporting,
                formation: homeTactical.formation,
              }}
              awayTeam={{
                name: match.awayTeam.name,
                crestUrl: match.awayTeam.crestUrl,
                isSporting: match.awayTeam.isSporting,
                formation: awayTactical.formation,
              }}
              activeTeam={activeMobileTeam}
              onSelectTeam={setActiveMobileTeam}
            />

            {activeMobileTactical && activeMobileStarters && (
              <TacticalVerticalPitch
                tactical={activeMobileTactical}
                team={activeMobileTeamMeta}
                starters={activeMobileStarters}
                playerStats={playerStats}
                onSelectPlayer={handleSelectPlayer}
              />
            )}
          </div>

          {/* Desktop View (>= md): Unified 11 vs 11 Horizontal Pitch Board */}
          <div className="hidden md:flex md:flex-col">
            <LineupsDesktopHeader homeTeam={match.homeTeam} awayTeam={match.awayTeam} />
            <TacticalPitchBoard
              homeTactical={homeTactical}
              awayTactical={awayTactical}
              homeTeam={match.homeTeam}
              awayTeam={match.awayTeam}
              homeStarters={match.homeLineup.starters}
              awayStarters={match.awayLineup.starters}
              playerStats={playerStats}
              onSelectPlayer={handleSelectPlayer}
            />
          </div>
        </div>
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
