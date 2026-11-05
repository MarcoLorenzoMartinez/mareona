// Client: Compositor en línea (publicar y responder) con foco para auth y contador progresivo
"use client";

import { useRef, useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { AuthAvatar } from "@/components/auth/auth-avatar";
import { createSocialPost } from "@/lib/social/actions";
import type { AttachmentOption } from "@/lib/social/attachment-options";
import { AttachmentPickerButton } from "./attachment-picker";
import type { SocialPost } from "@/lib/social/types";

const MAX_LENGTH = 500;
const COUNTER_THRESHOLD = 400;

interface PostComposerProps {
  readonly onPosted: (post: SocialPost) => void;
  readonly parentId?: string;
  readonly placeholder?: string;
  readonly submitLabel?: string;
}

export function PostComposer({
  onPosted,
  parentId,
  placeholder = "¿Qué opinas del Sporting?",
  submitLabel = "Publicar",
}: PostComposerProps) {
  const { user, profile, openAuthModal } = useAuth();
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attachment, setAttachment] = useState<AttachmentOption | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setError(null);
    const res = await createSocialPost({
      body: body.trim(),
      parentId,
      attachment: attachment?.ref ?? null,
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
    setAttachment(null);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-3 border-b border-[var(--border)] px-4 py-3"
    >
      <AuthAvatar src={profile?.avatar_url} alt="" size="md" className="shrink-0" />

      <div className="min-w-0 flex-1">
        <label htmlFor={`composer-${parentId ?? "root"}`} className="sr-only">
          {placeholder}
        </label>
        <textarea
          ref={textareaRef}
          id={`composer-${parentId ?? "root"}`}
          rows={1}
          value={body}
          onFocus={handleFocus}
          onChange={(e) => {
            setBody(e.target.value);
            autoGrow(e.target);
          }}
          placeholder={placeholder}
          maxLength={MAX_LENGTH}
          className="block w-full resize-none bg-transparent py-1.5 text-[17px] leading-snug text-neutral-900 placeholder:text-neutral-500 focus:outline-none"
        />

        {error && (
          <p role="alert" className="mt-1 text-sm font-medium text-[var(--primary-strong)]">
            {error}
          </p>
        )}

        {attachment && (
          <div className="mt-2 flex items-center justify-between gap-2 rounded-xl border border-[var(--border)] py-1 pl-3.5 pr-1">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-neutral-900">{attachment.title}</p>
              <p className="truncate text-xs text-neutral-500">{attachment.subtitle}</p>
            </div>
            <button
              type="button"
              onClick={() => setAttachment(null)}
              aria-label="Quitar dato adjunto"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-neutral-600 hover:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}

        <div className="mt-2 flex items-center gap-3">
          <AttachmentPickerButton onSelect={setAttachment} disabled={isSubmitting} />
          <div className="ml-auto flex items-center gap-3">
            {body.length >= COUNTER_THRESHOLD && (
              <span
                aria-live="polite"
                className={`font-sans text-xs tabular-nums ${
                  remaining < 20 ? "font-bold text-[var(--primary-strong)]" : "text-neutral-500"
                }`}
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
      </div>
    </form>
  );
}