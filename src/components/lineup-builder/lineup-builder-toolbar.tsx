// Client: Barra superior de controles tácticos (Esquema + Descarga + Compartir)
"use client";

import type { TacticalFormationKey } from "@/lib/lineup-builder/types";

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
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-[var(--border)] bg-white p-4 shadow-2xs">
      {/* Selector de esquema táctico tipo píldora */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
        <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider shrink-0">
          Esquema:
        </span>
        {FORMATIONS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => onFormationChange(key)}
            className={`rounded-full px-3 py-1 text-xs font-bold transition-all shrink-0 ${
              formationKey === key
                ? "bg-[#e2001a] text-white shadow-xs"
                : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
            }`}
          >
            {key}
          </button>
        ))}
      </div>

      {/* Acciones principales: Reiniciar, Descargar y Compartir en Tertulia/Grada */}
      <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
        <button
          type="button"
          onClick={onResetLineup}
          className="rounded-full border border-neutral-300 px-3.5 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
        >
          Reiniciar
        </button>
        <button
          type="button"
          disabled={isExporting}
          onClick={onDownload}
          className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 transition-colors"
        >
          {isExporting ? "Generando..." : "Descargar Imagen"}
        </button>
        <button
          type="button"
          onClick={onOpenShareModal}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#e2001a] px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#b30015] transition-colors"
        >
          Compartir Once
        </button>
      </div>
    </div>
  );
}
