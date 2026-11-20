// Client: Botón de borrado de publicación con confirmación inline accesible
"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

interface PostDeleteButtonProps {
  readonly onConfirm: () => void;
  readonly onConfirmingChange?: (confirming: boolean) => void;
}

export function PostDeleteButton({
  onConfirm,
  onConfirmingChange,
}: PostDeleteButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  const setConfirming = (next: boolean) => {
    setIsConfirming(next);
    onConfirmingChange?.(next);
  };

  const handleToggleConfirm = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirming(!isConfirming);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirming(false);
    onConfirm();
  };

  if (isConfirming) {
    return (
      <div className="flex items-center gap-1 animate-in fade-in duration-100">
        <span className="text-[11px] font-semibold text-red-600">¿Borrar?</span>
        <button
          type="button"
          onClick={handleDelete}
          className="rounded-full bg-[var(--primary)] px-2 py-0.5 text-[11px] font-bold text-white hover:bg-red-700 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
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
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggleConfirm}
      aria-label="Borrar publicación"
      className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-red-50 hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
    >
      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
    </button>
  );
}
