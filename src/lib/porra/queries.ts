'use server';

import { createClient } from '@/lib/supabase/server';
import type { PorraLeaderboardEntry } from './types';

export interface PorraCommunityData {
  readonly entries: readonly PorraLeaderboardEntry[];
  readonly friendsCount: number;
}

/**
 * Fetches real global and friends leaderboard data from Supabase.
 * Never returns mock or synthetic data.
 *
 * @param currentMatchExternalId - External ID of the active matchday fixture.
 * @returns Community leaderboard entries and total accepted friends count.
 */
export async function fetchPorraCommunityData(
  currentMatchExternalId: string
): Promise<PorraCommunityData> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return { entries: [], friendsCount: 0 };
  }

  try {
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

    const { data: topProfiles } = await supabase
      .from('profiles')
      .select('id, username, display_name, points')
      .eq('is_banned', false)
      .gt('points', 0)
      .order('points', { ascending: false })
      .limit(50);

    const friendIds = Array.from(friendIdSet);
    const { data: friendProfiles } =
      friendIds.length > 0
        ? await supabase
            .from('profiles')
            .select('id, username, display_name, points')
            .eq('is_banned', false)
            .in('id', friendIds)
        : { data: [] };

    const profileMap = new Map<
      string,
      {
        id: string;
        username: string;
        display_name: string | null;
        points: number;
      }
    >();

    for (const p of topProfiles ?? []) {
      profileMap.set(p.id, p);
    }
    for (const p of friendProfiles ?? []) {
      profileMap.set(p.id, p);
    }

    if (profileMap.size === 0) {
      return { entries: [], friendsCount: friendIdSet.size };
    }

    const allProfileIds = Array.from(profileMap.keys());

    // Resolve internal match UUID for the current external match ID if synced
    const { data: matchRow } = await supabase
      .from('matches')
      .select('id')
      .eq('external_id', currentMatchExternalId)
      .maybeSingle();

    const { data: predictionRows } = await supabase
      .from('predictions')
      .select('user_id, match_id, home_score, away_score, points_awarded, created_at')
      .in('user_id', allProfileIds)
      .order('created_at', { ascending: false });

    const entries: PorraLeaderboardEntry[] = [];

    for (const profile of profileMap.values()) {
      const userPreds = (predictionRows ?? []).filter(
        (pr) => pr.user_id === profile.id
      );

      let exactScoresCount = 0;
      let outcomesCount = 0;
      let computedPoints = 0;
      let lastMatchPoints: number | undefined;

      for (const pr of userPreds) {
        if (pr.points_awarded !== null) {
          computedPoints += pr.points_awarded;
          if (pr.points_awarded >= 5) {
            exactScoresCount += 1;
            outcomesCount += 1;
          } else if (pr.points_awarded >= 2) {
            outcomesCount += 1;
          }
          if (lastMatchPoints === undefined) {
            lastMatchPoints = pr.points_awarded;
          }
        }
      }

      const activePred = matchRow
        ? userPreds.find((pr) => pr.match_id === matchRow.id)
        : undefined;

      const totalPoints = Math.max(profile.points, computedPoints);
      const isFriend = friendIdSet.has(profile.id);
      const isCurrentUser = user?.id === profile.id;

      if (totalPoints > 0 || isFriend || isCurrentUser || activePred) {
        entries.push({
          rank: 0,
          userId: profile.id,
          userName: profile.display_name || profile.username,
          avatarSeed: profile.username,
          totalPoints,
          exactScoresCount,
          outcomesCount,
          lastMatchPoints,
          currentPrediction: activePred
            ? {
                homeScore: activePred.home_score,
                awayScore: activePred.away_score,
                sportingScorers: [],
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
