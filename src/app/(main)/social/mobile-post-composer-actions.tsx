// Client: Barra de acciones inferior del compositor móvil (encuesta, once, contador y botón)
"use client";

import { BarChart2, Shield } from "lucide-react";

interface MobilePostComposerActionsProps {
  readonly isPollActive: boolean;
  readonly hasAttachedLineup: boolean;
  readonly onActivatePoll: () => void;
  readonly onToggleLineup: () => void;
  readonly showCounter: boolean;
  readonly remaining: number;
  readonly canSubmit: boolean;
  readonly isSubmitting: boolean;
}

export function MobilePostComposerActions({
  isPollActive,
  hasAttachedLineup,
  onActivatePoll,
  onToggleLineup,
  showCounter,
  remaining,
  canSubmit,
  isSubmitting,
}: MobilePostComposerActionsProps) {
  return (
    <div className="mt-4 flex items-center justify-between pt-3 border-t border-[var(--border)]">
      <div className="flex items-center gap-1">
        {!isPollActive && (
          <button
            type="button"
            onClick={onActivatePoll}
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-neutral-500 hover:bg-neutral-100 hover:text-[var(--primary)]"
          >
            <BarChart2 className="h-4 w-4" aria-hidden="true" />
            <span>Encuesta</span>
          </button>
        )}
        {!hasAttachedLineup && (
          <button
            type="button"
            onClick={onToggleLineup}
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-neutral-500 hover:bg-neutral-100 hover:text-[var(--primary)]"
          >
            <Shield className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Mi Once</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        {showCounter && (
          <span
            className={`font-sans text-xs tabular-nums ${
              remaining < 20 ? "font-bold text-[var(--primary)]" : "text-neutral-500"
            }`}
          >
            {remaining}
          </span>
        )}
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-full bg-[var(--primary)] px-5 py-2 text-xs font-bold text-white shadow-xs transition-opacity hover:opacity-95 disabled:opacity-50"
        >
          {isSubmitting ? "Publicando…" : "Publicar"}
        </button>
      </div>
    </div>
  );
}
