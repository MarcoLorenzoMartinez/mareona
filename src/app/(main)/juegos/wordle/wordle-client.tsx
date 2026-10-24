// Client: Renders the Sportinguista Wordle interface and coordinates game modals
'use client';

import React, { useState, useEffect } from 'react';
import type { WordleDailyWord } from '@/lib/wordle/types';
import { useWordleGame } from '@/lib/wordle/use-wordle-game';
import { WordleHeader } from './wordle-header';
import { WordleBoard } from './wordle-board';
import { WordleKeyboard } from './wordle-keyboard';
import { WordleArchiveModal } from './wordle-archive-modal';
import { WordleStatsModal } from './wordle-stats-modal';

interface WordleClientProps {
  initialChallenge: WordleDailyWord;
}

export function WordleClient({ initialChallenge }: WordleClientProps) {
  const [challenge, setChallenge] = useState<WordleDailyWord>(initialChallenge);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  const {
    gameState,
    currentGuess,
    maxAttempts,
    targetLength,
    targetWord,
    shakeRow,
    stats,
    letterStatuses,
    addLetter,
    deleteLetter,
    submitGuess,
  } = useWordleGame(challenge);

  const isGameOver = gameState.status !== 'IN_PROGRESS';
  const hasWon = gameState.status === 'WON';

  // Open stats modal automatically when game finishes
  useEffect(() => {
    if (isGameOver) {
      const timer = setTimeout(() => setIsStatsOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, [isGameOver]);

  const handleSelectHistoricalDate = (date: string) => {
    // Import dynamically or get from registry
    import('@/lib/wordle/words').then(({ getChallengeForDate }) => {
      setChallenge(getChallengeForDate(date));
    });
  };

  return (
    <div className="flex flex-col gap-4 max-w-xl mx-auto w-full">
      <WordleHeader
        challenge={challenge}
        isArchive={challenge.id !== initialChallenge.id}
        stats={stats}
        onOpenArchive={() => setIsArchiveOpen(true)}
        onOpenStats={() => setIsStatsOpen(true)}
      />

      <WordleBoard
        targetWord={targetWord}
        targetLength={targetLength}
        maxAttempts={maxAttempts}
        guesses={gameState.guesses}
        currentGuess={currentGuess}
        shakeRow={shakeRow}
      />

      <div className="mt-2">
        <WordleKeyboard
          onLetter={addLetter}
          onDelete={deleteLetter}
          onSubmit={submitGuess}
          letterStatuses={letterStatuses}
        />
      </div>

      <WordleArchiveModal
        isOpen={isArchiveOpen}
        onClose={() => setIsArchiveOpen(false)}
        selectedDate={challenge.id}
        onSelectDate={handleSelectHistoricalDate}
      />

      <WordleStatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        stats={stats}
        challenge={challenge}
        isGameOver={isGameOver}
        hasWon={hasWon}
      />
    </div>
  );
}
