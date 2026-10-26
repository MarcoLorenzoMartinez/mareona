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
      aria-labelledby="archive-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-2xs animate-in fade-in duration-150"
    >
      <div className="flex w-full max-w-sm flex-col rounded-2xl border border-[var(--border)] bg-white p-6 shadow-xl animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <h2 id="archive-modal-title" className="text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">
            Archivo de retos
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--foreground-muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
            aria-label="Cerrar archivo"
          >
            ✕
          </button>
        </div>

        {/* Selector de Mes */}
        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="rounded-lg p-1.5 text-xs font-bold text-[var(--foreground)] hover:bg-[var(--surface)]"
            aria-label="Mes anterior"
          >
            ◀
          </button>
          <span className="text-xs font-bold text-[var(--foreground)]">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </span>
          <button
            type="button"
            onClick={handleNextMonth}
            className="rounded-lg p-1.5 text-xs font-bold text-[var(--foreground)] hover:bg-[var(--surface)]"
            aria-label="Mes siguiente"
          >
            ▶
          </button>
        </div>

        {/* Cabecera días */}
        <div className="mt-3 grid grid-cols-7 gap-1 text-center">
          {WEEKDAY_HEADERS.map((h) => (
            <span key={h} className="text-[10px] font-bold text-[var(--foreground-muted)]">
              {h}
            </span>
          ))}
        </div>

        {/* Matriz de días */}
        <div className="mt-2 grid grid-cols-7 gap-1">
          {cells.map((cell, idx) => {
            if (!cell) return <div key={`empty-${idx}`} className="h-8" />;
            const isDisabled = cell.isFuture || cell.isPastEpoch;
            return (
              <button
                key={cell.dateStr}
                type="button"
                disabled={isDisabled}
                onClick={() => {
                  onSelectDate(cell.dateStr);
                  onClose();
                }}
                className={`flex h-8 items-center justify-center rounded-lg text-xs font-bold transition-all ${
                  cell.isSelected
                    ? 'bg-[#e2001a] text-white shadow-2xs'
                    : isDisabled
                    ? 'text-neutral-300 cursor-not-allowed'
                    : 'text-[var(--foreground)] hover:bg-[var(--surface)] active:scale-95'
                }`}
              >
                {cell.day}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
