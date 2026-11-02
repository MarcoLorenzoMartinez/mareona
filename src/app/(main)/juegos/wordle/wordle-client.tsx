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
import { useAuth } from '@/context/auth-context';
import { isDemoEmail } from '@/lib/auth/demo-credentials';

interface WordleClientProps {
  initialChallenge?: WordleDailyWord;
}

export function WordleClient({ initialChallenge }: WordleClientProps) {
  const { user } = useAuth();
  const isDemo = isDemoEmail(user?.email);

  const [challenge, setChallenge] = useState<WordleDailyWord>(() => {
    return initialChallenge || getTodayChallenge();
  });
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  const {
    gameState,
    letters,
    currentGuess,
    cursorIndex,
    setCursor,
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
        onOpenArchive={() => setIsArchiveOpen(true)}
        onOpenStats={() => setIsStatsOpen(true)}
      />

      <WordleBoard
        targetWord={targetWord}
        targetLength={targetLength}
        maxAttempts={maxAttempts}
        guesses={gameState.guesses}
        currentGuess={currentGuess}
        currentLetters={letters}
        shakeRow={shakeRow}
        cursorIndex={cursorIndex}
        onSelectCell={setCursor}
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
        onOpenArchive={() => setIsArchiveOpen(true)}
        onResetStats={isDemo ? resetAllProgress : undefined}
      />
    </div>
  );
}
