import "server-only";

import { fetchSportingSeasonMatches, fetchSportingSquad } from "@/lib/sports-api/client";
import { fetchTeamSeasonStats } from "@/lib/sports-api/team-season-stats";
import { CANONICAL_SPORTING_NAME, getSeasonLabel } from "@/lib/sports-api/types";
import { getMatchesForSeason } from "@/lib/historical/service";
import { attachmentRefSchema, type AttachmentRef } from "./schemas";
import { buildStatItem } from "./stat-catalog";
import type {
  ResolvedAttachment,
  ResolvedMatchAttachment,
  ResolvedPlayerAttachment,
  ResolvedStatAttachment,
} from "./types";

const STATS_HREF = "/temporada/estadisticas";

async function resolveStat(ref: Extract<AttachmentRef, { type: "stat" }>): Promise<ResolvedStatAttachment | null> {
  const stats = await fetchTeamSeasonStats();
  if (!stats) return null;
  const item = buildStatItem(stats, ref.key);
  return {
    type: "stat",
    href: STATS_HREF,
    category: item.category,
    label: item.label,
    value: item.value,
    rank: item.rank,
    lowerIsBetter: item.lowerIsBetter,
    seasonLabel: getSeasonLabel(stats.seasonYear),
  };
}

async function resolvePlayer(ref: Extract<AttachmentRef, { type: "player" }>): Promise<ResolvedPlayerAttachment | null> {
  const squad = await fetchSportingSquad();
  const player = squad.find((p) => p.externalId === ref.playerId);
  if (!player) return null;
  return {
    type: "player",
    href: `/temporada/plantilla/${player.shirtNumber ?? player.externalId}`,
    name: player.displayName,
    shirtNumber: player.shirtNumber,
    positionLabel: player.positionLabel,
    photoUrl: player.photoUrl,
    appearances: player.stats.appearances,
    goals: player.stats.goals,
    assists: player.stats.assists,
  };
}

async function resolveMatch(ref: Extract<AttachmentRef, { type: "match" }>): Promise<ResolvedMatchAttachment | null> {
  const matches = await fetchSportingSeasonMatches();
  const m = matches.find((x) => x.externalId === ref.matchId);
  if (!m) return null;
  return {
    type: "match",
    href: `/temporada/partidos/${m.externalId}`,
    isHistorical: false,
    competition: m.competition,
    roundLabel: m.roundName ?? (m.matchday ? `Jornada ${m.matchday}` : null),
    kickoffAt: m.kickoffAt,
    status: m.status === "live" ? "live" : m.status === "finished" ? "finished" : "scheduled",
    homeName: m.homeTeam.name,
    awayName: m.awayTeam.name,
    homeCrestUrl: m.homeTeam.crestUrl,
    awayCrestUrl: m.awayTeam.crestUrl,
    homeScore: m.homeScore,
    awayScore: m.awayScore,
    sportingIsHome: m.homeTeam.isSporting,
  };
}

function resolveHistoricalMatch(ref: Extract<AttachmentRef, { type: "historical_match" }>): ResolvedMatchAttachment | null {
  const m = getMatchesForSeason(ref.seasonId).find((x) => x.id === ref.matchId);
  if (!m) return null;
  return {
    type: "match",
    href: `/historico?temporada=${ref.seasonId}&vista=partidos`,
    isHistorical: true,
    competition: m.competition,
    roundLabel: m.round || null,
    kickoffAt: m.date,
    status: "finished",
    homeName: m.homeTeam,
    awayName: m.awayTeam,
    homeCrestUrl: m.homeCrestUrl ?? null,
    awayCrestUrl: m.awayCrestUrl ?? null,
    homeScore: m.homeScore,
    awayScore: m.awayScore,
    sportingIsHome: m.homeTeam === CANONICAL_SPORTING_NAME,
  };
}

/**
 * Resolves an attachment reference into display data from the live caches.
 *
 * @param ref - Validated attachment reference.
 * @returns Display data, or `null` when the referenced entity does not exist (or its source is down).
 */
export async function resolveAttachment(
  ref: AttachmentRef
): Promise<Exclude<ResolvedAttachment, { type: "unavailable" }> | null> {
  switch (ref.type) {
    case "stat":
      return resolveStat(ref);
    case "player":
      return resolvePlayer(ref);
    case "match":
      return resolveMatch(ref);
    case "historical_match":
      return resolveHistoricalMatch(ref);
  }
}

/**
 * Resolves the raw JSON stored in `posts.attachment` for rendering. Invalid or unresolvable
 * references degrade to an explicit "unavailable" card instead of invented content.
 *
 * @param raw - JSON value read from the database.
 * @returns Resolved attachment, or `null` when the post has none.
 */
export async function resolveStoredAttachment(raw: unknown): Promise<ResolvedAttachment | null> {
  if (raw === null || raw === undefined) return null;
  const parsed = attachmentRefSchema.safeParse(raw);
  if (!parsed.success) return { type: "unavailable" };
  try {
    return (await resolveAttachment(parsed.data)) ?? { type: "unavailable" };
  } catch {
    return { type: "unavailable" };
  }
}

/**
 * Batch version of {@link resolveStoredAttachment} that resolves each distinct reference once,
 * so a feed with many posts quoting the same player triggers a single lookup.
 *
 * @param rawValues - `posts.attachment` values in feed order.
 * @returns Resolved attachments aligned with the input order.
 */
export async function resolveStoredAttachments(
  rawValues: readonly unknown[]
): Promise<readonly (ResolvedAttachment | null)[]> {
  const cache = new Map<string, Promise<ResolvedAttachment | null>>();
  return Promise.all(
    rawValues.map((raw) => {
      if (raw === null || raw === undefined) return null;
      const key = JSON.stringify(raw);
      const cached = cache.get(key) ?? resolveStoredAttachment(raw);
      cache.set(key, cached);
      return cached;
    })
  );
}
