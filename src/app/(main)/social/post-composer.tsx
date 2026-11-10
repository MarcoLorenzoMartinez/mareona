// Client: Compositor inline colapsable con soporte para encuestas y alineaciones de Mi Once
"use client";

import { useRef, useState } from "react";
import { toast } from "@/lib/ui/toast";
import { useAuth } from "@/context/auth-context";
import { AuthAvatar } from "@/components/auth/auth-avatar";
import { PollCreator } from "@/components/social/poll-creator";
import { usePollDraft } from "@/components/social/use-poll-draft";
import { LineupAttachmentChip } from "@/components/lineup-builder/lineup-attachment-chip";
import { PostComposerControls } from "./post-composer-controls";
import {
  encodeSharedLineup,
  loadLocalSharedLineup,
  type SharedLineupData,
} from "@/lib/lineup-builder/shared-lineup-codec";
import { createSocialPost } from "@/lib/social/actions";
import type { SocialPost } from "@/lib/social/types";

const MAX_TOTAL_LENGTH = 500;
const COUNTER_THRESHOLD = 380;

interface PostComposerProps {
  readonly onPosted: (post: SocialPost) => void;
  readonly parentId?: string;
  readonly placeholder?: string;
  readonly submitLabel?: string;
  readonly className?: string;
}

export function PostComposer({
  onPosted,
  parentId,
  placeholder = "¿Qué opinas del Sporting?",
  submitLabel = "Publicar",
  className = "",
}: PostComposerProps) {
  const { user, profile, openAuthModal } = useAuth();
  const [body, setBody] = useState("");
  const [attachedLineup, setAttachedLineup] = useState<SharedLineupData | null>(null);
  const [isExpanded, setIsExpanded] = useState(Boolean(parentId));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const poll = usePollDraft();

  const displayName = profile?.display_name || profile?.username || "Aficionado";
  const lineupTagLen = attachedLineup ? encodeSharedLineup(attachedLineup).length + 2 : 0;
  const maxBodyLength = Math.max(50, MAX_TOTAL_LENGTH - lineupTagLen);
  const remaining = maxBodyLength - body.length;
  const canSubmit = (body.trim().length > 0 || Boolean(attachedLineup)) && !isSubmitting;

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
    const res = await createSocialPost({ body: fullBody, parentId, pollOptions: validPollOptions });
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
    if (!parentId) setIsExpanded(false);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  return (
    <form onSubmit={handleSubmit} className={`flex gap-3 border-b border-[var(--border)] px-4 py-3 transition-colors duration-150 ${className}`}>
      <AuthAvatar src={profile?.avatar_url} alt={displayName} size="md" className="shrink-0" />
      <div className="min-w-0 flex-1">
        <label htmlFor={`composer-${parentId ?? "root"}`} className="sr-only">{placeholder}</label>
        <textarea
          ref={textareaRef}
          id={`composer-${parentId ?? "root"}`}
          rows={isExpanded ? 3 : 1}
          value={body}
          onFocus={handleFocus}
          onChange={(e) => { setBody(e.target.value); autoGrow(e.target); }}
          placeholder={placeholder}
          maxLength={maxBodyLength}
          className="block w-full resize-none bg-transparent py-1.5 text-[15px] sm:text-base leading-snug text-neutral-900 placeholder:text-neutral-400 focus:outline-none transition-all"
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

        {error && <p role="alert" className="mt-1 text-xs font-semibold text-[var(--primary)]">{error}</p>}

        {isExpanded && (
          <PostComposerControls
            parentId={parentId}
            isPollActive={poll.isPollActive}
            hasAttachedLineup={Boolean(attachedLineup)}
            onActivatePoll={poll.activatePoll}
            onToggleLineup={handleToggleLineup}
            onCancel={() => setIsExpanded(false)}
            canCancel={!parentId && !body && !poll.isPollActive && !attachedLineup}
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
