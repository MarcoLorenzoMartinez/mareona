// Client: Hook reactivo para consultar y sincronizar notificaciones sociales en tiempo real
"use client";

import { useSyncExternalStore, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { createClient } from "@/lib/supabase/client";
import {
  getSocialNotificationCounts,
  type SocialNotificationCounts,
} from "@/lib/social/notifications-queries";

const INITIAL_COUNTS: SocialNotificationCounts = {
  unreadMessagesCount: 0,
  pendingFriendRequestsCount: 0,
  totalUnread: 0,
};

let currentCounts: SocialNotificationCounts = INITIAL_COUNTS;
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) {
    listener();
  }
}

/**
 * Optimistically decrements the unread conversations count with 0ms latency.
 */
export function decrementOptimisticUnreadChat(): void {
  currentCounts = {
    ...currentCounts,
    unreadMessagesCount: Math.max(0, currentCounts.unreadMessagesCount - 1),
    totalUnread: Math.max(0, currentCounts.totalUnread - 1),
  };
  notify();
}

/**
 * Refreshes authoritative notification counts from the server.
 */
export async function refreshSocialNotifications(): Promise<void> {
  try {
    const data = await getSocialNotificationCounts();
    currentCounts = data;
    notify();
  } catch {
    // Fallback silently if offline or transient network failure occurs
  }
}

export function subscribeToSocialNotifications(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot(): SocialNotificationCounts {
  return currentCounts;
}

function getServerSnapshot(): SocialNotificationCounts {
  return INITIAL_COUNTS;
}

export function useSocialNotifications(): SocialNotificationCounts {
  const { user } = useAuth();
  const counts = useSyncExternalStore(
    subscribeToSocialNotifications,
    getSnapshot,
    getServerSnapshot
  );

  useEffect(() => {
    if (!user) {
      currentCounts = INITIAL_COUNTS;
      notify();
      return;
    }

    void refreshSocialNotifications();

    // Supabase realtime channel for live updates across browser instances
    const supabase = createClient();
    const instanceId = Math.random().toString(36).slice(2, 9);
    const channelName = `social-notifications-${user.id}-${instanceId}`;

    let channel: ReturnType<typeof supabase.channel> | null = null;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    const scheduleRefresh = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        void refreshSocialNotifications();
      }, 400);
    };

    try {
      channel = supabase
        .channel(channelName)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "messages" },
          scheduleRefresh
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "friendships" },
          scheduleRefresh
        )
        .subscribe();
    } catch (err) {
      console.warn("Realtime notification subscription error:", err);
    }

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      if (channel) {
        void supabase.removeChannel(channel);
      }
    };
  }, [user]);

  return user ? counts : INITIAL_COUNTS;
}
