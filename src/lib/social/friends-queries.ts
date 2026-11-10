"use server";

import { createClient } from "@/lib/supabase/server";
import { DEMO_SEARCH_AFICIONADOS } from "./seed-posts";
import { filterFriendsList, normalizeSearchQuery } from "./friends-search-utils";
import {
  isTestFriend,
  TEST_FRIEND_ID,
  TEST_FRIENDSHIP_ID,
  TEST_FRIEND_SUMMARY,
} from "./test-friend-chat";
import type { FriendSummary, FriendshipStatus } from "./friendship-schemas";

/**
 * Returns friend user IDs for the specified user.
 */
export async function getFriendIdsForUser(userId: string): Promise<readonly string[]> {
  try {
    const supabase = await createClient();
    const { data: rows } = await supabase
      .from("friendships")
      .select("requester_id, addressee_id")
      .eq("status", "accepted")
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

    if (!rows) return [];
    return rows.map((r) => (r.requester_id === userId ? r.addressee_id : r.requester_id));
  } catch {
    return [];
  }
}

/**
 * Checks friendship status between current user and target user.
 */
export async function getFriendshipStatusWith(
  targetUserId: string
): Promise<{ status: FriendshipStatus; friendshipId?: string }> {
  if (isTestFriend(targetUserId)) {
    return { status: "accepted", friendshipId: TEST_FRIENDSHIP_ID };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.id === targetUserId) return { status: "none" };

    const { data: row } = await supabase
      .from("friendships")
      .select("id, requester_id, status")
      .or(
        `and(requester_id.eq.${user.id},addressee_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},addressee_id.eq.${user.id})`
      )
      .maybeSingle();

    if (!row) return { status: "none" };
    if (row.status === "accepted") return { status: "accepted", friendshipId: row.id };
    if (row.requester_id === user.id) return { status: "pending_sent", friendshipId: row.id };
    return { status: "pending_received", friendshipId: row.id };
  } catch {
    return { status: "none" };
  }
}

/**
 * Retrieves the full list of friends for the logged-in user.
 */
export async function getMyFriendsList(): Promise<readonly FriendSummary[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data: rows } = await supabase
      .from("friendships")
      .select("id, requester_id, addressee_id")
      .eq("status", "accepted")
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

    if (!rows || rows.length === 0) return [TEST_FRIEND_SUMMARY];

    const friendIds = rows.map((r) => (r.requester_id === user.id ? r.addressee_id : r.requester_id));

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url")
      .in("id", friendIds);

    if (!profiles || profiles.length === 0) return [TEST_FRIEND_SUMMARY];

    const mapped: FriendSummary[] = profiles.map((p) => {
      const match = rows.find((r) => r.requester_id === p.id || r.addressee_id === p.id);
      return {
        id: p.id,
        friendshipId: match?.id ?? "",
        username: p.username,
        displayName: p.display_name,
        avatarUrl: p.avatar_url,
      };
    });

    if (!mapped.some((f) => f.id === TEST_FRIEND_ID)) {
      mapped.unshift(TEST_FRIEND_SUMMARY);
    }
    return mapped;
  } catch {
    return [TEST_FRIEND_SUMMARY];
  }
}

/**
 * Searches users by username or display name for friend addition.
 */
export async function searchAficionados(query: string): Promise<readonly FriendSummary[]> {
  const cleanQuery = normalizeSearchQuery(query);
  if (cleanQuery.length < 2) return [];

  // When Supabase environment variables are missing (local demo mode / sandbox),
  // immediately resolve using the fallback demo dataset.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return filterFriendsList(DEMO_SEARCH_AFICIONADOS, cleanQuery);
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url")
      .or(`username.ilike.%${cleanQuery}%,display_name.ilike.%${cleanQuery}%`)
      .limit(10);

    if (error || !profiles || profiles.length === 0) {
      return filterFriendsList(DEMO_SEARCH_AFICIONADOS, cleanQuery, user?.id);
    }

    const filtered = user ? profiles.filter((p) => p.id !== user.id) : profiles;

    return filtered.map((p) => ({
      id: p.id,
      friendshipId: "",
      username: p.username,
      displayName: p.display_name,
      avatarUrl: p.avatar_url,
    }));
  } catch {
    return filterFriendsList(DEMO_SEARCH_AFICIONADOS, cleanQuery);
  }
}
