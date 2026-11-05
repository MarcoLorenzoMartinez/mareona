// Client: Modal de redacción para dispositivos móviles con diseño accesible y área cómoda
"use client";

import { useEffect, useRef, useState } from "react";
import { X, Feather } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { AuthAvatar } from "@/components/auth/auth-avatar";
import { createSocialPost } from "@/lib/social/actions";
import type { SocialPost } from "@/lib/social/types";

const MAX_LENGTH = 500;
const COUNTER_THRESHOLD = 400;

interface MobilePostComposerModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onPosted: (post: SocialPost) => void;
}

export function MobilePostComposerModal({
  isOpen,
  onClose,
  onPosted,
}: MobilePostComposerModalProps) {
  const { profile } = useAuth();
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const displayName = profile?.display_name || profile?.username || "Aficionado";
  const remaining = MAX_LENGTH - body.length;
  const canSubmit = body.trim().length > 0 && !isSubmitting;

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setError(null);
    const res = await createSocialPost({
      body: body.trim(),
    });
    setIsSubmitting(false);

    if (!res.success || !res.data) {
      setError(res.error ?? "No se pudo publicar el mensaje");
      return;
    }

    onPosted({
      ...res.data,
      authorName: displayName,
      authorUsername: profile?.username || "aficionado",
      authorAvatar: profile?.avatar_url || null,
    });
    setBody("");
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Nueva publicación"
      className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs sm:hidden animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-3xl bg-white p-5 shadow-2xl border-t border-neutral-100 flex flex-col max-h-[90dvh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2.5">
            <AuthAvatar src={profile?.avatar_url} alt="" size="sm" />
            <span className="text-xs font-bold text-neutral-900">{displayName}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana"
            className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-3 flex flex-col flex-1 min-h-0">
          <textarea
            ref={textareaRef}
            autoFocus
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="¿Qué opinas hoy sobre el Sporting?"
            maxLength={MAX_LENGTH}
            className="w-full resize-none bg-transparent py-2 text-base text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
          />

          {error && (
            <p role="alert" className="text-xs font-semibold text-[var(--primary)] mt-1">
              {error}
            </p>
          )}

          <div className="mt-4 flex items-center justify-between pt-3 border-t border-[var(--border)]">
            <div className="flex-1" />

            <div className="flex items-center gap-3">
              {body.length >= COUNTER_THRESHOLD && (
                <span className={`font-sans text-xs tabular-nums ${remaining < 20 ? "font-bold text-[var(--primary)]" : "text-neutral-500"}`}>
                  {remaining}
                </span>
              )}
              <button
                type="submit"
                disabled={!canSubmit}
                className="rounded-full bg-[var(--primary)] px-5 py-2 text-xs font-bold text-white shadow-xs transition-opacity hover:opacity-95 disabled:opacity-50"
              >
                {isSubmitting ? "Publicando…" : "Publicar"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export function MobilePostComposerFab({ onClick }: { readonly onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Escribir publicación en la tertulia"
      className="fixed bottom-20 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-xl transition-transform duration-150 active:scale-95 sm:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--primary)]"
    >
      <Feather className="h-6 w-6" aria-hidden="true" strokeWidth={2.2} />
    </button>
  );
}
