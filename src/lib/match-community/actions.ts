"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  MODERATION_REJECTED_MESSAGE,
  BANNED_USER_POST_MESSAGE,
  READ_ONLY_WALL_MESSAGE,
  isProfileActivelyBanned,
  moderateText,
} from "@/lib/social/moderation";
import { logBlockedAttempt } from "@/lib/social/moderation-log";
import { parsePostLineup } from "@/lib/lineup-builder/shared-lineup-codec";
import { checkRateLimit } from "@/lib/security/rate-limiter";
import {
  createMatchCommentSchema,
  submitMvpVoteSchema,
  submitPlayerRatingSchema,
  submitMatchPlayerRatingsSchema,
  type CreateMatchCommentInput,
  type SubmitMvpVoteInput,
  type SubmitPlayerRatingInput,
  type SubmitMatchPlayerRatingsInput,
} from "./schemas";
import { buildMatchCommentTree } from "./comment-tree";
import type { MatchComment } from "./types";
import type { Database } from "@/types/database.types";

interface ActionResult<T = void> {
  readonly success: boolean;
  readonly error?: string;
  readonly data?: T;
}

export interface MatchCommunityRatingsState {
  readonly mvpVoteCounts: Record<string, number>;
  readonly communityRatingAverages: Record<string, number>;
  readonly userMvpPlayerId: string | null;
  readonly userRatings: Record<string, number>;
}

const EMPTY_COMMUNITY_RATINGS: MatchCommunityRatingsState = {
  mvpVoteCounts: {},
  communityRatingAverages: {},
  userMvpPlayerId: null,
  userRatings: {},
};

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

async function authorizeMatchVoteUser(
  rateKeyPrefix: string,
  limit: number,
  unauthenticatedMessage: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: unauthenticatedMessage } as const;
  }

  const rateLimit = checkRateLimit({
    key: `${rateKeyPrefix}_${user.id}`,
    limit,
    windowMs: 60_000,
  });
  if (!rateLimit.allowed) {
    return { error: rateLimit.error ?? "Demasiadas solicitudes" } as const;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_banned, banned_until, banned_reason")
    .eq("id", user.id)
    .maybeSingle();

  if (isProfileActivelyBanned(profile)) {
    return { error: BANNED_USER_POST_MESSAGE } as const;
  }

  return { supabase, user } as const;
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

    const [{ data: profile }, { data: activeAnnouncement }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase
        .from("system_announcements")
        .select("read_only_wall")
        .eq("is_active", true)
        .eq("read_only_wall", true)
        .limit(1)
        .maybeSingle(),
    ]);

    if (isProfileActivelyBanned(profile)) {
      return { success: false, error: BANNED_USER_POST_MESSAGE };
    }

    if (activeAnnouncement?.read_only_wall) {
      return { success: false, error: READ_ONLY_WALL_MESSAGE };
    }

    const { cleanBody } = parsePostLineup(parsed.data.body);
    const moderation = await moderateText(cleanBody);
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
      success: false,
      error: "Error de conexión al publicar el comentario",
    };
  }
}

/**
 * Fetches real community MVP vote counts, aggregated player ratings,
 * and the current user's persisted selections from Supabase.
 *
 * @param matchId - Canonical external match ID.
 * @returns Real community ratings and current user picks (never synthetic data).
 */
export async function getMatchCommunityRatings(
  matchId: string
): Promise<MatchCommunityRatingsState> {
  if (!matchId || !isSupabaseConfigured()) {
    return EMPTY_COMMUNITY_RATINGS;
  }

  try {
    const supabase = await createClient();
    const [
      {
        data: { user },
      },
      { data: mvpSummary },
      { data: ratingSummary },
    ] = await Promise.all([
      supabase.auth.getUser(),
      supabase.rpc("get_match_mvp_summary", { p_match_id: matchId }),
      supabase.rpc("get_match_player_ratings_summary", { p_match_id: matchId }),
    ]);

    const mvpVoteCounts: Record<string, number> = {};
    for (const row of mvpSummary ?? []) {
      mvpVoteCounts[row.player_id] = Number(row.votes);
    }

    const communityRatingAverages: Record<string, number> = {};
    for (const row of ratingSummary ?? []) {
      communityRatingAverages[row.target_id] = Number(row.avg_rating);
    }

    let userMvpPlayerId: string | null = null;
    const userRatings: Record<string, number> = {};

    if (user) {
      const [{ data: ownMvp }, { data: ownRatings }] = await Promise.all([
        supabase
          .from("match_mvp_votes")
          .select("player_id")
          .eq("match_id", matchId)
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("match_player_ratings")
          .select("target_id, rating")
          .eq("match_id", matchId)
          .eq("user_id", user.id),
      ]);

      userMvpPlayerId = ownMvp?.player_id ?? null;
      for (const row of ownRatings ?? []) {
        userRatings[row.target_id] = row.rating;
      }
    }

    return {
      mvpVoteCounts,
      communityRatingAverages,
      userMvpPlayerId,
      userRatings,
    };
  } catch {
    return EMPTY_COMMUNITY_RATINGS;
  }
}

/**
 * Persists an authenticated user's MVP vote for a finished match in `public.match_mvp_votes`.
 *
 * @param input - Match ID and selected player ID validated against `submitMvpVoteSchema`.
 * @returns Updated vote counts and user selection on success.
 */
export async function submitMvpVote(
  input: SubmitMvpVoteInput
): Promise<
  ActionResult<{
    playerId: string;
    previousPlayerId?: string | null;
    mvpVoteCounts: Record<string, number>;
  }>
> {
  const parsed = submitMvpVoteSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: "El servicio de base de datos no está disponible",
    };
  }

  try {
    const auth = await authorizeMatchVoteUser(
      "mvp_vote",
      10,
      "Debes iniciar sesión para votar al MVP"
    );
    if ("error" in auth) {
      return { success: false, error: auth.error };
    }

    const { supabase, user } = auth;

    const { data: existingVote } = await supabase
      .from("match_mvp_votes")
      .select("player_id")
      .eq("match_id", parsed.data.matchId)
      .eq("user_id", user.id)
      .maybeSingle();

    const { error: rpcError } = await supabase.rpc("cast_match_mvp_vote", {
      p_match_id: parsed.data.matchId,
      p_player_id: parsed.data.playerId,
    });

    if (rpcError) {
      return {
        success: false,
        error: rpcError.message ?? "No se pudo registrar tu voto al MVP",
      };
    }

    const { data: mvpSummary } = await supabase.rpc("get_match_mvp_summary", {
      p_match_id: parsed.data.matchId,
    });
    const mvpVoteCounts: Record<string, number> = {};
    for (const row of mvpSummary ?? []) {
      mvpVoteCounts[row.player_id] = Number(row.votes);
    }

    revalidatePath(`/temporada/partidos/${parsed.data.matchId}`);

    return {
      success: true,
      data: {
        playerId: parsed.data.playerId,
        previousPlayerId: existingVote?.player_id ?? parsed.data.previousPlayerId ?? null,
        mvpVoteCounts,
      },
    };
  } catch {
    return {
      success: false,
      error: "Error de conexión al registrar el voto al MVP",
    };
  }
}

/**
 * Persists a single player or coach rating in `public.match_player_ratings`.
 *
 * @param input - Single rating payload validated against `submitPlayerRatingSchema`.
 * @returns Persisted target ID and integer score on success.
 */
export async function submitPlayerRating(
  input: SubmitPlayerRatingInput
): Promise<ActionResult<{ targetId: string; userRating: number }>> {
  const parsed = submitPlayerRatingSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: "El servicio de base de datos no está disponible",
    };
  }

  try {
    const auth = await authorizeMatchVoteUser(
      "player_rating",
      30,
      "Debes iniciar sesión para puntuar jugadores"
    );
    if ("error" in auth) {
      return { success: false, error: auth.error };
    }

    const { supabase } = auth;
    const integerRating = Math.round(parsed.data.rating);

    const { error } = await supabase.rpc("upsert_match_player_rating", {
      p_match_id: parsed.data.matchId,
      p_target_id: parsed.data.targetId,
      p_rating: integerRating,
    });

    if (error) {
      return {
        success: false,
        error: error.message ?? "No se pudo registrar la calificación",
      };
    }

    revalidatePath(`/temporada/partidos/${parsed.data.matchId}`);

    return {
      success: true,
      data: { targetId: parsed.data.targetId, userRating: integerRating },
    };
  } catch {
    return {
      success: false,
      error: "Error de conexión al registrar la calificación",
    };
  }
}

/**
 * Persists an entire matchday batch of player and coach ratings in a single upsert call.
 *
 * @param input - Match ID and array of target ratings validated against `submitMatchPlayerRatingsSchema`.
 * @returns User's persisted rating map and refreshed community averages on success.
 */
export async function submitMatchPlayerRatings(
  input: SubmitMatchPlayerRatingsInput
): Promise<
  ActionResult<{
    userRatings: Record<string, number>;
    communityRatingAverages: Record<string, number>;
  }>
> {
  const parsed = submitMatchPlayerRatingsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: "El servicio de base de datos no está disponible",
    };
  }

  try {
    const auth = await authorizeMatchVoteUser(
      "player_ratings_batch",
      5,
      "Debes iniciar sesión para enviar tus calificaciones"
    );
    if ("error" in auth) {
      return { success: false, error: auth.error };
    }

    const { supabase, user } = auth;
    const rowsToUpsert = parsed.data.ratings.map((item) => ({
      match_id: parsed.data.matchId,
      user_id: user.id,
      target_id: item.targetId,
      rating: Math.round(item.rating),
    }));

    const results = await Promise.all(
      rowsToUpsert.map((row) =>
        supabase.rpc("upsert_match_player_rating", {
          p_match_id: row.match_id,
          p_target_id: row.target_id,
          p_rating: row.rating,
        })
      )
    );

    const firstErr = results.find((r) => r.error)?.error;
    if (firstErr) {
      return {
        success: false,
        error: firstErr.message ?? "No se pudieron guardar tus calificaciones",
      };
    }

    const { data: ratingSummary } = await supabase.rpc(
      "get_match_player_ratings_summary",
      { p_match_id: parsed.data.matchId }
    );

    const communityRatingAverages: Record<string, number> = {};
    for (const row of ratingSummary ?? []) {
      communityRatingAverages[row.target_id] = Number(row.avg_rating);
    }

    const userRatings: Record<string, number> = {};
    for (const row of rowsToUpsert) {
      userRatings[row.target_id] = row.rating;
    }

    revalidatePath(`/temporada/partidos/${parsed.data.matchId}`);

    return {
      success: true,
      data: {
        userRatings,
        communityRatingAverages,
      },
    };
  } catch {
    return {
      success: false,
      error: "Error de conexión al guardar tus calificaciones",
    };
  }
}
