"use server";

import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/security/rate-limiter";
import { MODERATION_REJECTED_MESSAGE, moderateText } from "./moderation";
import { logBlockedAttempt } from "./moderation-log";
import {
  sendDirectMessageSchema,
  openDirectConversationSchema,
  deleteDirectMessageSchema,
  type SendDirectMessageInput,
  type OpenDirectConversationInput,
  type DeleteDirectMessageInput,
} from "./direct-messages-schemas";
import type { DirectMessage } from "./direct-messages-types";

interface ActionResult<T = void> {
  readonly success: boolean;
  readonly error?: string;
  readonly data?: T;
}

/**
 * Sends a private direct message to an active conversation between friends.
 *
 * @param input - Conversation UUID and message body.
 * @returns Action result with the created message or an error description in Spanish.
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

    // AI/Safety Moderation: blocked attempts are preserved in restricted legal custody
    const moderation = await moderateText(parsed.data.body);
    if (moderation.verdict === "block") {
      await logBlockedAttempt(supabase, {
        userId: user.id,
        body: parsed.data.body,
        reason: moderation.reason,
        channel: "direct_message",
      });
      return { success: false, error: moderation.reason || MODERATION_REJECTED_MESSAGE };
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
 * Soft-deletes a private message sent by the authenticated user.
 * Marks `deleted_at` so the message immediately disappears from the chat for both
 * participants, while preserving the original record in blocked legal custody
 * (Art. 32 LOPDGDD / LSSI-CE) in case of a judicial warrant or offense investigation.
 *
 * @param input - Target messageId and conversationId.
 * @returns Action result confirming soft-deletion.
 */
export async function deleteDirectMessage(
  input: DeleteDirectMessageInput
): Promise<ActionResult<{ messageId: string }>> {
  const parsed = deleteDirectMessageSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Solicitud inválida" };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Debes iniciar sesión para eliminar un mensaje" };
    }

    const { data: updated, error: updateErr } = await supabase
      .from("messages")
      .update({ deleted_at: new Date().toISOString() })
      .match({
        id: parsed.data.messageId,
        conversation_id: parsed.data.conversationId,
        sender_id: user.id,
      })
      .is("deleted_at", null)
      .select("id")
      .maybeSingle();

    if (updateErr || !updated) {
      return { success: false, error: "No se pudo eliminar el mensaje" };
    }

    return { success: true, data: { messageId: updated.id } };
  } catch {
    return { success: false, error: "Error inesperado al eliminar el mensaje" };
  }
}

/**
 * Opens or initializes a 1-on-1 private conversation, verifying mutual friendship first.
 *
 * @param input - Target friend user UUID.
 * @returns Action result with the resolved conversationId.
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

    // Verify friendship status is accepted
    const filter = `and(requester_id.eq.${user.id},addressee_id.eq.${parsed.data.targetUserId}),and(requester_id.eq.${parsed.data.targetUserId},addressee_id.eq.${user.id})`;
    const { data: friendship } = await supabase
      .from("friendships")
      .select("id")
      .eq("status", "accepted")
      .or(filter)
      .maybeSingle();

    if (!friendship) {
      return {
        success: false,
        error: "Solo puedes iniciar conversaciones privadas con aficionados con los que estés conectado como amigos",
      };
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
