// Client: Estado optimista del "me gusta" y botón de respuestas
"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { HeartLikeIcon } from "@/components/social/heart-like-icon";

interface PostActionsProps {
  readonly likesCount: number;
  readonly repliesCount: number;
  readonly onOpenThread?: () => void;
}

const ACTION_CLASS =
  "group flex min-h-9 items-center gap-1.5 rounded-full px-2 -ml-2 text-xs transition-colors duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]";

export function PostActions({ likesCount, repliesCount, onOpenThread }: PostActionsProps) {
  const [likes, setLikes] = useState(likesCount);
  const [hasLiked, setHasLiked] = useState(false);

  const toggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLikes((prev) => (hasLiked ? Math.max(0, prev - 1) : prev + 1));
    setHasLiked((prev) => !prev);
  };

  const handleReplies = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenThread?.();
  };

  return (
    <div className="mt-1 flex items-center gap-6 text-neutral-500">
      <button
        type="button"
        onClick={toggleLike}
        aria-pressed={hasLiked}
        aria-label={`Me gusta, ${likes}`}
        className={`${ACTION_CLASS} ${
          hasLiked ? "font-bold text-[var(--primary)]" : "hover:text-[var(--primary)]"
        }`}
      >
        <HeartLikeIcon filled={hasLiked} />
        <span className="font-sans tabular-nums">{likes}</span>
      </button>

      {onOpenThread ? (
        <button
          type="button"
          onClick={handleReplies}
          aria-label={`Ver respuestas, ${repliesCount}`}
          className={`${ACTION_CLASS} hover:text-[var(--primary)]`}
        >
          <MessageSquare className="h-4 w-4" aria-hidden="true" />
          <span className="font-sans tabular-nums">{repliesCount}</span>
        </button>
      ) : (
        <span className="flex min-h-9 items-center gap-1.5 text-xs">
          <MessageSquare className="h-4 w-4" aria-hidden="true" />
          <span className="font-sans tabular-nums">{repliesCount}</span>
        </span>
      )}
    </div>
  );
}
