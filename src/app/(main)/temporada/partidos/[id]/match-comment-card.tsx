// Client: Fila de comentario de partido en el timeline con edición en 15 min y borrado
"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { AuthAvatar } from "@/components/auth/auth-avatar";
import { SharedLineupPitchCard } from "@/components/lineup-builder/shared-lineup-pitch-card";
import { InlinePostEditor } from "@/components/social/inline-post-editor";
import { parsePostLineup } from "@/lib/lineup-builder/shared-lineup-codec";
import { PostActions } from "@/app/(main)/social/post-actions";
import { PostAuthorLine } from "@/app/(main)/social/post-author-line";
import type { MatchComment } from "@/lib/match-community/types";

interface MatchCommentCardProps {
  readonly comment: MatchComment;
  readonly onOpenThread: (commentId: string) => void;
  readonly onOpenProfile?: (userId: string) => void;
  readonly onDelete?: (commentId: string) => void;
  readonly onUpdate?: (commentId: string, newBody: string) => Promise<void> | void;
}

export function MatchCommentCard({
  comment,
  onOpenThread,
  onOpenProfile,
  onDelete,
  onUpdate,
}: MatchCommentCardProps) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const repliesCount = comment.replies?.length ?? 0;
  const openThread = () => onOpenThread(comment.id);
  const isOwner = Boolean(user && user.id === comment.authorId);
  const { cleanBody, lineup } = parsePostLineup(comment.body);

  const handleSaveEdit = async (newBody: string) => {
    if (onUpdate) {
      await onUpdate(comment.id, newBody);
    }
    setIsEditing(false);
  };

  return (
    <article
      onClick={isEditing ? undefined : openThread}
      className={`flex gap-3 border-b border-[var(--border)] px-4 py-3 last:border-b-0 transition-colors duration-150 ${
        isEditing ? "bg-neutral-50/50" : "cursor-pointer hover:bg-[var(--surface)]/60"
      }`}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (comment.authorId) onOpenProfile?.(comment.authorId);
        }}
        aria-label={`Ver perfil de ${comment.authorName}`}
        className="h-fit shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
      >
        <AuthAvatar src={comment.authorAvatar} alt={comment.authorName} size="md" />
      </button>

      <div className="min-w-0 flex-1">
        <PostAuthorLine
          authorName={comment.authorName}
          authorUsername={comment.authorUsername}
          userId={comment.authorId}
          createdAt={comment.createdAt}
          isEdited={comment.isEdited}
          onOpenProfile={onOpenProfile}
          onEdit={isOwner && onUpdate ? () => setIsEditing((prev) => !prev) : undefined}
          onDelete={isOwner && onDelete ? () => onDelete(comment.id) : undefined}
        />

        {isEditing ? (
          <InlinePostEditor
            initialBody={comment.body}
            onSave={handleSaveEdit}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          cleanBody && (
            <p className="mt-0.5 whitespace-pre-line break-words text-[15px] leading-snug text-neutral-900">
              {cleanBody}
            </p>
          )
        )}

        {lineup && <SharedLineupPitchCard lineup={lineup} />}

        {!isEditing && (
          <PostActions
            likesCount={comment.likesCount}
            repliesCount={repliesCount}
            onOpenThread={openThread}
            postId={comment.id}
            postBody={cleanBody || comment.body}
          />
        )}
      </div>
    </article>
  );
}
