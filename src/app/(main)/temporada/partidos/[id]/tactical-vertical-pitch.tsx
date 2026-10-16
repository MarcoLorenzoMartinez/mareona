// Client: Dedicated vertical football pitch board engineered for mobile portrait touchscreens
"use client";

import type {
  DomainTacticalLineup,
  DomainLineupPlayer,
  DomainPlayerMatchStats,
} from "@/lib/sports-api/types";
import { getTeamPrimaryColor } from "@/lib/sports-api/team-colors";
import { PitchPlayerNode } from "./pitch-player-node";
import { PitchVerticalMarkings } from "./pitch-vertical-markings";
import { calculateVerticalPitchCoordinates } from "./tactical-vertical-math";
import { lookupPlayerStats } from "@/lib/sports-api/player-stats-matcher";

interface TeamMetadata {
  readonly name: string;
  readonly externalId?: string;
  readonly crestUrl?: string | null;
  readonly isSporting: boolean;
}

interface TacticalVerticalPitchProps {
  readonly tactical: DomainTacticalLineup;
  readonly team: TeamMetadata;
  readonly starters: readonly DomainLineupPlayer[];
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

export function TacticalVerticalPitch({
  tactical,
  team,
  starters,
  playerStats,
  onSelectPlayer,
}: TacticalVerticalPitchProps) {
  const teamColor = getTeamPrimaryColor({
    teamExternalId: team.externalId,
    teamName: team.name,
    isSporting: team.isSporting,
  });
  const textColor = getContrastTextColor(teamColor);

  return (
    <div className="relative w-full aspect-[68/98] min-h-[380px] max-h-[520px] rounded-2xl border border-neutral-300/80 bg-[#f4f7f4] overflow-hidden shadow-2xs select-none">
      <PitchVerticalMarkings />

      {tactical.starters.map((starter) => {
        const domainMatch = findMatchingStarter(starter, starters);
        const stats = domainMatch ? lookupPlayerStats(domainMatch, playerStats, starter.id) : null;
        const { pitchX, pitchY } = calculateVerticalPitchCoordinates(starter.x, starter.y);

        const playerWithPhoto = domainMatch
          ? { ...domainMatch, photoUrl: starter.photoUrl || domainMatch.photoUrl }
          : undefined;

        return (
          <PitchPlayerNode
            key={`vert-${starter.id}`}
            starter={starter}
            teamColor={teamColor}
            textColor={textColor}
            isSporting={team.isSporting}
            pitchX={pitchX}
            pitchY={pitchY}
            size="normal"
            onClick={
              playerWithPhoto && onSelectPlayer
                ? () => onSelectPlayer(playerWithPhoto, stats, team, teamColor, textColor)
                : undefined
            }
          />
        );
      })}
    </div>
  );
}
