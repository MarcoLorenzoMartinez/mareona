import React from 'react';
import { WordleTile } from './wordle-tile';
import { evaluateGuess } from '@/lib/wordle/engine';

interface WordleBoardProps {
  targetWord: string;
  targetLength: number;
  maxAttempts: number;
  guesses: string[];
  currentGuess?: string;
  currentLetters?: readonly string[];
  shakeRow: boolean;
  cursorIndex?: number | null;
  onSelectCell?: (index: number) => void;
}

export function WordleBoard({
  targetWord,
  targetLength,
  maxAttempts,
  guesses,
  currentGuess = '',
  currentLetters,
  shakeRow,
  cursorIndex = null,
  onSelectCell,
}: WordleBoardProps) {
  const rows = Array.from({ length: maxAttempts });

  const maxBoardWidthClass =
    targetLength <= 4
      ? 'max-w-[240px] sm:max-w-[280px]'
      : targetLength === 5
      ? 'max-w-[280px] sm:max-w-[330px]'
      : targetLength === 6
      ? 'max-w-[310px] sm:max-w-[370px]'
      : targetLength === 7
      ? 'max-w-[330px] sm:max-w-[400px]'
      : targetLength === 8
      ? 'max-w-[350px] sm:max-w-[430px]'
      : 'max-w-[360px] sm:max-w-[480px]';

  const gapClass = targetLength <= 6 ? 'gap-1.5 sm:gap-2' : 'gap-1 sm:gap-1.5';

  return (
    <div
      role="grid"
      aria-label="Tablero de Wordle"
      className={`mx-auto flex flex-col items-center ${gapClass} w-full ${maxBoardWidthClass} px-2 sm:px-0 py-1 sm:py-2 select-none`}
    >
      {rows.map((_, rowIndex) => {
        const isCurrentRow = rowIndex === guesses.length;
        const submittedGuess = guesses[rowIndex];

        let letters: { char: string; status?: 'correct' | 'present' | 'absent' }[] = [];

        if (submittedGuess) {
          const evaluated = evaluateGuess(submittedGuess, targetWord);
          letters = evaluated;
        } else if (isCurrentRow) {
          letters = Array.from({ length: targetLength }).map((_, colIndex) => ({
            char: currentLetters ? (currentLetters[colIndex] || '') : (currentGuess[colIndex] || ''),
          }));
        } else {
          letters = Array.from({ length: targetLength }).map(() => ({ char: '' }));
        }

        const isShaking = isCurrentRow && shakeRow;

        return (
          <div
            key={rowIndex}
            role="row"
            className={`grid w-full ${gapClass} transition-transform ${isShaking ? 'animate-card-shake' : ''}`}
            style={{
              gridTemplateColumns: `repeat(${targetLength}, minmax(0, 1fr))`,
            }}
          >
            {letters.map((cell, colIndex) => (
              <WordleTile
                key={colIndex}
                letter={cell.char}
                status={cell.status}
                isRevealing={Boolean(submittedGuess)}
                isCurrentRow={isCurrentRow}
                isActiveCursor={isCurrentRow && colIndex === cursorIndex}
                targetLength={targetLength}
                onClick={isCurrentRow && onSelectCell ? () => onSelectCell(colIndex) : undefined}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
