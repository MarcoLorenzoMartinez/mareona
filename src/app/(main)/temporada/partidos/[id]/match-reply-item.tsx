// Client: Respuesta del hilo de partido con edición en 15 min y borrado
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

interface MatchReplyItemProps {
  readonly reply: MatchComment;
  readonly onDrillDown: (commentId: string) => void;
  readonly onOpenProfile?: (userId: string) => void;
  readonly onDelete?: (commentId: string) => void;
  readonly onUpdate?: (commentId: string, newBody: string) => Promise<void> | void;
}

export function MatchReplyItem({
  reply,
  onDrillDown,
  onOpenProfile,
  onDelete,
  onUpdate,
}: MatchReplyItemProps) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const count = reply.replies?.length ?? 0;
  const drillDown = () => onDrillDown(reply.id);
  const isOwner = Boolean(user && user.id === reply.authorId);
  const { cleanBody, lineup } = parsePostLineup(reply.body);

  const handleSaveEdit = async (newBody: string) => {
    if (onUpdate) {
      await onUpdate(reply.id, newBody);
    }
    setIsEditing(false);
  };

  return (
    <article
      onClick={isEditing ? undefined : drillDown}
      className={`flex gap-3 border-b border-[var(--border)] px-4 py-3 last:border-b-0 transition-colors duration-150 ${
        isEditing ? "bg-neutral-50/50" : "cursor-pointer hover:bg-[var(--surface)]/60"
      }`}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (reply.authorId) onOpenProfile?.(reply.authorId);
        }}
        aria-label={`Ver perfil de ${reply.authorName}`}
        className="h-fit shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
      >
        <AuthAvatar src={reply.authorAvatar} alt={reply.authorName} size="md" />
      </button>

      <div className="min-w-0 flex-1">
        <PostAuthorLine
          authorName={reply.authorName}
          authorUsername={reply.authorUsername}
          userId={reply.authorId}
          createdAt={reply.createdAt}
          isEdited={reply.isEdited}
          onOpenProfile={onOpenProfile}
          onEdit={isOwner && onUpdate ? () => setIsEditing((prev) => !prev) : undefined}
          onDelete={isOwner && onDelete ? () => onDelete(reply.id) : undefined}
        />

        {isEditing ? (
          <InlinePostEditor
            initialBody={reply.body}
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
            likesCount={reply.likesCount}
            repliesCount={count}
            onOpenThread={drillDown}
            postId={reply.id}
            postBody={cleanBody || reply.body}
          />
        )}
      </div>
    </article>
  );
}
