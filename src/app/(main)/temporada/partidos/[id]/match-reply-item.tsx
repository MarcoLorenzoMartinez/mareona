// Client: Respuesta del hilo de partido con la misma anatomía que el timeline de Social
"use client";

import { AuthAvatar } from "@/components/auth/auth-avatar";
import { SharedLineupPitchCard } from "@/components/lineup-builder/shared-lineup-pitch-card";
import { parsePostLineup } from "@/lib/lineup-builder/shared-lineup-codec";
import { PostActions } from "@/app/(main)/social/post-actions";
import { formatRelativeTime } from "@/lib/social/format";
import type { MatchComment } from "@/lib/match-community/types";

interface MatchReplyItemProps {
  readonly reply: MatchComment;
  readonly onDrillDown: (commentId: string) => void;
  readonly onOpenProfile?: (userId: string) => void;
}

export function MatchReplyItem({
  reply,
  onDrillDown,
  onOpenProfile,
}: MatchReplyItemProps) {
  const count = reply.replies?.length ?? 0;
  const drillDown = () => onDrillDown(reply.id);
  const { cleanBody, lineup } = parsePostLineup(reply.body);

  const openProfile = (e: React.MouseEvent) => {
    if (!reply.authorId || !onOpenProfile) return;
    e.stopPropagation();
    onOpenProfile(reply.authorId);
  };

  return (
    <article
      onClick={drillDown}
      className="flex cursor-pointer gap-3 border-b border-[var(--border)] px-4 py-3 last:border-b-0 transition-colors duration-150 hover:bg-[var(--surface)]/60"
    >
      <button
        type="button"
        onClick={openProfile}
        aria-label={`Ver perfil de ${reply.authorName}`}
        className="h-fit shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
      >
        <AuthAvatar src={reply.authorAvatar} alt={reply.authorName} size="md" />
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-baseline gap-1.5 text-sm">
          <button
            type="button"
            onClick={openProfile}
            className="truncate text-left font-bold text-neutral-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          >
            {reply.authorName}
          </button>
          <button
            type="button"
            onClick={openProfile}
            className="truncate text-left text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          >
            @{reply.authorUsername}
          </button>
          <span aria-hidden="true" className="text-neutral-400">·</span>
          <time dateTime={reply.createdAt} className="shrink-0 text-xs text-neutral-500">
            {formatRelativeTime(reply.createdAt)}
          </time>
        </div>

        {cleanBody && (
          <p className="mt-0.5 whitespace-pre-line break-words text-[15px] leading-snug text-neutral-900">
            {cleanBody}
          </p>
        )}

        {lineup && <SharedLineupPitchCard lineup={lineup} />}

        <PostActions
          likesCount={reply.likesCount}
          repliesCount={count}
          onOpenThread={drillDown}
        />
      </div>
    </article>
  );
}
