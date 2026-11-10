// Client: Lista de amigos y buscador en FriendsModal
"use client";

import { Search, MessageSquare, UserCheck } from "lucide-react";
import { AuthAvatar } from "@/components/auth/auth-avatar";
import type { FriendSummary } from "@/lib/social/friendship-schemas";

interface FriendsListContentProps {
  readonly tab: "friends" | "search";
  readonly friends: readonly FriendSummary[];
  readonly searchResults: readonly FriendSummary[];
  readonly searchQuery: string;
  readonly isPending: boolean;
  readonly onSearchChange: (q: string) => void;
  readonly onOpenProfile: (id: string) => void;
  readonly onRemove: (id: string, name: string) => void;
  readonly onSendRequest: (id: string, name: string) => void;
  readonly onStartChat?: (friend: FriendSummary) => void;
}

export function FriendsListContent({
  tab,
  friends,
  searchResults,
  searchQuery,
  isPending,
  onSearchChange,
  onOpenProfile,
  onRemove,
  onSendRequest,
  onStartChat,
}: FriendsListContentProps) {
  if (tab === "friends") {
    if (friends.length === 0) {
      return (
        <div className="py-10 text-center">
          <p className="text-sm font-semibold text-neutral-600">Aún no tienes amigos agregados</p>
          <p className="text-xs text-neutral-400 mt-1">Usa Buscar o pulsa en perfiles en la tertulia.</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {friends.map((f) => (
          <div
            key={f.id}
            className="flex items-center justify-between gap-2 rounded-xl border border-neutral-100 p-2.5 hover:bg-neutral-50/60 transition-colors"
          >
            <button
              type="button"
              onClick={() => onOpenProfile(f.id)}
              className="flex items-center gap-2.5 text-left min-w-0 flex-1 cursor-pointer"
            >
              <AuthAvatar src={f.avatarUrl} alt={f.displayName || f.username} size="sm" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-neutral-900 truncate">{f.displayName || f.username}</p>
                <p className="text-[11px] text-neutral-400">@{f.username}</p>
              </div>
            </button>
            <div className="flex items-center gap-1.5 shrink-0">
              {onStartChat && (
                <button
                  type="button"
                  onClick={() => onStartChat(f)}
                  aria-label={`Enviar mensaje a ${f.displayName || f.username}`}
                  className="inline-flex items-center gap-1 rounded-full bg-[var(--primary)] text-white px-2.5 py-1 text-[11px] font-bold hover:bg-[#b30015] transition-colors cursor-pointer"
                >
                  <MessageSquare className="h-3 w-3" aria-hidden="true" />
                  <span>Hablar</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => onRemove(f.friendshipId, f.displayName || f.username)}
                className="rounded-full border border-neutral-200 px-2 py-1 text-[11px] font-semibold text-neutral-500 hover:border-red-200 hover:text-[var(--primary)] transition-colors cursor-pointer"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
        <input
          type="text"
          placeholder="Buscar por @usuario o nombre..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 py-2 pl-9 pr-3 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-[var(--primary)] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
        />
      </div>
      {isPending && <p className="text-center text-xs text-neutral-400">Buscando...</p>}
      {searchResults.map((userResult) => (
        <div
          key={userResult.id}
          className="flex items-center justify-between rounded-xl border border-neutral-100 p-2.5 hover:bg-neutral-50/60 transition-colors"
        >
          <button
            type="button"
            onClick={() => onOpenProfile(userResult.id)}
            className="flex items-center gap-2.5 text-left min-w-0 flex-1 cursor-pointer"
          >
            <AuthAvatar
              src={userResult.avatarUrl}
              alt={userResult.displayName || userResult.username}
              size="sm"
            />
            <div className="min-w-0">
              <p className="text-xs font-bold text-neutral-900 truncate">
                {userResult.displayName || userResult.username}
              </p>
              <p className="text-[11px] text-neutral-400">@{userResult.username}</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => onSendRequest(userResult.id, userResult.displayName || userResult.username)}
            className="flex items-center gap-1 rounded-full bg-[var(--primary)] px-3 py-1 text-[11px] font-bold text-white shadow-xs hover:opacity-90 cursor-pointer"
          >
            <UserCheck className="h-3 w-3" />
            <span>Conectar</span>
          </button>
        </div>
      ))}
    </div>
  );
}
