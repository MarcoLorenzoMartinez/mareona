// Client: Cabecera de autor con acceso al perfil, edición en ventana de 15 min y borrado
"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { formatRelativeTime, canEditPost } from "@/lib/social/format";
import { PostDeleteButton } from "./post-delete-button";

interface PostAuthorLineProps {
  readonly post?: {
    readonly id?: string;
    readonly authorName?: string;
    readonly authorUsername?: string;
    readonly userId?: string;
    readonly authorId?: string;
    readonly createdAt: string;
    readonly isEdited?: boolean;
  };
  readonly authorName?: string;
  readonly authorUsername?: string;
  readonly userId?: string;
  readonly createdAt?: string;
  readonly isEdited?: boolean;
  readonly onOpenProfile?: (userId: string) => void;
  readonly onEdit?: () => void;
  readonly onDelete?: () => void;
}

export function PostAuthorLine({
  post,
  authorName,
  authorUsername,
  userId,
  createdAt,
  isEdited,
  onOpenProfile,
  onEdit,
  onDelete,
}: PostAuthorLineProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  const effectiveAuthorName = post?.authorName ?? authorName ?? "Aficionado";
  const effectiveAuthorUsername = post?.authorUsername ?? authorUsername ?? "aficionado";
  const effectiveUserId = post?.userId ?? post?.authorId ?? userId ?? "";
  const effectiveCreatedAt = post?.createdAt ?? createdAt ?? "";
  const effectiveIsEdited = Boolean(post?.isEdited ?? isEdited);

  const canEdit = Boolean(onEdit && effectiveCreatedAt && canEditPost(effectiveCreatedAt));

  const open = (e: React.MouseEvent) => {
    if (!effectiveUserId || !onOpenProfile) return;
    e.stopPropagation();
    onOpenProfile(effectiveUserId);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.();
  };

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex min-w-0 items-baseline gap-1.5 text-sm">
        <button
          type="button"
          onClick={open}
          className="truncate text-left font-bold text-neutral-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
        >
          {effectiveAuthorName}
        </button>
        <button
          type="button"
          onClick={open}
          className="truncate text-left text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
        >
          @{effectiveAuthorUsername}
        </button>
        <span aria-hidden="true" className="text-neutral-400">·</span>
        <time dateTime={effectiveCreatedAt} className="shrink-0 text-xs text-neutral-500">
          {formatRelativeTime(effectiveCreatedAt)}
        </time>
        {effectiveIsEdited && (
          <>
            <span aria-hidden="true" className="text-neutral-400">·</span>
            <span className="shrink-0 text-xs text-neutral-400">editado</span>
          </>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-0.5">
        {canEdit && !isConfirming && (
          <button
            type="button"
            onClick={handleEdit}
            aria-label="Editar mensaje"
            className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        )}

        {onDelete && (
          <PostDeleteButton
            onConfirm={onDelete}
            onConfirmingChange={setIsConfirming}
          />
        )}
      </div>
    </div>
  );
}
