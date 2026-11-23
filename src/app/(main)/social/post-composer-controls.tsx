// Client: Barra de controles y botones de acción del compositor de publicaciones
"use client";

import { BarChart2 } from "lucide-react";
import { FootballPitchIcon } from "@/components/icons/football-pitch-icon";
import { getDictionary } from "@/i18n";

interface PostComposerControlsProps {
  readonly parentId?: string;
  readonly isPollActive: boolean;
  readonly hasAttachedLineup: boolean;
  readonly onActivatePoll: () => void;
  readonly onToggleLineup: () => void;
  readonly onCancel: () => void;
  readonly canCancel: boolean;
  readonly showCounter: boolean;
  readonly remaining: number;
  readonly canSubmit: boolean;
  readonly isSubmitting: boolean;
  readonly submitLabel: string;
}

export function PostComposerControls({
  parentId,
  isPollActive,
  hasAttachedLineup,
  onActivatePoll,
  onToggleLineup,
  onCancel,
  canCancel,
  showCounter,
  remaining,
  canSubmit,
  isSubmitting,
  submitLabel,
}: PostComposerControlsProps) {
  const dict = getDictionary();
  return (
    <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-neutral-100 animate-in fade-in duration-150">
      <div className="flex items-center gap-1">
        {!parentId && !isPollActive && (
          <button
            type="button"
            onClick={onActivatePoll}
            aria-label={dict.social.composer.addPollAria}
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-neutral-500 hover:bg-neutral-100 hover:text-[var(--primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          >
            <BarChart2 className="h-4 w-4" aria-hidden="true" />
            <span>{dict.social.composer.pollLabel}</span>
          </button>
        )}
        {!parentId && !hasAttachedLineup && (
          <button
            type="button"
            onClick={onToggleLineup}
            aria-label={dict.social.composer.attachLineupAria}
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-neutral-500 hover:bg-neutral-100 hover:text-[var(--primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          >
            <FootballPitchIcon className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{dict.social.composer.lineupLabel}</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        {canCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full px-3 py-1.5 text-xs font-semibold text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 transition-colors"
          >
            {dict.social.composer.cancelButton}
          </button>
        )}

        {showCounter && (
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
          aria-busy={isSubmitting}
          className="min-h-9 rounded-full bg-[var(--primary)] px-5 text-sm font-bold text-white transition-[transform,opacity] duration-150 hover:bg-[var(--primary-strong)] active:scale-95 disabled:opacity-50 disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
        >
          {isSubmitting ? dict.social.composer.submitting : submitLabel}
        </button>
      </div>
    </div>
  );
}
