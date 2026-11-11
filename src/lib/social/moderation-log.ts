import "server-only";

import type { createClient } from "@/lib/supabase/server";
import {
  formatBlockedAttemptReason,
  type ModerationAuditChannel,
} from "./dm-privacy-custody";

type ServerSupabase = Awaited<ReturnType<typeof createClient>>;

interface BlockedAttempt {
  readonly userId: string;
  readonly body: string;
  readonly reason: string;
  readonly parentId?: string | null;
  readonly matchId?: string | null;
  readonly channel?: ModerationAuditChannel;
}

/**
 * Persists a rejected post or direct message in legal custody (`blocked_post_attempts`).
 * Full raw text is preserved at the database level (`service_role` only) for judicial or
 * law-enforcement requirements, while private DM bodies are redacted in web admin views.
 * Best-effort: a logging failure must never change the user-facing rejection.
 *
 * @param supabase - Server client bound to the authenticated user's session.
 * @param attempt - Rejected text plus its context and channel.
 */
export async function logBlockedAttempt(
  supabase: ServerSupabase,
  attempt: BlockedAttempt
): Promise<void> {
  try {
    await supabase.from("blocked_post_attempts").insert({
      user_id: attempt.userId,
      body: attempt.body,
      reason: formatBlockedAttemptReason(attempt.reason, attempt.channel ?? "post"),
      parent_id: attempt.parentId ?? null,
      match_id: attempt.matchId ?? null,
    });
  } catch {
    // Intentionally swallowed, see TSDoc.
  }
}
