// Client: Modal de gestión de amigos y buscador en tiempo real
"use client";

import { useState, useEffect, useTransition } from "react";
import { Users, X } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { FriendsListContent } from "./friends-list-content";
import { getMyFriendsList, searchAficionados } from "@/lib/social/friends-queries";
import { removeFriendship, sendFriendRequest } from "@/lib/social/friends-actions";
import type { FriendSummary } from "@/lib/social/friendship-schemas";

interface FriendsModalProps {
  readonly onOpenProfile: (userId: string) => void;
  readonly onStartChat?: (friend: FriendSummary) => void;
}

export function FriendsModal({ onOpenProfile, onStartChat }: FriendsModalProps) {
  const { user, openAuthModal } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<"friends" | "search">("friends");
  const [friends, setFriends] = useState<readonly FriendSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<readonly FriendSummary[]>([]);
  const [isPending, startTransition] = useTransition();
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleOpen = () => {
    if (!user) {
      openAuthModal("signin");
      return;
    }
    setIsOpen(true);
    setActionMessage(null);
    startTransition(async () => {
      const list = await getMyFriendsList();
      setFriends(list);
    });
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
      setActionMessage(`Has dejado de conectar con ${name}`);
    }
  };

  const handleSendRequest = async (targetUserId: string, name: string) => {
    const res = await sendFriendRequest({ addresseeId: targetUserId });
    if (res.success) {
      setActionMessage(`Solicitud enviada a ${name}`);
    } else {
      setActionMessage(res.error ?? "No se pudo enviar la solicitud");
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        aria-label="Abrir gestión de amigos"
        className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-neutral-700 shadow-xs hover:border-neutral-300 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] cursor-pointer"
      >
        <Users className="h-3.5 w-3.5 text-neutral-500" />
        <span>Amigos</span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Amigos y comunidad sportinguista"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl border border-neutral-100 flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTab("friends")}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                    tab === "friends"
                      ? "bg-[var(--primary)] text-white font-bold"
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  Mis Amigos ({friends.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTab("search")}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                    tab === "search"
                      ? "bg-[var(--primary)] text-white font-bold"
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  Buscar Aficionados
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 cursor-pointer"
                aria-label="Cerrar ventana"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

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
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
