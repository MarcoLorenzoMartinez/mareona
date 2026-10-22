// Client: Barra inferior de confirmación y bloqueo exclusivo de notas
"use client";

import { CheckCircle2 } from "lucide-react";

interface MatchRatingsSubmitBarProps {
  readonly hasSubmitted: boolean;
  readonly isSubmitting: boolean;
  readonly ratedCount: number;
  readonly onSubmit: () => void;
}

export function MatchRatingsSubmitBar({
  hasSubmitted,
  isSubmitting,
  ratedCount,
  onSubmit,
}: MatchRatingsSubmitBarProps) {
  const buttonLabel = isSubmitting
    ? "Enviando notas..."
    : ratedCount > 0
    ? `Enviar notas (${ratedCount})`
    : "Enviar notas";

  return (
    <div className="flex flex-col items-center gap-2 border-t border-[var(--border)] pt-4">
      {!hasSubmitted ? (
        <>
          <button
            type="button"
            disabled={ratedCount === 0 || isSubmitting}
            onClick={onSubmit}
            className="w-full sm:w-auto min-w-[200px] rounded-full bg-[var(--primary)] px-6 py-2.5 text-xs font-bold text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {buttonLabel}
          </button>
          <p className="text-[11px] text-[var(--foreground-muted)]">
            Una vez enviadas tus notas, no se podrán modificar.
          </p>
        </>
      ) : (
        <div className="flex items-center gap-2 rounded-xl bg-neutral-50 px-4 py-2.5 text-xs font-semibold text-neutral-700">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>Puntuaciones registradas. Medias generales desbloqueadas.</span>
        </div>
      )}
    </div>
  );
}
