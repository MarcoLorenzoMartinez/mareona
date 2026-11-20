// Client: Respuesta del hilo con la misma anatomía que una publicación del timeline
"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { AuthAvatar } from "@/components/auth/auth-avatar";
import { PollDisplay } from "@/components/social/poll-display";
import { SharedLineupPitchCard } from "@/components/lineup-builder/shared-lineup-pitch-card";
import { InlinePostEditor } from "@/components/social/inline-post-editor";
import { parsePostLineup } from "@/lib/lineup-builder/shared-lineup-codec";
import { PostActions } from "./post-actions";
import { PostAuthorLine } from "./post-author-line";
import type { SocialPost } from "@/lib/social/types";
import { getDictionary } from "@/i18n";

interface ThreadReplyItemProps {
  readonly reply: SocialPost;
  readonly onDrillDown: (postId: string) => void;
  readonly onOpenProfile?: (userId: string) => void;
  readonly onDelete?: (postId: string) => void;
  readonly onUpdate?: (postId: string, newBody: string) => Promise<void> | void;
}

export function ThreadReplyItem({
  reply,
  onDrillDown,
  onOpenProfile,
  onDelete,
  onUpdate,
}: ThreadReplyItemProps) {
  const dict = getDictionary();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const count = reply.repliesCount ?? reply.replies?.length ?? 0;
  const drillDown = () => onDrillDown(reply.id);
  const isOwner = Boolean(user && user.id === reply.userId);
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
      className={`flex gap-3 border-b border-[var(--border)] px-4 py-3 transition-colors duration-150 ${
        isEditing ? "bg-neutral-50/50" : "cursor-pointer hover:bg-[var(--surface)]/60"
      }`}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (reply.userId) onOpenProfile?.(reply.userId);
        }}
        aria-label={`${dict.social.post.viewProfileAriaPrefix} ${reply.authorName}`}
        className="h-fit shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
      >
        <AuthAvatar src={reply.authorAvatar} alt={reply.authorName} size="md" />
      </button>

      <div className="min-w-0 flex-1">
        <PostAuthorLine
          post={reply}
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

        {reply.poll && <PollDisplay poll={reply.poll} />}

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
