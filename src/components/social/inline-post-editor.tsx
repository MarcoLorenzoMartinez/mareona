// Client: Editor en línea para modificar mensajes propios dentro de la ventana de 15 minutos
"use client";

import { useState, useRef, useEffect } from "react";
import { parsePostLineup } from "@/lib/lineup-builder/shared-lineup-codec";
import { getDictionary } from "@/i18n";

interface InlinePostEditorProps {
  readonly initialBody: string;
  readonly onSave: (fullBody: string) => Promise<void> | void;
  readonly onCancel: () => void;
  readonly isSaving?: boolean;
}

/**
 * Inline text editor that activates inside a post card or comment,
 * preserving attached tactical lineups while allowing text revisions.
 */
export function InlinePostEditor({
  initialBody,
  onSave,
  onCancel,
  isSaving = false,
}: InlinePostEditorProps) {
  const dict = getDictionary();
  const { cleanBody } = parsePostLineup(initialBody);
  const [text, setText] = useState(cleanBody);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(text.length, text.length);
    }
  }, [text.length]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    const trimmed = text.trim();
    if (!trimmed) {
      setError(dict.social.editor.emptyError);
      return;
    }
    if (trimmed.length > 500) {
      setError(dict.social.editor.tooLongError);
      return;
    }

    // Keep any attached lineup tag intact at the end of the post payload
    const tagMatch = initialBody.match(
      /<!--once:(?:4-2-3-1|4-4-2|4-3-3|5-3-2|3-4-3|3-5-2)\|.*?-->/
    );
    const finalBody = tagMatch ? `${trimmed}\n\n${tagMatch[0]}` : trimmed;

    try {
      await onSave(finalBody);
    } catch {
      setError(dict.social.editor.saveError);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      onCancel();
    } else if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      void handleSubmit();
    }
  };

  const remaining = 500 - text.length;

  return (
    <form
      onSubmit={handleSubmit}
      onClick={(e) => e.stopPropagation()}
      className="mt-2 w-full space-y-2"
    >
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={handleKeyDown}
          maxLength={500}
          rows={3}
          disabled={isSaving}
          aria-label={dict.social.editor.textareaAria}
          className="w-full resize-none rounded-xl border border-[var(--border)] bg-white p-3 text-[15px] leading-snug text-neutral-900 placeholder-neutral-400 focus:border-[#e2001a] focus:outline-none focus:ring-1 focus:ring-[#e2001a] disabled:bg-neutral-50"
        />
      </div>

      {error && <p className="text-xs font-semibold text-red-600">{error}</p>}

      <div className="flex items-center justify-between gap-2">
        <span
          className={`font-sans text-xs tabular-nums ${
            remaining < 20 ? "font-bold text-red-600" : "text-neutral-400"
          }`}
        >
          {text.length}/500
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onCancel();
            }}
            disabled={isSaving}
            className="rounded-full px-3 py-1 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 disabled:opacity-50"
          >
            {dict.social.editor.cancelButton}
          </button>
          <button
            type="submit"
            disabled={isSaving || !text.trim() || text.length > 500}
            className="rounded-full bg-[#e2001a] px-3.5 py-1 text-xs font-bold text-white shadow-2xs hover:bg-red-700 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e2001a] disabled:opacity-50 disabled:pointer-events-none"
          >
            {isSaving ? dict.social.editor.saving : dict.social.editor.saveButton}
          </button>
        </div>
      </div>
    </form>
  );
}
