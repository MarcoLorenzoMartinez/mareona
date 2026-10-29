"use client"; // Client: Lista sobria y editorial de obtención de sobres y reciclaje de repetidos

import Link from "next/link";
import type { DailyMissionState } from "@/lib/cards/types";
import { DUPLICATES_RECIPE_COST } from "@/lib/cards/pack-storage";

interface PackMissionsPanelProps {
  readonly missionState: DailyMissionState;
  readonly duplicateCount: number;
  readonly onClaimLogin: () => void;
  readonly onRecycleDuplicates: () => void;
  readonly isClaimingLogin?: boolean;
  readonly isRecycling?: boolean;
}

/**
 * Editorial list of daily pack rewards conforming strictly to AGENTS.md.
 * Zero explanatory prose, no nested boxes inside boxes, clean lines and tabular numbers.
 */
export function PackMissionsPanel({
  missionState,
  duplicateCount,
  onClaimLogin,
  onRecycleDuplicates,
  isClaimingLogin = false,
  isRecycling = false,
}: PackMissionsPanelProps) {
  const canRecycle = duplicateCount >= DUPLICATES_RECIPE_COST;
  const recycleProgressPct = Math.min(
    100,
    Math.round((duplicateCount / DUPLICATES_RECIPE_COST) * 100)
  );

  return (
    <section aria-label="Cómo conseguir sobres" className="flex flex-col gap-3">
      <h2 className="font-sans text-xs font-black uppercase tracking-wider text-[var(--foreground-muted)]">
        Conseguir sobres
      </h2>

      <div className="flex flex-col divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-white overflow-hidden shadow-2xs">
        {/* Fila 1: Visita Diaria */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-[var(--foreground)]">
              Visita diaria
            </span>
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 font-sans text-[10px] font-bold text-neutral-600">
              {missionState.isMatchday ? "Sobre Rojiblanco" : "Sobre Aficionado"}
            </span>
          </div>

          <button
            type="button"
            disabled={missionState.hasClaimedDailyLogin || isClaimingLogin}
            onClick={onClaimLogin}
            className={`rounded-full px-3.5 py-1 text-xs font-bold transition-all cursor-pointer ${
              missionState.hasClaimedDailyLogin
                ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                : "bg-[#e2001a] text-white hover:bg-[#b30015] active:scale-95 shadow-2xs"
            }`}
          >
            {missionState.hasClaimedDailyLogin ? "Reclamado" : "Reclamar"}
          </button>
        </div>

        {/* Fila 2: Reto Diario de Juegos */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-[var(--foreground)]">
              Reto diario de juegos
            </span>
            <span className="rounded-full bg-red-50 px-2 py-0.5 font-sans text-[10px] font-bold text-[#e2001a]">
              Sobre Rojiblanco
            </span>
          </div>

          {missionState.hasClaimedDailyGame ? (
            <span className="rounded-full bg-neutral-100 px-3.5 py-1 font-sans text-xs font-bold text-neutral-400">
              Conseguido
            </span>
          ) : (
            <Link
              href="/juegos"
              className="rounded-full border border-[var(--border)] px-3.5 py-1 text-xs font-bold text-[var(--foreground)] hover:border-[#e2001a] hover:text-[#e2001a] transition-colors"
            >
              Jugar hoy →
            </Link>
          )}
        </div>

        {/* Fila 3: La Porra */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-[var(--foreground)]">
              La Porra de la jornada
            </span>
            <span className="rounded-full bg-amber-50 px-2 py-0.5 font-sans text-[10px] font-bold text-amber-700">
              Sobre Leyenda
            </span>
          </div>

          <Link
            href="/juegos/porra"
            className="rounded-full border border-[var(--border)] px-3.5 py-1 text-xs font-bold text-[var(--foreground)] hover:border-amber-600 hover:text-amber-700 transition-colors"
          >
            Pronosticar →
          </Link>
        </div>

        {/* Fila 4: Taco de Repetidos */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-xs sm:text-sm font-bold text-[var(--foreground)]">
              Taco de repetidos
            </span>
            <div className="flex items-center gap-2">
              <span className="font-sans text-xs font-bold tabular-nums text-neutral-500">
                {duplicateCount}/{DUPLICATES_RECIPE_COST}
              </span>
              <div className="h-1.5 w-16 sm:w-24 overflow-hidden rounded-full bg-neutral-100">
                <div
                  className="h-full bg-[#e2001a] transition-all duration-300"
                  style={{ width: `${recycleProgressPct}%` }}
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={!canRecycle || isRecycling}
            onClick={onRecycleDuplicates}
            className={`rounded-full px-3.5 py-1 text-xs font-bold transition-all cursor-pointer ${
              canRecycle
                ? "bg-[#e2001a] text-white hover:bg-[#b30015] active:scale-95 shadow-2xs"
                : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
            }`}
          >
            Canjear sobre
          </button>
        </div>
      </div>
    </section>
  );
}
