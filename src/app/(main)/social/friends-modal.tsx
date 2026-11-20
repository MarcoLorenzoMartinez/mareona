// Client: Modal de gestión de amigos y buscador en tiempo real
"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import { Users } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { FriendsModalHeader } from "./friends-modal-header";
import { FriendsListContent } from "./friends-list-content";
import { getMyFriendsList, searchAficionados } from "@/lib/social/friends-queries";
import { removeFriendship, sendFriendRequest } from "@/lib/social/friends-actions";
import type { FriendSummary } from "@/lib/social/friendship-schemas";
import { getDictionary } from "@/i18n";

interface FriendsModalProps {
  readonly onOpenProfile: (userId: string) => void;
  readonly onStartChat?: (friend: FriendSummary) => void;
  readonly isOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly defaultTab?: "friends" | "search";
}

export function FriendsModal({
  onOpenProfile,
  onStartChat,
  isOpen: controlledIsOpen,
  onOpenChange,
  defaultTab = "friends",
}: FriendsModalProps) {
  const dict = getDictionary();
  const { user, openAuthModal } = useAuth();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const setIsOpen = useCallback(
    (open: boolean) => {
      setInternalIsOpen(open);
      onOpenChange?.(open);
    },
    [onOpenChange]
  );

  const [tab, setTab] = useState<"friends" | "search">(defaultTab);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [friends, setFriends] = useState<readonly FriendSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<readonly FriendSummary[]>([]);
  const [isPending, startTransition] = useTransition();
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  if (isOpen && !prevIsOpen) {
    setPrevIsOpen(true);
    setTab(defaultTab);
    setActionMessage(null);
  } else if (!isOpen && prevIsOpen) {
    setPrevIsOpen(false);
  }

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    getMyFriendsList().then((list) => {
      if (!cancelled) setFriends(list);
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      cancelled = true;
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, setIsOpen]);

  const handleOpen = () => {
    if (!user) {
      openAuthModal("signin");
      return;
    }
    setIsOpen(true);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    startTransition(async () => {
      const results = await searchAficionados(query);
      setSearchResults(results);
    });
  };

  const handleRemove = async (friendshipId: string, name: string) => {
    const res = await removeFriendship(friendshipId);
    if (res.success) {
      setFriends((prev) => prev.filter((f) => f.friendshipId !== friendshipId));
      setActionMessage(`${dict.social.friends.removedMessagePrefix} ${name}`);
    }
  };

  const handleSendRequest = async (targetUserId: string, name: string) => {
    const res = await sendFriendRequest({ addresseeId: targetUserId });
    if (res.success) {
      setActionMessage(`${dict.social.friends.requestSentPrefix} ${name}`);
    } else {
      setActionMessage(res.error ?? dict.social.friends.requestErrorFallback);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        aria-label={dict.social.friends.buttonAria}
        className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-neutral-700 shadow-xs hover:border-neutral-300 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] cursor-pointer"
      >
        <Users className="h-3.5 w-3.5 text-neutral-500" />
        <span>{dict.social.friends.buttonLabel}</span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={dict.social.friends.dialogAria}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl border border-neutral-100 flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <FriendsModalHeader
              tab={tab}
              friendsCount={friends.length}
              onTabChange={setTab}
              onClose={() => setIsOpen(false)}
            />

            {actionMessage && (
              <p className="mt-2 text-center text-xs font-medium text-[var(--primary)]">
                {actionMessage}
              </p>
            )}

            <div className="mt-3 flex-1 overflow-y-auto pr-1">
              <FriendsListContent
                tab={tab}
                friends={friends}
                searchResults={searchResults}
                searchQuery={searchQuery}
                isPending={isPending}
                onSearchChange={handleSearch}
                onOpenProfile={(id) => {
                  setIsOpen(false);
                  onOpenProfile(id);
                }}
                onRemove={handleRemove}
                onSendRequest={handleSendRequest}
                onStartChat={(f) => {
                  setIsOpen(false);
                  onStartChat?.(f);
                }}
                onSwitchToSearch={() => setTab("search")}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
