// Client: Tarjeta limpia de publicación estilo Twitter (solo post principal y contador de respuestas)
"use client";

import { useState } from "react";
import { AuthAvatar } from "@/components/auth/auth-avatar";
import type { SocialPost } from "@/lib/social/types";

interface PostCardProps {
  readonly post: SocialPost;
  readonly onOpenThread: (postId: string) => void;
}

export function formatRelativeTime(dateStr: string): string {
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

export function PostCard({ post, onOpenThread }: PostCardProps) {
  const [likes, setLikes] = useState(post.likesCount);
  const [hasLiked, setHasLiked] = useState(false);

  const toggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasLiked) {
      setLikes((prev) => Math.max(0, prev - 1));
      setHasLiked(false);
    } else {
      setLikes((prev) => prev + 1);
      setHasLiked(true);
    }
  };

  const repliesCount = post.repliesCount ?? post.replies?.length ?? 0;

  return (
    <article
      onClick={() => onOpenThread(post.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenThread(post.id);
        }
      }}
      aria-label={`Publicación de ${post.authorName}. Haz clic para ver el hilo y ${repliesCount} respuestas.`}
      className="group relative cursor-pointer rounded-2xl border border-[var(--border)] bg-white p-4 sm:p-5 shadow-xs transition-all hover:border-neutral-300 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
    >
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

          <div className="mt-3.5 flex items-center gap-6 border-t border-neutral-100 pt-2.5 text-xs text-neutral-500">
            {/* Botón de Me Gusta */}
            <button
              type="button"
              onClick={toggleLike}
              className={`flex items-center gap-1.5 transition-colors ${
                hasLiked
                  ? "text-[var(--primary)] font-bold"
                  : "hover:text-neutral-900"
              }`}
            >
              <svg
                className={`h-4 w-4 ${hasLiked ? "fill-current" : "fill-none"}`}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span className="tabular-nums font-sans">{likes}</span>
            </button>

            {/* Contador de Respuestas */}
            <div className="flex items-center gap-1.5 text-neutral-500 group-hover:text-[var(--primary)] transition-colors">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span className="tabular-nums font-sans">
                {repliesCount} {repliesCount === 1 ? "respuesta" : "respuestas"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
