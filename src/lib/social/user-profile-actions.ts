"use server";

import { createClient } from "@/lib/supabase/server";
import { fetchSportingSeasonMatches } from "@/lib/sports-api/client";
import { getFriendshipStatusWith } from "./friends-queries";
import { formatMatchOriginLabel } from "./format";
import type { UserSocialProfile } from "./friendship-schemas";
import type { SocialPost } from "./types";

/**
 * Fetches user profile card details and their social posts.
 */
export async function getUserSocialProfile(
  userId: string
): Promise<{ profile: UserSocialProfile | null; posts: readonly SocialPost[] }> {
  // Comprobación de variables de entorno para evitar esperas de timeout de red
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { profile: null, posts: [] };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    // Consultas en paralelo para máximo rendimiento
    const [profileRes, statusInfo, postsRes, blockRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, points, created_at")
        .eq("id", userId)
        .maybeSingle(),
      getFriendshipStatusWith(userId),
      supabase
        .from("posts")
        .select("id, body, created_at, updated_at, parent_id, user_id, match_id")
        .eq("user_id", userId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(20),
      currentUser && currentUser.id !== userId
        ? supabase
            .from("user_blocks")
            .select("blocked_id")
            .eq("blocker_id", currentUser.id)
            .eq("blocked_id", userId)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    const profileData = profileRes.data;
    if (!profileData) return { profile: null, posts: [] };

    const profile: UserSocialProfile = {
      id: profileData.id,
      username: profileData.username,
      displayName: profileData.display_name,
      avatarUrl: profileData.avatar_url,
      points: profileData.points ?? 0,
      createdAt: profileData.created_at,
      friendshipStatus: statusInfo.status,
      friendshipId: statusInfo.friendshipId,
      isBlockedByMe: Boolean(blockRes.data),
    };

    const rawPosts = postsRes.data ?? [];
    const matchIds = Array.from(
      new Set(rawPosts.map((p) => p.match_id).filter((id): id is string => Boolean(id)))
    );

    const matchLabels = new Map<string, string>();
    if (matchIds.length > 0) {
      try {
        const seasonMatches = await fetchSportingSeasonMatches();
        for (const m of seasonMatches) {
          const label = formatMatchOriginLabel(
            m.homeTeam.name,
            m.awayTeam.name
          );
          if (label) {
            matchLabels.set(m.externalId, label);
          }
        }
      } catch {
        // Non-blocking fallback if external schedule cache is unavailable
      }
    }

    const posts: readonly SocialPost[] = rawPosts.map((p) => ({
      id: p.id,
      userId: p.user_id,
      authorName: profile.displayName || profile.username,
      authorUsername: profile.username,
      authorAvatar: profile.avatarUrl,
      body: p.body,
      createdAt: p.created_at,
      updatedAt: p.updated_at ?? null,
      isEdited: Boolean(
        p.updated_at &&
          new Date(p.updated_at).getTime() - new Date(p.created_at).getTime() > 1000
      ),
      parentId: p.parent_id,
      matchId: p.match_id ?? null,
      matchLabel: p.match_id ? (matchLabels.get(p.match_id) ?? null) : null,
      likesCount: 0,
      repliesCount: 0,
    }));

    return { profile, posts };
  } catch {
    return { profile: null, posts: [] };
  }
}
