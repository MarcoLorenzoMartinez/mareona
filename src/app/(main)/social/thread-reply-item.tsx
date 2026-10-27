// Client: Tarjeta de respuesta interactiva dentro del hilo (permite profundizar en la muñeca rusa)
"use client";

import { AuthAvatar } from "@/components/auth/auth-avatar";
import { formatRelativeTime } from "./post-card";
import type { SocialPost } from "@/lib/social/types";

interface ThreadReplyItemProps {
  readonly reply: SocialPost;
  readonly onDrillDown: (postId: string) => void;
  readonly onOpenProfile?: (userId: string) => void;
}

export function ThreadReplyItem({
  reply,
  onDrillDown,
  onOpenProfile,
}: ThreadReplyItemProps) {
  const count = reply.repliesCount ?? reply.replies?.length ?? 0;

  const handleProfileClick = (e: React.MouseEvent) => {
    if (!reply.userId || !onOpenProfile) return;
    e.stopPropagation();
    onOpenProfile(reply.userId);
  };

  return (
    <div
      onClick={() => onDrillDown(reply.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onDrillDown(reply.id);
        }
      }}
      aria-label={`Respuesta de ${reply.authorName}. Haz clic para ver sus respuestas.`}
      className="group cursor-pointer rounded-xl border border-[var(--border)] bg-white p-3.5 transition-all hover:border-neutral-300 hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
    >
      <div className="flex items-start gap-2.5">
        <div onClick={handleProfileClick} className="cursor-pointer hover:opacity-85 transition-opacity">
          <AuthAvatar src={reply.authorAvatar} alt={reply.authorName} size="sm" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={handleProfileClick}
              className="text-xs font-bold text-neutral-900 truncate hover:underline hover:text-[var(--primary)] text-left cursor-pointer"
            >
              {reply.authorName}
            </button>
            <button
              type="button"
              onClick={handleProfileClick}
              className="text-[11px] text-neutral-400 hover:text-neutral-600 cursor-pointer"
            >
              @{reply.authorUsername}
            </button>
            <span className="text-[11px] text-neutral-300">·</span>
            <span className="text-[11px] text-neutral-400">
              {formatRelativeTime(reply.createdAt)}
            </span>
          </div>

          <p className="mt-1 text-xs text-neutral-800 leading-relaxed whitespace-pre-line">
            {reply.body}
          </p>

          <div className="mt-2 flex items-center gap-4 text-[11px] text-neutral-400">
            <span className="group-hover:text-[var(--primary)] font-medium transition-colors font-sans tabular-nums">
              {count} {count === 1 ? "respuesta" : "respuestas"} →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
