// Client: Encabezado con pestañas y botón de cierre para FriendsModal
"use client";

import { X } from "lucide-react";
import { getDictionary } from "@/i18n";

interface FriendsModalHeaderProps {
  readonly tab: "friends" | "search";
  readonly friendsCount: number;
  readonly onTabChange: (tab: "friends" | "search") => void;
  readonly onClose: () => void;
}

export function FriendsModalHeader({
  tab,
  friendsCount,
  onTabChange,
  onClose,
}: FriendsModalHeaderProps) {
  const dict = getDictionary();
  return (
    <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
      <div
        role="tablist"
        aria-label={dict.social.friends.tabsAria}
        className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface)] p-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "friends"}
          onClick={() => onTabChange("friends")}
          className={`inline-flex min-h-[34px] items-center justify-center gap-1 rounded-full px-3.5 py-1 text-xs transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] cursor-pointer ${
            tab === "friends"
              ? "bg-[var(--primary)] text-white font-bold shadow-2xs"
              : "text-[var(--foreground-muted)] font-semibold hover:text-[var(--foreground)]"
          }`}
        >
          <span>{dict.social.friends.myFriendsTab}</span>
          <span className="tabular-nums opacity-90">({friendsCount})</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "search"}
          onClick={() => onTabChange("search")}
          className={`inline-flex min-h-[34px] items-center justify-center rounded-full px-3.5 py-1 text-xs transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] cursor-pointer ${
            tab === "search"
              ? "bg-[var(--primary)] text-white font-bold shadow-2xs"
              : "text-[var(--foreground-muted)] font-semibold hover:text-[var(--foreground)]"
          }`}
        >
          {dict.social.friends.searchTab}
        </button>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="flex h-9 w-9 min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] cursor-pointer -mr-2"
        aria-label={dict.social.friends.closeAria}
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
