// Client: Subcomponente accesible de celdas de calendario y leyenda deportiva
"use client";

import type { ChallengeDayStatus } from "./game-archive-modal";
import { getDictionary } from "@/i18n";

export interface ArchiveCalendarCell {
  readonly day: number;
  readonly dateStr: string;
  readonly status: ChallengeDayStatus;
  readonly isFuture: boolean;
  readonly isPastEpoch: boolean;
}

interface GameArchiveGridProps {
  readonly cells: readonly (ArchiveCalendarCell | null)[];
  readonly selectedDate: string;
  readonly todayDate: string;
  readonly onSelectDate: (date: string) => void;
  readonly onClose: () => void;
}

export function GameArchiveGrid({
  cells,
  selectedDate,
  todayDate,
  onSelectDate,
  onClose,
}: GameArchiveGridProps) {
  const dict = getDictionary();
  return (
    <>
      <div className="grid grid-cols-7 gap-1.5 pt-1">
        {cells.map((cell, idx) => {
          if (!cell) {
            return <div key={`empty-${idx}`} className="aspect-square" />;
          }

          const { day, dateStr, status, isFuture, isPastEpoch } = cell;
          const isSelected = dateStr === selectedDate;
          const isToday = dateStr === todayDate;
          const isDisabled = isFuture || isPastEpoch;

          let cellBg = "bg-[var(--surface)] text-[var(--foreground)] hover:border-[#e2001a]";
          if (isDisabled) {
            cellBg = "bg-neutral-50 text-neutral-300 border-neutral-100 cursor-not-allowed";
          } else if (status === "WON") {
            cellBg = "bg-emerald-500 text-white font-bold border-emerald-500";
          } else if (status === "LOST") {
            cellBg = "bg-rose-500 text-white font-bold border-rose-500";
          }

          const selectionRing = isSelected ? "border-[#e2001a] ring-2 ring-[#e2001a] z-10" : "";
          const todayIndicator = isToday && !isSelected ? "font-bold underline decoration-[#e2001a] decoration-2 underline-offset-4" : "";

          return (
            <button
              key={dateStr}
              type="button"
              disabled={isDisabled}
              onClick={() => {
                onSelectDate(dateStr);
                onClose();
              }}
              className={`relative flex aspect-square flex-col items-center justify-center rounded-lg border text-xs font-semibold tabular-nums transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${cellBg} ${selectionRing} ${todayIndicator}`}
              title={isDisabled ? dict.games.archive.notAvailableTitle : `${dict.games.archive.playChallengePrefix} ${dateStr}`}
              aria-label={`${dict.games.archive.dayAriaPrefix} ${day}, ${status}${isSelected ? dict.games.archive.selectedAriaSuffix : ""}`}
            >
              <span>{day}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-3 text-[11px] text-[var(--foreground-muted)]">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span>{dict.games.archive.legendWon}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
          <span>{dict.games.archive.legendLost}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--surface)] border border-[var(--border)]" />
          <span>{dict.games.archive.legendPending}</span>
        </div>
      </div>
    </>
  );
}
