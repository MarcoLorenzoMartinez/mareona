"use server";

import { createClient } from "@/lib/supabase/server";
import type { DirectConversationSummary, DirectMessage } from "./direct-messages-types";

/**
 * Retrieves all direct message conversations for the authenticated user,
 * populated with the friend's identity and preview of the latest visible message.
 *
 * @returns Ordered list of active 1:1 conversations (empty array if none exist).
 */
export async function getDirectConversations(): Promise<readonly DirectConversationSummary[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    // 1. Fetch conversations the user is a member of
    const { data: myMemberships, error: memberErr } = await supabase
      .from("conversation_members")
      .select("conversation_id, last_read_at")
      .eq("user_id", user.id);

    if (memberErr || !myMemberships || myMemberships.length === 0) {
      return [];
    }

    const convIds = myMemberships.map((m) => m.conversation_id);

    // 2. Fetch the other participant profiles and user's active blocks in parallel
    const [{ data: otherMembers, error: otherErr }, { data: myBlocks }] = await Promise.all([
      supabase
        .from("conversation_members")
        .select(
          `conversation_id, user_id,
           profiles (id, username, display_name, avatar_url)`
        )
        .in("conversation_id", convIds)
        .neq("user_id", user.id),
      supabase
        .from("user_blocks")
        .select("blocked_id")
        .eq("blocker_id", user.id),
    ]);

    if (otherErr || !otherMembers) return [];

    const blockedIds = new Set((myBlocks ?? []).map((b) => b.blocked_id));

    // 3. Fetch latest non-deleted messages for each conversation
    const { data: latestMessages } = await supabase
      .from("messages")
      .select("id, conversation_id, sender_id, body, created_at")
      .in("conversation_id", convIds)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    const results: DirectConversationSummary[] = [];

    for (const membership of myMemberships) {
      const other = otherMembers.find((m) => m.conversation_id === membership.conversation_id);
      if (!other || blockedIds.has(other.user_id)) continue;

      const profile = other.profiles as {
        id: string;
        username: string;
        display_name: string | null;
        avatar_url: string | null;
      } | null;

      if (!profile) continue;

      const convMessages = (latestMessages ?? []).filter(
        (m) => m.conversation_id === membership.conversation_id
      );
      const lastMsg = convMessages[0] ?? null;

      const unreadCount = membership.last_read_at
        ? convMessages.filter(
            (m) =>
              m.sender_id !== user.id &&
              new Date(m.created_at) > new Date(membership.last_read_at!)
          ).length
        : convMessages.filter((m) => m.sender_id !== user.id).length;

      results.push({
        id: membership.conversation_id,
        otherUserId: profile.id,
        otherUserName: profile.display_name || profile.username,
        otherUserUsername: profile.username,
        otherUserAvatar: profile.avatar_url,
        lastMessageBody: lastMsg?.body ?? null,
        lastMessageCreatedAt: lastMsg?.created_at ?? null,
        lastMessageIsMine: lastMsg ? lastMsg.sender_id === user.id : false,
        unreadCount,
      });
    }

    // Sort by most recent activity
    return results.sort((a, b) => {
      const timeA = a.lastMessageCreatedAt ? new Date(a.lastMessageCreatedAt).getTime() : 0;
      const timeB = b.lastMessageCreatedAt ? new Date(b.lastMessageCreatedAt).getTime() : 0;
      return timeB - timeA;
    });
  } catch {
    return [];
  }
}

/**
 * Fetches all ordered non-deleted messages in a direct conversation and marks it read.
 *
 * @param conversationId - Target conversation UUID.
 * @returns Ordered list of active messages visible to conversation members.
 */
export async function getDirectMessages(
  conversationId: string
): Promise<readonly DirectMessage[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    // Check membership via secure RPC
    const { data: isMember } = await supabase.rpc("is_conversation_member", {
      p_conversation_id: conversationId,
    });

    if (!isMember) return [];

    // Mark as read in background
    void supabase
      .from("conversation_members")
      .update({ last_read_at: new Date().toISOString() })
      .match({ conversation_id: conversationId, user_id: user.id });

    // Fetch messages
    const { data: messages, error } = await supabase
      .from("messages")
      .select(
        `id, conversation_id, sender_id, body, created_at,
         profiles (username, display_name, avatar_url)`
      )
      .eq("conversation_id", conversationId)
      .is("deleted_at", null)
      .order("created_at", { ascending: true })
      .limit(100);

    if (error || !messages) return [];

    return messages.map((m) => {
      const profile = m.profiles as {
        username: string;
        display_name: string | null;
        avatar_url: string | null;
      } | null;

      return {
        id: m.id,
        conversationId: m.conversation_id,
        senderId: m.sender_id ?? "",
        senderName: profile?.display_name || profile?.username || "Aficionado",
        senderUsername: profile?.username || "aficionado",
        senderAvatar: profile?.avatar_url || null,
        body: m.body,
        createdAt: m.created_at,
        isMine: m.sender_id === user.id,
      };
    });
  } catch {
    return [];
  }
}
