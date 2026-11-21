// Client: Interactive game client for "La pregunta del día" with archive modal and history support
'use client';

import { useState, useEffect } from 'react';
import type { TriviaDailyChallenge, TriviaPlayerAttempt, TriviaStats } from '@/lib/trivia/types';
import { evaluateTriviaAnswer, getTriviaForDate } from '@/lib/trivia/engine';
import {
  getStoredTriviaAttempt,
  saveTriviaAttempt,
  getStoredTriviaStats,
  INITIAL_TRIVIA_STATS,
  updateTriviaStatsOnFinish,
} from '@/lib/trivia/storage';
import { useAuth } from '@/context/auth-context';
import { enqueueGameResult } from '@/lib/games/offline-sync-queue';
import { TriviaHeader } from './trivia-header';
import { TriviaInputHandler } from './trivia-input-handler';
import { TriviaResultModal } from './trivia-result-modal';
import { TriviaArchiveModal } from './trivia-archive-modal';
import { TriviaArenaBackground } from './trivia-arena-background';
import { TriviaSolvedCard } from './trivia-solved-card';
import { getDictionary } from '@/i18n';

interface TriviaClientProps {
  challenge: TriviaDailyChallenge;
}

export function TriviaClient({ challenge: initialChallenge }: TriviaClientProps) {
  const dict = getDictionary();
  const { user } = useAuth();
  const [activeDate, setActiveDate] = useState<string>(initialChallenge.dateStr);
  const [challenge, setChallenge] = useState<TriviaDailyChallenge>(initialChallenge);
  const [attempt, setAttempt] = useState<TriviaPlayerAttempt | null>(null);
  const [stats, setStats] = useState<TriviaStats>(INITIAL_TRIVIA_STATS);

  useEffect(() => {
    const refreshFromStorage = () => {
      setAttempt(getStoredTriviaAttempt(activeDate));
      setStats(getStoredTriviaStats());
    };
    queueMicrotask(refreshFromStorage);
    window.addEventListener('mareona_account_state_synced', refreshFromStorage);
    return () => window.removeEventListener('mareona_account_state_synced', refreshFromStorage);
  }, [activeDate]);
  const [inputVal, setInputVal] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isAnswered = attempt !== null;

  const handleSelectDate = (date: string) => {
    setActiveDate(date);
    const nextChallenge = getTriviaForDate(date);
    setChallenge(nextChallenge);
    setAttempt(getStoredTriviaAttempt(date));
    setInputVal('');
    setErrorMsg('');
  };

  function handleSubmit(overrideAnswer?: string) {
    if (isAnswered) return;
    const finalAnswer = (overrideAnswer ?? inputVal).trim();
    if (!finalAnswer) {
      setErrorMsg(dict.games.trivia.emptyAnswerError);
      return;
    }
    setErrorMsg('');

    const isCorrect = evaluateTriviaAnswer(finalAnswer, challenge.question);
    const newAttempt: TriviaPlayerAttempt = {
      dateStr: challenge.dateStr,
      questionId: challenge.question.id,
      userAnswer: finalAnswer,
      isCorrect,
      answeredAt: new Date().toISOString(),
    };

    saveTriviaAttempt(newAttempt);
    setAttempt(newAttempt);
    const updatedStats = updateTriviaStatsOnFinish(isCorrect, challenge.dateStr);
    setStats(updatedStats);
    try {
      enqueueGameResult({
        gameType: 'trivia',
        challengeDate: challenge.dateStr,
        won: isCorrect,
        completedAt: newAttempt.answeredAt,
        userId: user?.id,
      });
    } catch {
      // Offline queue allocation fallback
    }
    setIsModalOpen(true);
  }

  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto w-full">
      <TriviaHeader
        onOpenArchive={() => setIsArchiveOpen(true)}
        onOpenStats={() => setIsModalOpen(true)}
      />

      {/* Main Question Arena Card with El Molinón Backdrop */}
      <div className="relative flex flex-col justify-between rounded-3xl border border-neutral-200/90 bg-white/90 p-7 sm:p-9 shadow-xs backdrop-blur-xs">
        <TriviaArenaBackground />

        <div>
          <h2 className="text-lg sm:text-xl font-bold leading-relaxed text-neutral-900">
            {challenge.question.question}
          </h2>
        </div>

        {!isAnswered ? (
          <div className="mt-8 flex flex-col gap-4">
            <TriviaInputHandler
              question={challenge.question}
              value={inputVal}
              onChange={setInputVal}
              disabled={isAnswered}
              onSubmit={handleSubmit}
            />

            {errorMsg && (
              <p className="text-xs font-semibold text-[#e2001a]">{errorMsg}</p>
            )}

            <button
              type="button"
              onClick={() => handleSubmit()}
              className="mt-2 flex h-12 w-full items-center justify-center rounded-xl bg-[#e2001a] px-4 text-xs sm:text-sm font-bold text-white shadow-2xs hover:bg-[#b30015] active:scale-[0.99] transition-all select-none"
            >
              {dict.games.trivia.confirmAnswerButton}
            </button>
          </div>
        ) : (
          <TriviaSolvedCard
            isCorrect={attempt.isCorrect}
            userAnswer={attempt.userAnswer}
            canonicalAnswer={challenge.question.canonicalAnswer}
            explanation={challenge.question.explanation}
            photoUrl={challenge.question.photoUrl}
            onOpenStats={() => setIsModalOpen(true)}
          />
        )}
      </div>

      {/* Archive Calendar Modal */}
      <TriviaArchiveModal
        isOpen={isArchiveOpen}
        onClose={() => setIsArchiveOpen(false)}
        selectedDate={activeDate}
        onSelectDate={handleSelectDate}
        attemptVersion={stats.played}
      />

      {/* Unified Results Modal aligned with Wordle and Más o Menos */}
      <TriviaResultModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        stats={stats}
        challenge={challenge}
        attempt={attempt}
        onOpenArchive={() => setIsArchiveOpen(true)}
      />
    </div>
  );
}
