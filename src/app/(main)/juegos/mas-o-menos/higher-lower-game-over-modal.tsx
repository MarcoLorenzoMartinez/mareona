// Client: Modal de fin de partida accesible para Más o Menor con resumen de racha
"use client";

import React from "react";
import Link from "next/link";
import type { HigherLowerMode } from "@/lib/higher-lower/types";
import { useModalA11y } from "@/lib/ui/use-modal-a11y";
import { getDictionary } from "@/i18n";

interface HigherLowerGameOverModalProps {
  readonly isOpen: boolean;
  readonly score: number;
  readonly bestScore: number;
  readonly mode: HigherLowerMode;
  readonly onPlayAgain: () => void;
}

export function HigherLowerGameOverModal({
  isOpen,
  score,
  bestScore,
  mode,
  onPlayAgain,
}: HigherLowerGameOverModalProps) {
  const dict = getDictionary();
  const { handleBackdropClick } = useModalA11y({
    isOpen,
    onClose: onPlayAgain,
    closeOnEscape: true,
  });

  if (!isOpen) return null;

  const modeLabel =
    mode === "goals"
      ? dict.games.higherLower.gameOver.modes.goals
      : mode === "minutes"
      ? dict.games.higherLower.gameOver.modes.minutes
      : dict.games.higherLower.gameOver.modes.matches;
  const isNewRecord = score > 0 && score >= bestScore;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="gameover-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-2xs animate-in fade-in duration-150"
      onClick={handleBackdropClick}
    >
      <div
        className="flex w-full max-w-sm flex-col items-center rounded-2xl border border-neutral-200 bg-white p-7 text-center shadow-xl animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera: Modo en tamaño destacado */}
        <span className="text-[11px] font-bold tracking-widest text-[#e2001a] uppercase">
          {isNewRecord ? dict.games.higherLower.gameOver.newRecord : dict.games.higherLower.gameOver.gameModeEyebrow}
        </span>

        <h2 id="gameover-title" className="mt-1 text-2xl font-black text-neutral-900 tracking-tight">
          {modeLabel}
        </h2>

        {/* Resumen de Racha */}
        <div className="mt-6 grid grid-cols-[1fr_auto_1fr] w-full items-center border-y border-neutral-100 py-4">
          <div className="flex flex-col items-center justify-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              {dict.games.higherLower.gameOver.streakLabel}
            </span>
            <span className="mt-0.5 text-3xl font-black tabular-nums text-[#e2001a]">
              {score}
            </span>
          </div>

          <div className="h-8 w-[1px] bg-neutral-200" aria-hidden="true" />

          <div className="flex flex-col items-center justify-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              {dict.games.higherLower.gameOver.bestStreakLabel}
            </span>
            <span className="mt-0.5 text-3xl font-black tabular-nums text-neutral-900">
              {bestScore}
            </span>
          </div>
        </div>

        {/* Botones de acción con foco accesible */}
        <div className="mt-6 grid grid-cols-2 gap-3 w-full">
          <Link
            href="/juegos"
            className="flex h-12 items-center justify-center rounded-xl border border-neutral-300 bg-white px-3 text-xs sm:text-sm font-bold text-neutral-600 shadow-2xs hover:bg-neutral-50 hover:text-neutral-900 active:scale-[0.97] transition-all select-none text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          >
            {dict.games.higherLower.gameOver.backToGames}
          </Link>

          <button
            type="button"
            onClick={onPlayAgain}
            className="flex h-12 items-center justify-center rounded-xl bg-gradient-to-b from-[#e2001a] to-[#c70017] px-3 text-xs sm:text-sm font-extrabold text-white shadow-md hover:from-[#c70017] hover:to-[#a80013] hover:shadow-lg active:scale-[0.97] transition-all select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] cursor-pointer"
          >
            {dict.games.higherLower.gameOver.playAgain}
          </button>
        </div>
      </div>
    </div>
  );
}
