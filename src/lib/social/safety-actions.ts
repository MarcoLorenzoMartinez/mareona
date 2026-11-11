"use server";

import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/security/rate-limiter";
import { logBlockedAttempt } from "./moderation-log";
import {
  blockUserSchema,
  reportUserSchema,
  formatUserReportAuditEntry,
  type BlockUserInput,
  type ReportUserInput,
} from "./dm-privacy-custody";

interface SafetyActionResult {
  readonly success: boolean;
  readonly error?: string;
}

/**
 * Unilaterally blocks another user and severs any existing or pending friendship.
 * Once blocked, neither user can send direct messages or open a conversation.
 *
 * @param input - Target user UUID to block.
 * @returns Action result.
 */
export async function blockUserAction(
  input: BlockUserInput
): Promise<SafetyActionResult> {
  const parsed = blockUserSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Aficionado no válido" };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Debes iniciar sesión para bloquear a un usuario" };
    }

    if (user.id === parsed.data.targetUserId) {
      return { success: false, error: "No puedes bloquearte a ti mismo" };
    }

    const { error: blockErr } = await supabase
      .from("user_blocks")
      .upsert(
        {
          blocker_id: user.id,
          blocked_id: parsed.data.targetUserId,
        },
        { onConflict: "blocker_id,blocked_id", ignoreDuplicates: true }
      );

    if (blockErr) {
      return { success: false, error: "No se pudo bloquear al usuario" };
    }

    // Automatically sever any active or pending friendship in either direction
    const friendshipFilter = `and(requester_id.eq.${user.id},addressee_id.eq.${parsed.data.targetUserId}),and(requester_id.eq.${parsed.data.targetUserId},addressee_id.eq.${user.id})`;
    await supabase.from("friendships").delete().or(friendshipFilter);

    return { success: true };
  } catch {
    return { success: false, error: "Error inesperado al bloquear al usuario" };
  }
}

/**
 * Removes an active block previously placed on another user.
 *
 * @param input - Target user UUID to unblock.
 * @returns Action result.
 */
export async function unblockUserAction(
  input: BlockUserInput
): Promise<SafetyActionResult> {
  const parsed = blockUserSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Aficionado no válido" };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Debes iniciar sesión para desbloquear a un usuario" };
    }

    const { error } = await supabase
      .from("user_blocks")
      .delete()
      .eq("blocker_id", user.id)
      .eq("blocked_id", parsed.data.targetUserId);

    if (error) {
      return { success: false, error: "No se pudo desbloquear al usuario" };
    }

    return { success: true };
  } catch {
    return { success: false, error: "Error inesperado al desbloquear al usuario" };
  }
}

/**
 * Submits a formal user or conversation report to the moderation and legal custody log.
 * When `conversationId` is supplied, the reporting user explicitly consents to attach
 * the recent conversation transcript as evidence for review and legal preservation.
 *
 * @param input - Reported user UUID, offense category, optional details, conversationId, and alsoBlock flag.
 * @returns Action result.
 */
export async function reportUserAction(
  input: ReportUserInput
): Promise<SafetyActionResult> {
  const parsed = reportUserSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos de denuncia inválidos" };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Debes iniciar sesión para enviar una denuncia" };
    }

    if (user.id === parsed.data.targetUserId) {
      return { success: false, error: "No puedes denunciarte a ti mismo" };
    }

    const rateLimit = checkRateLimit({
      key: `report_${user.id}`,
      limit: 5,
      windowMs: 10 * 60_000,
    });
    if (!rateLimit.allowed) {
      return {
        success: false,
        error: `Has enviado demasiadas denuncias seguidas. Espera ${rateLimit.retryAfterSeconds} segundos.`,
      };
    }

    const { data: targetProfile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", parsed.data.targetUserId)
      .maybeSingle();

    const reportedUsername = targetProfile?.username ?? "aficionado";
    let transcriptLines: string[] = [];

    if (parsed.data.conversationId) {
      const { data: isMember } = await supabase.rpc("is_conversation_member", {
        p_conversation_id: parsed.data.conversationId,
      });

      if (isMember) {
        const { data: recentMsgs } = await supabase
          .from("messages")
          .select("sender_id, body, created_at")
          .eq("conversation_id", parsed.data.conversationId)
          .order("created_at", { ascending: false })
          .limit(10);

        if (recentMsgs && recentMsgs.length > 0) {
          transcriptLines = [...recentMsgs].reverse().map((m) => {
            const authorLabel = m.sender_id === parsed.data.targetUserId ? `@${reportedUsername}` : "Denunciante";
            return `[${m.created_at}] ${authorLabel}: ${m.body}`;
          });
        }
      }
    }

    const formatted = formatUserReportAuditEntry({
      reportedUsername,
      reportedUserId: parsed.data.targetUserId,
      category: parsed.data.category,
      details: parsed.data.details,
      transcriptLines,
    });

    await logBlockedAttempt(supabase, {
      userId: user.id,
      body: formatted.body,
      reason: formatted.reason,
      channel: "user_report",
    });

    if (parsed.data.alsoBlock) {
      await blockUserAction({ targetUserId: parsed.data.targetUserId });
    }

    return { success: true };
  } catch {
    return { success: false, error: "Error inesperado al registrar la denuncia" };
  }
}
