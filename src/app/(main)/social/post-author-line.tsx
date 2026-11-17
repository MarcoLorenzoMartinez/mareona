// Client: Cabecera de autor con acceso al perfil y borrado de publicación
"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { formatRelativeTime } from "@/lib/social/format";
import type { SocialPost } from "@/lib/social/types";

interface PostAuthorLineProps {
  readonly post: SocialPost;
  readonly onOpenProfile?: (userId: string) => void;
  readonly onDelete?: () => void;
}

export function PostAuthorLine({
  post,
  onOpenProfile,
  onDelete,
}: PostAuthorLineProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  const open = (e: React.MouseEvent) => {
    if (!post.userId || !onOpenProfile) return;
    e.stopPropagation();
    onOpenProfile(post.userId);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.();
  };

  const handleToggleConfirm = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsConfirming((prev) => !prev);
  };

  return (
    <div className="flex items-center justify-between gap-2">
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

      {onDelete && (
        <div className="shrink-0">
          {isConfirming ? (
            <div className="flex items-center gap-1 animate-in fade-in duration-100">
              <span className="text-[11px] font-semibold text-red-600">¿Borrar?</span>
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-full bg-[#e2001a] px-2 py-0.5 text-[11px] font-bold text-white hover:bg-red-700 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e2001a]"
              >
                Sí
              </button>
              <button
                type="button"
                onClick={handleToggleConfirm}
                className="rounded-full px-2 py-0.5 text-[11px] font-semibold text-neutral-500 hover:bg-neutral-100 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
              >
                No
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleToggleConfirm}
              aria-label="Borrar publicación"
              className="-mr-1 flex h-7 w-7 items-center justify-center rounded-full text-neutral-400 hover:bg-red-50 hover:text-[#e2001a] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e2001a]"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
