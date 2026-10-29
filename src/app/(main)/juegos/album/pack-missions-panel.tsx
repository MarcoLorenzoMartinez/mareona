"use client"; // Client: Panel de misiones de aficionado, reciclaje de repetidos y recompensas

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
 * Missions and duplicate recycling panel for Mareona album collectors.
 * Explains clearly how to earn each tier and allows 1-click claiming.
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
    <section
      aria-label="Objetivos y Recompensas de la Colección"
      className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-white p-5 shadow-2xs"
    >
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
        <div>
          <h2 className="text-base font-bold text-[var(--foreground)]">
            Objetivos y Recompensas
          </h2>
          <p className="text-xs text-[var(--foreground-muted)]">
            Consigue sobres diarios cumpliendo retos del club y reciclando repetidos.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Misión 1: Login Diario */}
        <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-neutral-50/60 p-3.5">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[var(--foreground)]">Fidelidad Rojiblanca</span>
              <span className="rounded-full bg-neutral-200/80 px-2 py-0.2 text-[9px] font-bold uppercase tracking-wider text-neutral-700">
                Diario
              </span>
            </div>
            <p className="text-xs text-[var(--foreground-muted)]">
              {missionState.isMatchday
                ? "¡Día de partido! Reclama tu Sobre Rojiblanco."
                : "Entra cada día y llévate 1 Sobre Aficionado."}
            </p>
          </div>

          <button
            type="button"
            disabled={missionState.hasClaimedDailyLogin || isClaimingLogin}
            onClick={onClaimLogin}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              missionState.hasClaimedDailyLogin
                ? "bg-neutral-200 text-neutral-500 cursor-not-allowed"
                : "bg-[#e2001a] text-white hover:bg-[#b30015] active:scale-95 shadow-2xs"
            }`}
          >
            {missionState.hasClaimedDailyLogin ? "Reclamado" : "Reclamar"}
          </button>
        </div>

        {/* Misión 2: Reto Diario de Juegos */}
        <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-neutral-50/60 p-3.5">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[var(--foreground)]">Reto Diario de Juegos</span>
              <span className="rounded-full bg-red-100 px-2 py-0.2 text-[9px] font-bold uppercase tracking-wider text-[#e2001a]">
                1 al día
              </span>
            </div>
            <p className="text-xs text-[var(--foreground-muted)]">
              Supera el Wordle o cualquier juego de hoy para ganar 1 Sobre Rojiblanco.
            </p>
          </div>

          {missionState.hasClaimedDailyGame ? (
            <span className="shrink-0 rounded-full bg-neutral-200 px-3.5 py-1.5 text-xs font-bold text-neutral-500">
              Conseguido
            </span>
          ) : (
            <Link
              href="/juegos"
              className="shrink-0 rounded-full border border-[var(--border)] bg-white px-3.5 py-1.5 text-xs font-bold text-[var(--foreground)] hover:border-[#e2001a] hover:text-[#e2001a] transition-colors"
            >
              Jugar hoy
            </Link>
          )}
        </div>

        {/* Misión 3: La Porra */}
        <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-neutral-50/60 p-3.5">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[var(--foreground)]">La Porra de la Jornada</span>
              <span className="rounded-full bg-amber-100 px-2 py-0.2 text-[9px] font-bold uppercase tracking-wider text-amber-900">
                Élite
              </span>
            </div>
            <p className="text-xs text-[var(--foreground-muted)]">
              Acierta el marcador exacto del Sporting y gana 1 Sobre Leyenda.
            </p>
          </div>

          <Link
            href="/juegos/porra"
            className="shrink-0 rounded-full border border-[var(--border)] bg-white px-3.5 py-1.5 text-xs font-bold text-[var(--foreground)] hover:border-amber-600 hover:text-amber-700 transition-colors"
          >
            Pronosticar
          </Link>
        </div>

        {/* Misión 4: Taco de Repetidos (Reciclaje 10 a 1) */}
        <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-neutral-50/60 p-3.5">
          <div className="flex flex-col gap-1.5 flex-1 pr-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[var(--foreground)]">Taco de Repes</span>
              <span className="text-xs font-sans font-bold tabular-nums text-neutral-600">
                {duplicateCount} / {DUPLICATES_RECIPE_COST}
              </span>
            </div>
            <div className="h-1.5 w-full max-w-[200px] overflow-hidden rounded-full bg-neutral-200">
              <div
                className="h-full bg-[#e2001a] transition-all duration-300"
                style={{ width: `${recycleProgressPct}%` }}
              />
            </div>
          </div>

          <button
            type="button"
            disabled={!canRecycle || isRecycling}
            onClick={onRecycleDuplicates}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              canRecycle
                ? "bg-[#e2001a] text-white hover:bg-[#b30015] active:scale-95 shadow-2xs"
                : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
            }`}
          >
            {canRecycle ? "Canjear Sobre" : "10 repes"}
          </button>
        </div>
      </div>
    </section>
  );
}
