// Client: Shared calendar archive modal for Mareona daily challenges (Wordle, ¿Quién es?, Pregunta del Día)
'use client';

import React, { useState, useMemo } from 'react';

export type ChallengeDayStatus = 'WON' | 'LOST' | 'UNPLAYED';

export interface GameArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  epochDate: string;
  todayDate: string;
  getStatusForDate: (dateStr: string) => ChallengeDayStatus;
  attemptVersion?: number;
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const WEEKDAY_HEADERS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

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
  const [viewYear, setViewYear] = useState(() => Number(selectedDate.split('-')[0]) || 2026);
  const [viewMonth, setViewMonth] = useState(() => Number(selectedDate.split('-')[1]) - 1 || 9);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Recalculate cells whenever view changes, modal opens or attempt updates
  const cells = useMemo(() => {
    if (!isOpen) return [];

    const firstDayOfMonth = new Date(Date.UTC(viewYear, viewMonth, 1));
    const dayOfWeek = (firstDayOfMonth.getUTCDay() + 6) % 7;
    const totalDays = new Date(Date.UTC(viewYear, viewMonth + 1, 0)).getUTCDate();

    const result = [];
    for (let i = 0; i < dayOfWeek; i++) result.push(null);

    for (let day = 1; day <= totalDays; day++) {
      const monthPadded = String(viewMonth + 1).padStart(2, '0');
      const dayPadded = String(day).padStart(2, '0');
      const dateStr = `${viewYear}-${monthPadded}-${dayPadded}`;
      const isFuture = dateStr > todayDate;
      const isPastEpoch = dateStr < epochDate;

      let status: ChallengeDayStatus = 'UNPLAYED';
      if (!isFuture && !isPastEpoch) {
        status = getStatusForDate(dateStr);
      }

      result.push({
        day,
        dateStr,
        status,
        isFuture,
        isPastEpoch,
      });
    }

    return result;
  }, [isOpen, viewYear, viewMonth, todayDate, epochDate, getStatusForDate, attemptVersion]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="calendar-archive-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-2xs animate-in fade-in duration-150"
    >
      <div className="flex w-full max-w-sm flex-col rounded-2xl border border-[var(--border)] bg-white p-5 shadow-xl animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <h2 id="calendar-archive-title" className="text-base font-bold text-[var(--foreground)]">
            Calendario de Retos
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 transition-colors"
            aria-label="Cerrar calendario"
          >
            ✕
          </button>
        </div>

        {/* Month Selector Controls */}
        <div className="mt-3 flex items-center justify-between px-1">
          <span className="text-sm font-bold text-[var(--foreground)]">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--border)] text-xs font-bold hover:bg-[var(--surface)] text-[var(--foreground)]"
              aria-label="Mes anterior"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--border)] text-xs font-bold hover:bg-[var(--surface)] text-[var(--foreground)]"
              aria-label="Mes siguiente"
            >
              ›
            </button>
          </div>
        </div>

        {/* Calendar Day Header */}
        <div className="mt-3 grid grid-cols-7 text-center text-[11px] font-semibold text-[var(--foreground-muted)]">
          {WEEKDAY_HEADERS.map((h, i) => (
            <div key={i} className="py-1">
              {h}
            </div>
          ))}
        </div>

        {/* Calendar Day Cells */}
        <div className="grid grid-cols-7 gap-1.5 pt-1">
          {cells.map((cell, idx) => {
            if (!cell) {
              return <div key={`empty-${idx}`} className="aspect-square" />;
            }

            const { day, dateStr, status, isFuture, isPastEpoch } = cell;
            const isSelected = dateStr === selectedDate;
            const isToday = dateStr === todayDate;
            const isDisabled = isFuture || isPastEpoch;

            let cellBg = 'bg-[var(--surface)] text-[var(--foreground)] hover:border-[#e2001a]';
            if (isDisabled) {
              cellBg = 'bg-neutral-50 text-neutral-300 border-neutral-100 cursor-not-allowed';
            } else if (status === 'WON') {
              cellBg = 'bg-emerald-500 text-white font-bold border-emerald-500';
            } else if (status === 'LOST') {
              cellBg = 'bg-rose-500 text-white font-bold border-rose-500';
            }

            const selectionRing = isSelected ? 'border-[#e2001a] ring-2 ring-[#e2001a] z-10' : '';
            const todayIndicator = isToday && !isSelected ? 'font-bold underline decoration-[#e2001a] decoration-2 underline-offset-4' : '';

            return (
              <button
                key={dateStr}
                type="button"
                disabled={isDisabled}
                onClick={() => {
                  onSelectDate(dateStr);
                  onClose();
                }}
                className={`relative flex aspect-square flex-col items-center justify-center rounded-lg border text-xs font-semibold tabular-nums transition-all ${cellBg} ${selectionRing} ${todayIndicator}`}
                title={isDisabled ? 'No disponible' : `Jugar reto del ${dateStr}`}
                aria-label={`Día ${day}, ${status}${isSelected ? ', seleccionado' : ''}`}
              >
                <span>{day}</span>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-3 text-[11px] text-[var(--foreground-muted)]">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span>Superado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
            <span>Fallado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--surface)] border border-[var(--border)]" />
            <span>Pendiente</span>
          </div>
        </div>
      </div>
    </div>
  );
}
