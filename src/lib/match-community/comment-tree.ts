import type { MatchComment } from "./types";

interface RawPostRow {
  readonly id: string;
  readonly body: string;
  readonly created_at: string;
  readonly updated_at?: string | null;
  readonly user_id: string;
  readonly parent_id: string | null;
  readonly profiles?:
    | {
        readonly display_name: string | null;
        readonly username: string;
        readonly avatar_url: string | null;
      }
    | Array<{
        readonly display_name: string | null;
        readonly username: string;
        readonly avatar_url: string | null;
      }>
    | null;
}

interface MutableComment {
  id: string;
  matchId: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string | null;
  body: string;
  createdAt: string;
  updatedAt?: string | null;
  isEdited?: boolean;
  parentId: string | null;
  likesCount: number;
  replies: MutableComment[];
}

export function buildMatchCommentTree(
  rows: readonly RawPostRow[],
  matchId: string
): MatchComment[] {
  const postMap = new Map<string, MutableComment>();
  const roots: MutableComment[] = [];
  const replies: MutableComment[] = [];

  for (const post of rows) {
    const profile = Array.isArray(post.profiles)
      ? post.profiles[0]
      : post.profiles;
    const comment: MutableComment = {
      id: post.id,
      matchId,
      authorId: post.user_id,
      authorName: profile?.display_name || profile?.username || "Aficionado",
      authorUsername: profile?.username || "aficionado",
      authorAvatar: profile?.avatar_url || null,
      body: post.body,
      createdAt: post.created_at,
      updatedAt: post.updated_at ?? null,
      isEdited: Boolean(
        post.updated_at &&
          new Date(post.updated_at).getTime() - new Date(post.created_at).getTime() > 1000
      ),
      parentId: post.parent_id,
      likesCount: 0,
      replies: [],
    };
    postMap.set(comment.id, comment);

    if (comment.parentId) {
      replies.push(comment);
    } else {
      roots.push(comment);
    }
  }

  for (const reply of replies) {
    if (reply.parentId && postMap.has(reply.parentId)) {
      postMap.get(reply.parentId)!.replies.push(reply);
    } else {
      roots.push(reply);
    }
  }

  return roots;
}
