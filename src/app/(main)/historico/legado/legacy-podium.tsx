// Client: Podio de los 3 futbolistas más destacados en cada récord
"use client";

import type { LegacyPlayerRecord } from "@/lib/historical/legacy-types";
import { PlayerPhoto } from "@/components/media/player-photo";

interface LegacyPodiumProps {
  readonly topPlayers: readonly LegacyPlayerRecord[];
  readonly metricLabel: string;
  readonly getMetricValue: (p: LegacyPlayerRecord) => string | number;
}

const PODIUM_ORDER = [1, 0, 2] as const; // 2nd, 1st, 3rd for visual height layout

export function LegacyPodium({ topPlayers, metricLabel, getMetricValue }: LegacyPodiumProps) {
  if (topPlayers.length < 3) return null;

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end pt-4 pb-2">
      {PODIUM_ORDER.map((idx) => {
        const player = topPlayers[idx];
        if (!player) return null;

        const isFirst = idx === 0;
        const rankNumber = idx + 1;

        return (
          <div
            key={player.name}
            className={`flex flex-col items-center text-center rounded-xl border bg-white p-3 sm:p-4 shadow-2xs transition-all ${
              isFirst
                ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/10 -translate-y-2 sm:-translate-y-3"
                : "border-[var(--border)]"
            }`}
          >
            {/* Rank badge */}
            <span
              className={`inline-flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full text-xs font-black font-sans tabular-nums shadow-2xs mb-2 ${
                isFirst
                  ? "bg-[var(--primary)] text-white"
                  : "bg-neutral-100 text-neutral-800 border border-neutral-200"
              }`}
            >
              {rankNumber}º
            </span>

            {/* Photo */}
            <div className="overflow-hidden rounded-full border-2 border-white shadow-xs">
              <PlayerPhoto
                photoUrl={player.photoUrl}
                playerName={player.name}
                size="md"
                className="h-14 w-14 sm:h-16 sm:w-16 object-cover object-top"
              />
            </div>

            {/* Name & Position */}
            <h4 className="mt-2 text-xs sm:text-sm font-bold text-[var(--foreground)] truncate max-w-full">
              {player.name}
            </h4>
            <span className="text-[10px] text-[var(--muted-foreground)] truncate">
              {player.position}
            </span>

            {/* Big Metric */}
            <div className="mt-2 flex flex-col items-center">
              <span className="text-lg sm:text-2xl font-black text-neutral-900 font-sans tabular-nums">
                {getMetricValue(player)}
              </span>
              <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
                {metricLabel}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
