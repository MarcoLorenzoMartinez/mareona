// Client: Modal de redacción para dispositivos móviles con diseño accesible, encuestas y Mi Once
"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { toast } from "@/lib/ui/toast";
import { useAuth } from "@/context/auth-context";
import { AuthAvatar } from "@/components/auth/auth-avatar";
import { PollCreator } from "@/components/social/poll-creator";
import { usePollDraft } from "@/components/social/use-poll-draft";
import { LineupAttachmentChip } from "@/components/lineup-builder/lineup-attachment-chip";
import { MobilePostComposerActions } from "./mobile-post-composer-actions";
import {
  encodeSharedLineup,
  loadLocalSharedLineup,
  type SharedLineupData,
} from "@/lib/lineup-builder/shared-lineup-codec";
import { createSocialPost } from "@/lib/social/actions";
import type { SocialPost } from "@/lib/social/types";

const MAX_TOTAL_LENGTH = 500;
const COUNTER_THRESHOLD = 380;

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
  const [attachedLineup, setAttachedLineup] = useState<SharedLineupData | null>(() => {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get("adjuntarOnce") === "1" ? loadLocalSharedLineup() : null;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const poll = usePollDraft();

  const displayName = profile?.display_name || profile?.username || "Aficionado";
  const lineupTagLen = attachedLineup ? encodeSharedLineup(attachedLineup).length + 2 : 0;
  const maxBodyLength = Math.max(50, MAX_TOTAL_LENGTH - lineupTagLen);
  const remaining = maxBodyLength - body.length;
  const canSubmit = (body.trim().length > 0 || Boolean(attachedLineup)) && !isSubmitting;

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
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

    const validPollOptions = poll.getValidOptions();
    if (poll.isPollActive && (!validPollOptions || validPollOptions.length < 2)) {
      setError("Añade al menos 2 opciones a la encuesta");
      return;
    }
    const fullBody = attachedLineup
      ? `${body.trim() ? `${body.trim()}\n\n` : ""}${encodeSharedLineup(attachedLineup)}`
      : body.trim();
    setIsSubmitting(true);
    setError(null);
    const res = await createSocialPost({ body: fullBody, pollOptions: validPollOptions });
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
    setAttachedLineup(null);
    poll.resetPoll();
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

        <form onSubmit={handleSubmit} className="mt-3 flex flex-col flex-1 min-h-0 overflow-y-auto">
          <textarea
            ref={textareaRef}
            autoFocus
            rows={3}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="¿Qué opinas hoy sobre el Sporting?"
            maxLength={maxBodyLength}
            className="w-full resize-none bg-transparent py-2 text-base text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
          />

          {attachedLineup && (
            <LineupAttachmentChip lineup={attachedLineup} onRemove={() => setAttachedLineup(null)} />
          )}

          {poll.isPollActive && (
            <PollCreator
              options={poll.pollOptions}
              onChangeOption={poll.setOption}
              onAddOption={poll.addOption}
              onRemoveOption={poll.removeOption}
              onRemovePoll={poll.resetPoll}
            />
          )}

          {error && <p role="alert" className="text-xs font-semibold text-[var(--primary)] mt-1">{error}</p>}

          <MobilePostComposerActions
            isPollActive={poll.isPollActive}
            hasAttachedLineup={Boolean(attachedLineup)}
            onActivatePoll={poll.activatePoll}
            onToggleLineup={handleToggleLineup}
            showCounter={body.length >= COUNTER_THRESHOLD}
            remaining={remaining}
            canSubmit={canSubmit}
            isSubmitting={isSubmitting}
          />
        </form>
      </div>
    </div>
  );
}
