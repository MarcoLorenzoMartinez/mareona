// Client: Respuesta del hilo con la misma anatomía que una publicación del timeline
"use client";

import { useAuth } from "@/context/auth-context";
import { AuthAvatar } from "@/components/auth/auth-avatar";
import { PollDisplay } from "@/components/social/poll-display";
import { PostActions } from "./post-actions";
import { PostAuthorLine } from "./post-author-line";
import type { SocialPost } from "@/lib/social/types";

interface ThreadReplyItemProps {
  readonly reply: SocialPost;
  readonly onDrillDown: (postId: string) => void;
  readonly onOpenProfile?: (userId: string) => void;
  readonly onDelete?: (postId: string) => void;
}

export function ThreadReplyItem({
  reply,
  onDrillDown,
  onOpenProfile,
  onDelete,
}: ThreadReplyItemProps) {
  const { user } = useAuth();
  const count = reply.repliesCount ?? reply.replies?.length ?? 0;
  const drillDown = () => onDrillDown(reply.id);
  const isOwner = Boolean(user && user.id === reply.userId);

  return (
    <article
      onClick={drillDown}
      className="flex cursor-pointer gap-3 border-b border-[var(--border)] px-4 py-3 transition-colors duration-150 hover:bg-[var(--surface)]/60"
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (reply.userId) onOpenProfile?.(reply.userId);
        }}
        aria-label={`Ver perfil de ${reply.authorName}`}
        className="h-fit shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
      >
        <AuthAvatar src={reply.authorAvatar} alt="" size="md" />
      </button>

      <div className="min-w-0 flex-1">
        <PostAuthorLine post={reply} onOpenProfile={onOpenProfile} />
        <p className="mt-0.5 whitespace-pre-line break-words text-[15px] leading-snug text-neutral-900">
          {reply.body}
        </p>

        {reply.poll && <PollDisplay poll={reply.poll} />}

        <PostActions
          likesCount={reply.likesCount}
          repliesCount={count}
          onOpenThread={drillDown}
          postId={reply.id}
          postBody={reply.body}
          onDelete={isOwner && onDelete ? () => onDelete(reply.id) : undefined}
        />
      </div>
    </article>
  );
}
