// Client: Acciones de publicación con me gusta, respuestas y compartir enlace
"use client";

import { useState } from "react";
import { MessageSquare, Share2, Check } from "lucide-react";
import { HeartLikeIcon } from "@/components/social/heart-like-icon";

interface PostActionsProps {
  readonly likesCount: number;
  readonly repliesCount: number;
  readonly onOpenThread?: () => void;
  readonly postId?: string;
  readonly postBody?: string;
}

const ACTION_CLASS =
  "group flex min-h-9 items-center gap-1.5 rounded-full px-2 -ml-2 text-xs transition-colors duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]";

export function PostActions({
  likesCount,
  repliesCount,
  onOpenThread,
  postId,
  postBody,
}: PostActionsProps) {
  const [likes, setLikes] = useState(likesCount);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  const toggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLikes((prev) => (hasLiked ? Math.max(0, prev - 1) : prev + 1));
    setHasLiked((prev) => !prev);
  };

  const handleReplies = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenThread?.();
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!postId || typeof window === "undefined") return;
    const url = `${window.location.origin}/social?post=${postId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Mareona - Tertulia Sportinguista",
          text: postBody ? `${postBody.slice(0, 100)}…` : "Publicación en Mareona",
          url,
        });
        return;
      } catch {}
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    }
  };

  return (
    <div className="mt-1 flex items-center justify-between text-neutral-500 pr-2">
      <div className="flex items-center gap-6">
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

        {postId && (
          <button
            type="button"
            onClick={handleShare}
            aria-label="Compartir publicación"
            className={`${ACTION_CLASS} hover:text-[var(--primary)]`}
          >
            {hasCopied ? (
              <>
                <Check className="h-4 w-4 text-green-600" aria-hidden="true" />
                <span className="text-[11px] font-semibold text-green-700">Copiado</span>
              </>
            ) : (
              <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
