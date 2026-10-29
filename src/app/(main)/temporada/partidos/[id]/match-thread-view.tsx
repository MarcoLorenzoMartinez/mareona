// Client: Vista detallada de hilo de comentario en partido (muñeca rusa idéntica a social)
"use client";

import { useState } from "react";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { AuthAvatar } from "@/components/auth/auth-avatar";
import { HeartLikeIcon } from "@/components/social/heart-like-icon";
import { formatRelativeTime } from "@/app/(main)/social/post-card";
import { useAuth } from "@/context/auth-context";
import { MatchReplyItem } from "./match-reply-item";
import type { MatchComment } from "@/lib/match-community/types";

interface MatchThreadViewProps {
  readonly comment: MatchComment;
  readonly parentComment?: MatchComment | null;
  readonly onBack: () => void;
  readonly onDrillDown: (commentId: string) => void;
  readonly onAddReply: (parentId: string, body: string) => Promise<void>;
  readonly onOpenProfile?: (userId: string) => void;
}

export function MatchThreadView({
  comment,
  parentComment,
  onBack,
  onDrillDown,
  onAddReply,
  onOpenProfile,
}: MatchThreadViewProps) {
  const { user, openAuthModal } = useAuth();
  const [likes, setLikes] = useState(comment.likesCount);
  const [hasLiked, setHasLiked] = useState(comment.hasLiked ?? false);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleLike = () => {
    if (!user) {
      openAuthModal("signin");
      return;
    }
    setHasLiked(!hasLiked);
    setLikes((prev) => (hasLiked ? prev - 1 : prev + 1));
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    if (!user) {
      openAuthModal("signin");
      return;
    }

    setIsSubmitting(true);
    await onAddReply(comment.id, replyText.trim());
    setIsSubmitting(false);
    setReplyText("");
  };

  const replies = comment.replies ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 pb-2 border-b border-neutral-100">
        <button
          type="button"
          onClick={onBack}
          aria-label="Volver al hilo anterior"
          className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-sm font-bold text-neutral-900">Conversación de partido</h2>
          {parentComment && (
            <p className="text-[11px] text-neutral-400">
              En respuesta a @{parentComment.authorUsername}
            </p>
          )}
        </div>
      </div>

      <article className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <div
            onClick={() => comment.authorId && onOpenProfile?.(comment.authorId)}
            className="cursor-pointer hover:opacity-85"
          >
            <AuthAvatar src={comment.authorAvatar} alt={comment.authorName} size="md" />
          </div>
          <div className="min-w-0 flex-1">
            <button
              type="button"
              onClick={() => comment.authorId && onOpenProfile?.(comment.authorId)}
              className="text-sm font-bold text-neutral-900 truncate hover:underline hover:text-[var(--primary)] text-left cursor-pointer"
            >
              {comment.authorName}
            </button>
            <button
              type="button"
              onClick={() => comment.authorId && onOpenProfile?.(comment.authorId)}
              className="text-xs text-neutral-400 hover:text-neutral-600 block cursor-pointer"
            >
              @{comment.authorUsername}
            </button>
          </div>
          <span className="text-xs text-neutral-400">{formatRelativeTime(comment.createdAt)}</span>
        </div>

        <p className="mt-4 text-sm text-neutral-900 leading-relaxed whitespace-pre-line">
          {comment.body}
        </p>

        <div className="mt-4 flex items-center gap-6 border-t border-neutral-100 pt-3 text-xs text-neutral-500">
          <button
            type="button"
            onClick={toggleLike}
            className={`group flex items-center gap-1.5 transition-colors cursor-pointer ${
              hasLiked ? "text-[var(--primary)] font-bold" : "text-neutral-500 hover:text-[var(--primary)]"
            }`}
          >
            <HeartLikeIcon filled={hasLiked} />
            <span className="tabular-nums font-sans">{likes}</span>
          </button>
          <div className="flex items-center gap-1.5 text-neutral-500">
            <MessageSquare className="h-4 w-4" />
            <span className="tabular-nums font-sans">{replies.length} respuestas</span>
          </div>
        </div>
      </article>

      <form onSubmit={handleReplySubmit} className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-xs space-y-2.5">
        <textarea
          rows={2}
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder={`Responder a @${comment.authorUsername}...`}
          maxLength={500}
          className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 p-3 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-[var(--primary)] focus:bg-white focus:outline-none resize-none"
        />
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-neutral-400 font-sans tabular-nums">{500 - replyText.length} car.</span>
          <button
            type="submit"
            disabled={isSubmitting || !replyText.trim()}
            className="rounded-full bg-[var(--primary)] px-4 py-1.5 text-xs font-bold text-white hover:opacity-95 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? "Enviando..." : "Responder"}
          </button>
        </div>
      </form>

      <section aria-label="Respuestas al comentario" className="space-y-2.5 pt-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 px-1">
          Respuestas
        </h3>
        {replies.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-200 p-6 text-center text-xs text-neutral-400">
            No hay respuestas aún. Sé el primero en continuar la conversación del partido.
          </div>
        ) : (
          replies.map((reply) => (
            <MatchReplyItem
              key={reply.id}
              reply={reply}
              onDrillDown={onDrillDown}
              onOpenProfile={onOpenProfile}
            />
          ))
        )}
      </section>
    </div>
  );
}
