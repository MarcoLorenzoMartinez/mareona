// Client: Vista de conversación de partido enfocada con edición en 15 min y borrado
"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { AuthAvatar } from "@/components/auth/auth-avatar";
import { SharedLineupPitchCard } from "@/components/lineup-builder/shared-lineup-pitch-card";
import { InlinePostEditor } from "@/components/social/inline-post-editor";
import { ThreadHeaderBar } from "@/components/social/thread-header-bar";
import { parsePostLineup } from "@/lib/lineup-builder/shared-lineup-codec";
import { PostActions } from "@/app/(main)/social/post-actions";
import { MatchCommentComposer } from "./match-comment-composer";
import { MatchReplyItem } from "./match-reply-item";
import { formatRelativeTime, canEditPost } from "@/lib/social/format";
import type { MatchComment } from "@/lib/match-community/types";

interface MatchThreadViewProps {
  readonly matchId: string;
  readonly comment: MatchComment;
  readonly parentComment?: MatchComment | null;
  readonly onBack: () => void;
  readonly onDrillDown: (commentId: string) => void;
  readonly onAddReply: (parentId: string, reply: MatchComment) => void;
  readonly onOpenProfile?: (userId: string) => void;
  readonly onDeleteComment?: (commentId: string) => void;
  readonly onUpdateComment?: (commentId: string, newBody: string) => Promise<void> | void;
}

export function MatchThreadView({
  matchId,
  comment,
  parentComment,
  onBack,
  onDrillDown,
  onAddReply,
  onOpenProfile,
  onDeleteComment,
  onUpdateComment,
}: MatchThreadViewProps) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const replies = comment.replies ?? [];
  const openProfile = () => { if (comment.authorId) onOpenProfile?.(comment.authorId); };
  const isOwner = Boolean(user && user.id === comment.authorId);
  const canEdit = Boolean(isOwner && onUpdateComment && canEditPost(comment.createdAt));
  const { cleanBody, lineup } = parsePostLineup(comment.body);

  const handleSaveEdit = async (newBody: string) => {
    if (onUpdateComment) await onUpdateComment(comment.id, newBody);
    setIsEditing(false);
  };

  return (
    <div>
      <ThreadHeaderBar
        onBack={onBack}
        parentUsername={parentComment?.authorUsername}
      />

      <article className="border-b border-[var(--border)] px-4 pt-4 pb-1">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
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

          <div className="flex items-center gap-1 shrink-0">
            {canEdit && (
              <button
                type="button"
                onClick={() => setIsEditing((prev) => !prev)}
                aria-label="Editar comentario"
                className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-100 hover:text-neutral-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
              </button>
            )}

            {isOwner && onDeleteComment && (
              <button
                type="button"
                onClick={() => onDeleteComment(comment.id)}
                aria-label="Borrar comentario"
                className="flex h-8 w-8 items-center justify-center text-neutral-600 hover:bg-red-50 hover:text-[#e2001a] rounded-full transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e2001a]"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {isEditing ? (
          <InlinePostEditor
            initialBody={comment.body}
            onSave={handleSaveEdit}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          cleanBody && (
            <p className="mt-3 whitespace-pre-line break-words text-[19px] leading-snug text-neutral-900">
              {cleanBody}
            </p>
          )
        )}

        {lineup && <SharedLineupPitchCard lineup={lineup} />}

        <div className="mt-3 flex items-center gap-1.5 text-sm text-neutral-500">
          <time dateTime={comment.createdAt}>{formatRelativeTime(comment.createdAt)}</time>
          {comment.isEdited && (
            <>
              <span aria-hidden="true" className="text-neutral-600">·</span>
              <span className="text-neutral-600 text-xs">editado</span>
            </>
          )}
        </div>

        {!isEditing && (
          <div className="mt-2 border-t border-[var(--border)] pt-1">
            <PostActions
              likesCount={comment.likesCount}
              repliesCount={replies.length}
              postId={comment.id}
              postBody={cleanBody || comment.body}
            />
          </div>
        )}
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
          <p className="px-4 py-10 text-center text-sm text-neutral-500">Aún no hay respuestas</p>
        ) : (
          replies.map((reply) => (
            <MatchReplyItem
              key={reply.id}
              reply={reply}
              onDrillDown={onDrillDown}
              onOpenProfile={onOpenProfile}
              onDelete={onDeleteComment}
              onUpdate={onUpdateComment}
            />
          ))
        )}
      </section>
    </div>
  );
}
