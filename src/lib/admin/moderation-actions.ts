"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { assertAdmin } from "./guard";
import { moderatePostActionSchema } from "./schemas";
import { DEV_FLAGGED_POSTS, DEV_BLOCKED_ATTEMPTS } from "./dev-seeds";
import { redactAuditBodyForWebPanel } from "@/lib/social/dm-privacy-custody";
import type { Database } from "@/types/database.types";

export interface FlaggedPostItem {
  readonly id: string;
  readonly userId: string;
  readonly body: string;
  readonly moderationReason: string | null;
  readonly createdAt: string;
  readonly deletedAt: string | null;
  readonly author: {
    readonly username: string;
    readonly displayName: string | null;
    readonly avatarUrl: string | null;
  };
}

export interface BlockedAttemptItem {
  readonly id: string;
  readonly userId: string;
  readonly body: string;
  readonly reason: string | null;
  readonly createdAt: string;
  readonly author: {
    readonly username: string;
    readonly displayName: string | null;
  };
}

/**
 * Fetches community posts that have been flagged by the AI moderation engine
 * or require administrative review.
 */
export async function getFlaggedPosts(): Promise<readonly FlaggedPostItem[]> {
  await assertAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select(`
      id,
      user_id,
      body,
      moderation_reason,
      created_at,
      deleted_at,
      profiles:user_id (
        username,
        display_name,
        avatar_url
      )
    `)
    .eq("moderation_status", "flagged")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !data || data.length === 0) {
    return DEV_FLAGGED_POSTS;
  }

  type RawPostWithProfile = Database["public"]["Tables"]["posts"]["Row"] & {
    profiles: Database["public"]["Tables"]["profiles"]["Row"] | null;
  };

  const rawPosts = data as unknown as readonly RawPostWithProfile[];

  return rawPosts.map((post) => ({
    id: post.id,
    userId: post.user_id,
    body: post.body,
    moderationReason: post.moderation_reason,
    createdAt: post.created_at,
    deletedAt: post.deleted_at,
    author: {
      username: post.profiles?.username ?? "aficionado_anonimo",
      displayName: post.profiles?.display_name ?? null,
      avatarUrl: post.profiles?.avatar_url ?? null,
    },
  }));
}

/**
 * Fetches recent blocked post attempts recorded in the audit log.
 */
export async function getBlockedAttempts(): Promise<readonly BlockedAttemptItem[]> {
  await assertAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("blocked_post_attempts")
    .select(`
      id,
      user_id,
      body,
      reason,
      created_at,
      profiles:user_id (
        username,
        display_name
      )
    `)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !data || data.length === 0) {
    return DEV_BLOCKED_ATTEMPTS;
  }

  type RawAttempt = Database["public"]["Tables"]["blocked_post_attempts"]["Row"] & {
    profiles: Pick<Database["public"]["Tables"]["profiles"]["Row"], "username" | "display_name"> | null;
  };

  const rawAttempts = data as unknown as readonly RawAttempt[];

  return rawAttempts.map((attempt) => ({
    id: attempt.id,
    userId: attempt.user_id,
    body: redactAuditBodyForWebPanel(attempt.body, attempt.reason),
    reason: attempt.reason,
    createdAt: attempt.created_at,
    author: {
      username: attempt.profiles?.username ?? "aficionado_anonimo",
      displayName: attempt.profiles?.display_name ?? null,
    },
  }));
}

/**
 * Approves a flagged post, clearing the flag and keeping it published in the feed.
 */
export async function approveFlaggedPost(postId: string): Promise<{ success: boolean; error?: string }> {
  const { user } = await assertAdmin();
  const parsed = moderatePostActionSchema.safeParse({ postId, action: "approve" });
  if (!parsed.success) return { success: false, error: "Parámetros inválidos" };

  const supabase = await createClient();

  const { error } = await supabase
    .from("posts")
    .update({ moderation_status: "approved", moderation_reason: null })
    .eq("id", postId);

  if (error) return { success: false, error: error.message };

  await supabase.from("admin_audit_logs").insert({
    admin_id: user.id,
    action: "approve_post",
    target_type: "post",
    target_id: postId,
    metadata: { reason: "Aprobado manualmente tras revisión" },
  });

  revalidatePath("/admin/moderacion");
  revalidatePath("/social");
  return { success: true };
}

/**
 * Soft-deletes an offending post and appends an immutable audit entry.
 */
export async function softDeletePost(
  postId: string,
  reason = "Incumplimiento de normas"
): Promise<{ success: boolean; error?: string }> {
  const { user } = await assertAdmin();
  const parsed = moderatePostActionSchema.safeParse({ postId, action: "delete", reason });
  if (!parsed.success) return { success: false, error: "Parámetros inválidos" };

  const supabase = await createClient();

  const { error } = await supabase
    .from("posts")
    .update({
      deleted_at: new Date().toISOString(),
      moderation_reason: reason,
    })
    .eq("id", postId);

  if (error) return { success: false, error: error.message };

  await supabase.from("admin_audit_logs").insert({
    admin_id: user.id,
    action: "soft_delete_post",
    target_type: "post",
    target_id: postId,
    metadata: { reason },
  });

  revalidatePath("/admin/moderacion");
  revalidatePath("/social");
  return { success: true };
}
