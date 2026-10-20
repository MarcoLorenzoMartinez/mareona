// Client: Botón flotante y modal para redactar publicaciones sin sobrecargar la vista
"use client";

import { useState, useEffect } from "react";
import { NotebookPen } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { AuthAvatar } from "@/components/auth/auth-avatar";
import { createSocialPost } from "@/lib/social/actions";
import type { SocialPost } from "@/lib/social/types";

interface PostComposerProps {
  readonly onPostCreated: (post: SocialPost) => void;
}

export function PostComposer({ onPostCreated }: PostComposerProps) {
  const { user, profile, openAuthModal } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayName = profile?.display_name || profile?.username || "Aficionado";
  const maxLength = 500;
  const remainingChars = maxLength - body.length;

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
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;

    setIsSubmitting(true);
    setError(null);

    const res = await createSocialPost({ body: body.trim() });
    setIsSubmitting(false);

    if (!res.success) {
      setError(res.error ?? "No se pudo publicar el mensaje");
      return;
    }

    if (res.data) {
      const newPost: SocialPost = {
        ...res.data,
        authorName: displayName,
        authorUsername: profile?.username || "aficionado",
        authorAvatar: profile?.avatar_url || null,
      };
      onPostCreated(newPost);
      setBody("");
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Botón flotante en la parte inferior */}
      <button
        type="button"
        onClick={handleOpen}
        aria-label="Escribir publicación en la tertulia"
        className="fixed bottom-20 right-5 md:bottom-8 md:right-8 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-xl transition-transform duration-150 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--primary)]"
      >
        <NotebookPen className="h-6 w-6" aria-hidden="true" strokeWidth={2.2} />
      </button>

      {/* Modal accesible para redactar */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Nueva publicación"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-neutral-100 transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2.5">
                <AuthAvatar src={profile?.avatar_url} alt={displayName} size="sm" />
                <span className="text-xs font-bold text-neutral-900">{displayName}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                aria-label="Cerrar ventana"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <textarea
                autoFocus
                rows={4}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="¿Qué opinas hoy sobre el Sporting? Comparte con la afición..."
                maxLength={maxLength}
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 p-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-[var(--primary)] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none transition-colors"
              />

              {error && <p className="text-xs text-[var(--primary)]">{error}</p>}

              <div className="flex items-center justify-between pt-2">
                <span
                  className={`text-xs font-sans tabular-nums ${
                    remainingChars < 40 ? "font-bold text-[var(--primary)]" : "text-neutral-400"
                  }`}
                >
                  {remainingChars} car.
                </span>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="rounded-lg px-4 py-2 text-xs font-semibold text-neutral-500 hover:text-neutral-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !body.trim()}
                    className="rounded-lg bg-[var(--primary)] px-5 py-2 text-xs font-bold text-white shadow-xs transition-opacity hover:opacity-95 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                  >
                    {isSubmitting ? "Publicando..." : "Publicar"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
