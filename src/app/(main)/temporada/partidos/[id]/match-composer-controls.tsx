// Client: Controles y botón de acción del compositor de comentarios de partido
"use client";

import { FootballPitchIcon } from "@/components/icons/football-pitch-icon";

interface MatchComposerControlsProps {
  readonly parentId?: string;
  readonly hasAttachedLineup: boolean;
  readonly onToggleLineup: () => void;
  readonly onCancel: () => void;
  readonly canCancel: boolean;
  readonly showCounter: boolean;
  readonly remaining: number;
  readonly canSubmit: boolean;
  readonly isSubmitting: boolean;
  readonly submitLabel: string;
}

export function MatchComposerControls({
  parentId,
  hasAttachedLineup,
  onToggleLineup,
  onCancel,
  canCancel,
  showCounter,
  remaining,
  canSubmit,
  isSubmitting,
  submitLabel,
}: MatchComposerControlsProps) {
  return (
    <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-neutral-100 animate-in fade-in duration-150">
      <div>
        {!parentId && !hasAttachedLineup && (
          <button
            type="button"
            onClick={onToggleLineup}
            aria-label="Adjuntar alineación de Mi Once"
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-neutral-500 hover:bg-neutral-100 hover:text-[var(--primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          >
            <FootballPitchIcon className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Mi Once</span>
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
            Cancelar
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
          className="min-h-9 rounded-full bg-[var(--primary)] px-5 text-sm font-bold text-white transition-[transform,opacity] duration-150 hover:bg-[var(--primary-strong)] active:scale-95 disabled:opacity-50 disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
        >
          {isSubmitting ? "Publicando…" : submitLabel}
        </button>
      </div>
    </div>
  );
}
