// Client: Fila de publicación del timeline con encuesta, edición en 15 min, acciones y borrado
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

interface PostCardProps {
  readonly post: SocialPost;
  readonly onOpenThread: (postId: string) => void;
  readonly onOpenProfile?: (userId: string) => void;
  readonly onDelete?: (postId: string) => void;
  readonly onUpdate?: (postId: string, newBody: string) => Promise<void> | void;
}

export function PostCard({
  post,
  onOpenThread,
  onOpenProfile,
  onDelete,
  onUpdate,
}: PostCardProps) {
  const dict = getDictionary();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const repliesCount = post.repliesCount ?? post.replies?.length ?? 0;
  const openThread = () => onOpenThread(post.id);
  const isOwner = Boolean(user && user.id === post.userId);
  const { cleanBody, lineup } = parsePostLineup(post.body);

  const handleSaveEdit = async (newBody: string) => {
    if (onUpdate) {
      await onUpdate(post.id, newBody);
    }
    setIsEditing(false);
  };

  return (
    <article
      onClick={isEditing ? undefined : openThread}
      tabIndex={isEditing ? undefined : 0}
      role={isEditing ? "region" : "button"}
      aria-label={`${dict.social.post.ariaPrefix} ${post.authorName}`}
      onKeyDown={(e) => {
        if (!isEditing && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          openThread();
        }
      }}
      className={`flex gap-3 border-b border-[var(--border)] px-4 py-3 transition-colors duration-150 ${
        isEditing
          ? "bg-neutral-50/50"
          : "cursor-pointer hover:bg-[var(--surface)]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--primary)]"
      }`}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (post.userId) onOpenProfile?.(post.userId);
        }}
        aria-label={`${dict.social.post.viewProfileAriaPrefix} ${post.authorName}`}
        className="h-fit shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
      >
        <AuthAvatar src={post.authorAvatar} alt={post.authorName} size="md" />
      </button>

      <div className="min-w-0 flex-1">
        <PostAuthorLine
          post={post}
          onOpenProfile={onOpenProfile}
          onEdit={isOwner && onUpdate ? () => setIsEditing((prev) => !prev) : undefined}
          onDelete={isOwner && onDelete ? () => onDelete(post.id) : undefined}
        />

        {isEditing ? (
          <InlinePostEditor
            initialBody={post.body}
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

        {post.poll && <PollDisplay poll={post.poll} />}

        {!isEditing && (
          <PostActions
            likesCount={post.likesCount}
            userHasLiked={post.userHasLiked}
            repliesCount={repliesCount}
            onOpenThread={openThread}
            postId={post.id}
            postBody={cleanBody || post.body}
          />
        )}
      </div>
    </article>
  );
}
