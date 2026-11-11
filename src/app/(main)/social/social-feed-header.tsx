// Client: Barra superior del feed con selector de pestañas, acceso a mensajes privados y amigos
"use client";

import { MessageSquare } from "lucide-react";
import { FeedTabSelector, type SocialFeedTab } from "./feed-tab-selector";
import { FriendsModal } from "./friends-modal";
import type { FriendSummary } from "@/lib/social/friendship-schemas";

interface SocialFeedHeaderProps {
  readonly activeTab: SocialFeedTab;
  readonly onTabChange: (tab: SocialFeedTab) => void;
  readonly onOpenProfile: (id: string) => void;
  readonly onStartChat: (friend: FriendSummary) => void;
  readonly unreadMessagesCount?: number;
  readonly isFriendsOpen?: boolean;
  readonly onFriendsOpenChange?: (open: boolean) => void;
  readonly friendsModalTab?: "friends" | "search";
}

export function SocialFeedHeader({
  activeTab,
  onTabChange,
  onOpenProfile,
  onStartChat,
  unreadMessagesCount = 0,
  isFriendsOpen,
  onFriendsOpenChange,
  friendsModalTab = "friends",
}: SocialFeedHeaderProps) {
  const isMessagesActive = activeTab === "messages";

  return (
    <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] bg-white px-3 sm:px-4 py-2">
      <FeedTabSelector activeTab={activeTab} onTabChange={onTabChange} />

      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <button
          type="button"
          onClick={() => onTabChange("messages")}
          aria-label="Ver mensajes directos"
          aria-pressed={isMessagesActive}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-xs transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${
            isMessagesActive
              ? "bg-[var(--primary)] text-white font-bold"
              : "border border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50"
          }`}
        >
          <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="hidden xs:inline sm:inline">Mensajes</span>
          {unreadMessagesCount > 0 && (
            <span
              className={`inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold tabular-nums ${
                isMessagesActive ? "bg-white text-[var(--primary)]" : "bg-[var(--primary)] text-white"
              }`}
            >
              {unreadMessagesCount}
            </span>
          )}
        </button>

        <FriendsModal
          onOpenProfile={onOpenProfile}
          onStartChat={onStartChat}
          isOpen={isFriendsOpen}
          onOpenChange={onFriendsOpenChange}
          defaultTab={friendsModalTab}
        />
      </div>
    </div>
  );
}
