// Client: Cabecera de autor con acceso al perfil
"use client";

import { formatRelativeTime } from "@/lib/social/format";
import type { SocialPost } from "@/lib/social/types";

interface PostAuthorLineProps {
  readonly post: SocialPost;
  readonly onOpenProfile?: (userId: string) => void;
}

export function PostAuthorLine({ post, onOpenProfile }: PostAuthorLineProps) {
  const open = (e: React.MouseEvent) => {
    if (!post.userId || !onOpenProfile) return;
    e.stopPropagation();
    onOpenProfile(post.userId);
  };

  return (
    <div className="flex min-w-0 items-baseline gap-1.5 text-sm">
      <button
        type="button"
        onClick={open}
        className="truncate text-left font-bold text-neutral-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
      >
        {post.authorName}
      </button>
      <button
        type="button"
        onClick={open}
        className="truncate text-left text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
      >
        @{post.authorUsername}
      </button>
      <span aria-hidden="true" className="text-neutral-400">·</span>
      <time dateTime={post.createdAt} className="shrink-0 text-xs text-neutral-500">
        {formatRelativeTime(post.createdAt)}
      </time>
    </div>
  );
}
