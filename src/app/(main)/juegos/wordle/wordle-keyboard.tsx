import React from 'react';
import { getDictionary } from '@/i18n';

interface WordleKeyboardProps {
  onLetter: (char: string) => void;
  onDelete: () => void;
  onSubmit: () => void;
  letterStatuses: Record<string, 'correct' | 'present' | 'absent'>;
}

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DEL'],
];

export function WordleKeyboard({
  onLetter,
  onDelete,
  onSubmit,
  letterStatuses,
}: WordleKeyboardProps) {
  const dict = getDictionary();
  const getKeyClasses = (key: string) => {
    const status = letterStatuses[key];
    const base =
      'flex items-center justify-center rounded-md font-bold text-xs sm:text-sm h-9 min-[380px]:h-10 sm:h-12 active:scale-95 transition-transform duration-100 select-none touch-manipulation';

    if (key === 'ENTER' || key === 'DEL') {
      return `${base} px-1.5 sm:px-3 text-[10px] sm:text-xs bg-zinc-200 hover:bg-zinc-300 text-zinc-800 border border-zinc-300`;
    }

    if (status === 'correct') {
      return `${base} bg-emerald-700 text-white border border-emerald-600`;
    }
    if (status === 'present') {
      return `${base} bg-amber-700 text-white border border-amber-500`;
    }
    if (status === 'absent') {
      return `${base} bg-zinc-300 text-zinc-500 border border-zinc-300 opacity-60`;
    }

    return `${base} bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-200 shadow-2xs`;
  };

  return (
    <div
      aria-label={dict.games.wordle.keyboard.aria}
      className="mx-auto flex flex-col gap-1 sm:gap-1.5 w-full max-w-[480px] p-0.5 sm:p-1"
    >
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-1 sm:gap-1.5 w-full">
          {row.map((key) => {
            const isWide = key === 'ENTER' || key === 'DEL';
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  if (key === 'ENTER') onSubmit();
                  else if (key === 'DEL') onDelete();
                  else onLetter(key);
                }}
                className={`${getKeyClasses(key)} ${isWide ? 'flex-[1.5]' : 'flex-1'}`}
                aria-label={key === 'DEL' ? dict.games.wordle.keyboard.deleteAria : key === 'ENTER' ? dict.games.wordle.keyboard.enterAria : key}
              >
                {key === 'DEL' ? '⌫' : key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
