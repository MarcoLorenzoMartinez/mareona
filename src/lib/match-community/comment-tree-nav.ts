import type { MatchComment } from "./types";

/**
 * Searches recursively for a comment by ID within a match comment tree.
 */
export function findCommentInTree(
  comments: readonly MatchComment[],
  targetId: string
): MatchComment | null {
  for (const c of comments) {
    if (c.id === targetId) return c;
    if (c.replies && c.replies.length > 0) {
      const found = findCommentInTree(c.replies, targetId);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Finds the immediate parent of a given comment inside the tree.
 */
export function findParentInCommentTree(
  comments: readonly MatchComment[],
  childId: string
): MatchComment | null {
  for (const c of comments) {
    if (c.replies?.some((r) => r.id === childId)) return c;
    if (c.replies && c.replies.length > 0) {
      const found = findParentInCommentTree(c.replies, childId);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Immutably adds a reply to a target comment anywhere in the tree.
 */
export function addReplyToCommentTree(
  comments: readonly MatchComment[],
  targetId: string,
  newReply: MatchComment
): readonly MatchComment[] {
  return comments.map((c) => {
    if (c.id === targetId) {
      const currentReplies = c.replies ?? [];
      return {
        ...c,
        replies: [...currentReplies, newReply],
      };
    }
    if (c.replies && c.replies.length > 0) {
      return {
        ...c,
        replies: addReplyToCommentTree(c.replies, targetId, newReply),
      };
    }
    return c;
  });
}
