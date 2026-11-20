// Client: Unified tactical pitch card switching between mobile vertical and desktop horizontal views
"use client";

import type {
  DomainLineupPlayer,
  DomainMatchDetail,
  DomainPlayerMatchStats,
  DomainTacticalLineup,
} from "@/lib/sports-api/types";
import { TacticalPitchBoard } from "./tactical-pitch-board";
import { TacticalVerticalPitch } from "./tactical-vertical-pitch";
import { LineupsMobileSelector } from "./lineups-mobile-selector";
import { LineupsDesktopHeader } from "./lineups-desktop-header";

interface MatchLineupsTacticalCardProps {
  readonly match: DomainMatchDetail;
  readonly homeTactical: DomainTacticalLineup;
  readonly awayTactical: DomainTacticalLineup;
  readonly activeMobileTeam: "home" | "away";
  readonly onSelectMobileTeam: (team: "home" | "away") => void;
  readonly playerStats: Readonly<Record<string, DomainPlayerMatchStats>> | null;
  readonly onSelectPlayer: (
    player: DomainLineupPlayer,
    stats: DomainPlayerMatchStats | null,
    team: { readonly name: string; readonly crestUrl?: string | null; readonly isSporting: boolean },
    teamColor: string,
    textColor: string
  ) => void;
}

export function MatchLineupsTacticalCard({
  match,
  homeTactical,
  awayTactical,
  activeMobileTeam,
  onSelectMobileTeam,
  playerStats,
  onSelectPlayer,
}: MatchLineupsTacticalCardProps) {
  if (!match.homeLineup || !match.awayLineup) {
    return null;
  }

  const activeMobileTactical = activeMobileTeam === "home" ? homeTactical : awayTactical;
  const activeMobileTeamMeta = activeMobileTeam === "home" ? match.homeTeam : match.awayTeam;
  const activeMobileStarters =
    activeMobileTeam === "home" ? match.homeLineup.starters : match.awayLineup.starters;

  return (
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
          onSelectTeam={onSelectMobileTeam}
        />

        {activeMobileTactical && activeMobileStarters && (
          <TacticalVerticalPitch
            tactical={activeMobileTactical}
            team={activeMobileTeamMeta}
            starters={activeMobileStarters}
            playerStats={playerStats}
            onSelectPlayer={onSelectPlayer}
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
          onSelectPlayer={onSelectPlayer}
        />
      </div>
    </div>
  );
}
