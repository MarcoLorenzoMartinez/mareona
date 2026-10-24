// Client: Renders the Sportinguista Wordle interface and coordinates game modals
'use client';

import React, { useState, useEffect } from 'react';
import type { WordleDailyWord } from '@/lib/wordle/types';
import { getTodayChallenge, getChallengeForDate } from '@/lib/wordle/words';
import { useWordleGame } from '@/lib/wordle/use-wordle-game';
import { WordleHeader } from './wordle-header';
import { WordleBoard } from './wordle-board';
import { WordleKeyboard } from './wordle-keyboard';
import { WordleArchiveModal } from './wordle-archive-modal';
import { WordleStatsModal } from './wordle-stats-modal';

interface WordleClientProps {
  initialChallenge?: WordleDailyWord;
}

const DEFAULT_CHALLENGE: WordleDailyWord = {
  id: '2026-10-01',
  word: 'MAJO',
  trivia: 'Majo, emblemático jugador sportinguista de las primeras décadas del club en El Molinón.',
};

export function WordleClient({ initialChallenge }: WordleClientProps) {
  const [challenge, setChallenge] = useState<WordleDailyWord>(() => {
    if (initialChallenge) return initialChallenge;
    // Client-side initialization fallback
    if (typeof window !== 'undefined') {
      return getTodayChallenge();
    }
    return DEFAULT_CHALLENGE;
  });
  const [todayId] = useState<string>(() => {
    if (initialChallenge) return initialChallenge.id;
    if (typeof window !== 'undefined') {
      return getTodayChallenge().id;
    }
    return '2026-10-01';
  });
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
    resetAllProgress,
    justFinished,
  } = useWordleGame(challenge);

  const isGameOver = gameState.status !== 'IN_PROGRESS';
  const hasWon = gameState.status === 'WON';

  // Open stats modal automatically ONLY when the user finishes a game in the current session
  useEffect(() => {
    if (justFinished) {
      const timer = setTimeout(() => setIsStatsOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, [justFinished]);

  const handleSelectHistoricalDate = (date: string) => {
    setChallenge(getChallengeForDate(date));
  };

  return (
    <div className="flex flex-col gap-4 max-w-xl mx-auto w-full">
      <WordleHeader
        challenge={challenge}
        isArchive={challenge.id !== todayId}
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
        onResetStats={resetAllProgress}
      />
    </div>
  );
}
