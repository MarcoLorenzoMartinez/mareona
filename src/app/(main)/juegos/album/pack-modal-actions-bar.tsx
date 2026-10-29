"use client"; // Client: Barra de acciones e información del resultado del sobre

interface PackModalActionsBarProps {
  readonly allRevealed: boolean;
  readonly revealedCount: number;
  readonly totalCards: number;
  readonly newCardsCount: number;
  readonly canOpenAnother: boolean;
  readonly onRevealAll: () => void;
  readonly onOpenAnother: () => void;
  readonly onPaste: () => void;
}

/**
 * Bottom action and progress controls for the pack reveal modal.
 * Complies with AGENTS.md: clean light theme, red brand accents, zero mono font.
 */
export function PackModalActionsBar({
  allRevealed,
  revealedCount,
  totalCards,
  newCardsCount,
  canOpenAnother,
  onRevealAll,
  onOpenAnother,
  onPaste,
}: PackModalActionsBarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full border-t border-[var(--border)] pt-4 mt-2">
      <div className="text-xs font-medium text-neutral-600">
        {!allRevealed ? (
          <div className="flex items-center gap-3">
            <span>
              Descubriendo cromos (
              <strong className="font-bold tabular-nums text-neutral-900">
                {revealedCount}/{totalCards}
              </strong>
              )...
            </span>
            <button
              type="button"
              onClick={onRevealAll}
              className="text-xs font-bold text-[#e2001a] hover:underline cursor-pointer"
            >
              Revelar todos
            </button>
          </div>
        ) : (
          <span className="text-xs font-medium text-neutral-700">
            {newCardsCount > 0 ? (
              <>
                ¡Has conseguido{" "}
                <strong className="font-bold text-neutral-900">
                  {newCardsCount} {newCardsCount === 1 ? "cromo nuevo" : "cromos nuevos"}
                </strong>{" "}
                para tu álbum!
              </>
            ) : (
              "Todos los cromos ya estaban en tu álbum (sumados a repetidos)."
            )}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2.5">
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
