import type { SocialPost } from "./types";

/**
 * Searches recursively for a post or reply by ID within a post tree.
 */
export function findPostInTree(
  posts: readonly SocialPost[],
  targetId: string
): SocialPost | null {
  for (const post of posts) {
    if (post.id === targetId) return post;
    if (post.replies && post.replies.length > 0) {
      const found = findPostInTree(post.replies, targetId);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Finds the immediate parent of a given post inside the tree.
 */
export function findParentInTree(
  posts: readonly SocialPost[],
  childId: string
): SocialPost | null {
  for (const post of posts) {
    if (post.replies?.some((r) => r.id === childId)) {
      return post;
    }
    if (post.replies && post.replies.length > 0) {
      const found = findParentInTree(post.replies, childId);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Immutably adds a reply to a target node anywhere in the tree and updates repliesCount.
 */
export function addReplyToTree(
  posts: readonly SocialPost[],
  targetId: string,
  newReply: SocialPost
): readonly SocialPost[] {
  return posts.map((post) => {
    if (post.id === targetId) {
      const currentReplies = post.replies ?? [];
      return {
        ...post,
        repliesCount: (post.repliesCount || 0) + 1,
        replies: [...currentReplies, newReply],
      };
    }
    if (post.replies && post.replies.length > 0) {
      return {
        ...post,
        replies: addReplyToTree(post.replies, targetId, newReply),
      };
    }
    return post;
  });
}

/**
 * Immutably removes a post or reply by ID from anywhere in the tree.
 */
export function removePostFromTree(
  posts: readonly SocialPost[],
  targetId: string
): readonly SocialPost[] {
  return posts
    .filter((post) => post.id !== targetId)
    .map((post) => {
      if (post.replies && post.replies.length > 0) {
        const filteredReplies = removePostFromTree(post.replies, targetId);
        return {
          ...post,
          replies: filteredReplies,
          repliesCount: filteredReplies.length,
        };
      }
      return post;
    });
}

/**
 * Immutably updates a post or reply by ID anywhere in the tree.
 */
export function updatePostInTree(
  posts: readonly SocialPost[],
  targetId: string,
  updatedFields: Partial<SocialPost>
): readonly SocialPost[] {
  return posts.map((post) => {
    if (post.id === targetId) {
      return { ...post, ...updatedFields };
    }
    if (post.replies && post.replies.length > 0) {
      return {
        ...post,
        replies: updatePostInTree(post.replies, targetId, updatedFields),
      };
    }
    return post;
  });
}
