"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createPostSchema, type CreatePostInput } from "./schemas";
import { INITIAL_TERTULIA_POSTS } from "./seed-posts";
import type { SocialPost } from "./types";
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

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    const insertPayload: Database["public"]["Tables"]["posts"]["Insert"] = {
      user_id: user.id,
      body: parsed.data.body,
      parent_id: parsed.data.parentId ?? null,
      match_id: null,
    };

    const { data: createdPost, error } = await supabase
      .from("posts")
      .insert(insertPayload)
      .select("id, body, created_at, user_id, parent_id")
      .single();

    if (error) {
      return { success: false, error: error.message };
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
      },
    };
  } catch {
    // Fallback if offline/demo
    return {
      success: true,
      data: {
        id: `local-post-${Date.now()}`,
        userId: "local-user",
        authorName: "Aficionado Sportinguista",
        authorUsername: "aficionado",
        authorAvatar: "/avatars/presets/quini.svg",
        body: parsed.data.body,
        createdAt: new Date().toISOString(),
        parentId: parsed.data.parentId ?? null,
        likesCount: 0,
        repliesCount: 0,
        replies: [],
      },
    };
  }
}

/**
 * Retrieves the general discussion posts for /social.
 */
export async function getSocialPosts(): Promise<readonly SocialPost[]> {
  try {
    const supabase = await createClient();
    const { data: posts, error } = await supabase
      .from("posts")
      .select(
        `id, body, created_at, parent_id, user_id,
         profiles (username, display_name, avatar_url)`
      )
      .is("match_id", null)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(30);

    if (error || !posts || posts.length === 0) {
      return INITIAL_TERTULIA_POSTS;
    }

    // Map database posts into typed SocialPost structures
    const rootPosts = posts.filter((p) => !p.parent_id);
    const replyPosts = posts.filter((p) => Boolean(p.parent_id));

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
          return {
            id: r.id,
            userId: r.user_id,
            authorName: replyAuthor?.display_name || replyAuthor?.username || "Aficionado",
            authorUsername: replyAuthor?.username || "aficionado",
            authorAvatar: replyAuthor?.avatar_url || null,
            body: r.body,
            createdAt: r.created_at,
            parentId: p.id,
            likesCount: 0,
            repliesCount: 0,
          };
        });

      return {
        id: p.id,
        userId: p.user_id,
        authorName: author?.display_name || author?.username || "Aficionado",
        authorUsername: author?.username || "aficionado",
        authorAvatar: author?.avatar_url || null,
        body: p.body,
        createdAt: p.created_at,
        parentId: null,
        likesCount: 0,
        repliesCount: postReplies.length,
        replies: postReplies,
      };
    });
  } catch {
    return INITIAL_TERTULIA_POSTS;
  }
}
