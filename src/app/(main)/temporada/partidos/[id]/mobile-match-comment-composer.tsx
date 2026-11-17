// Client: Modal de comentario de partido para móvil con soporte para Mi Once
"use client";

import { useEffect, useRef, useState } from "react";
import { X, Shield, Send } from "lucide-react";
import { toast } from "@/lib/ui/toast";
import { useAuth } from "@/context/auth-context";
import { AuthAvatar } from "@/components/auth/auth-avatar";
import { LineupAttachmentChip } from "@/components/lineup-builder/lineup-attachment-chip";
import {
  encodeSharedLineup,
  loadLocalSharedLineup,
  type SharedLineupData,
} from "@/lib/lineup-builder/shared-lineup-codec";
import { createMatchComment } from "@/lib/match-community/actions";
import type { MatchComment } from "@/lib/match-community/types";

const MAX_USER_BODY_LENGTH = 500;
const COUNTER_THRESHOLD = 380;

interface MobileMatchCommentModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly matchId: string;
  readonly onCommented: (comment: MatchComment) => void;
}

export function MobileMatchCommentModal({
  isOpen,
  onClose,
  matchId,
  onCommented,
}: MobileMatchCommentModalProps) {
  const { profile } = useAuth();
  const [body, setBody] = useState("");
  const [attachedLineup, setAttachedLineup] = useState<SharedLineupData | null>(loadLocalSharedLineup);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const displayName = profile?.display_name || profile?.username || "Aficionado";
  const remaining = MAX_USER_BODY_LENGTH - body.length;
  const canSubmit = (body.trim().length > 0 || Boolean(attachedLineup)) && !isSubmitting;

  useEffect(() => {
    if (!isOpen) return;
    if (window.matchMedia("(min-width: 640px)").matches) { onClose(); return; }
    const timer = setTimeout(() => textareaRef.current?.focus(), 80);
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    const handleResize = () => { if (window.matchMedia("(min-width: 640px)").matches) onClose(); };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleToggleLineup = () => {
    if (attachedLineup) { setAttachedLineup(null); return; }
    const draft = loadLocalSharedLineup();
    if (!draft) {
      toast.info("Aún no tienes una alineación guardada. Ve a Mi Once para crearla.");
      return;
    }
    setAttachedLineup(draft);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const fullBody = attachedLineup
      ? `${body.trim() ? `${body.trim()}\n\n` : ""}${encodeSharedLineup(attachedLineup)}`
      : body.trim();
    setIsSubmitting(true);
    setError(null);
    const res = await createMatchComment({ matchId, body: fullBody });
    setIsSubmitting(false);
    if (!res.success || !res.data) {
      setError(res.error ?? "No se pudo publicar el comentario");
      return;
    }
    onCommented({
      ...res.data,
      authorName: displayName,
      authorUsername: profile?.username || "aficionado",
      authorAvatar: profile?.avatar_url || null,
      replies: [],
    });
    setBody("");
    setAttachedLineup(null);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Nuevo comentario de partido"
      className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs sm:hidden animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-3xl bg-white p-5 shadow-2xl border-t border-neutral-100 flex flex-col max-h-[90dvh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2.5">
            <AuthAvatar src={profile?.avatar_url} alt={displayName} size="sm" />
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
            placeholder="¿Cómo ves el partido?"
            maxLength={MAX_USER_BODY_LENGTH}
            className="w-full resize-none bg-transparent py-2 text-base text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
          />

          {attachedLineup && (
            <LineupAttachmentChip lineup={attachedLineup} onRemove={() => setAttachedLineup(null)} />
          )}

          {error && <p role="alert" className="text-xs font-semibold text-[var(--primary)] mt-1">{error}</p>}

          <div className="mt-4 flex items-center justify-between pt-3 border-t border-[var(--border)]">
            {!attachedLineup ? (
              <button
                type="button"
                onClick={handleToggleLineup}
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-neutral-500 hover:bg-neutral-100 hover:text-[var(--primary)]"
              >
                <Shield className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Mi Once</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-3">
              {body.length >= COUNTER_THRESHOLD && (
                <span className={`font-sans text-xs tabular-nums ${remaining < 20 ? "font-bold text-[var(--primary)]" : "text-neutral-500"}`}>
                  {remaining}
                </span>
              )}
              <button
                type="submit"
                disabled={!canSubmit}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[var(--primary)] px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-95 active:scale-95 disabled:opacity-40"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                <span>{isSubmitting ? "Publicando…" : "Publicar"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
