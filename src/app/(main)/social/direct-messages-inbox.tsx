// Client: Bandeja de entrada de mensajes directos 1 a 1 entre aficionados amigos
"use client";

import { useEffect, useState, useTransition } from "react";
import { MessageSquare, MessageCirclePlus } from "lucide-react";
import { AuthAvatar } from "@/components/auth/auth-avatar";
import { getDirectConversations } from "@/lib/social/direct-messages-queries";
import { formatRelativeTime } from "@/lib/social/format";
import { decrementOptimisticUnreadChat } from "@/components/layout/use-social-notifications";
import type { DirectConversationSummary } from "@/lib/social/direct-messages-types";

interface DirectMessagesInboxProps {
  readonly onOpenConversation: (
    conversationId: string,
    otherUser: {
      readonly id: string;
      readonly name: string;
      readonly username: string;
      readonly avatarUrl: string | null;
    }
  ) => void;
  readonly onOpenFriends: () => void;
}

export function DirectMessagesInbox({
  onOpenConversation,
  onOpenFriends,
}: DirectMessagesInboxProps) {
  const [conversations, setConversations] = useState<readonly DirectConversationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    startTransition(async () => {
      const data = await getDirectConversations();
      if (!cancelled) {
        setConversations(data);
        setIsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="py-16 text-center text-xs text-neutral-400">
        Cargando conversaciones privadas...
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-[var(--primary)] mb-3">
          <MessageSquare className="h-6 w-6" aria-hidden="true" />
        </div>
        <h3 className="text-base font-bold text-neutral-900">
          Mensajes directos entre amigos
        </h3>
        <button
          type="button"
          onClick={onOpenFriends}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[var(--primary)] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#b30015] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
        >
          <MessageCirclePlus className="h-4 w-4" aria-hidden="true" />
          <span>Elegir un amigo para hablar</span>
        </button>
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label="Lista de conversaciones directas"
      className={`divide-y divide-[var(--border)] ${isPending ? "opacity-60" : "opacity-100"} transition-opacity`}
    >
      {conversations.map((c) => {
        const hasUnread = c.unreadCount > 0;

        return (
          <article
            key={c.id}
            onClick={() => {
              if (hasUnread) {
                setConversations((prev) =>
                  prev.map((item) => (item.id === c.id ? { ...item, unreadCount: 0 } : item))
                );
                decrementOptimisticUnreadChat();
              }
              onOpenConversation(c.id, {
                id: c.otherUserId,
                name: c.otherUserName,
                username: c.otherUserUsername,
                avatarUrl: c.otherUserAvatar,
              });
            }}
            aria-label={`${c.otherUserName}${hasUnread ? `, ${c.unreadCount} mensaje no leído` : ""}`}
            className={`flex cursor-pointer items-center gap-3 px-3 py-3.5 transition-colors duration-150 sm:px-4 ${
              hasUnread
                ? "bg-red-500/[0.03] hover:bg-red-500/[0.06]"
                : "hover:bg-[var(--surface)]/70"
            }`}
          >
            {/* Left Unread Indicator Dot (iOS / Telegram standard) */}
            <span
              className={`h-2 w-2 shrink-0 rounded-full transition-opacity ${
                hasUnread ? "bg-[var(--primary)]" : "opacity-0"
              }`}
              aria-hidden="true"
            />

            <AuthAvatar src={c.otherUserAvatar} alt={c.otherUserName} size="md" />

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`truncate text-sm ${
                    hasUnread ? "font-bold text-neutral-950" : "font-semibold text-neutral-800"
                  }`}
                >
                  {c.otherUserName}
                </span>
                {c.lastMessageCreatedAt && (
                  <time
                    dateTime={c.lastMessageCreatedAt}
                    className={`shrink-0 text-[11px] font-sans tabular-nums ${
                      hasUnread
                        ? "font-bold text-[var(--primary)]"
                        : "text-neutral-400"
                    }`}
                  >
                    {formatRelativeTime(c.lastMessageCreatedAt)}
                  </time>
                )}
              </div>

              <div className="mt-0.5 flex items-center justify-between gap-2">
                <p
                  className={`truncate text-xs ${
                    hasUnread
                      ? "font-medium text-neutral-900"
                      : "text-neutral-500"
                  }`}
                >
                  {c.lastMessageBody ? (
                    <>
                      {c.lastMessageIsMine && (
                        <span className="font-normal text-neutral-400">Tú: </span>
                      )}
                      <span>{c.lastMessageBody}</span>
                    </>
                  ) : (
                    "Sin mensajes aún"
                  )}
                </p>
                {hasUnread && (
                  <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--primary)] px-1 text-[10px] font-bold tabular-nums text-white">
                    {c.unreadCount > 9 ? "9+" : c.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
