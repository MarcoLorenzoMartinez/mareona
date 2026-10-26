// Client: Archive modal for Who Are Ya daily challenges with calendar picker
'use client';

import React, { useState, useMemo } from 'react';
import { WHO_ARE_YA_EPOCH_DATE, getTodayDateStr } from '@/lib/who-are-ya/daily';

interface WhoAreYaArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const WEEKDAY_HEADERS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export function WhoAreYaArchiveModal({
  isOpen,
  onClose,
  selectedDate,
  onSelectDate,
}: WhoAreYaArchiveModalProps) {
  const todayIso = useMemo(() => getTodayDateStr(), []);
  const [viewYear, setViewYear] = useState(() => Number(selectedDate.split('-')[0]) || 2026);
  const [viewMonth, setViewMonth] = useState(() => Number(selectedDate.split('-')[1]) - 1 || 9);

  if (!isOpen) return null;

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

  const firstDayOfMonth = new Date(Date.UTC(viewYear, viewMonth, 1));
  const dayOfWeek = (firstDayOfMonth.getUTCDay() + 6) % 7;
  const totalDays = new Date(Date.UTC(viewYear, viewMonth + 1, 0)).getUTCDate();

  const cells: ({ day: number; dateStr: string; isFuture: boolean; isPastEpoch: boolean; isSelected: boolean } | null)[] = [];
  for (let i = 0; i < dayOfWeek; i++) cells.push(null);

  for (let day = 1; day <= totalDays; day++) {
    const monthPadded = String(viewMonth + 1).padStart(2, '0');
    const dayPadded = String(day).padStart(2, '0');
    const dateStr = `${viewYear}-${monthPadded}-${dayPadded}`;
    cells.push({
      day,
      dateStr,
      isFuture: dateStr > todayIso,
      isPastEpoch: dateStr < WHO_ARE_YA_EPOCH_DATE,
      isSelected: dateStr === selectedDate,
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="calendar-archive-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-2xs animate-in fade-in duration-150"
    >
      <div className="flex w-full max-w-sm flex-col rounded-2xl border border-[var(--border)] bg-white p-5 shadow-xl animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <h2 id="calendar-archive-title" className="text-base font-bold text-[var(--foreground)]">
            Calendario de Retos
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100"
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
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--border)] text-xs font-bold hover:bg-[var(--surface)] text-[var(--foreground)] transition-colors"
              aria-label="Mes anterior"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--border)] text-xs font-bold hover:bg-[var(--surface)] text-[var(--foreground)] transition-colors"
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

            const { day, dateStr, isFuture, isPastEpoch, isSelected } = cell;
            const isToday = dateStr === todayIso;
            const isDisabled = isFuture || isPastEpoch;

            let cellBg = 'bg-[var(--surface)] text-[var(--foreground)] hover:border-[#e2001a]';
            if (isDisabled) {
              cellBg = 'bg-zinc-50 text-zinc-300 border-zinc-100 cursor-not-allowed';
            } else if (isSelected) {
              cellBg = 'bg-[#e2001a] text-white font-bold border-[#e2001a]';
            }

            return (
              <button
                key={dateStr}
                type="button"
                disabled={isDisabled}
                onClick={() => {
                  onSelectDate(dateStr);
                  onClose();
                }}
                className={`relative flex aspect-square flex-col items-center justify-center rounded-lg border text-xs font-semibold tabular-nums transition-all ${cellBg} ${
                  isToday && !isSelected ? 'ring-2 ring-[#e2001a]/40 font-bold' : ''
                }`}
                title={isDisabled ? 'No disponible' : `Jugar reto del ${dateStr}`}
                aria-label={`Día ${day}`}
              >
                <span>{day}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
