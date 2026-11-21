'use server';

import { createClient } from '@/lib/supabase/server';
import { settlePendingPredictions } from './settle';
import type { PorraLeaderboardEntry } from './types';

export interface PorraCommunityData {
  readonly entries: readonly PorraLeaderboardEntry[];
  readonly friendsCount: number;
}

/**
 * Fetches real global and friends leaderboard data from Supabase.
 * Uses external canonical match IDs stored directly in public.predictions.match_id.
 * Never returns mock or synthetic data.
 *
 * @param currentMatchExternalId - External ID of the active matchday fixture.
 * @returns Community leaderboard entries and total accepted friends count.
 */
export async function fetchPorraCommunityData(
  currentMatchExternalId: string | null
): Promise<PorraCommunityData> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return { entries: [], friendsCount: 0 };
  }

  try {
    // Settle finished matches on demand (throttled) so points appear immediately after full-time
    await settlePendingPredictions({ respectCooldown: true }).catch(() => 0);

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const friendIdSet = new Set<string>();

    if (user) {
      const { data: friendshipRows } = await supabase
        .from('friendships')
        .select('requester_id, addressee_id')
        .eq('status', 'accepted')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

      if (friendshipRows) {
        for (const r of friendshipRows) {
          const fId =
            r.requester_id === user.id ? r.addressee_id : r.requester_id;
          friendIdSet.add(fId);
        }
      }
    }

    const friendIds = Array.from(friendIdSet);
    const [{ data: leaderboardStats }, { data: friendProfiles }, currentUserProfileResult] =
      await Promise.all([
        supabase.rpc('get_porra_leaderboard_stats', { p_limit: 500 }),
        friendIds.length > 0
          ? supabase
              .from('profiles')
              .select('id, username, display_name, points')
              .eq('is_banned', false)
              .in('id', friendIds)
          : Promise.resolve({ data: [] }),
        user
          ? supabase
              .from('profiles')
              .select('id, username, display_name, points')
              .eq('id', user.id)
              .maybeSingle()
          : Promise.resolve({ data: null }),
      ]);

    const profileMap = new Map<
      string,
      {
        id: string;
        username: string;
        display_name: string | null;
        points: number;
      }
    >();

    const statsByUserId = new Map<
      string,
      { predictionsCount: number; exactHits: number }
    >();

    for (const s of leaderboardStats ?? []) {
      profileMap.set(s.user_id, {
        id: s.user_id,
        username: s.username,
        display_name: s.display_name,
        points: s.points,
      });
      statsByUserId.set(s.user_id, {
        predictionsCount: Number(s.predictions_count),
        exactHits: Number(s.exact_hits),
      });
    }
    for (const p of friendProfiles ?? []) {
      if (!profileMap.has(p.id)) profileMap.set(p.id, p);
    }
    if (currentUserProfileResult.data && !profileMap.has(currentUserProfileResult.data.id)) {
      profileMap.set(currentUserProfileResult.data.id, currentUserProfileResult.data);
    }

    if (profileMap.size === 0) {
      return { entries: [], friendsCount: friendIdSet.size };
    }

    const activeMatchPredsMap = new Map<
      string,
      { home_score: number; away_score: number; sporting_scorers: string[] }
    >();

    if (currentMatchExternalId) {
      const { data: activeRows } = await supabase
        .from('predictions')
        .select('user_id, home_score, away_score, sporting_scorers')
        .eq('match_id', currentMatchExternalId)
        .in('user_id', Array.from(profileMap.keys()));

      for (const row of activeRows ?? []) {
        activeMatchPredsMap.set(row.user_id, {
          home_score: row.home_score,
          away_score: row.away_score,
          sporting_scorers: Array.isArray(row.sporting_scorers)
            ? row.sporting_scorers
            : [],
        });
      }
    }

    const entries: PorraLeaderboardEntry[] = [];

    for (const profile of profileMap.values()) {
      const stat = statsByUserId.get(profile.id);
      const activePred = activeMatchPredsMap.get(profile.id);
      const totalPoints = profile.points;
      const isFriend = friendIdSet.has(profile.id);
      const isCurrentUser = user?.id === profile.id;

      if (totalPoints > 0 || isFriend || isCurrentUser || activePred) {
        entries.push({
          rank: 0,
          userId: profile.id,
          userName: profile.display_name || profile.username,
          avatarSeed: profile.username,
          totalPoints,
          exactScoresCount: stat?.exactHits ?? 0,
          outcomesCount: stat?.predictionsCount ?? 0,
          lastMatchPoints: undefined,
          currentPrediction: activePred
            ? {
                homeScore: activePred.home_score,
                awayScore: activePred.away_score,
                sportingScorers: activePred.sporting_scorers,
              }
            : null,
          isCurrentUser,
          isFriend,
        });
      }
    }

    return { entries, friendsCount: friendIdSet.size };
  } catch {
    return { entries: [], friendsCount: 0 };
  }
}
