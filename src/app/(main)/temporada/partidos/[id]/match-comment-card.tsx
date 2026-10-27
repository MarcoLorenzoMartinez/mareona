// Client: Tarjeta limpia de comentario de partido estilo Twitter (sin respuestas anidadas a la vista)
"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { AuthAvatar } from "@/components/auth/auth-avatar";
import { HeartLikeIcon } from "@/components/social/heart-like-icon";
import { formatRelativeTime } from "@/app/(main)/social/post-card";
import { useAuth } from "@/context/auth-context";
import type { MatchComment } from "@/lib/match-community/types";

interface MatchCommentCardProps {
  readonly comment: MatchComment;
  readonly onOpenThread: (commentId: string) => void;
  readonly onOpenProfile?: (userId: string) => void;
}

export function MatchCommentCard({
  comment,
  onOpenThread,
  onOpenProfile,
}: MatchCommentCardProps) {
  const { user, openAuthModal } = useAuth();
  const [likes, setLikes] = useState(comment.likesCount);
  const [hasLiked, setHasLiked] = useState(comment.hasLiked ?? false);

  const toggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      openAuthModal("signin");
      return;
    }
    setHasLiked(!hasLiked);
    setLikes((prev) => (hasLiked ? prev - 1 : prev + 1));
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    if (!comment.authorId || !onOpenProfile) return;
    e.stopPropagation();
    onOpenProfile(comment.authorId);
  };

  const repliesCount = comment.replies?.length ?? 0;

  return (
    <article
      onClick={() => onOpenThread(comment.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenThread(comment.id);
        }
      }}
      aria-label={`Comentario de ${comment.authorName}. Haz clic para ver el hilo y ${repliesCount} respuestas.`}
      className="group relative cursor-pointer rounded-2xl border border-[var(--border)] bg-white p-4 shadow-xs transition-all hover:border-neutral-300 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
    >
      <div className="flex gap-3">
        <div onClick={handleProfileClick} className="cursor-pointer hover:opacity-85 transition-opacity">
          <AuthAvatar src={comment.authorAvatar} alt={comment.authorName} size="sm" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleProfileClick}
              className="text-xs font-bold text-neutral-900 truncate hover:underline hover:text-[var(--primary)] text-left cursor-pointer"
            >
              {comment.authorName}
            </button>
            <button
              type="button"
              onClick={handleProfileClick}
              className="text-[11px] font-medium text-neutral-400 hover:text-neutral-600 cursor-pointer"
            >
              @{comment.authorUsername}
            </button>
            <span className="text-[11px] text-neutral-300">·</span>
            <span className="text-[11px] text-neutral-400">
              {formatRelativeTime(comment.createdAt)}
            </span>
          </div>

          <p className="mt-1.5 text-xs text-neutral-800 leading-relaxed whitespace-pre-line">
            {comment.body}
          </p>

          <div className="mt-3 flex items-center gap-6 border-t border-neutral-100 pt-2 text-xs text-neutral-500">
            {/* Botón de Like estilo Twitter */}
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
              <MessageSquare className="h-3.5 w-3.5" />
              <span className="tabular-nums font-sans">{repliesCount}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
