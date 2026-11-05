import "server-only";

import type { createClient } from "@/lib/supabase/server";

type ServerSupabase = Awaited<ReturnType<typeof createClient>>;

interface BlockedAttempt {
  readonly userId: string;
  readonly body: string;
  readonly reason: string;
  readonly parentId?: string | null;
  readonly matchId?: string | null;
}

/**
 * Persists a rejected post so moderators can review each user's attempts.
 * Best-effort: a logging failure must never change the user-facing rejection.
 *
 * @param supabase - Server client bound to the authenticated user's session.
 * @param attempt - Rejected text plus its context.
 */
export async function logBlockedAttempt(
  supabase: ServerSupabase,
  attempt: BlockedAttempt
): Promise<void> {
  try {
    await supabase.from("blocked_post_attempts").insert({
      user_id: attempt.userId,
      body: attempt.body,
      reason: attempt.reason,
      parent_id: attempt.parentId ?? null,
      match_id: attempt.matchId ?? null,
    });
  } catch {
    // Intentionally swallowed, see TSDoc.
  }
}
