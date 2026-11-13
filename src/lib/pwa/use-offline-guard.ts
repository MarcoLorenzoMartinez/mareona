// Client: Combina el estado de red del navegador con avisos de feedback inmediato
"use client";

import type { MouseEvent } from "react";
import { useOnlineStatus } from "./use-online-status";
import { getOfflineBlockCopy, type OfflineBlockCopy } from "./offline-routes";
import { toast } from "@/lib/ui/toast";

/** Repeated taps on a blocked target must not stack identical toasts. */
const TOAST_COOLDOWN_MS = 2500;
let lastToastAt = 0;

function notify(copy: OfflineBlockCopy): void {
  const now = Date.now();
  if (now - lastToastAt < TOAST_COOLDOWN_MS) return;
  lastToastAt = now;
  toast.info(copy.title, { description: copy.description });
}

/**
 * Offline guard for navigation targets and network-bound actions.
 * Blocked targets stay focusable and tappable so every user, on any device,
 * gets an explanation instead of a dead control or a failed navigation.
 *
 * @returns `isBlocked` to style a link, `guardNavigation` for its click handler
 * and `guardAction` for buttons that need the network.
 */
export function useOfflineGuard() {
  const isOnline = useOnlineStatus();

  const isBlocked = (href: string): boolean => !isOnline && getOfflineBlockCopy(href) !== null;

  const guardNavigation = (event: MouseEvent<HTMLElement>, href: string): void => {
    if (isOnline) return;
    const copy = getOfflineBlockCopy(href);
    if (!copy) return;
    event.preventDefault();
    notify(copy);
  };

  /**
   * @returns `true` when the action may proceed; `false` after showing the notice.
   */
  const guardAction = (description: string): boolean => {
    if (isOnline) return true;
    notify({ title: "Sin conexión", description });
    return false;
  };

  return { isOnline, isBlocked, guardNavigation, guardAction };
}
