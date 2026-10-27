// Client: Tarjeta limpia de publicación estilo Twitter (solo post principal y contador de respuestas)
"use client";

import { useState } from "react";
import { AuthAvatar } from "@/components/auth/auth-avatar";
import { MessageSquare } from "lucide-react";
import { HeartLikeIcon } from "@/components/social/heart-like-icon";
import type { SocialPost } from "@/lib/social/types";

interface PostCardProps {
  readonly post: SocialPost;
  readonly onOpenThread: (postId: string) => void;
  readonly onOpenProfile?: (userId: string) => void;
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

export function PostCard({ post, onOpenThread, onOpenProfile }: PostCardProps) {
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

  const handleProfileClick = (e: React.MouseEvent) => {
    if (!post.userId || !onOpenProfile) return;
    e.stopPropagation();
    onOpenProfile(post.userId);
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
        <div onClick={handleProfileClick} className="cursor-pointer hover:opacity-85 transition-opacity">
          <AuthAvatar src={post.authorAvatar} alt={post.authorName} size="md" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleProfileClick}
              className="text-sm font-bold text-neutral-900 truncate hover:underline hover:text-[var(--primary)] text-left cursor-pointer"
            >
              {post.authorName}
            </button>
            <button
              type="button"
              onClick={handleProfileClick}
              className="text-xs font-medium text-neutral-400 hover:text-neutral-600 cursor-pointer"
            >
              @{post.authorUsername}
            </button>
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
              className={`group flex items-center gap-1.5 transition-colors cursor-pointer ${
                hasLiked
                  ? "text-[var(--primary)] font-bold"
                  : "text-neutral-500 hover:text-[var(--primary)]"
              }`}
            >
              <HeartLikeIcon filled={hasLiked} />
              <span className="tabular-nums font-sans">{likes}</span>
            </button>

            {/* Contador de Respuestas */}
            <div className="flex items-center gap-1.5 text-neutral-500 group-hover:text-[var(--primary)] transition-colors">
              <MessageSquare className="h-4 w-4" />
              <span className="tabular-nums font-sans">
                {repliesCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
