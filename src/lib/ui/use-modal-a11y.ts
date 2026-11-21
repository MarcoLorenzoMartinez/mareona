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

    const previousFocused =
      typeof document !== "undefined" ? (document.activeElement as HTMLElement | null) : null;

    const getFocusableInActiveDialog = (): HTMLElement[] => {
      if (typeof document === "undefined") return [];
      const dialogs = document.querySelectorAll<HTMLElement>('[role="dialog"][aria-modal="true"]');
      const activeDialog = dialogs[dialogs.length - 1];
      if (!activeDialog) return [];
      return Array.from(
        activeDialog.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => el.offsetParent !== null || el.getClientRects().length > 0);
    };

    const focusInitialTimer = window.setTimeout(() => {
      const focusables = getFocusableInActiveDialog();
      const activeDialog = document.querySelector<HTMLElement>('[role="dialog"][aria-modal="true"]');
      if (activeDialog && !activeDialog.contains(document.activeElement)) {
        (focusables[0] ?? activeDialog).focus?.();
      }
    }, 0);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && closeOnEscape) {
        if (onEscape) {
          onEscape();
        } else {
          onClose();
        }
        return;
      }

      if (e.key === "Tab") {
        const focusables = getFocusableInActiveDialog();
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    if (lockScroll) {
      lockBodyScroll();
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusInitialTimer);
      window.removeEventListener("keydown", handleKeyDown);
      if (lockScroll) {
        unlockBodyScroll();
      }
      if (previousFocused && typeof previousFocused.focus === "function" && previousFocused.isConnected) {
        previousFocused.focus();
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
