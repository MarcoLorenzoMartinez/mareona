"use client"; // Client: Gestión de estados interactivos y feedback al moderar publicaciones

import { useTransition } from "react";
import { approveFlaggedPost, softDeletePost } from "@/lib/admin/moderation-actions";
import { toast } from "@/lib/ui/toast";

interface ModerationActionButtonsProps {
  readonly postId: string;
}

/**
 * Interactive button group for approving or deleting a flagged community post.
 * Features inline feedback, accessible ARIA states, and minimum 44px tap targets.
 */
export function ModerationActionButtons({ postId }: ModerationActionButtonsProps) {
  const [isPending, startTransition] = useTransition();

  function handleApprove() {
    startTransition(async () => {
      const res = await approveFlaggedPost(postId);
      if (res.success) {
        toast.success("Publicación aprobada y visible en la tertulia");
      } else {
        toast.error("Error al aprobar publicación", { description: res.error });
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const res = await softDeletePost(postId, "Retirado por moderador administrativo");
      if (res.success) {
        toast.success("Publicación retirada correctamente");
      } else {
        toast.error("Error al retirar publicación", { description: res.error });
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2 pt-2">
      <button
        type="button"
        disabled={isPending}
        onClick={handleApprove}
        aria-label="Aprobar publicación y confirmar que cumple las normas"
        className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[var(--border)] bg-white px-4 py-2 text-xs font-semibold text-[var(--foreground)] transition-colors hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-50"
      >
        {isPending ? "Procesando..." : "✓ Aprobar mensaje"}
      </button>

      <button
        type="button"
        disabled={isPending}
        onClick={handleDelete}
        aria-label="Eliminar publicación por incumplimiento de normas"
        className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[var(--brand,#e2001a)] px-4 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 disabled:opacity-50"
      >
        {isPending ? "Procesando..." : "✕ Retirar publicación"}
      </button>
    </div>
  );
}
