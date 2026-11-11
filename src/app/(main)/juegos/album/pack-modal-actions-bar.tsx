"use client"; // Client: Barra de acciones y control de apertura de sobres sin prosa explicativa

interface PackModalActionsBarProps {
  readonly allRevealed: boolean;
  readonly canOpenAnother: boolean;
  readonly onOpenAnother: () => void;
  readonly onSaveCards: () => void;
}

/**
 * Bottom action and progress controls for the pack reveal modal.
 * Pure minimalist layout complying with AGENTS.md rule 9A (zero explanatory prose).
 */
export function PackModalActionsBar({
  allRevealed,
  canOpenAnother,
  onOpenAnother,
  onSaveCards,
}: PackModalActionsBarProps) {
  if (!allRevealed) return null;

  return (
    <div className="flex items-center justify-center sm:justify-end gap-2 sm:gap-2.5 w-full border-t border-[var(--border)] pt-3.5 sm:pt-4 mt-2">
      {canOpenAnother && (
        <button
          type="button"
          onClick={onOpenAnother}
          className="flex-1 sm:flex-initial rounded-full border border-[var(--border)] bg-white px-3.5 sm:px-4 py-2 text-xs font-bold text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50 active:scale-95 transition-all cursor-pointer"
        >
          Abrir otro sobre
        </button>
      )}
      <button
        type="button"
        onClick={onSaveCards}
        className="flex-1 sm:flex-initial rounded-full bg-[#e2001a] px-4 sm:px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#b30015] active:scale-95 transition-all cursor-pointer"
      >
        Guardar cromos
      </button>
    </div>
  );
}
