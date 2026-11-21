// Client: Burbuja individual de mensaje privado con opción accesible de borrado propio
"use client";

import { Trash2 } from "lucide-react";
import type { DirectMessage } from "@/lib/social/direct-messages-types";
import { getDictionary } from "@/i18n";

interface DirectMessageBubbleProps {
  readonly message: DirectMessage;
  readonly isDeleting: boolean;
  readonly onDelete: (messageId: string) => void;
}

export function DirectMessageBubble({
  message,
  isDeleting,
  onDelete,
}: DirectMessageBubbleProps) {
  const dict = getDictionary();
  return (
    <div
      className={`group flex flex-col ${
        message.isMine ? "items-end" : "items-start"
      }`}
    >
      <div className="flex items-center gap-1.5 max-w-[85%]">
        {message.isMine && (
          <button
            type="button"
            onClick={() => onDelete(message.id)}
            disabled={isDeleting}
            aria-label={dict.social.messages.deleteMessageAria}
            title={dict.social.messages.deleteMessageTitle}
            className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity duration-150 p-1.5 rounded-full text-neutral-600 hover:text-[var(--primary)] hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        )}

        <div
          className={`px-3.5 py-2 text-sm leading-relaxed rounded-2xl ${
            message.isMine
              ? "bg-[var(--primary)] text-white rounded-br-xs shadow-2xs"
              : "bg-white text-neutral-900 border border-[var(--border)] rounded-bl-xs shadow-2xs"
          }`}
        >
          <p className="whitespace-pre-line break-words">{message.body}</p>
          <time
            dateTime={message.createdAt}
            className={`mt-1 block text-[10px] font-sans tabular-nums text-right ${
              message.isMine ? "text-white/95" : "text-neutral-600"
            }`}
          >
            {new Date(message.createdAt).toLocaleTimeString("es-ES", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </time>
        </div>
      </div>
    </div>
  );
}
