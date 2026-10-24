import React from 'react';
import type { WordleDailyWord } from '@/lib/wordle/types';
import { SPORTING_DAILY_WORDS } from '@/lib/wordle/words';

interface WordleArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDate: (date: string) => void;
  selectedDate: string;
}

export function WordleArchiveModal({
  isOpen,
  onClose,
  onSelectDate,
  selectedDate,
}: WordleArchiveModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="archive-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-2xs"
    >
      <div className="flex max-h-[85vh] w-full max-w-md flex-col rounded-2xl border border-[var(--border)] bg-white p-5 shadow-xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <h2 id="archive-title" className="text-base font-bold text-[var(--foreground)]">
            Archivo de Retos Anteriores
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100"
            aria-label="Cerrar archivo"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-3 space-y-2 pr-1">
          {SPORTING_DAILY_WORDS.map((item: WordleDailyWord) => {
            const isSelected = item.id === selectedDate;
            let statusBadge = null;
            try {
              const saved = localStorage.getItem(`mareona_wordle_state_${item.id}`);
              if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.status === 'WON') {
                  statusBadge = (
                    <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold">
                      Completado
                    </span>
                  );
                } else if (parsed.status === 'LOST') {
                  statusBadge = (
                    <span className="rounded-full bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 text-[10px] font-bold">
                      No superado
                    </span>
                  );
                }
              }
            } catch {
              // fallback
            }

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectDate(item.id);
                  onClose();
                }}
                className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition-colors ${
                  isSelected
                    ? 'border-[#e2001a] bg-[#e2001a]/5 font-bold'
                    : 'border-[var(--border)] bg-white hover:bg-[var(--surface)]'
                }`}
              >
                <div>
                  <div className="text-xs font-semibold text-[var(--foreground)]">
                    Reto {item.id}
                  </div>
                  <div className="text-[11px] text-[var(--foreground-muted)]">
                    Longitud: {item.word.length} letras
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {statusBadge}
                  <span className="text-xs font-bold text-[#e2001a]">Jugar →</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
