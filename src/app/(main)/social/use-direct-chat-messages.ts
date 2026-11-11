// Client: Hook reactivo para mensajes directos 1 a 1 y suscripción en tiempo real
"use client";

import { useEffect, useRef, useState } from "react";
import { getDirectMessages } from "@/lib/social/direct-messages-queries";
import {
  sendDirectMessage,
  deleteDirectMessage,
} from "@/lib/social/direct-messages-actions";
import { createClient } from "@/lib/supabase/client";
import { refreshSocialNotifications } from "@/components/layout/use-social-notifications";
import type { DirectMessage } from "@/lib/social/direct-messages-types";

interface ChatParticipant {
  readonly id: string;
  readonly name: string;
  readonly username: string;
  readonly avatarUrl: string | null;
}

export function useDirectChatMessages(
  conversationId: string,
  otherUser: ChatParticipant
) {
  const [messages, setMessages] = useState<readonly DirectMessage[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
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
    return () => {
      cancelled = true;
    };
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
            deleted_at?: string | null;
          };
          if (row.deleted_at) return;

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
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const row = payload.new as { id: string; deleted_at?: string | null };
          if (row.deleted_at) {
            setMessages((prev) => prev.filter((m) => m.id !== row.id));
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [conversationId, otherUser]);

  const sendMessage = async (body: string): Promise<boolean> => {
    setIsSubmitting(true);
    setError(null);
    const res = await sendDirectMessage({ conversationId, body });
    setIsSubmitting(false);

    if (res.success && res.data) {
      setMessages((prev) => [...prev, res.data!]);
      setTimeout(scrollToBottom, 50);
      return true;
    }
    setError(res.error ?? "No se pudo enviar el mensaje");
    return false;
  };

  const removeMessage = async (messageId: string): Promise<void> => {
    if (deletingId) return;
    setDeletingId(messageId);
    setError(null);

    const res = await deleteDirectMessage({ messageId, conversationId });
    setDeletingId(null);

    if (res.success) {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      void refreshSocialNotifications();
    } else {
      setError(res.error ?? "No se pudo eliminar el mensaje");
    }
  };

  return {
    messages,
    containerRef,
    isInitialLoading,
    isSubmitting,
    deletingId,
    error,
    sendMessage,
    removeMessage,
  };
}
