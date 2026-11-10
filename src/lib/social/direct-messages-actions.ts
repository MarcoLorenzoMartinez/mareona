"use server";

import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/security/rate-limiter";
import { MODERATION_REJECTED_MESSAGE, moderateText } from "./moderation";
import { logBlockedAttempt } from "./moderation-log";
import {
  sendDirectMessageSchema,
  openDirectConversationSchema,
  type SendDirectMessageInput,
  type OpenDirectConversationInput,
} from "./direct-messages-schemas";
import {
  isTestFriend,
  isTestConversation,
  sendTestDirectMessage,
  TEST_CONVERSATION_ID,
} from "./test-friend-chat";
import type { DirectMessage } from "./direct-messages-types";

interface ActionResult<T = void> {
  readonly success: boolean;
  readonly error?: string;
  readonly data?: T;
}

/**
 * Sends a private direct message to an active conversation between friends.
 */
export async function sendDirectMessage(
  input: SendDirectMessageInput
): Promise<ActionResult<DirectMessage>> {
  const parsed = sendDirectMessageSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Mensaje inválido" };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Debes iniciar sesión para enviar mensajes" };
    }

    // Rate Limiting (10 messages per minute)
    const rateLimit = checkRateLimit({ key: `dm_${user.id}`, limit: 10, windowMs: 60_000 });
    if (!rateLimit.allowed) {
      return {
        success: false,
        error: `Has enviado demasiados mensajes. Espera ${rateLimit.retryAfterSeconds} segundos.`,
      };
    }

    // AI/Regex Safety Moderation
    const moderation = await moderateText(parsed.data.body);
    if (moderation.verdict === "block") {
      await logBlockedAttempt(supabase, {
        userId: user.id,
        body: parsed.data.body,
        reason: moderation.reason,
      });
      return { success: false, error: moderation.reason || MODERATION_REJECTED_MESSAGE };
    }

    if (isTestConversation(parsed.data.conversationId)) {
      return { success: true, data: sendTestDirectMessage(parsed.data.body, user.id) };
    }

    // Verify permission to post in conversation via RPC
    const { data: canMessage } = await supabase.rpc("can_message_conversation", {
      p_conversation_id: parsed.data.conversationId,
    });

    if (!canMessage) {
      return {
        success: false,
        error: "No puedes enviar mensajes a esta conversación o has sido bloqueado",
      };
    }

    // Insert message into database
    const { data: inserted, error: insertErr } = await supabase
      .from("messages")
      .insert({
        conversation_id: parsed.data.conversationId,
        sender_id: user.id,
        body: parsed.data.body,
      })
      .select("id, conversation_id, sender_id, body, created_at")
      .single();

    if (insertErr || !inserted) {
      return { success: false, error: "No se pudo enviar el mensaje" };
    }

    // Fetch user profile for instant local rendering
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, display_name, avatar_url")
      .eq("id", user.id)
      .single();

    return {
      success: true,
      data: {
        id: inserted.id,
        conversationId: inserted.conversation_id,
        senderId: inserted.sender_id,
        senderName: profile?.display_name || profile?.username || "Aficionado",
        senderUsername: profile?.username || "aficionado",
        senderAvatar: profile?.avatar_url || null,
        body: inserted.body,
        createdAt: inserted.created_at,
        isMine: true,
      },
    };
  } catch {
    return { success: false, error: "Error inesperado al enviar el mensaje" };
  }
}

/**
 * Opens or initializes a 1-on-1 private conversation, verifying mutual friendship first.
 */
export async function getOrCreateConversationWithFriend(
  input: OpenDirectConversationInput
): Promise<ActionResult<{ conversationId: string }>> {
  const parsed = openDirectConversationSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Aficionado no válido" };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Debes iniciar sesión para conectar" };
    }

    if (user.id === parsed.data.targetUserId) {
      return { success: false, error: "No puedes abrir una conversación contigo mismo" };
    }

    if (isTestFriend(parsed.data.targetUserId)) {
      return { success: true, data: { conversationId: TEST_CONVERSATION_ID } };
    }

    // Verify friendship status is accepted
    const filter = `and(requester_id.eq.${user.id},addressee_id.eq.${parsed.data.targetUserId}),and(requester_id.eq.${parsed.data.targetUserId},addressee_id.eq.${user.id})`;
    const { data: friendship } = await supabase.from("friendships").select("id").eq("status", "accepted").or(filter).maybeSingle();

    if (!friendship) {
      return { success: false, error: "Solo puedes iniciar conversaciones privadas con aficionados con los que estés conectado como amigos" };
    }

    const { data: conversationId, error: rpcErr } = await supabase.rpc(
      "get_or_create_direct_conversation",
      { p_other_user: parsed.data.targetUserId }
    );
    if (rpcErr || !conversationId) {
      return { success: false, error: "No se pudo iniciar la conversación privada" };
    }

    return { success: true, data: { conversationId } };
  } catch {
    return { success: false, error: "Error inesperado al abrir la conversación" };
  }
}
