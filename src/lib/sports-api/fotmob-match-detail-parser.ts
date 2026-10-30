import {
  normalizeAthleteName,
  mapPositionToLabel,
  mapPositionToShort,
  type DomainMatchLineup,
  type DomainLineupPlayer,
  type DomainPlayerPosition,
  type DomainMatchEvent,
  type MatchEventType,
} from "./types.ts";

export interface FotMobLineupRawPlayer {
  readonly id: number;
  readonly name: string;
  readonly shirtNumber?: string | number;
  readonly positionId?: number;
  readonly usualPlayingPositionId?: number;
  readonly verticalLayout?: { readonly x?: number; readonly y?: number };
  readonly performance?: {
    readonly rating?: number | null;
    readonly events?: readonly { readonly type: string; readonly time?: number }[];
  };
}

export interface FotMobLineupRawTeam {
  readonly id?: number;
  readonly name?: string;
  readonly formation?: string;
  readonly starters?: readonly FotMobLineupRawPlayer[];
  readonly subs?: readonly FotMobLineupRawPlayer[];
}

export interface FotMobRawEvent {
  readonly eventId?: number | string;
  readonly type?: string;
  readonly time?: number;
  readonly timeStr?: string | number;
  readonly isHome?: boolean;
  readonly player?: { readonly id?: number | null; readonly name?: string | null };
  readonly ownGoal?: boolean | null;
  readonly card?: string;
}

/**
 * Maps FotMob usualPlayingPositionId (0: GK, 1: DEF, 2: MID, 3: ATT) or positionId to domain position.
 */
export function mapFotMobPlayerPosition(
  usualPosId?: number,
  posColId?: number
): DomainPlayerPosition {
  if (usualPosId === 0) return "goalkeeper";
  if (usualPosId === 1) return "defender";
  if (usualPosId === 2) return "midfielder";
  if (usualPosId === 3) return "forward";

  if (posColId !== undefined) {
    if (posColId === 11) return "goalkeeper";
    if (posColId >= 30 && posColId < 60) return "defender";
    if (posColId >= 60 && posColId < 90) return "midfielder";
    if (posColId >= 90) return "forward";
  }

  return "midfielder";
}

/**
 * Parses raw FotMob lineup into canonical DomainMatchLineup.
 */
export function parseFotMobMatchLineup(
  team?: FotMobLineupRawTeam | null,
  isSporting: boolean = false
): DomainMatchLineup | null {
  if (!team?.starters || team.starters.length === 0) return null;

  const teamId = String(team.id ?? "");
  const teamName = isSporting ? "Real Sporting" : (team.name ?? "");
  const formation = team.formation || "4-2-3-1";

  const mapPlayer = (p: FotMobLineupRawPlayer, isStarter: boolean): DomainLineupPlayer => {
    const rawName = p.name || "";
    const norm = normalizeAthleteName({ id: String(p.id), displayName: rawName });
    const jerseyNum = p.shirtNumber !== undefined ? parseInt(String(p.shirtNumber), 10) : null;
    const jersey = jerseyNum !== null && !Number.isNaN(jerseyNum) ? jerseyNum : null;
    const pos = mapFotMobPlayerPosition(p.usualPlayingPositionId, p.positionId);
    const photoUrl =
      isSporting && jersey
        ? `/images/players/${jersey}.png`
        : p.id
        ? `https://images.fotmob.com/image_resources/playerimages/${p.id}.png`
        : null;

    return {
      id: String(p.id),
      name: norm.name,
      shortName: norm.shortName,
      jersey,
      position: pos,
      positionLabel: mapPositionToLabel(pos),
      subposition: mapPositionToShort(pos),
      formationPlace: null,
      isStarter,
      photoUrl,
    };
  };

  return {
    teamId,
    teamName,
    isSporting,
    formation,
    starters: team.starters.map((p) => mapPlayer(p, true)),
    substitutes: (team.subs ?? []).map((p) => mapPlayer(p, false)),
  };
}

/**
 * Parses FotMob match facts events array into canonical DomainMatchEvent list.
 */
export function parseFotMobMatchEvents(
  rawEvents: readonly FotMobRawEvent[] = [],
  isHomeSporting: boolean,
  isAwaySporting: boolean,
  homeTeamId: string,
  awayTeamId: string
): readonly DomainMatchEvent[] {
  const events: DomainMatchEvent[] = [];

  for (const e of rawEvents) {
    if (!e.type || e.type === "Half") continue;

    let type: MatchEventType | null = null;
    const t = e.type.toLowerCase();
    if (t.includes("goal")) {
      type = "goal";
    } else if (t.includes("card")) {
      type = (e.card || "").toLowerCase().includes("red") ? "redCard" : "yellowCard";
    } else if (t.includes("sub")) {
      type = "substitution";
    }

    if (!type) continue;

    const isHome = Boolean(e.isHome);
    const isSporting = isHome ? isHomeSporting : isAwaySporting;
    const teamId = isHome ? homeTeamId : awayTeamId;
    const minStr = String(e.timeStr ?? e.time ?? "0");
    const minute = minStr.endsWith("'") ? minStr : `${minStr}'`;
    const minuteSort = Number(e.time ?? 0);
    const playerName = e.player?.name || "";
    const playerId = String(e.player?.id ?? "");

    events.push({
      id: String(e.eventId ?? `${minuteSort}_${playerId}`),
      type,
      minute,
      minuteSort,
      period: minuteSort > 45 ? 2 : 1,
      teamId,
      isSporting,
      isHome,
      player: {
        id: playerId,
        name: playerName,
      },
    });
  }

  return events;
}
