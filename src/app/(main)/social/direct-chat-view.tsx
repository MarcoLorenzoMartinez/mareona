// Client: Vista de sala de chat 1 a 1 con auto-scroll y acciones de mensaje
"use client";

import { useState } from "react";
import { DirectChatHeader } from "./direct-chat-header";
import { DirectChatComposer } from "./direct-chat-composer";
import { DirectMessageBubble } from "./direct-message-bubble";
import { useDirectChatMessages } from "./use-direct-chat-messages";

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
  const [body, setBody] = useState("");
  const {
    messages,
    containerRef,
    isInitialLoading,
    isSubmitting,
    deletingId,
    error,
    sendMessage,
    removeMessage,
  } = useDirectChatMessages(conversationId, otherUser);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = body.trim();
    if (!clean || isSubmitting) return;

    const ok = await sendMessage(clean);
    if (ok) setBody("");
  };

  return (
    <div className="flex flex-col h-[520px] max-h-[75vh]">
      <DirectChatHeader otherUser={otherUser} onBack={onBack} onOpenProfile={onOpenProfile} />

      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-[var(--surface)]/30">
        {isInitialLoading ? (
          <div className="py-12 text-center text-xs text-neutral-400">Cargando conversación...</div>
        ) : messages.length === 0 ? (
          <div className="py-12 text-center text-xs text-neutral-400">
            Comienza la conversación con {otherUser.name}. ¡Comenta la actualidad del Sporting!
          </div>
        ) : (
          messages.map((m) => (
            <DirectMessageBubble
              key={m.id}
              message={m}
              isDeleting={deletingId === m.id}
              onDelete={removeMessage}
            />
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
