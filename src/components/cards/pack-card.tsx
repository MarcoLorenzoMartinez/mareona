"use client"; // Client: Renderizado de sobre interactivo en 3D/foil con estados de hover y apertura

import type { PackTier } from "@/lib/cards/types";
import { PACK_TIERS } from "@/lib/cards/packs";

interface PackCardProps {
  readonly tier: PackTier;
  readonly count: number;
  readonly onOpen: (tier: PackTier) => void;
  readonly isOpening?: boolean;
}

/**
 * FUT-style collectible pack component adapted to Mareona's official corporate identity.
 * Features realistic foil sheen, crimped heat-sealed edges, embossed crest watermark, and count pill.
 */
export function PackCard({ tier, count, onOpen, isOpening = false }: PackCardProps) {
  const config = PACK_TIERS[tier];
  const isAvailable = count > 0;

  // Visual styles per tier conforming strictly to AGENTS.md (no blue, no font-mono)
  const tierStyles = {
    aficionado: {
      wrapper: "border-neutral-300 bg-white text-neutral-900 shadow-md hover:border-[#e2001a]",
      foilSheen:
        "bg-[repeating-linear-gradient(90deg,transparent,transparent_14px,rgba(226,0,26,0.06)_14px,rgba(226,0,26,0.06)_28px)]",
      headerBadge: "bg-neutral-100 text-neutral-700 border-neutral-200",
      accentBorder: "border-[#e2001a]/30",
      sealBg: "bg-neutral-100 border-neutral-300 text-neutral-800",
      buttonBg: "bg-[#e2001a] hover:bg-[#b30015] text-white",
      tagLabel: "BÁSICO",
    },
    rojiblanco: {
      wrapper:
        "border-[#e2001a] bg-gradient-to-b from-[#e2001a] via-[#b30015] to-[#80000e] text-white shadow-xl shadow-red-950/20 hover:scale-[1.02]",
      foilSheen:
        "bg-[linear-gradient(115deg,transparent_20%,rgba(255,255,255,0.22)_40%,rgba(255,255,255,0.05)_55%,transparent_80%)]",
      headerBadge: "bg-white/20 text-white border-white/30",
      accentBorder: "border-white/20",
      sealBg: "bg-white/15 border-white/40 text-white",
      buttonBg: "bg-white text-[#e2001a] hover:bg-neutral-100",
      tagLabel: "ESPECIAL",
    },
    leyenda: {
      wrapper:
        "border-amber-500/80 bg-gradient-to-b from-neutral-950 via-neutral-900 to-black text-amber-100 shadow-xl shadow-amber-950/30 hover:scale-[1.02]",
      foilSheen:
        "bg-[linear-gradient(115deg,transparent_20%,rgba(212,175,55,0.30)_42%,rgba(255,235,160,0.15)_50%,transparent_75%)]",
      headerBadge: "bg-amber-950/80 text-amber-300 border-amber-600/50",
      accentBorder: "border-amber-500/40",
      sealBg: "bg-amber-950/60 border-amber-500 text-amber-300",
      buttonBg: "bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-950 hover:opacity-90",
      tagLabel: "ÉLITE",
    },
  }[tier];

  return (
    <div
      className={`relative flex w-full max-w-[240px] flex-col items-center justify-between rounded-2xl border p-4 transition-all duration-200 select-none ${tierStyles.wrapper} ${
        !isAvailable ? "opacity-60 saturate-50 hover:scale-100" : ""
      }`}
    >
      {/* Crimped top sealed edge simulating authentic foil packaging */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-1 left-3 right-3 h-2 border-b border-dashed border-current/30 opacity-70"
      />

      {/* Foil glossy overlay */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 rounded-2xl overflow-hidden ${tierStyles.foilSheen}`}
      />

      {/* Header with tier badge and count indicator */}
      <div className="z-10 flex w-full items-center justify-between">
        <span
          className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${tierStyles.headerBadge}`}
        >
          {tierStyles.tagLabel}
        </span>
        <div
          className="flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5 text-xs font-sans font-bold tabular-nums text-white backdrop-blur-xs"
          title={`${count} disponibles`}
        >
          <span>×</span>
          <span>{count}</span>
        </div>
      </div>

      {/* Central medallion / emblem */}
      <div className="z-10 my-4 flex flex-col items-center text-center">
        <div
          className={`relative flex h-20 w-20 items-center justify-center rounded-full border-2 shadow-inner transition-transform duration-300 group-hover:scale-105 ${tierStyles.sealBg}`}
        >
          <span className="font-sans font-black text-3xl tabular-nums">
            {config.cardCount}
          </span>
          <span className="absolute -bottom-2 rounded-full bg-neutral-900 px-2 py-0.5 text-[8px] font-bold tracking-wider text-white uppercase">
            CROMOS
          </span>
        </div>

        <h3 className="mt-4 font-sans text-base font-black tracking-tight uppercase">
          {config.name}
        </h3>
        <p className="mt-0.5 text-[11px] opacity-80 line-clamp-2 px-1 leading-snug">
          {config.description}
        </p>
      </div>

      {/* Action button */}
      <div className="z-10 mt-2 w-full">
        <button
          type="button"
          disabled={!isAvailable || isOpening}
          onClick={() => onOpen(tier)}
          aria-label={`Abrir ${config.name} (${count} disponibles)`}
          className={`w-full rounded-full py-2 px-3 text-xs font-bold tracking-wide transition-all duration-150 active:scale-95 disabled:pointer-events-none disabled:opacity-40 shadow-xs cursor-pointer ${tierStyles.buttonBg}`}
        >
          {isOpening ? "Abriendo..." : isAvailable ? "Abrir Sobre" : "Sin sobres"}
        </button>
      </div>

      {/* Crimped bottom heat-seal */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-1 left-3 right-3 h-2 border-t border-dashed border-current/30 opacity-70"
      />
    </div>
  );
}
