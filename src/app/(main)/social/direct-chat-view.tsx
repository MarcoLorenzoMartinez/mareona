// Client: Vista de sala de chat 1 a 1 con suscripción en tiempo real y auto-scroll
"use client";

import { useEffect, useRef, useState } from "react";
import { DirectChatHeader } from "./direct-chat-header";
import { DirectChatComposer } from "./direct-chat-composer";
import { getDirectMessages } from "@/lib/social/direct-messages-queries";
import { sendDirectMessage } from "@/lib/social/direct-messages-actions";
import { createClient } from "@/lib/supabase/client";
import { TEST_CONVERSATION_ID, TEST_FRIEND_ID } from "@/lib/social/test-friend-chat";
import { refreshSocialNotifications } from "@/components/layout/use-social-notifications";
import type { DirectMessage } from "@/lib/social/direct-messages-types";

interface DirectChatViewProps {
  readonly conversationId: string;
  readonly otherUser: {
    readonly id: string;
    readonly name: string;
    readonly username: string;
    readonly avatarUrl: string | null;
  };
  readonly onBack: () => void;
  readonly onOpenProfile: (userId: string) => void;
}

export function DirectChatView({
  conversationId,
  otherUser,
  onBack,
  onOpenProfile,
}: DirectChatViewProps) {
  const [messages, setMessages] = useState<readonly DirectMessage[]>([]);
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    const el = containerRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior });
  };

  useEffect(() => {
    let cancelled = false;
    getDirectMessages(conversationId).then((data) => {
      if (cancelled) return;
      setMessages(data);
      setIsInitialLoading(false);
      setTimeout(() => scrollToBottom("auto"), 20);
      void refreshSocialNotifications();
    });
    return () => { cancelled = true; };
  }, [conversationId]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`direct-chat-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const row = payload.new as {
            id: string;
            conversation_id: string;
            sender_id: string;
            body: string;
            created_at: string;
          };

          setMessages((prev) => {
            if (prev.some((m) => m.id === row.id)) return prev;
            return [
              ...prev,
              {
                id: row.id,
                conversationId: row.conversation_id,
                senderId: row.sender_id,
                senderName: otherUser.name,
                senderUsername: otherUser.username,
                senderAvatar: otherUser.avatarUrl,
                body: row.body,
                createdAt: row.created_at,
                isMine: row.sender_id !== otherUser.id,
              },
            ];
          });
          setTimeout(scrollToBottom, 50);
        }
      )
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, [conversationId, otherUser]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = body.trim();
    if (!clean || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    const res = await sendDirectMessage({ conversationId, body: clean });
    setIsSubmitting(false);

    if (res.success && res.data) {
      setMessages((prev) => [...prev, res.data!]);
      setBody("");
      setTimeout(scrollToBottom, 50);
      if (otherUser.id === TEST_FRIEND_ID || conversationId === TEST_CONVERSATION_ID) {
        setTimeout(async () => {
          const updated = await getDirectMessages(conversationId);
          setMessages(updated);
          setTimeout(scrollToBottom, 50);
        }, 800);
      }
    } else {
      setError(res.error ?? "No se pudo enviar el mensaje");
    }
  };

  return (
    <div className="flex flex-col h-[520px] max-h-[75vh]">
      <DirectChatHeader otherUser={otherUser} onBack={onBack} onOpenProfile={onOpenProfile} />

      {/* Historial */}
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-[var(--surface)]/30">
        {isInitialLoading ? (
          <div className="py-12 text-center text-xs text-neutral-400">Cargando conversación...</div>
        ) : messages.length === 0 ? (
          <div className="py-12 text-center text-xs text-neutral-400">
            Comienza la conversación con {otherUser.name}. ¡Comenta la actualidad del Sporting!
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.isMine ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[82%] px-3.5 py-2 text-sm leading-relaxed rounded-2xl ${
                  m.isMine
                    ? "bg-[var(--primary)] text-white rounded-br-xs shadow-2xs"
                    : "bg-white text-neutral-900 border border-[var(--border)] rounded-bl-xs shadow-2xs"
                }`}
              >
                <p className="whitespace-pre-line break-words">{m.body}</p>
                <time
                  dateTime={m.createdAt}
                  className={`mt-1 block text-[10px] font-sans tabular-nums text-right ${
                    m.isMine ? "text-white/80" : "text-neutral-400"
                  }`}
                >
                  {new Date(m.createdAt).toLocaleTimeString("es-ES", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
              </div>
            </div>
          ))
        )}
      </div>

      <DirectChatComposer
        body={body}
        onChangeBody={setBody}
        onSend={handleSend}
        isSubmitting={isSubmitting}
        error={error}
        otherUserName={otherUser.name}
      />
    </div>
  );
}
