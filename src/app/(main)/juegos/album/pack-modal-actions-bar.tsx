"use client"; // Client: Barra de acciones y control de apertura de sobres sin prosa explicativa

interface PackModalActionsBarProps {
  readonly allRevealed: boolean;
  readonly revealedCount: number;
  readonly totalCards: number;
  readonly canOpenAnother: boolean;
  readonly onRevealAll: () => void;
  readonly onOpenAnother: () => void;
  readonly onPaste: () => void;
}

/**
 * Bottom action and progress controls for the pack reveal modal.
 * Pure minimalist layout complying with AGENTS.md rule 9A (zero explanatory prose).
 */
export function PackModalActionsBar({
  allRevealed,
  revealedCount,
  totalCards,
  canOpenAnother,
  onRevealAll,
  onOpenAnother,
  onPaste,
}: PackModalActionsBarProps) {
  return (
    <div className="flex items-center justify-between gap-3 w-full border-t border-[var(--border)] pt-4 mt-2">
      <div>
        {!allRevealed && (
          <div className="flex items-center gap-2.5">
            <span className="font-sans text-xs font-semibold tabular-nums text-neutral-400">
              {revealedCount}/{totalCards}
            </span>
            <button
              type="button"
              onClick={onRevealAll}
              className="text-xs font-bold text-neutral-500 hover:text-neutral-800 underline cursor-pointer"
            >
              Revelar todos
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2.5 ml-auto">
        {allRevealed && (
          <>
            {canOpenAnother && (
              <button
                type="button"
                onClick={onOpenAnother}
                className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-xs font-bold text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50 active:scale-95 transition-all cursor-pointer"
              >
                Abrir otro sobre
              </button>
            )}
            <button
              type="button"
              onClick={onPaste}
              className="rounded-full bg-[#e2001a] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#b30015] active:scale-95 transition-all cursor-pointer"
            >
              Pegar en mi Álbum
            </button>
          </>
        )}
      </div>
    </div>
  );
}
