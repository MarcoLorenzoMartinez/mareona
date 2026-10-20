// Client: Tarjeta de comentario y respuestas de partido
"use client";

import { useState } from "react";
import { AuthAvatar } from "@/components/auth/auth-avatar";
import { useAuth } from "@/context/auth-context";
import type { MatchComment } from "@/lib/match-community/types";

interface MatchCommentCardProps {
  readonly comment: MatchComment;
  readonly onReply: (parentId: string, body: string) => Promise<void>;
}

export function MatchCommentCard({ comment, onReply }: MatchCommentCardProps) {
  const { user, openAuthModal } = useAuth();
  const [likes, setLikes] = useState(comment.likesCount);
  const [hasLiked, setHasLiked] = useState(comment.hasLiked ?? false);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLike = () => {
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
    setIsSubmitting(true);
    await onReply(comment.id, replyText.trim());
    setIsSubmitting(false);
    setReplyText("");
    setShowReplyBox(false);
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-2xs">
      <div className="flex items-start gap-3">
        <AuthAvatar
          src={comment.authorAvatar}
          alt={comment.authorName}
          size="sm"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-neutral-900">
              {comment.authorName}
            </span>
            <span className="text-[11px] text-neutral-400">
              @{comment.authorUsername}
            </span>
          </div>

          <p className="mt-1 text-xs leading-relaxed text-neutral-800 whitespace-pre-line">
            {comment.body}
          </p>

          <div className="mt-2.5 flex items-center gap-4 text-xs">
            <button
              type="button"
              onClick={handleLike}
              className={`flex items-center gap-1 font-semibold transition-colors ${
                hasLiked ? "text-[var(--primary)]" : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              <span>{hasLiked ? "❤️" : "🤍"}</span>
              <span className="font-sans tabular-nums">{likes}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!user) {
                  openAuthModal("signin");
                  return;
                }
                setShowReplyBox(!showReplyBox);
              }}
              className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-900"
            >
              Responder
            </button>
          </div>

          {/* Formulario de respuesta */}
          {showReplyBox && (
            <form onSubmit={handleReplySubmit} className="mt-3 flex gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Escribe tu respuesta..."
                maxLength={500}
                className="flex-1 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs text-neutral-900 focus:border-[var(--primary)] focus:bg-white focus:outline-none"
              />
              <button
                type="submit"
                disabled={isSubmitting || !replyText.trim()}
                className="rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-bold text-white hover:opacity-95 disabled:opacity-50"
              >
                {isSubmitting ? "..." : "Enviar"}
              </button>
            </form>
          )}

          {/* Respuestas anidadas */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 space-y-2.5 border-l-2 border-neutral-100 pl-3">
              {comment.replies.map((reply) => (
                <div key={reply.id} className="flex items-start gap-2.5">
                  <AuthAvatar
                    src={reply.authorAvatar}
                    alt={reply.authorName}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-bold text-neutral-900">
                        {reply.authorName}
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        @{reply.authorUsername}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-neutral-800">
                      {reply.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
