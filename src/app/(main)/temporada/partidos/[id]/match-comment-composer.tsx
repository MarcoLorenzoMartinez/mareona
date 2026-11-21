// Client: Compositor inline colapsable para comentarios de partido y alineaciones de Mi Once
"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "@/lib/ui/toast";
import { useAuth } from "@/context/auth-context";
import { AuthAvatar } from "@/components/auth/auth-avatar";
import { LineupAttachmentChip } from "@/components/lineup-builder/lineup-attachment-chip";
import { MatchComposerControls } from "./match-composer-controls";
import {
  encodeSharedLineup,
  loadLocalSharedLineup,
  type SharedLineupData,
} from "@/lib/lineup-builder/shared-lineup-codec";
import { createMatchComment } from "@/lib/match-community/actions";
import type { MatchComment } from "@/lib/match-community/types";

const MAX_USER_BODY_LENGTH = 500, COUNTER_THRESHOLD = 380;

interface MatchCommentComposerProps {
  readonly matchId: string;
  readonly onCommented: (comment: MatchComment) => void;
  readonly parentId?: string;
  readonly placeholder?: string;
  readonly submitLabel?: string;
  readonly className?: string;
}

export function MatchCommentComposer({
  matchId,
  onCommented,
  parentId,
  placeholder = "¿Cómo ves el partido?",
  submitLabel = "Publicar",
  className = "",
}: MatchCommentComposerProps) {
  const { user, profile, openAuthModal } = useAuth();
  const searchParams = useSearchParams();
  const isLineupParam = !parentId && searchParams?.get("adjuntarOnce") === "1";

  const [body, setBody] = useState("");
  const [attachedLineup, setAttachedLineup] = useState<SharedLineupData | null>(() => (
    isLineupParam ? loadLocalSharedLineup() : null
  ));
  const [isExpanded, setIsExpanded] = useState(() => Boolean(parentId) || isLineupParam);
  const [prevLineupParam, setPrevLineupParam] = useState(isLineupParam);

  if (isLineupParam && !prevLineupParam) {
    setPrevLineupParam(true);
    const draft = loadLocalSharedLineup();
    if (draft) { setAttachedLineup(draft); setIsExpanded(true); }
  } else if (!isLineupParam && prevLineupParam) {
    setPrevLineupParam(false);
  }
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const displayName = profile?.display_name || profile?.username || "Aficionado";
  const remaining = MAX_USER_BODY_LENGTH - body.length;
  const canSubmit = (body.trim().length > 0 || Boolean(attachedLineup)) && !isSubmitting;

  useEffect(() => {
    if (!isLineupParam) return;
    if (typeof window !== "undefined") window.history.replaceState({}, "", window.location.pathname);
    setTimeout(() => textareaRef.current?.focus(), 50);
  }, [isLineupParam]);

  const autoGrow = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  const handleFocus = () => {
    if (!user) {
      textareaRef.current?.blur();
      openAuthModal("signin");
      return;
    }
    setIsExpanded(true);
  };

  const handleToggleLineup = () => {
    if (attachedLineup) {
      setAttachedLineup(null);
      return;
    }
    const draft = loadLocalSharedLineup();
    if (!draft) {
      toast.info("Aún no tienes una alineación guardada. Ve a Mi Once para crearla.");
      return;
    }
    setAttachedLineup(draft);
    setIsExpanded(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const fullBody = attachedLineup
      ? `${body.trim() ? `${body.trim()}\n\n` : ""}${encodeSharedLineup(attachedLineup)}`
      : body.trim();

    setIsSubmitting(true);
    setError(null);
    const res = await createMatchComment({ matchId, body: fullBody, parentId });
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
    setBody(""); setAttachedLineup(null);
    if (!parentId) setIsExpanded(false);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex gap-3 border-b border-[var(--border)] px-4 py-3 transition-colors duration-150 ${className}`}
    >
      <AuthAvatar src={profile?.avatar_url} alt={displayName} size="md" className="shrink-0" />
      <div className="min-w-0 flex-1">
        <label htmlFor={`match-composer-${parentId ?? "root"}`} className="sr-only">
          {placeholder}
        </label>
        <textarea
          ref={textareaRef}
          id={`match-composer-${parentId ?? "root"}`}
          rows={isExpanded ? 3 : 1}
          value={body}
          onFocus={handleFocus}
          onChange={(e) => {
            setBody(e.target.value);
            autoGrow(e.target);
          }}
          placeholder={placeholder}
          maxLength={MAX_USER_BODY_LENGTH}
          className="block w-full resize-none bg-transparent py-1.5 text-[15px] sm:text-base leading-snug text-neutral-900 placeholder:text-neutral-400 focus:outline-none transition-all"
        />

        {attachedLineup && (
          <LineupAttachmentChip lineup={attachedLineup} onRemove={() => setAttachedLineup(null)} />
        )}

        {error && (
          <p role="alert" className="mt-1 text-xs font-semibold text-[var(--primary)]">
            {error}
          </p>
        )}

        {isExpanded && (
          <MatchComposerControls
            parentId={parentId}
            hasAttachedLineup={Boolean(attachedLineup)}
            onToggleLineup={handleToggleLineup}
            onCancel={() => setIsExpanded(false)} canCancel={!parentId && !body && !attachedLineup}
            showCounter={body.length >= COUNTER_THRESHOLD}
            remaining={remaining}
            canSubmit={canSubmit}
            isSubmitting={isSubmitting}
            submitLabel={submitLabel}
          />
        )}
      </div>
    </form>
  );
}
