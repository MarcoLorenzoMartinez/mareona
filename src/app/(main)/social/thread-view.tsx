// Client: Vista de conversación enfocada (modelo muñeca rusa) con encuesta, edición, acciones y borrado
"use client";

import { useState } from "react";
import { Trash2, Pencil } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { AuthAvatar } from "@/components/auth/auth-avatar";
import { PollDisplay } from "@/components/social/poll-display";
import { SharedLineupPitchCard } from "@/components/lineup-builder/shared-lineup-pitch-card";
import { InlinePostEditor } from "@/components/social/inline-post-editor";
import { ThreadHeaderBar } from "@/components/social/thread-header-bar";
import { parsePostLineup } from "@/lib/lineup-builder/shared-lineup-codec";
import { PostActions } from "./post-actions";
import { PostComposer } from "./post-composer";
import { ThreadReplyItem } from "./thread-reply-item";
import { formatRelativeTime, canEditPost } from "@/lib/social/format";
import type { SocialPost } from "@/lib/social/types";
import { getDictionary } from "@/i18n";

interface ThreadViewProps {
  readonly post: SocialPost;
  readonly parentPost?: SocialPost | null;
  readonly onBack: () => void;
  readonly onDrillDown: (postId: string) => void;
  readonly onAddReply: (parentId: string, newReply: SocialPost) => void;
  readonly onOpenProfile?: (userId: string) => void;
  readonly onDeletePost?: (postId: string) => void;
  readonly onUpdatePost?: (postId: string, newBody: string) => Promise<void> | void;
}

export function ThreadView({
  post,
  parentPost,
  onBack,
  onDrillDown,
  onAddReply,
  onOpenProfile,
  onDeletePost,
  onUpdatePost,
}: ThreadViewProps) {
  const dict = getDictionary();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const replies = post.replies ?? [];
  const openProfile = () => {
    if (post.userId) onOpenProfile?.(post.userId);
  };
  const isOwner = Boolean(user && user.id === post.userId);
  const canEdit = Boolean(isOwner && onUpdatePost && canEditPost(post.createdAt));
  const { cleanBody, lineup } = parsePostLineup(post.body);

  const handleSaveEdit = async (newBody: string) => {
    if (onUpdatePost) {
      await onUpdatePost(post.id, newBody);
    }
    setIsEditing(false);
  };

  return (
    <div>
      <ThreadHeaderBar
        onBack={onBack}
        parentUsername={parentPost?.authorUsername}
      />

      <article className="border-b border-[var(--border)] px-4 pt-4 pb-1">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={openProfile}
              aria-label={`${dict.social.post.viewProfileAriaPrefix} ${post.authorName}`}
              className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            >
              <AuthAvatar src={post.authorAvatar} alt={post.authorName} size="md" />
            </button>
            <div className="min-w-0 flex-1 leading-tight">
              <button
                type="button"
                onClick={openProfile}
                className="block max-w-full truncate text-left text-sm font-bold text-neutral-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
              >
                {post.authorName}
              </button>
              <span className="block truncate text-sm text-neutral-500">@{post.authorUsername}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {canEdit && (
              <button
                type="button"
                onClick={() => setIsEditing((prev) => !prev)}
                aria-label={dict.social.post.editPostAria}
                className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
              </button>
            )}

            {isOwner && onDeletePost && (
              <button
                type="button"
                onClick={() => onDeletePost(post.id)}
                aria-label={dict.social.post.deletePostAria}
                className="flex h-8 w-8 items-center justify-center text-neutral-400 hover:bg-red-50 hover:text-[#e2001a] rounded-full transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e2001a]"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {isEditing ? (
          <InlinePostEditor
            initialBody={post.body}
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

        {post.poll && <PollDisplay poll={post.poll} />}

        <div className="mt-3 flex items-center gap-1.5 text-sm text-neutral-500">
          <time dateTime={post.createdAt}>{formatRelativeTime(post.createdAt)}</time>
          {post.isEdited && (
            <>
              <span aria-hidden="true" className="text-neutral-400">·</span>
              <span className="text-neutral-400 text-xs">{dict.social.post.editedLabel}</span>
            </>
          )}
        </div>

        {!isEditing && (
          <div className="mt-2 border-t border-[var(--border)] pt-1">
            <PostActions
              likesCount={post.likesCount}
              repliesCount={replies.length}
              postId={post.id}
              postBody={cleanBody || post.body}
            />
          </div>
        )}
      </article>

      <PostComposer
        parentId={post.id}
        placeholder={`${dict.social.thread.replyPlaceholderPrefix}${post.authorUsername}`}
        submitLabel={dict.social.thread.replySubmit}
        onPosted={(reply) => onAddReply(post.id, reply)}
      />

      <section aria-label={dict.social.thread.repliesAria}>
        {replies.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-neutral-500">{dict.social.thread.noReplies}</p>
        ) : (
          replies.map((reply) => (
            <ThreadReplyItem
              key={reply.id}
              reply={reply}
              onDrillDown={onDrillDown}
              onOpenProfile={onOpenProfile}
              onDelete={onDeletePost}
              onUpdate={onUpdatePost}
            />
          ))
        )}
      </section>
    </div>
  );
}
