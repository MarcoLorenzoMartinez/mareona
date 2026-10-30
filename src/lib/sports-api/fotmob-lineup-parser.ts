import type { DomainTacticalLineup, DomainTacticalStarter } from "./types.ts";

export interface FotMobRawLineupPlayer {
  readonly id: number;
  readonly name: string | { readonly fullName?: string };
  readonly shirtNumber?: string | number;
  readonly verticalLayout?: { readonly x?: number; readonly y?: number };
  readonly performance?: { readonly rating?: number | null };
}

export interface FotMobRawLineupTeam {
  readonly id?: number;
  readonly name?: string;
  readonly formation?: string;
  readonly starters?: readonly FotMobRawLineupPlayer[];
}

export interface FotMobRawLineupPayload {
  readonly homeTeam?: FotMobRawLineupTeam;
  readonly awayTeam?: FotMobRawLineupTeam;
}

const FOTMOB_SPORTING_ID = 9869;

export function parseFotMobTacticalLineups(
  lineup?: FotMobRawLineupPayload,
  homeTeamId?: number,
  awayTeamId?: number
): { readonly home: DomainTacticalLineup; readonly away: DomainTacticalLineup } | null {
  if (!lineup?.homeTeam?.starters || !lineup?.awayTeam?.starters) return null;
  if (lineup.homeTeam.starters.length === 0 || lineup.awayTeam.starters.length === 0) return null;

  const isHomeSporting = homeTeamId === FOTMOB_SPORTING_ID || lineup.homeTeam.id === FOTMOB_SPORTING_ID;
  const isAwaySporting = awayTeamId === FOTMOB_SPORTING_ID || lineup.awayTeam.id === FOTMOB_SPORTING_ID;

  const mapStarters = (
    starters: readonly FotMobRawLineupPlayer[],
    isSporting: boolean
  ): readonly DomainTacticalStarter[] => {
    return starters.map((s) => {
      const rawName = typeof s.name === "string" ? s.name : s.name?.fullName || "";
      const shirt = String(s.shirtNumber ?? "");
      const photoUrl =
        isSporting && shirt
          ? `/images/players/${shirt}.png`
          : s.id
          ? `https://images.fotmob.com/image_resources/playerimages/${s.id}.png`
          : "";

      return {
        id: s.id,
        name: rawName,
        shirtNumber: shirt,
        x: s.verticalLayout?.x ?? 0.5,
        y: s.verticalLayout?.y ?? 0.5,
        photoUrl,
        rating: s.performance?.rating ?? null,
      };
    });
  };

  return {
    home: {
      formation: lineup.homeTeam.formation || "4-2-3-1",
      starters: mapStarters(lineup.homeTeam.starters, isHomeSporting),
    },
    away: {
      formation: lineup.awayTeam.formation || "4-2-3-1",
      starters: mapStarters(lineup.awayTeam.starters, isAwaySporting),
    },
  };
}
