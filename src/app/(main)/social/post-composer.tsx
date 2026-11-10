// Client: Compositor inline colapsable con soporte para encuestas y contador progresivo
"use client";

import { useRef, useState } from "react";
import { BarChart2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { AuthAvatar } from "@/components/auth/auth-avatar";
import { PollCreator } from "@/components/social/poll-creator";
import { usePollDraft } from "@/components/social/use-poll-draft";
import { createSocialPost } from "@/lib/social/actions";
import type { SocialPost } from "@/lib/social/types";

const MAX_LENGTH = 500;
const COUNTER_THRESHOLD = 400;

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
  const [isExpanded, setIsExpanded] = useState(Boolean(parentId));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const poll = usePollDraft();

  const displayName = profile?.display_name || profile?.username || "Aficionado";
  const remaining = MAX_LENGTH - body.length;
  const canSubmit = body.trim().length > 0 && !isSubmitting;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const validPollOptions = poll.getValidOptions();
    if (poll.isPollActive && (!validPollOptions || validPollOptions.length < 2)) {
      setError("Añade al menos 2 opciones a la encuesta");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    const res = await createSocialPost({ body: body.trim(), parentId, pollOptions: validPollOptions });
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
          maxLength={MAX_LENGTH}
          className="block w-full resize-none bg-transparent py-1.5 text-[15px] sm:text-base leading-snug text-neutral-900 placeholder:text-neutral-400 focus:outline-none transition-all"
        />

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
          <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-neutral-100 animate-in fade-in duration-150">
            <div>
              {!parentId && !poll.isPollActive && (
                <button
                  type="button"
                  onClick={poll.activatePoll}
                  aria-label="Añadir encuesta a la publicación"
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-neutral-500 hover:bg-neutral-100 hover:text-[var(--primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                >
                  <BarChart2 className="h-4 w-4" aria-hidden="true" />
                  <span>Encuesta</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {!parentId && !body && !poll.isPollActive && (
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="rounded-full px-3 py-1.5 text-xs font-semibold text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 transition-colors"
                >
                  Cancelar
                </button>
              )}

              {body.length >= COUNTER_THRESHOLD && (
                <span
                  aria-live="polite"
                  className={`font-sans text-xs tabular-nums ${remaining < 20 ? "font-bold text-[var(--primary-strong)]" : "text-neutral-500"}`}
                >
                  {remaining}
                </span>
              )}

              <button
                type="submit"
                disabled={!canSubmit}
                className="min-h-9 rounded-full bg-[var(--primary)] px-5 text-sm font-bold text-white transition-[transform,opacity] duration-150 hover:bg-[var(--primary-strong)] active:scale-95 disabled:opacity-50 disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
              >
                {isSubmitting ? "Publicando…" : submitLabel}
              </button>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
