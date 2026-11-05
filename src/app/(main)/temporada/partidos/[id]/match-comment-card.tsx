// Client: Fila de comentario de partido en el timeline; clic abre el hilo (idéntico a Social)
"use client";

import { AuthAvatar } from "@/components/auth/auth-avatar";
import { PostActions } from "@/app/(main)/social/post-actions";
import { formatRelativeTime } from "@/lib/social/format";
import type { MatchComment } from "@/lib/match-community/types";

interface MatchCommentCardProps {
  readonly comment: MatchComment;
  readonly onOpenThread: (commentId: string) => void;
  readonly onOpenProfile?: (userId: string) => void;
}

export function MatchCommentCard({
  comment,
  onOpenThread,
  onOpenProfile,
}: MatchCommentCardProps) {
  const repliesCount = comment.replies?.length ?? 0;
  const openThread = () => onOpenThread(comment.id);

  const openProfile = (e: React.MouseEvent) => {
    if (!comment.authorId || !onOpenProfile) return;
    e.stopPropagation();
    onOpenProfile(comment.authorId);
  };

  return (
    <article
      onClick={openThread}
      className="flex cursor-pointer gap-3 border-b border-[var(--border)] px-4 py-3 last:border-b-0 transition-colors duration-150 hover:bg-[var(--surface)]/60"
    >
      <button
        type="button"
        onClick={openProfile}
        aria-label={`Ver perfil de ${comment.authorName}`}
        className="h-fit shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
      >
        <AuthAvatar src={comment.authorAvatar} alt="" size="md" />
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-baseline gap-1.5 text-sm">
          <button
            type="button"
            onClick={openProfile}
            className="truncate text-left font-bold text-neutral-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          >
            {comment.authorName}
          </button>
          <button
            type="button"
            onClick={openProfile}
            className="truncate text-left text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          >
            @{comment.authorUsername}
          </button>
          <span aria-hidden="true" className="text-neutral-400">·</span>
          <time dateTime={comment.createdAt} className="shrink-0 text-xs text-neutral-500">
            {formatRelativeTime(comment.createdAt)}
          </time>
        </div>

        <p className="mt-0.5 whitespace-pre-line break-words text-[15px] leading-snug text-neutral-900">
          {comment.body}
        </p>

        <PostActions
          likesCount={comment.likesCount}
          repliesCount={repliesCount}
          onOpenThread={openThread}
        />
      </div>
    </article>
  );
}
