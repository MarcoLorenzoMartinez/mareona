"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { MODERATION_REJECTED_MESSAGE, moderateText } from "@/lib/social/moderation";
import { logBlockedAttempt } from "@/lib/social/moderation-log";
import { checkRateLimit } from "@/lib/security/rate-limiter";
import {
  createMatchCommentSchema, submitMvpVoteSchema, submitPlayerRatingSchema,
  type CreateMatchCommentInput, type SubmitMvpVoteInput, type SubmitPlayerRatingInput,
} from "./schemas";
import { buildMatchCommentTree } from "./comment-tree";
import type { MatchComment } from "./types";
import type { Database } from "@/types/database.types";

interface ActionResult<T = void> {
  readonly success: boolean;
  readonly error?: string;
  readonly data?: T;
}

export async function getMatchComments(
  matchId: string
): Promise<MatchComment[]> {
  try {
    const supabase = await createClient();
    const { data: posts, error } = await supabase
      .from("posts")
      .select("id, body, created_at, updated_at, user_id, parent_id, profiles(display_name, username, avatar_url)")
      .eq("match_id", matchId)
      .is("deleted_at", null)
      .order("created_at", { ascending: true });

    if (error || !posts || posts.length === 0) {
      return [];
    }

    return buildMatchCommentTree(posts, matchId);
  } catch {
    return [];
  }
}

export async function createMatchComment(
  input: CreateMatchCommentInput
): Promise<ActionResult<MatchComment>> {
  const parsed = createMatchCommentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Comentario inválido",
    };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "Debes iniciar sesión para comentar en el partido",
      };
    }

    const rateLimit = checkRateLimit({
      key: `match_comment_${user.id}`,
      limit: 5,
      windowMs: 60_000,
    });
    if (!rateLimit.allowed) {
      return { success: false, error: rateLimit.error };
    }

    const moderation = await moderateText(parsed.data.body);
    if (moderation.verdict === "block") {
      await logBlockedAttempt(supabase, {
        userId: user.id,
        body: parsed.data.body,
        reason: moderation.reason,
        parentId: parsed.data.parentId,
        matchId: parsed.data.matchId,
      });
      return { success: false, error: MODERATION_REJECTED_MESSAGE };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    const insertPayload: Database["public"]["Tables"]["posts"]["Insert"] = {
      user_id: user.id,
      body: parsed.data.body,
      parent_id: parsed.data.parentId ?? null,
      match_id: parsed.data.matchId,
      moderation_status: moderation.verdict === "flag" ? "flagged" : "approved",
      moderation_reason: moderation.verdict === "flag" ? moderation.reason : null,
    };

    const { data: createdPost, error } = await supabase
      .from("posts")
      .insert(insertPayload)
      .select("id, body, created_at, user_id, parent_id")
      .single();

    if (error || !createdPost) {
      return { success: false, error: error?.message ?? "Error al publicar el comentario" };
    }

    revalidatePath(`/temporada/partidos/${parsed.data.matchId}`);

    return {
      success: true,
      data: {
        id: createdPost.id,
        matchId: parsed.data.matchId,
        authorId: createdPost.user_id,
        authorName: profile?.display_name || profile?.username || "Aficionado",
        authorUsername: profile?.username || "aficionado",
        authorAvatar: profile?.avatar_url || null,
        body: createdPost.body,
        createdAt: createdPost.created_at,
        parentId: createdPost.parent_id,
        likesCount: 0,
        replies: [],
      },
    };
  } catch {
    return {
      success: true,
      data: {
        id: `local-comment-${Date.now()}`,
        matchId: parsed.data.matchId,
        authorId: "local-user",
        authorName: "Aficionado Sportinguista",
        authorUsername: "aficionado",
        authorAvatar: null,
        body: parsed.data.body,
        createdAt: new Date().toISOString(),
        parentId: parsed.data.parentId ?? null,
        likesCount: 0,
        replies: [],
      },
    };
  }
}

export async function submitMvpVote(
  input: SubmitMvpVoteInput
): Promise<ActionResult<{ playerId: string; previousPlayerId?: string | null }>> {
  const parsed = submitMvpVoteSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };
  return {
    success: true,
    data: { playerId: parsed.data.playerId, previousPlayerId: parsed.data.previousPlayerId ?? null },
  };
}

export async function submitPlayerRating(
  input: SubmitPlayerRatingInput
): Promise<ActionResult<{ targetId: string; userRating: number }>> {
  const parsed = submitPlayerRatingSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };
  return {
    success: true,
    data: { targetId: parsed.data.targetId, userRating: parsed.data.rating },
  };
}
