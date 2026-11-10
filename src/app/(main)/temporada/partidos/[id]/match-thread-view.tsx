// Client: Vista de conversación de partido enfocada (muñeca rusa idéntica a Social)
"use client";

import { ArrowLeft } from "lucide-react";
import { AuthAvatar } from "@/components/auth/auth-avatar";
import { PostActions } from "@/app/(main)/social/post-actions";
import { MatchCommentComposer } from "./match-comment-composer";
import { MatchReplyItem } from "./match-reply-item";
import { formatRelativeTime } from "@/lib/social/format";
import type { MatchComment } from "@/lib/match-community/types";

interface MatchThreadViewProps {
  readonly matchId: string;
  readonly comment: MatchComment;
  readonly parentComment?: MatchComment | null;
  readonly onBack: () => void;
  readonly onDrillDown: (commentId: string) => void;
  readonly onAddReply: (parentId: string, reply: MatchComment) => void;
  readonly onOpenProfile?: (userId: string) => void;
}

export function MatchThreadView({
  matchId,
  comment,
  parentComment,
  onBack,
  onDrillDown,
  onAddReply,
  onOpenProfile,
}: MatchThreadViewProps) {
  const replies = comment.replies ?? [];
  const openProfile = () => {
    if (comment.authorId) onOpenProfile?.(comment.authorId);
  };

  return (
    <div>
      <div className="flex items-center gap-3 border-b border-[var(--border)] bg-white px-3 py-2">
        <button
          type="button"
          onClick={onBack}
          aria-label="Volver a la conversación anterior"
          className="flex h-11 w-11 items-center justify-center rounded-full text-neutral-700 transition-colors duration-150 hover:bg-[var(--surface)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <div className="min-w-0">
          <h2 className="text-base font-bold text-neutral-900">Conversación</h2>
          {parentComment && (
            <p className="truncate text-xs text-neutral-500">
              En respuesta a @{parentComment.authorUsername}
            </p>
          )}
        </div>
      </div>

      <article className="border-b border-[var(--border)] px-4 pt-4 pb-1">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={openProfile}
            aria-label={`Ver perfil de ${comment.authorName}`}
            className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          >
            <AuthAvatar src={comment.authorAvatar} alt={comment.authorName} size="md" />
          </button>
          <div className="min-w-0 flex-1 leading-tight">
            <button
              type="button"
              onClick={openProfile}
              className="block max-w-full truncate text-left text-sm font-bold text-neutral-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            >
              {comment.authorName}
            </button>
            <span className="block truncate text-sm text-neutral-500">
              @{comment.authorUsername}
            </span>
          </div>
        </div>

        <p className="mt-3 whitespace-pre-line break-words text-[19px] leading-snug text-neutral-900">
          {comment.body}
        </p>
        <time dateTime={comment.createdAt} className="mt-3 block text-sm text-neutral-500">
          {formatRelativeTime(comment.createdAt)}
        </time>

        <div className="mt-2 border-t border-[var(--border)] pt-1">
          <PostActions likesCount={comment.likesCount} repliesCount={replies.length} />
        </div>
      </article>

      <MatchCommentComposer
        matchId={matchId}
        parentId={comment.id}
        placeholder={`Responder a @${comment.authorUsername}`}
        submitLabel="Responder"
        onCommented={(reply) => onAddReply(comment.id, reply)}
      />

      <section aria-label="Respuestas al comentario">
        {replies.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-neutral-500">
            Aún no hay respuestas
          </p>
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
