import type { DomainMatchDetail, DomainLineupPlayer } from "../sports-api/types.ts";
import type { Card } from "./types.ts";
import { resolveCardSlugForPlayer } from "./match-card-resolver.ts";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../types/database.types.ts";

export interface MatchSyncResult {
  readonly matchId: string;
  readonly competition: string;
  readonly skipped: boolean;
  readonly reason?: "already_synced" | "unofficial_competition" | "match_not_finished";
  readonly updatedSlugs: readonly string[];
  readonly playerMatchesDelta: Readonly<Record<string, number>>;
}

const OFFICIAL_COMPETITIONS = [
  "segunda division",
  "laliga hypermotion",
  "laliga 2",
  "copa del rey",
  "copa de s.m. el rey",
  "copa uefa",
  "uefa",
  "europa league",
  "copa de la liga",
  "promocion",
  "copa federacion",
  "campeonato regional",
  "fase previa",
] as const;

/**
 * Checks whether a competition belongs to an official tournament included in
 * the all-competitions appearance total.
 */
export function isOfficialCompetition(competitionName: string): boolean {
  const norm = competitionName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
  return OFFICIAL_COMPETITIONS.some((official) => norm.includes(official));
}

/**
 * Extracts Sporting players who actually participated in the match on the pitch.
 */
export function extractParticipatingPlayers(
  match: DomainMatchDetail
): readonly DomainLineupPlayer[] {
  const sportingLineup = match.homeTeam.isSporting
    ? match.homeLineup
    : match.awayTeam.isSporting
      ? match.awayLineup
      : null;

  if (!sportingLineup) return [];

  const participants: DomainLineupPlayer[] = [];
  for (const starter of sportingLineup.starters) {
    if (starter.isStarter) participants.push(starter);
  }
  for (const sub of sportingLineup.substitutes) {
    if (sub.subbedIn) participants.push(sub);
  }

  return participants;
}

/**
 * Computes card sync updates for a match enforcing idempotency and competition rules.
 */
export function computeMatchSyncUpdates(
  match: DomainMatchDetail,
  existingSyncs: ReadonlySet<string>
): MatchSyncResult {
  if (existingSyncs.has(match.externalId)) {
    return { matchId: match.externalId, competition: match.competition, skipped: true, reason: "already_synced", updatedSlugs: [], playerMatchesDelta: {} };
  }
  if (!isOfficialCompetition(match.competition)) {
    return { matchId: match.externalId, competition: match.competition, skipped: true, reason: "unofficial_competition", updatedSlugs: [], playerMatchesDelta: {} };
  }
  if (match.status !== "finished") {
    return { matchId: match.externalId, competition: match.competition, skipped: true, reason: "match_not_finished", updatedSlugs: [], playerMatchesDelta: {} };
  }

  const participants = extractParticipatingPlayers(match);
  const updatedSlugs: string[] = [];
  const playerMatchesDelta: Record<string, number> = {};

  for (const player of participants) {
    const slug = resolveCardSlugForPlayer(player);
    if (slug) {
      updatedSlugs.push(slug);
      playerMatchesDelta[slug] = (playerMatchesDelta[slug] ?? 0) + 1;
    }
  }

  return {
    matchId: match.externalId,
    competition: match.competition,
    skipped: false,
    updatedSlugs,
    playerMatchesDelta,
  };
}

/**
 * Applies calculated match sync increments to in-memory card catalog.
 * Preserves OVR, ATQ and DEF combat attributes while incrementing matchesPlayed.
 */
export function applySyncToMemoryCatalog(
  cards: readonly Card[],
  updates: readonly MatchSyncResult[]
): Card[] {
  const totalDeltas: Record<string, number> = {};
  for (const update of updates) {
    if (update.skipped) continue;
    for (const [slug, delta] of Object.entries(update.playerMatchesDelta)) {
      totalDeltas[slug] = (totalDeltas[slug] ?? 0) + delta;
    }
  }

  return cards.map((card) => {
    const delta = totalDeltas[card.slug];
    if (!delta) return card;
    return {
      ...card,
      matchesPlayed: (card.matchesPlayed ?? 0) + delta,
    };
  });
}

/**
 * Synchronizes finished matches with Supabase database ensuring strict idempotency.
 */
export async function syncFinishedMatchesWithSupabase(
  supabase: SupabaseClient<Database>,
  matches: readonly DomainMatchDetail[]
): Promise<readonly MatchSyncResult[]> {
  const { data: existingRows } = await supabase
    .from("card_match_sync")
    .select("match_id");

  const existingIds = new Set(
    existingRows?.map((r) => r.match_id) ?? []
  );

  const results: MatchSyncResult[] = [];

  for (const match of matches) {
    const result = computeMatchSyncUpdates(match, existingIds);
    results.push(result);

    if (!result.skipped && result.updatedSlugs.length > 0) {
      await supabase.from("card_match_sync").insert({
        match_id: match.externalId,
        competition: match.competition,
        match_date: match.kickoffAt,
        synced_card_slugs: [...result.updatedSlugs],
      });

      existingIds.add(match.externalId);
    }
  }

  return results;
}
