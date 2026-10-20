// Client: Tarjeta de publicación con autoría, reacciones e hilos anidados
"use client";

import { useState } from "react";
import { AuthAvatar } from "@/components/auth/auth-avatar";
import { PostReplyForm } from "./post-reply-form";
import type { SocialPost } from "@/lib/social/types";

interface PostCardProps {
  readonly post: SocialPost;
  readonly onAddReply: (parentId: string, newReply: SocialPost) => void;
}

function formatRelativeTime(dateStr: string): string {
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    if (diffMinutes < 1) return "ahora";
    if (diffMinutes < 60) return `hace ${diffMinutes} min`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `hace ${diffHours} h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "ayer";
    return `hace ${diffDays} d`;
  } catch {
    return "reciente";
  }
}

export function PostCard({ post, onAddReply }: PostCardProps) {
  const [likes, setLikes] = useState(post.likesCount);
  const [hasLiked, setHasLiked] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(true);

  const toggleLike = () => {
    if (hasLiked) {
      setLikes((prev) => Math.max(0, prev - 1));
      setHasLiked(false);
    } else {
      setLikes((prev) => prev + 1);
      setHasLiked(true);
    }
  };

  const handleReplyCreated = (reply: SocialPost) => {
    onAddReply(post.id, reply);
    setIsReplying(false);
    setShowReplies(true);
  };

  const replies = post.replies ?? [];

  return (
    <article className="rounded-2xl border border-[var(--border)] bg-white p-4 sm:p-5 shadow-xs transition-shadow hover:shadow-sm">
      <div className="flex gap-3">
        <AuthAvatar
          src={post.authorAvatar}
          alt={post.authorName}
          size="md"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-sm font-bold text-neutral-900 truncate">
              {post.authorName}
            </span>
            <span className="text-xs font-medium text-neutral-400">
              @{post.authorUsername}
            </span>
            <span className="text-xs text-neutral-300">·</span>
            <span className="text-xs text-neutral-400">
              {formatRelativeTime(post.createdAt)}
            </span>
          </div>

          <p className="mt-2 text-sm text-neutral-800 leading-relaxed whitespace-pre-line">
            {post.body}
          </p>

          <div className="mt-3 flex items-center gap-4 border-t border-neutral-100 pt-2 text-xs text-neutral-500">
            <button
              type="button"
              onClick={toggleLike}
              className={`flex items-center gap-1.5 transition-colors ${
                hasLiked ? "text-[var(--primary)] font-bold" : "hover:text-neutral-800"
              }`}
            >
              <svg
                className={`h-4 w-4 ${hasLiked ? "fill-current" : "fill-none"}`}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="tabular-nums font-sans">{likes}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsReplying(!isReplying)}
              className="flex items-center gap-1.5 hover:text-neutral-800 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="tabular-nums font-sans">{replies.length}</span>
            </button>
          </div>
        </div>
      </div>

      {isReplying && (
        <PostReplyForm
          parentId={post.id}
          onReplyCreated={handleReplyCreated}
          onCancel={() => setIsReplying(false)}
        />
      )}

      {replies.length > 0 && (
        <div className="mt-3 pl-8 sm:pl-10 space-y-2 border-l-2 border-neutral-100 ml-5 sm:ml-6 pt-2">
          {showReplies &&
            replies.map((reply) => (
              <div key={reply.id} className="flex gap-2.5 pt-1">
                <AuthAvatar src={reply.authorAvatar} alt={reply.authorName} size="sm" />
                <div className="flex-1 bg-neutral-50 rounded-xl p-2.5">
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-neutral-900">{reply.authorName}</span>
                    <span className="text-[10px] text-neutral-400">@{reply.authorUsername}</span>
                    <span className="text-[10px] text-neutral-400">· {formatRelativeTime(reply.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-xs text-neutral-800 leading-normal">{reply.body}</p>
                </div>
              </div>
            ))}
        </div>
      )}
    </article>
  );
}
