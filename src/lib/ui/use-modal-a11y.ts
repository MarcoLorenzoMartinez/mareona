// Client: Hook de accesibilidad WCAG 2.2 AA para modales y diálogos interactivos
"use client";

import { useEffect, useCallback } from "react";

export interface ModalA11yOptions {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onEscape?: () => void;
  readonly closeOnEscape?: boolean;
  readonly lockScroll?: boolean;
}

/**
 * Custom hook providing robust WCAG 2.2 AA compliant modal behavior:
 * - Listens for Escape key to safely close or trigger custom escape actions.
 * - Prevents background scrolling by managing document.body overflow cleanly.
 * - Provides intentional backdrop click handler (ignores child event propagation).
 */
export function useModalA11y({
  isOpen,
  onClose,
  onEscape,
  closeOnEscape = true,
  lockScroll = true,
}: ModalA11yOptions) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && closeOnEscape) {
        if (onEscape) {
          onEscape();
        } else {
          onClose();
        }
      }
    };

    let originalOverflow = "";
    if (lockScroll && typeof document !== "undefined") {
      originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (lockScroll && typeof document !== "undefined") {
        document.body.style.overflow = originalOverflow;
      }
    };
  }, [isOpen, onClose, onEscape, closeOnEscape, lockScroll]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  return {
    handleBackdropClick,
  };
}
