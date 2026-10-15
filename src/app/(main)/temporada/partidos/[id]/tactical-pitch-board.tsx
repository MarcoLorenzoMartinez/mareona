// Client: Unified horizontal football pitch displaying both teams head-to-head without horizontal scroll
"use client";

import type {
  DomainTacticalLineup,
  DomainLineupPlayer,
  DomainPlayerMatchStats,
} from "@/lib/sports-api/types";
import { getTeamPrimaryColor } from "@/lib/sports-api/team-colors";
import { PitchPlayerNode } from "./pitch-player-node";
import { PitchSvgMarkings } from "./pitch-svg-markings";
import { lookupPlayerStats } from "@/lib/sports-api/player-stats-matcher";

interface TeamMetadata {
  readonly name: string;
  readonly externalId?: string;
  readonly crestUrl?: string | null;
  readonly isSporting: boolean;
}

interface TacticalPitchBoardProps {
  readonly homeTactical: DomainTacticalLineup;
  readonly awayTactical: DomainTacticalLineup;
  readonly homeTeam: TeamMetadata;
  readonly awayTeam: TeamMetadata;
  readonly homeStarters: readonly DomainLineupPlayer[];
  readonly awayStarters: readonly DomainLineupPlayer[];
  readonly playerStats?: Readonly<Record<string, DomainPlayerMatchStats>> | null;
  readonly onSelectPlayer?: (
    player: DomainLineupPlayer,
    stats: DomainPlayerMatchStats | null,
    team: TeamMetadata,
    teamColor: string,
    textColor: string
  ) => void;
}

function getContrastTextColor(hex: string): string {
  const c = hex.replace("#", "");
  if (c.length !== 6) return "#ffffff";
  const r = parseInt(c.slice(0, 2), 16),
    g = parseInt(c.slice(2, 4), 16),
    b = parseInt(c.slice(4, 6), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b > 160 ? "#18181b" : "#ffffff";
}

function findMatchingStarter(
  starter: { readonly id: number; readonly name: string; readonly shirtNumber?: string },
  domainStarters: readonly DomainLineupPlayer[]
): DomainLineupPlayer | undefined {
  return domainStarters.find(
    (p) =>
      (starter.shirtNumber && String(p.jersey) === starter.shirtNumber) ||
      p.name.toLowerCase().includes(starter.name.toLowerCase()) ||
      starter.name.toLowerCase().includes(p.name.toLowerCase())
  );
}

export function TacticalPitchBoard({
  homeTactical,
  awayTactical,
  homeTeam,
  awayTeam,
  homeStarters,
  awayStarters,
  playerStats,
  onSelectPlayer,
}: TacticalPitchBoardProps) {
  const homeColor = getTeamPrimaryColor({
    teamExternalId: homeTeam.externalId,
    teamName: homeTeam.name,
    isSporting: homeTeam.isSporting,
  });
  const homeTextColor = getContrastTextColor(homeColor);

  const awayColor = getTeamPrimaryColor({
    teamExternalId: awayTeam.externalId,
    teamName: awayTeam.name,
    isSporting: awayTeam.isSporting,
  });
  const awayTextColor = getContrastTextColor(awayColor);

  return (
    <div className="relative w-full aspect-[105/68] min-h-[250px] max-h-[640px] rounded-2xl border border-neutral-300/80 bg-[#f4f7f4] overflow-hidden shadow-2xs select-none">
      <PitchSvgMarkings />

      {/* 1. Once titular del Equipo Local (Mitad Izquierda atacando hacia la derecha) */}
      {homeTactical.starters.map((starter) => {
        const domainMatch = findMatchingStarter(starter, homeStarters);
        const stats = domainMatch ? lookupPlayerStats(domainMatch, playerStats, starter.id) : null;
        const pitchX = Math.max(7, Math.min(45, 7 + starter.y * 38));
        // Banda izquierda en parte superior (10-30%) y banda derecha en parte inferior (70-90%)
        const pitchY = Math.max(10, Math.min(90, 10 + (1 - starter.x) * 80));

        const playerWithPhoto = domainMatch
          ? { ...domainMatch, photoUrl: starter.photoUrl || domainMatch.photoUrl }
          : undefined;

        return (
          <PitchPlayerNode
            key={`home-${starter.id}`}
            starter={starter}
            teamColor={homeColor}
            textColor={homeTextColor}
            isSporting={homeTeam.isSporting}
            pitchX={pitchX}
            pitchY={pitchY}
            onClick={
              playerWithPhoto && onSelectPlayer
                ? () => onSelectPlayer(playerWithPhoto, stats, homeTeam, homeColor, homeTextColor)
                : undefined
            }
          />
        );
      })}

      {/* 2. Once titular del Equipo Visitante (Mitad Derecha atacando hacia la izquierda) */}
      {awayTactical.starters.map((starter) => {
        const domainMatch = findMatchingStarter(starter, awayStarters);
        const stats = domainMatch ? lookupPlayerStats(domainMatch, playerStats, starter.id) : null;
        const playerWithPhoto = domainMatch
          ? { ...domainMatch, photoUrl: starter.photoUrl || domainMatch.photoUrl }
          : undefined;
        const pitchX = Math.max(55, Math.min(93, 93 - starter.y * 38));
        // Banda derecha en parte superior (10-30%) y banda izquierda en parte inferior (70-90%)
        const pitchY = Math.max(10, Math.min(90, 10 + starter.x * 80));

        return (
          <PitchPlayerNode
            key={`away-${starter.id}`}
            starter={starter}
            teamColor={awayColor}
            textColor={awayTextColor}
            isSporting={awayTeam.isSporting}
            pitchX={pitchX}
            pitchY={pitchY}
            onClick={
              playerWithPhoto && onSelectPlayer
                ? () => onSelectPlayer(playerWithPhoto, stats, awayTeam, awayColor, awayTextColor)
                : undefined
            }
          />
        );
      })}
    </div>
  );
}
