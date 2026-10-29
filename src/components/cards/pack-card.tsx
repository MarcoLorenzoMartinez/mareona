"use client"; // Client: Sobre físico minimalista e interactivo estilo booster pack FUT

import type { PackTier } from "@/lib/cards/types";
import { PACK_TIERS } from "@/lib/cards/packs";

interface PackCardProps {
  readonly tier: PackTier;
  readonly onOpen: (tier: PackTier) => void;
  readonly isOpening?: boolean;
}

/**
 * Minimalist collectible booster pack inspired by physical panini foil packets and FUT.
 * Free of clutter, descriptions or secondary buttons: the pack itself is the interactive touchpoint.
 */
export function PackCard({ tier, onOpen, isOpening = false }: PackCardProps) {
  const config = PACK_TIERS[tier];

  const tierStyles = {
    aficionado: {
      card: "border-neutral-300 bg-white text-neutral-900 shadow-md hover:border-[#e2001a] hover:shadow-xl",
      sheen:
        "bg-[repeating-linear-gradient(90deg,transparent,transparent_12px,rgba(226,0,26,0.06)_12px,rgba(226,0,26,0.06)_24px)]",
      emblemBg: "border-neutral-300 bg-neutral-100 text-[#e2001a]",
      labelColor: "text-neutral-900",
      subLabel: "text-[#e2001a]",
      crimpColor: "border-neutral-300",
    },
    rojiblanco: {
      card: "border-[#e2001a] bg-gradient-to-b from-[#e2001a] via-[#b30015] to-[#80000e] text-white shadow-xl shadow-red-950/25 hover:shadow-2xl hover:shadow-red-900/40",
      sheen:
        "bg-[linear-gradient(120deg,transparent_20%,rgba(255,255,255,0.22)_40%,rgba(255,255,255,0.05)_55%,transparent_80%)]",
      emblemBg: "border-white/30 bg-white/15 text-white",
      labelColor: "text-white",
      subLabel: "text-white/80",
      crimpColor: "border-white/30",
    },
    leyenda: {
      card: "border-amber-500/80 bg-gradient-to-b from-neutral-950 via-neutral-900 to-black text-amber-100 shadow-xl shadow-amber-950/40 hover:shadow-2xl hover:shadow-amber-500/20",
      sheen:
        "bg-[linear-gradient(120deg,transparent_20%,rgba(212,175,55,0.30)_42%,rgba(255,235,160,0.15)_50%,transparent_75%)]",
      emblemBg: "border-amber-500/40 bg-amber-950/60 text-amber-300",
      labelColor: "text-amber-100",
      subLabel: "text-amber-400",
      crimpColor: "border-amber-500/40",
    },
  }[tier];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => !isOpening && onOpen(tier)}
      onKeyDown={(e) => {
        if (!isOpening && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onOpen(tier);
        }
      }}
      aria-label={`Abrir ${config.name}`}
      className={`group relative flex aspect-[3/4.6] w-full max-w-[190px] sm:max-w-[210px] flex-col items-center justify-between rounded-2xl border p-4 transition-all duration-200 select-none cursor-pointer hover:scale-[1.04] active:scale-95 ${tierStyles.card}`}
    >
      {/* Crimped top heat-sealed edge */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -top-1 left-3 right-3 h-2.5 border-b border-dashed ${tierStyles.crimpColor} opacity-80`}
      />

      {/* Foil glossy overlay with light sweep on hover */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 rounded-2xl overflow-hidden transition-opacity group-hover:opacity-100 ${tierStyles.sheen}`}
      />

      {/* Top branding */}
      <div className="z-10 flex w-full justify-center pt-1">
        <span className="font-sans text-[10px] font-black uppercase tracking-[0.2em] opacity-80">
          Real Sporting
        </span>
      </div>

      {/* Central iconic emblem */}
      <div className="z-10 flex flex-col items-center my-auto transition-transform duration-300 group-hover:scale-110">
        <div
          className={`flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full border shadow-inner ${tierStyles.emblemBg}`}
        >
          <span className="text-2xl sm:text-3xl" aria-hidden="true">
            {tier === "leyenda" ? "👑" : tier === "rojiblanco" ? "⚡" : "⚽"}
          </span>
        </div>

        <h3
          className={`mt-4 text-center font-sans text-sm sm:text-base font-black tracking-wider uppercase ${tierStyles.labelColor}`}
        >
          {config.name}
        </h3>
        <span
          className={`font-sans text-[9px] font-bold uppercase tracking-widest opacity-80 ${tierStyles.subLabel}`}
        >
          Colección Oficial
        </span>
      </div>

      {/* Bottom subtle prompt */}
      <div className="z-10 pb-1">
        <span className="font-sans text-[10px] font-bold uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
          Toca para abrir
        </span>
      </div>

      {/* Crimped bottom heat-sealed edge */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -bottom-1 left-3 right-3 h-2.5 border-t border-dashed ${tierStyles.crimpColor} opacity-80`}
      />
    </div>
  );
}
