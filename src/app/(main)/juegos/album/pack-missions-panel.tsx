"use client"; // Client: Lista sobria y editorial de obtención de sobres y reciclaje de repetidos

import Link from "next/link";
import type { DailyMissionState, PackTier } from "@/lib/cards/types";
import { DUPLICATES_RECIPE_COST, WEEKLY_STREAK_CYCLE, resolveStreakRewardTier } from "@/lib/cards/pack-storage";
import { MiniPack } from "@/components/cards/mini-pack";

interface PackMissionsPanelProps {
  readonly missionState: DailyMissionState;
  readonly duplicateCount: number;
  readonly onClaimLogin: () => void;
  readonly onClaimDailyGame?: () => void;
  readonly onRecycleDuplicates: () => void;
  readonly isClaimingLogin?: boolean;
  readonly isRecycling?: boolean;
}

/**
 * Editorial list of daily pack rewards with 7-day game streak tracking and duplicate recycling.
 */
export function PackMissionsPanel({
  missionState,
  duplicateCount,
  onClaimLogin,
  onClaimDailyGame,
  onRecycleDuplicates,
  isClaimingLogin = false,
  isRecycling = false,
}: PackMissionsPanelProps) {
  const canRecycle = duplicateCount >= DUPLICATES_RECIPE_COST;
  const recycleProgressPct = Math.min(100, Math.round((duplicateCount / DUPLICATES_RECIPE_COST) * 100));

  const targetStreak = missionState.hasCompletedDailyGame ? Math.max(1, missionState.gameStreak) : missionState.gameStreak + 1;
  const dailyGameTier: PackTier = resolveStreakRewardTier(targetStreak);
  const isCycleCompletedToday =
    missionState.gameStreak > 0 && missionState.gameStreak % WEEKLY_STREAK_CYCLE === 0 && missionState.hasCompletedDailyGame;
  const streakInCycle = isCycleCompletedToday ? WEEKLY_STREAK_CYCLE : missionState.gameStreak % WEEKLY_STREAK_CYCLE;
  const streakProgressPct = Math.round((streakInCycle / WEEKLY_STREAK_CYCLE) * 100);

  return (
    <section aria-label="Cómo conseguir sobres" className="flex flex-col gap-3">
      <h2 className="font-sans text-xs font-black uppercase tracking-wider text-[var(--foreground-muted)]">
        Conseguir sobres
      </h2>

      <div className="flex flex-col divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-white overflow-hidden shadow-2xs">
        {/* Fila 1: Visita Diaria */}
        <div className="flex items-center justify-between px-3.5 sm:px-4 py-2.5">
          <span className="text-xs sm:text-sm font-bold text-[var(--foreground)] min-w-0 pr-2">
            Visita diaria
          </span>

          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
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
            <MiniPack tier="aficionado" />
          </div>
        </div>

        {/* Fila 2: Reto Diario de Juegos (con racha semanal de 7 días para Sobre Leyenda) */}
        <div className="flex items-center justify-between px-3.5 sm:px-4 py-2.5">
          <div className="min-w-0 pr-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-3">
              <span className="text-xs sm:text-sm font-bold text-[var(--foreground)] whitespace-nowrap">
                Reto diario de juegos
              </span>
              <div className="flex items-center gap-1.5" title="Completa 7 días seguidos para ganar un Sobre Leyenda">
                <span className="font-sans text-[11px] sm:text-xs font-bold tabular-nums text-neutral-500">
                  {streakInCycle}/{WEEKLY_STREAK_CYCLE}d
                </span>
                <div className="h-1.5 w-14 sm:w-20 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className={`h-full transition-all duration-300 ${
                      dailyGameTier === "leyenda" ? "bg-amber-500" : "bg-[#e2001a]"
                    }`}
                    style={{ width: `${streakProgressPct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {missionState.hasClaimedDailyGame ? (
              <span className="rounded-full bg-neutral-100 px-3.5 py-1 font-sans text-xs font-bold text-neutral-400 cursor-not-allowed">
                Reclamado
              </span>
            ) : missionState.hasCompletedDailyGame ? (
              <button
                type="button"
                onClick={onClaimDailyGame}
                className="rounded-full bg-[#e2001a] px-3.5 py-1 text-xs font-bold text-white transition-all hover:bg-[#b30015] active:scale-95 shadow-2xs cursor-pointer"
              >
                Reclamar
              </button>
            ) : (
              <Link
                href="/juegos"
                className="rounded-full border border-[var(--border)] px-3.5 py-1 text-xs font-bold text-[var(--foreground)] hover:border-[#e2001a] hover:text-[#e2001a] transition-colors"
              >
                Jugar hoy →
              </Link>
            )}
            <MiniPack tier={dailyGameTier} />
          </div>
        </div>

        {/* Fila 3: La Porra */}
        <div className="flex items-center justify-between px-3.5 sm:px-4 py-2.5">
          <span className="text-xs sm:text-sm font-bold text-[var(--foreground)] min-w-0 pr-2">
            La Porra de la jornada
          </span>

          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <Link
              href="/juegos/porra"
              className="rounded-full border border-[var(--border)] px-3.5 py-1 text-xs font-bold text-[var(--foreground)] hover:border-amber-600 hover:text-amber-700 transition-colors"
            >
              Pronosticar →
            </Link>
            <MiniPack tier="leyenda" />
          </div>
        </div>

        {/* Fila 4: Taco de Repetidos */}
        <div className="flex items-center justify-between px-3.5 sm:px-4 py-2.5">
          <div className="min-w-0 pr-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-3">
              <span className="text-xs sm:text-sm font-bold text-[var(--foreground)] whitespace-nowrap">
                Taco de repetidos
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-sans text-[11px] sm:text-xs font-bold tabular-nums text-neutral-500">
                  {duplicateCount}/{DUPLICATES_RECIPE_COST}
                </span>
                <div className="h-1.5 w-14 sm:w-20 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="h-full bg-[#e2001a] transition-all duration-300"
                    style={{ width: `${recycleProgressPct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
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
              Canjear
            </button>
            <MiniPack tier="rojiblanco" />
          </div>
        </div>
      </div>
    </section>
  );
}
