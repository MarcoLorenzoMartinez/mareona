// Client: Creador interactivo de encuestas de 2 a 4 opciones con eliminación individual
"use client";

import { Plus, X } from "lucide-react";

interface PollCreatorProps {
  readonly options: readonly string[];
  readonly onChangeOption: (index: number, value: string) => void;
  readonly onAddOption: () => void;
  readonly onRemoveOption: (index: number) => void;
  readonly onRemovePoll: () => void;
}

export function PollCreator({
  options,
  onChangeOption,
  onAddOption,
  onRemoveOption,
  onRemovePoll,
}: PollCreatorProps) {
  return (
    <div className="mt-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)]/50 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-neutral-700">Encuesta</span>
        <button
          type="button"
          onClick={onRemovePoll}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-400 hover:text-[var(--primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded-sm"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Quitar</span>
        </button>
      </div>

      <div className="space-y-1.5">
        {options.map((opt, idx) => (
          <div key={`poll-opt-${idx}`} className="flex items-center gap-1.5">
            <input
              type="text"
              maxLength={50}
              value={opt}
              onChange={(e) => onChangeOption(idx, e.target.value)}
              placeholder={`Opción ${idx + 1}`}
              className="flex-1 rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
            {options.length > 2 && (
              <button
                type="button"
                onClick={() => onRemoveOption(idx)}
                aria-label={`Quitar opción ${idx + 1}`}
                title="Quitar opción"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-200/60 hover:text-[var(--primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
        ))}
      </div>

      {options.length < 4 && (
        <button
          type="button"
          onClick={onAddOption}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded-sm pt-0.5"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Añadir opción ({options.length}/4)</span>
        </button>
      )}
    </div>
  );
}
