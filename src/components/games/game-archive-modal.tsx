// Client: Shared calendar archive modal for Mareona daily challenges (Wordle, ¿Quién es?, Pregunta del Día)
"use client";

import React, { useState, useMemo } from "react";
import { useModalA11y } from "@/lib/ui/use-modal-a11y";
import { GameArchiveGrid } from "./game-archive-grid";
import { buildArchiveCalendarCells } from "./game-archive-utils";
import { getDictionary } from "@/i18n";

export type ChallengeDayStatus = "WON" | "LOST" | "UNPLAYED";

export interface GameArchiveModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly selectedDate: string;
  readonly onSelectDate: (date: string) => void;
  readonly epochDate: string;
  readonly todayDate: string;
  readonly getStatusForDate: (dateStr: string) => ChallengeDayStatus;
  readonly attemptVersion?: number;
}

export function GameArchiveModal({
  isOpen,
  onClose,
  selectedDate,
  onSelectDate,
  epochDate,
  todayDate,
  getStatusForDate,
  attemptVersion,
}: GameArchiveModalProps) {
  const dict = getDictionary();
  const [viewYear, setViewYear] = useState(() => Number(selectedDate.split("-")[0]) || 2026);
  const [viewMonth, setViewMonth] = useState(() => {
    const parsed = Number(selectedDate.split("-")[1]) - 1;
    return isNaN(parsed) ? 10 : parsed;
  });

  const { handleBackdropClick } = useModalA11y({ isOpen, onClose });

  const [epochYear, epochMonth] = useMemo(
    () => epochDate.split("-").map(Number),
    [epochDate]
  );
  const [todayYear, todayMonth] = useMemo(
    () => todayDate.split("-").map(Number),
    [todayDate]
  );

  const canPrev = viewYear > epochYear || (viewYear === epochYear && viewMonth > epochMonth - 1);
  const canNext = viewYear < todayYear || (viewYear === todayYear && viewMonth < todayMonth - 1);

  const handlePrevMonth = () => {
    if (!canPrev) return;
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (!canNext) return;
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const cells = useMemo(() => {
    if (!isOpen) return [];
    void attemptVersion;
    return buildArchiveCalendarCells({
      viewYear,
      viewMonth,
      todayDate,
      epochDate,
      getStatusForDate,
    });
  }, [isOpen, viewYear, viewMonth, todayDate, epochDate, getStatusForDate, attemptVersion]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="calendar-archive-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-2xs animate-in fade-in duration-150"
      onClick={handleBackdropClick}
    >
      <div
        className="flex w-full max-w-sm flex-col rounded-2xl border border-[var(--border)] bg-white p-5 shadow-xl animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <h2 id="calendar-archive-title" className="text-base font-bold text-[var(--foreground)]">
            {dict.games.archive.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] cursor-pointer -mr-2"
            aria-label={dict.games.archive.closeAria}
          >
            ✕
          </button>
        </div>

        {/* Month Selector Controls */}
        <div className="mt-3 flex items-center justify-between px-1">
          <span className="text-sm font-bold text-[var(--foreground)]">
            {dict.games.archive.months[viewMonth]} {viewYear}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={!canPrev}
              onClick={handlePrevMonth}
              className={`flex h-9 w-9 min-h-[40px] min-w-[40px] items-center justify-center rounded-lg border text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${
                canPrev
                  ? "border-[var(--border)] hover:bg-[var(--surface)] text-[var(--foreground)] active:scale-95 cursor-pointer"
                  : "border-neutral-100 bg-neutral-50 text-neutral-300 opacity-40 cursor-not-allowed"
              }`}
              aria-label={dict.games.archive.prevMonthAria}
            >
              ‹
            </button>
            <button
              type="button"
              disabled={!canNext}
              onClick={handleNextMonth}
              className={`flex h-9 w-9 min-h-[40px] min-w-[40px] items-center justify-center rounded-lg border text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${
                canNext
                  ? "border-[var(--border)] hover:bg-[var(--surface)] text-[var(--foreground)] active:scale-95 cursor-pointer"
                  : "border-neutral-100 bg-neutral-50 text-neutral-300 opacity-40 cursor-not-allowed"
              }`}
              aria-label={dict.games.archive.nextMonthAria}
            >
              ›
            </button>
          </div>
        </div>

        {/* Calendar Day Header */}
        <div className="mt-3 grid grid-cols-7 text-center text-[11px] font-semibold text-[var(--foreground-muted)]">
          {dict.games.archive.weekdays.map((h, i) => (
            <div key={i} className="py-1">
              {h}
            </div>
          ))}
        </div>

        {/* Calendar Day Cells & Legend */}
        <GameArchiveGrid
          cells={cells}
          selectedDate={selectedDate}
          todayDate={todayDate}
          onSelectDate={onSelectDate}
          onClose={onClose}
        />
      </div>
    </div>
  );
}
