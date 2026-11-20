// Client: Barra superior de controles tácticos (Esquema + Descarga + Compartir)
"use client";

import type { TacticalFormationKey } from "@/lib/lineup-builder/types";
import { getDictionary } from "@/i18n";

interface LineupBuilderToolbarProps {
  readonly formationKey: TacticalFormationKey;
  readonly onFormationChange: (key: TacticalFormationKey) => void;
  readonly onResetLineup: () => void;
  readonly onDownload: () => void;
  readonly onOpenShareModal: () => void;
  readonly isExporting: boolean;
}

const FORMATIONS: readonly TacticalFormationKey[] = [
  "4-2-3-1",
  "4-4-2",
  "4-3-3",
  "5-3-2",
  "3-4-3",
  "3-5-2",
];

export function LineupBuilderToolbar({
  formationKey,
  onFormationChange,
  onResetLineup,
  onDownload,
  onOpenShareModal,
  isExporting,
}: LineupBuilderToolbarProps) {
  const dict = getDictionary();
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-[var(--border)] bg-white p-4 shadow-2xs">
      {/* Selector de esquema táctico tipo píldora */}
      <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-none py-1">
        <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider shrink-0">
          {dict.lineupBuilder.toolbar.formationLabel}
        </span>
        <div
          role="radiogroup"
          aria-label={dict.lineupBuilder.toolbar.formationAria}
          className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface)] p-1 shrink-0"
        >
          {FORMATIONS.map((key) => {
            const isSelected = formationKey === key;
            return (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onFormationChange(key)}
                className={`rounded-full px-3 py-1 text-xs tabular-nums transition-all duration-150 ease-out active:scale-[0.98] shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-[var(--primary)] text-white font-bold shadow-2xs"
                    : "text-[var(--foreground-muted)] font-semibold hover:text-[var(--foreground)]"
                }`}
              >
                {key}
              </button>
            );
          })}
        </div>
      </div>

      {/* Acciones principales: Reiniciar, Descargar y Compartir en Tertulia/Grada */}
      <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
        <button
          type="button"
          onClick={onResetLineup}
          className="rounded-full border border-neutral-300 px-3.5 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
        >
          {dict.lineupBuilder.toolbar.resetButton}
        </button>
        <button
          type="button"
          disabled={isExporting}
          onClick={onDownload}
          className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 transition-colors"
        >
          {isExporting ? dict.lineupBuilder.toolbar.generating : dict.lineupBuilder.toolbar.downloadButton}
        </button>
        <button
          type="button"
          onClick={onOpenShareModal}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#e2001a] px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#b30015] transition-colors"
        >
          {dict.lineupBuilder.toolbar.shareButton}
        </button>
      </div>
    </div>
  );
}
