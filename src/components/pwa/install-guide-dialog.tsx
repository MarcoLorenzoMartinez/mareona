// Client: Diálogo modal con foco gestionado y cierre por teclado
"use client";

import { useEffect, useRef } from "react";
import { InstallSteps } from "./install-steps";
import type { InstallPlatform } from "@/lib/pwa/install-platform";
import { getDictionary } from "@/i18n";

interface InstallGuideDialogProps {
  readonly isOpen: boolean;
  readonly platform: InstallPlatform;
  readonly onClose: () => void;
}

/**
 * Manual installation guide for browsers that cannot show a native prompt.
 * Moves focus into the dialog on open and restores it to the trigger on close.
 */
export function InstallGuideDialog({ isOpen, platform, onClose }: InstallGuideDialogProps) {
  const dict = getDictionary();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const trigger = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      trigger?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="install-guide-title"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-sm space-y-5 rounded-2xl border border-[var(--border)] bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
      >
        <h2 id="install-guide-title" className="text-lg font-bold tracking-tight text-[var(--foreground)]">
          {dict.pwa.installGuide.title}
        </h2>
        <InstallSteps platform={platform} />
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          className="min-h-11 w-full rounded-full bg-[var(--primary)] px-4 text-sm font-bold text-white transition-transform duration-100 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
        >
          {dict.pwa.installGuide.confirmButton}
        </button>
      </div>
    </div>
  );
}
