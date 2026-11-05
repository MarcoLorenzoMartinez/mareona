"use server";

import { fetchSportingSeasonMatches, fetchSportingSquad } from "@/lib/sports-api/client";
import { fetchTeamSeasonStats } from "@/lib/sports-api/team-season-stats";
import { getAllSeasons, getMatchesForSeason } from "@/lib/historical/service";
import { formatAttachmentDate, formatScoreLine } from "./attachments/format";
import { buildStatItems } from "./attachments/stat-catalog";
import type { AttachmentRef } from "./attachments/schemas";

export interface AttachmentOption {
  readonly ref: AttachmentRef;
  readonly title: string;
  readonly subtitle: string;
}

export interface HistoricalSeasonOption {
  readonly id: string;
  readonly label: string;
}

export interface AttachmentOptions {
  readonly stats: readonly AttachmentOption[];
  readonly players: readonly AttachmentOption[];
  readonly matches: readonly AttachmentOption[];
  readonly seasons: readonly HistoricalSeasonOption[];
}

/**
 * Lists the Mareona data a user can attach to a post. Each list is empty (never faked) when its
 * source is unavailable, so the picker can say so transparently.
 *
 * @returns Options grouped by attachment kind.
 */
export async function getAttachmentOptions(): Promise<AttachmentOptions> {
  const [stats, squad, matches] = await Promise.all([
    fetchTeamSeasonStats().catch(() => null),
    fetchSportingSquad().catch(() => []),
    fetchSportingSeasonMatches().catch(() => []),
  ]);

  return {
    stats: stats
      ? buildStatItems(stats).map((s) => ({
          ref: { type: "stat", key: s.key },
          title: s.label,
          subtitle: `${s.category} · ${s.value}`,
        }))
      : [],
    players: squad.map((p) => ({
      ref: { type: "player", playerId: p.externalId },
      title: p.displayName,
      subtitle: [p.shirtNumber !== null ? `#${p.shirtNumber}` : null, p.positionLabel]
        .filter(Boolean)
        .join(" · "),
    })),
    matches: matches.map((m) => ({
      ref: { type: "match", matchId: m.externalId },
      title: formatScoreLine(m.homeTeam.name, m.awayTeam.name, m.homeScore, m.awayScore),
      subtitle: [m.roundName ?? (m.matchday ? `Jornada ${m.matchday}` : null), formatAttachmentDate(m.kickoffAt)]
        .filter(Boolean)
        .join(" · "),
    })),
    seasons: getAllSeasons()
      .filter((s) => getMatchesForSeason(s.id).length > 0)
      .map((s) => ({ id: s.id, label: s.label })),
  };
}

/**
 * Lists the matches of a historical season for the picker.
 *
 * @param seasonId - Season identifier such as "2014-15".
 * @returns Match options, or an empty list for an unknown season.
 */
export async function getHistoricalMatchOptions(
  seasonId: string
): Promise<readonly AttachmentOption[]> {
  if (!/^\d{4}-\d{2}$/.test(seasonId)) return [];
  return getMatchesForSeason(seasonId).map((m) => ({
    ref: { type: "historical_match", seasonId, matchId: m.id },
    title: formatScoreLine(m.homeTeam, m.awayTeam, m.homeScore, m.awayScore),
    subtitle: [m.competition, m.round, formatAttachmentDate(m.date)].filter(Boolean).join(" · "),
  }));
}
