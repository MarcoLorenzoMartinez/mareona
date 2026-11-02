import React from "react";
import type { TeamSeasonStatsSplit } from "@/lib/sports-api/team-season-types";

interface SplitRowProps {
  readonly title: string;
  readonly split: TeamSeasonStatsSplit;
  readonly barColor: string;
}

export function SplitRow({ title, split, barColor }: SplitRowProps) {
  const maxPoints = (split.played || 1) * 3;
  const points = split.points;
  const pct = Math.min(100, Math.round((points / maxPoints) * 100));

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[var(--foreground)]">{title}</span>
          <span className="text-[11px] font-semibold text-neutral-300">·</span>
          <span className="text-[11px] font-semibold text-[var(--foreground)] font-sans tabular-nums">
            {split.wins}V - {split.draws}E - {split.losses}D
          </span>
          <span className="text-[11px] font-semibold text-neutral-300">·</span>
          <span className="text-[11px] font-medium text-[var(--foreground-muted)] font-sans tabular-nums">
            {split.goalsFor}:{split.goalsAgainst} goles
          </span>
        </div>

        <div className="flex items-baseline gap-1.5 font-sans tabular-nums">
          <span className="text-sm font-black text-[var(--foreground)]">
            {points}{" "}
            <span className="text-xs font-semibold text-[var(--foreground-muted)]">
              de {maxPoints} pts
            </span>
          </span>
          <span className="text-xs font-bold text-[var(--foreground-muted)]">
            ({pct}%)
          </span>
        </div>
      </div>

      <div
        className="h-2 w-full overflow-hidden rounded-full bg-neutral-100"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Aprovechamiento de puntos: ${title}`}
      >
        <div
          style={{ width: `${pct}%` }}
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
        />
      </div>
    </div>
  );
}

export function TotalStackedRow({
  homeSplit,
  awaySplit,
}: {
  readonly homeSplit: TeamSeasonStatsSplit;
  readonly awaySplit: TeamSeasonStatsSplit;
}) {
  const totalPlayed = homeSplit.played + awaySplit.played;
  const totalMax = (totalPlayed || 1) * 3;
  const totalPoints = homeSplit.points + awaySplit.points;
  const totalPct = Math.min(100, Math.round((totalPoints / totalMax) * 100));

  const homePctOfMax = Math.min(100, (homeSplit.points / totalMax) * 100);
  const awayPctOfMax = Math.min(100, (awaySplit.points / totalMax) * 100);

  const totalWins = homeSplit.wins + awaySplit.wins;
  const totalDraws = homeSplit.draws + awaySplit.draws;
  const totalLosses = homeSplit.losses + awaySplit.losses;
  const totalGf = homeSplit.goalsFor + awaySplit.goalsFor;
  const totalGa = homeSplit.goalsAgainst + awaySplit.goalsAgainst;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[var(--foreground)]">Total</span>
          <span className="text-[11px] font-semibold text-neutral-300">·</span>
          <span className="text-[11px] font-semibold text-[var(--foreground)] font-sans tabular-nums">
            {totalWins}V - {totalDraws}E - {totalLosses}D
          </span>
          <span className="text-[11px] font-semibold text-neutral-300">·</span>
          <span className="text-[11px] font-medium text-[var(--foreground-muted)] font-sans tabular-nums">
            {totalGf}:{totalGa} goles
          </span>
        </div>

        <div className="flex items-baseline gap-1.5 font-sans tabular-nums">
          <span className="text-sm font-black text-[var(--foreground)]">
            {totalPoints}{" "}
            <span className="text-xs font-semibold text-[var(--foreground-muted)]">
              de {totalMax} pts
            </span>
          </span>
          <span className="text-xs font-bold text-[var(--foreground-muted)]">
            ({totalPct}%)
          </span>
        </div>
      </div>

      <div
        className="flex h-2 w-full overflow-hidden rounded-full bg-neutral-100"
        role="progressbar"
        aria-valuenow={totalPct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Aprovechamiento de puntos total desglosado en casa y fuera"
      >
        <div
          style={{ width: `${homePctOfMax}%` }}
          className="h-full bg-[#e2001a] transition-all duration-500"
          title={`En casa: ${homeSplit.points} pts`}
        />
        <div
          style={{ width: `${awayPctOfMax}%` }}
          className="h-full bg-neutral-800 transition-all duration-500"
          title={`A domicilio: ${awaySplit.points} pts`}
        />
      </div>
    </div>
  );
}
