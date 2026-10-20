import type { MatchComment } from "./types";

interface RawPostRow {
  readonly id: string;
  readonly body: string;
  readonly created_at: string;
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

export function buildMatchCommentTree(
  rows: readonly RawPostRow[],
  matchId: string
): MatchComment[] {
  const postMap = new Map<string, MatchComment>();
  const roots: MatchComment[] = [];

  for (const post of rows) {
    const profile = Array.isArray(post.profiles)
      ? post.profiles[0]
      : post.profiles;
    const comment: MatchComment = {
      id: post.id,
      matchId,
      authorId: post.user_id,
      authorName: profile?.display_name || profile?.username || "Aficionado",
      authorUsername: profile?.username || "aficionado",
      authorAvatar: profile?.avatar_url || null,
      body: post.body,
      createdAt: post.created_at,
      parentId: post.parent_id,
      likesCount: 0,
      replies: [],
    };
    postMap.set(comment.id, comment);
  }

  for (const comment of postMap.values()) {
    if (comment.parentId && postMap.has(comment.parentId)) {
      const parent = postMap.get(comment.parentId)!;
      const currentReplies = [...(parent.replies ?? [])];
      currentReplies.push(comment);
      postMap.set(comment.parentId, { ...parent, replies: currentReplies });
    } else {
      roots.push(comment);
    }
  }

  return roots;
}
