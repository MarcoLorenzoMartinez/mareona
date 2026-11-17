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

let modalLockCount = 0;

function lockBodyScroll() {
  if (typeof document === "undefined") return;
  modalLockCount++;
  if (modalLockCount === 1) {
    document.body.style.overflow = "hidden";
  }
}

function unlockBodyScroll() {
  if (typeof document === "undefined") return;
  modalLockCount = Math.max(0, modalLockCount - 1);
  if (modalLockCount === 0) {
    document.body.style.overflow = "";
  }
}

/**
 * Custom hook providing robust WCAG 2.2 AA compliant modal behavior:
 * - Listens for Escape key to safely close or trigger custom escape actions.
 * - Prevents background scrolling with reference-counted body overflow lock.
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

    if (lockScroll) {
      lockBodyScroll();
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (lockScroll) {
        unlockBodyScroll();
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
