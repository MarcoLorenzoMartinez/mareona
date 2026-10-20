// Client: Formulario compacto para responder en hilo directo a una publicación
"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { createSocialPost } from "@/lib/social/actions";
import type { SocialPost } from "@/lib/social/types";

interface PostReplyFormProps {
  readonly parentId: string;
  readonly onReplyCreated: (newReply: SocialPost) => void;
  readonly onCancel: () => void;
}

export function PostReplyForm({
  parentId,
  onReplyCreated,
  onCancel,
}: PostReplyFormProps) {
  const { user, profile, openAuthModal } = useAuth();
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal("signin");
      return;
    }

    if (!text.trim()) return;

    setIsSubmitting(true);
    setError(null);

    const res = await createSocialPost({
      body: text.trim(),
      parentId,
    });

    setIsSubmitting(false);
    if (!res.success) {
      setError(res.error ?? "No se pudo enviar la respuesta");
      return;
    }

    if (res.data) {
      // If local mock or server action returns data, inject the current user's profile info
      const replyData: SocialPost = {
        ...res.data,
        authorName: profile?.display_name || profile?.username || "Aficionado",
        authorUsername: profile?.username || "aficionado",
        authorAvatar: profile?.avatar_url || null,
      };
      onReplyCreated(replyData);
      setText("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 pl-8 sm:pl-10 space-y-2">
      <div className="relative">
        <textarea
          rows={2}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe tu respuesta..."
          maxLength={500}
          className="w-full rounded-xl border border-neutral-200 bg-white p-2.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none"
        />
      </div>

      {error && <p className="text-[11px] text-[var(--primary)]">{error}</p>}

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-3 py-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-800"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !text.trim()}
          className="rounded-lg bg-[var(--primary)] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition-opacity hover:opacity-95 disabled:opacity-50"
        >
          {isSubmitting ? "Enviando..." : "Responder"}
        </button>
      </div>
    </form>
  );
}
