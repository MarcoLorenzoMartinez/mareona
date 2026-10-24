import React from 'react';
import { WordleTile } from './wordle-tile';
import { evaluateGuess } from '@/lib/wordle/engine';

interface WordleBoardProps {
  targetWord: string;
  targetLength: number;
  maxAttempts: number;
  guesses: string[];
  currentGuess: string;
  shakeRow: boolean;
}

export function WordleBoard({
  targetWord,
  targetLength,
  maxAttempts,
  guesses,
  currentGuess,
  shakeRow,
}: WordleBoardProps) {
  const rows = Array.from({ length: maxAttempts });

  return (
    <div
      role="grid"
      aria-label="Tablero de Wordle"
      className="mx-auto flex flex-col items-center gap-1.5 sm:gap-2 w-full py-2"
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
            char: currentGuess[colIndex] || '',
          }));
        } else {
          letters = Array.from({ length: targetLength }).map(() => ({ char: '' }));
        }

        const isShaking = isCurrentRow && shakeRow;

        return (
          <div
            key={rowIndex}
            role="row"
            className={`flex justify-center gap-1.5 transition-transform ${isShaking ? 'animate-bounce' : ''}`}
          >
            {letters.map((cell, colIndex) => (
              <WordleTile
                key={colIndex}
                letter={cell.char}
                status={cell.status}
                isRevealing={Boolean(submittedGuess)}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
