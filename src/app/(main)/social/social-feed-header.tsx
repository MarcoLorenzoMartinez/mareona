// Client: Barra superior del feed con selector de pestañas y acceso a amigos
"use client";

import { FeedTabSelector, type SocialFeedTab } from "./feed-tab-selector";
import { FriendsModal } from "./friends-modal";
import type { FriendSummary } from "@/lib/social/friendship-schemas";

interface SocialFeedHeaderProps {
  readonly activeTab: SocialFeedTab;
  readonly onTabChange: (tab: SocialFeedTab) => void;
  readonly onOpenProfile: (id: string) => void;
  readonly onStartChat: (friend: FriendSummary) => void;
}

export function SocialFeedHeader({
  activeTab,
  onTabChange,
  onOpenProfile,
  onStartChat,
}: SocialFeedHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] bg-white px-4 py-2">
      <FeedTabSelector activeTab={activeTab} onTabChange={onTabChange} />
      <FriendsModal onOpenProfile={onOpenProfile} onStartChat={onStartChat} />
    </div>
  );
}
