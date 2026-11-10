// Client: Barra inferior de redacción y envío para chat privado directo
"use client";

import { Send } from "lucide-react";

interface DirectChatComposerProps {
  readonly body: string;
  readonly onChangeBody: (val: string) => void;
  readonly onSend: (e: React.FormEvent) => void;
  readonly isSubmitting: boolean;
  readonly error: string | null;
  readonly otherUserName: string;
}

export function DirectChatComposer({
  body,
  onChangeBody,
  onSend,
  isSubmitting,
  error,
  otherUserName,
}: DirectChatComposerProps) {
  return (
    <form onSubmit={onSend} className="border-t border-[var(--border)] bg-white p-3">
      {error && (
        <p role="alert" className="mb-2 text-xs font-semibold text-[var(--primary)]">
          {error}
        </p>
      )}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={body}
          onChange={(e) => onChangeBody(e.target.value)}
          placeholder={`Escribe un mensaje a ${otherUserName}...`}
          maxLength={2000}
          className="flex-1 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-[var(--primary)] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[var(--primary)] transition-all"
        />
        <button
          type="submit"
          disabled={!body.trim() || isSubmitting}
          aria-label="Enviar mensaje directo"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-xs hover:bg-[#b30015] disabled:opacity-40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}
