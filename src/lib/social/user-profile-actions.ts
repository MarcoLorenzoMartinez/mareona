"use server";

import { createClient } from "@/lib/supabase/server";
import { getFriendshipStatusWith } from "./friends-queries";
import { DEMO_SEARCH_AFICIONADOS, INITIAL_TERTULIA_POSTS } from "./seed-posts";
import type { UserSocialProfile } from "./friendship-schemas";
import type { SocialPost } from "./types";

/**
 * Fetches user profile card details and their social posts.
 */
export async function getUserSocialProfile(
  userId: string
): Promise<{ profile: UserSocialProfile | null; posts: readonly SocialPost[] }> {
  // 1. Resolución instantánea si es un usuario de demostración / offline
  const demoSeed = DEMO_SEARCH_AFICIONADOS.find((d) => d.id === userId);
  if (demoSeed) {
    const demoProfile: UserSocialProfile = {
      id: demoSeed.id,
      username: demoSeed.username,
      displayName: demoSeed.displayName,
      avatarUrl: demoSeed.avatarUrl,
      points: 150,
      createdAt: "2026-08-15T10:00:00Z",
      friendshipStatus: "none",
    };
    const demoPosts = INITIAL_TERTULIA_POSTS.filter((p) => p.userId === userId);
    return { profile: demoProfile, posts: demoPosts };
  }

  // 2. Comprobación rápida de variables de entorno para evitar esperas de timeout de red
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { profile: null, posts: [] };
  }

  try {
    const supabase = await createClient();

    // Consultas en paralelo para máximo rendimiento
    const [profileRes, statusInfo, postsRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, points, created_at")
        .eq("id", userId)
        .maybeSingle(),
      getFriendshipStatusWith(userId),
      supabase
        .from("posts")
        .select("id, body, created_at, parent_id, user_id")
        .eq("user_id", userId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(20),
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
    };

    const posts: readonly SocialPost[] = (postsRes.data ?? []).map((p) => ({
      id: p.id,
      userId: p.user_id,
      authorName: profile.displayName || profile.username,
      authorUsername: profile.username,
      authorAvatar: profile.avatarUrl,
      body: p.body,
      createdAt: p.created_at,
      parentId: p.parent_id,
      likesCount: 0,
      repliesCount: 0,
    }));

    return { profile, posts };
  } catch {
    return { profile: null, posts: [] };
  }
}
