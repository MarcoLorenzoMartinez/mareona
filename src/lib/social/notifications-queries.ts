"use server";

import { createClient } from "@/lib/supabase/server";
import { computeTotalUnreadNotifications } from "./notifications-utils";
import { getDirectConversations } from "./direct-messages-queries";

export interface SocialNotificationCounts {
  readonly unreadMessagesCount: number;
  readonly pendingFriendRequestsCount: number;
  readonly totalUnread: number;
}

/**
 * Fetches unread social notification counts (pending friend requests and unread DMs).
 */
export async function getSocialNotificationCounts(): Promise<SocialNotificationCounts> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { unreadMessagesCount: 0, pendingFriendRequestsCount: 0, totalUnread: 0 };
    }

    // 1. Pending friend requests received
    const { count: requestsCount } = await supabase
      .from("friendships")
      .select("id", { count: "exact", head: true })
      .eq("addressee_id", user.id)
      .eq("status", "pending");

    // 2. Count distinct conversations that have unread messages (chats con mensajes pendientes)
    const conversations = await getDirectConversations();
    const unreadMessagesCount = conversations.filter((c) => (c.unreadCount || 0) > 0).length;
    const pendingFriendRequestsCount = requestsCount || 0;

    const totalUnread = computeTotalUnreadNotifications({
      unreadMessagesCount,
      pendingFriendRequestsCount,
    });

    return {
      unreadMessagesCount,
      pendingFriendRequestsCount,
      totalUnread,
    };
  } catch {
    return { unreadMessagesCount: 0, pendingFriendRequestsCount: 0, totalUnread: 0 };
  }
}
