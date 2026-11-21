"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  createPostSchema,
  deletePostSchema,
  updatePostSchema,
  votePollSchema,
  type CreatePostInput,
  type DeletePostInput,
  type UpdatePostInput,
  type VotePollInput,
} from "./schemas";
import {
  MODERATION_REJECTED_MESSAGE,
  BANNED_USER_POST_MESSAGE,
  READ_ONLY_WALL_MESSAGE,
  isProfileActivelyBanned,
  moderateText,
} from "./moderation";
import { logBlockedAttempt } from "./moderation-log";
import { checkRateLimit } from "@/lib/security/rate-limiter";
import { canEditPost } from "./format";
import { parsePostLineup } from "@/lib/lineup-builder/shared-lineup-codec";
import type { SocialPost, SocialPoll } from "./types";
import type { Database } from "@/types/database.types";

interface ActionResult<T = void> {
  readonly success: boolean;
  readonly error?: string;
  readonly data?: T;
}

/**
 * Creates a new community post or reply in the general forum.
 */
export async function createSocialPost(
  input: CreatePostInput
): Promise<ActionResult<SocialPost>> {
  const parsed = createPostSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Mensaje inválido",
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
        error: "Debes iniciar sesión para participar en la tertulia",
      };
    }

    const rateLimit = checkRateLimit({
      key: `social_post_${user.id}`,
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

    const { cleanBody, lineup } = parsePostLineup(parsed.data.body);
    const lineupNames = lineup ? lineup.starters.map((s) => s.displayName).join(" ") : "";
    const pollText = parsed.data.pollOptions ? parsed.data.pollOptions.join(" ") : "";
    const moderationInput = [cleanBody, pollText, lineupNames].filter(Boolean).join("\n");
    const moderation = await moderateText(moderationInput);
    if (moderation.verdict === "block") {
      await logBlockedAttempt(supabase, {
        userId: user.id,
        body: parsed.data.body,
        reason: moderation.reason,
        parentId: parsed.data.parentId,
      });
      return { success: false, error: MODERATION_REJECTED_MESSAGE };
    }

    const insertPayload: Database["public"]["Tables"]["posts"]["Insert"] = {
      user_id: user.id,
      body: parsed.data.body,
      parent_id: parsed.data.parentId ?? null,
      match_id: null,
      moderation_status: moderation.verdict === "flag" ? "flagged" : "approved",
      moderation_reason: moderation.verdict === "flag" ? moderation.reason : null,
    };

    const { data: createdPost, error } = await supabase
      .from("posts")
      .insert(insertPayload)
      .select("id, body, created_at, user_id, parent_id")
      .single();

    if (error || !createdPost) {
      return { success: false, error: error?.message ?? "Error al crear la publicación" };
    }

    let createdPoll: SocialPoll | null = null;
    if (parsed.data.pollOptions && parsed.data.pollOptions.length >= 2) {
      const { data: pollRow } = await supabase
        .from("polls")
        .insert({ post_id: createdPost.id })
        .select("id")
        .single();

      if (pollRow) {
        const optionInserts = parsed.data.pollOptions.map((label, idx) => ({
          poll_id: pollRow.id,
          label,
          position: idx,
        }));
        const { data: optionsRows } = await supabase
          .from("poll_options")
          .insert(optionInserts)
          .select("id, label");

        createdPoll = {
          id: pollRow.id,
          postId: createdPost.id,
          options: (optionsRows ?? []).map((o) => ({
            id: o.id,
            label: o.label,
            votesCount: 0,
          })),
          totalVotes: 0,
          userVotedOptionId: null,
        };
      }
    }

    revalidatePath("/social");

    return {
      success: true,
      data: {
        id: createdPost.id,
        userId: createdPost.user_id,
        authorName: profile?.display_name || profile?.username || "Aficionado",
        authorUsername: profile?.username || "aficionado",
        authorAvatar: profile?.avatar_url || null,
        body: createdPost.body,
        createdAt: createdPost.created_at,
        parentId: createdPost.parent_id,
        likesCount: 0,
        repliesCount: 0,
        replies: [],
        poll: createdPoll,
      },
    };
  } catch {
    return {
      success: false,
      error: "No se pudo publicar el mensaje. Comprueba tu conexión e inténtalo de nuevo.",
    };
  }
}

/**
 * Retrieves the general discussion posts for /social, optionally filtered by friends.
 */
export async function getSocialPosts(
  filter: "all" | "friends" = "all"
): Promise<readonly SocialPost[]> {
  try {
    const supabase = await createClient();

    let friendUserIds: readonly string[] = [];
    if (filter === "friends") {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return [];

      const { data: friendships } = await supabase
        .from("friendships")
        .select("requester_id, addressee_id")
        .eq("status", "accepted")
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

      if (!friendships || friendships.length === 0) return [];

      friendUserIds = friendships.map((f) =>
        f.requester_id === user.id ? f.addressee_id : f.requester_id
      );
    }

    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    const blockedUserIds = new Set<string>();
    if (currentUser) {
      const { data: blocks } = await supabase
        .from("user_blocks")
        .select("blocker_id, blocked_id")
        .or(`blocker_id.eq.${currentUser.id},blocked_id.eq.${currentUser.id}`);
      for (const b of blocks ?? []) {
        if (b.blocker_id === currentUser.id) blockedUserIds.add(b.blocked_id);
        if (b.blocked_id === currentUser.id) blockedUserIds.add(b.blocker_id);
      }
    }

    let query = supabase
      .from("posts")
      .select(
        `id, body, created_at, updated_at, parent_id, user_id,
         profiles (username, display_name, avatar_url)`
      )
      .is("match_id", null)
      .is("parent_id", null)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(30);

    if (filter === "friends") {
      query = query.in("user_id", friendUserIds as string[]);
    }

    const { data: rawRootPosts, error } = await query;

    if (error || !rawRootPosts || rawRootPosts.length === 0) {
      return [];
    }

    const rootPosts = rawRootPosts.filter((p) => !blockedUserIds.has(p.user_id));
    if (rootPosts.length === 0) return [];

    const rootPostIds = rootPosts.map((p) => p.id);

    const [{ data: rawReplies }, { data: pollRows }] = await Promise.all([
      supabase
        .from("posts")
        .select(
          `id, body, created_at, updated_at, parent_id, user_id,
           profiles (username, display_name, avatar_url)`
        )
        .in("parent_id", rootPostIds)
        .is("deleted_at", null)
        .order("created_at", { ascending: true }),
      supabase
        .from("polls")
        .select(
          `id, post_id,
           poll_options (id, label, position),
           poll_votes (id, option_id, user_id)`
        )
        .in("post_id", rootPostIds),
    ]);

    const replyPosts = (rawReplies ?? []).filter((r) => !blockedUserIds.has(r.user_id));
    const allPostIds = [...rootPostIds, ...replyPosts.map((r) => r.id)];

    const likesCountMap = new Map<string, number>();
    const likedByMeSet = new Set<string>();
    if (allPostIds.length > 0) {
      const { data: likeRows } = await supabase
        .from("post_likes")
        .select("post_id, user_id")
        .in("post_id", allPostIds);
      for (const lr of likeRows ?? []) {
        likesCountMap.set(lr.post_id, (likesCountMap.get(lr.post_id) ?? 0) + 1);
        if (currentUser && lr.user_id === currentUser.id) {
          likedByMeSet.add(lr.post_id);
        }
      }
    }

    const pollsByPostId = new Map<string, SocialPoll>();
    for (const pollRaw of pollRows ?? []) {
      const sortedOptions = [...(pollRaw.poll_options ?? [])].sort(
        (a, b) => a.position - b.position
      );
      const votes = pollRaw.poll_votes ?? [];
      const userVote = currentUser ? votes.find((v) => v.user_id === currentUser.id) : null;
      pollsByPostId.set(pollRaw.post_id, {
        id: pollRaw.id,
        postId: pollRaw.post_id,
        options: sortedOptions.map((opt) => ({
          id: opt.id,
          label: opt.label,
          votesCount: votes.filter((v) => v.option_id === opt.id).length,
        })),
        totalVotes: votes.length,
        userVotedOptionId: userVote?.option_id ?? null,
      });
    }

    return rootPosts.map((p) => {
      const author = p.profiles as {
        username: string;
        display_name: string | null;
        avatar_url: string | null;
      } | null;

      const postReplies = replyPosts
        .filter((r) => r.parent_id === p.id)
        .map((r) => {
          const replyAuthor = r.profiles as {
            username: string;
            display_name: string | null;
            avatar_url: string | null;
          } | null;
          const replyIsEdited = Boolean(
            r.updated_at &&
              new Date(r.updated_at).getTime() - new Date(r.created_at).getTime() > 1000
          );
          return {
            id: r.id,
            userId: r.user_id,
            authorName: replyAuthor?.display_name || replyAuthor?.username || "Aficionado",
            authorUsername: replyAuthor?.username || "aficionado",
            authorAvatar: replyAuthor?.avatar_url || null,
            body: r.body,
            createdAt: r.created_at,
            updatedAt: r.updated_at ?? null,
            isEdited: replyIsEdited,
            parentId: p.id,
            likesCount: likesCountMap.get(r.id) ?? 0,
            userHasLiked: likedByMeSet.has(r.id),
            repliesCount: 0,
          };
        });

      const postPoll = pollsByPostId.get(p.id) ?? null;

      const rootIsEdited = Boolean(
        p.updated_at &&
          new Date(p.updated_at).getTime() - new Date(p.created_at).getTime() > 1000
      );

      return {
        id: p.id,
        userId: p.user_id,
        authorName: author?.display_name || author?.username || "Aficionado",
        authorUsername: author?.username || "aficionado",
        authorAvatar: author?.avatar_url || null,
        body: p.body,
        createdAt: p.created_at,
        updatedAt: p.updated_at ?? null,
        isEdited: rootIsEdited,
        parentId: null,
        likesCount: likesCountMap.get(p.id) ?? 0,
        userHasLiked: likedByMeSet.has(p.id),
        repliesCount: postReplies.length,
        replies: postReplies,
        poll: postPoll,
      };
    });
  } catch {
    return [];
  }
}

/**
 * Deletes a post created by the authenticated user (soft delete).
 */
export async function deleteSocialPost(
  input: DeletePostInput
): Promise<ActionResult<{ deletedId: string }>> {
  const parsed = deletePostSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Identificador inválido",
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
        error: "Debes iniciar sesión para eliminar una publicación",
      };
    }

    const { data: targetPost } = await supabase
      .from("posts")
      .select("match_id")
      .eq("id", parsed.data.postId)
      .maybeSingle();

    const { error } = await supabase
      .from("posts")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", parsed.data.postId)
      .eq("user_id", user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/social");
    if (targetPost?.match_id) {
      revalidatePath(`/temporada/partidos/${targetPost.match_id}`);
    }
    return { success: true, data: { deletedId: parsed.data.postId } };
  } catch {
    return { success: false, error: "No se pudo eliminar la publicación" };
  }
}

/**
 * Updates a post or match comment created by the authenticated user within the 15-minute window.
 */
export async function updateSocialPost(
  input: UpdatePostInput
): Promise<ActionResult<{ postId: string; body: string; updatedAt: string }>> {
  const parsed = updatePostSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Mensaje inválido",
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
        error: "Debes iniciar sesión para editar tu mensaje",
      };
    }

    const rateLimit = checkRateLimit({
      key: `social_edit_${user.id}`,
      limit: 10,
      windowMs: 60_000,
    });
    if (!rateLimit.allowed) {
      return { success: false, error: rateLimit.error };
    }

    const [
      { data: existingPost, error: fetchError },
      { data: profile },
      { data: activeAnnouncement },
    ] = await Promise.all([
      supabase
        .from("posts")
        .select("id, user_id, created_at, match_id")
        .eq("id", parsed.data.postId)
        .is("deleted_at", null)
        .maybeSingle(),
      supabase
        .from("profiles")
        .select("is_banned, banned_until")
        .eq("id", user.id)
        .maybeSingle(),
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

    if (fetchError || !existingPost) {
      return { success: false, error: "Publicación no encontrada" };
    }

    if (existingPost.user_id !== user.id) {
      return {
        success: false,
        error: "No tienes permiso para editar esta publicación",
      };
    }

    if (!canEditPost(existingPost.created_at)) {
      return {
        success: false,
        error: "El tiempo para editar este mensaje ha expirado (límite: 15 minutos)",
      };
    }

    const { cleanBody, lineup } = parsePostLineup(parsed.data.body);
    const lineupNames = lineup ? lineup.starters.map((s) => s.displayName).join(" ") : "";
    const moderationInput = [cleanBody, lineupNames].filter(Boolean).join("\n");
    const moderation = await moderateText(moderationInput);
    if (moderation.verdict === "block") {
      await logBlockedAttempt(supabase, {
        userId: user.id,
        body: parsed.data.body,
        reason: moderation.reason,
      });
      return { success: false, error: MODERATION_REJECTED_MESSAGE };
    }

    const { data: updatedRow, error: updateError } = await supabase
      .from("posts")
      .update({
        body: parsed.data.body,
        moderation_status: moderation.verdict === "flag" ? "flagged" : "approved",
        moderation_reason: moderation.verdict === "flag" ? moderation.reason : null,
      })
      .eq("id", parsed.data.postId)
      .eq("user_id", user.id)
      .select("updated_at")
      .single();

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    revalidatePath("/social");
    if (existingPost.match_id) {
      revalidatePath(`/temporada/partidos/${existingPost.match_id}`);
    }

    return {
      success: true,
      data: {
        postId: parsed.data.postId,
        body: parsed.data.body,
        updatedAt: updatedRow?.updated_at ?? new Date().toISOString(),
      },
    };
  } catch {
    return { success: false, error: "No se pudo actualizar la publicación" };
  }
}

/**
 * Registers a vote for an option in a poll.
 */
export async function votePoll(
  input: VotePollInput
): Promise<ActionResult<{ pollId: string; optionId: string }>> {
  const parsed = votePollSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Voto inválido",
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
        error: "Debes iniciar sesión para votar en la encuesta",
      };
    }

    const { error } = await supabase.from("poll_votes").insert({
      poll_id: parsed.data.pollId,
      option_id: parsed.data.optionId,
      user_id: user.id,
    });

    if (error) {
      const isDuplicate = error.code === "23505";
      return {
        success: false,
        error: isDuplicate ? "Ya has participado en esta encuesta" : error.message,
      };
    }

    revalidatePath("/social");
    return { success: true, data: { pollId: parsed.data.pollId, optionId: parsed.data.optionId } };
  } catch {
    return { success: false, error: "No se pudo registrar tu voto en la encuesta" };
  }
}

/**
 * Toggles a persistent like on a social post in `public.post_likes`.
 *
 * @param postId - Target post UUID.
 * @returns Updated like state and total like count.
 */
export async function togglePostLike(
  postId: string
): Promise<ActionResult<{ liked: boolean; likesCount: number }>> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(postId)) {
    return { success: false, error: "Publicación no válida" };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Debes iniciar sesión para dar me gusta" };
    }

    const rate = checkRateLimit({ key: `post_like_${user.id}`, limit: 30, windowMs: 60_000 });
    if (!rate.allowed) {
      return { success: false, error: rate.error };
    }

    const { data: existing } = await supabase
      .from("post_likes")
      .select("post_id")
      .eq("post_id", postId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("post_likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", user.id);
      if (error) return { success: false, error: "No se pudo quitar el me gusta" };
    } else {
      const { error } = await supabase
        .from("post_likes")
        .insert({ post_id: postId, user_id: user.id });
      if (error) return { success: false, error: "No se pudo registrar el me gusta" };
    }

    const { count } = await supabase
      .from("post_likes")
      .select("post_id", { count: "exact", head: true })
      .eq("post_id", postId);

    return {
      success: true,
      data: { liked: !existing, likesCount: count ?? 0 },
    };
  } catch {
    return { success: false, error: "Error de conexión al actualizar el me gusta" };
  }
}
