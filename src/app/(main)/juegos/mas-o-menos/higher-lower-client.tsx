// Client: Orquestador interactivo del juego Más o Menor
'use client';

import React, { useState, useCallback, useTransition, useEffect } from 'react';
import type { HigherLowerMode, HigherLowerPlayer, HigherLowerGuess, HigherLowerStats } from '@/lib/higher-lower/types';
import {
  getEligiblePlayers,
  pickRandomPlayer,
  evaluateHigherLower,
} from '@/lib/higher-lower/engine';
import {
  getStoredHigherLowerStats,
  INITIAL_HIGHER_LOWER_STATS,
  saveHigherLowerStats,
  recordScoreInStats,
  incrementGamesPlayed,
} from '@/lib/higher-lower/storage';
import { HigherLowerHeader } from './higher-lower-header';
import { HigherLowerCard } from './higher-lower-card';
import { HigherLowerGameOverModal } from './higher-lower-game-over-modal';
import { HigherLowerArenaBackground } from './higher-lower-arena-background';
import { useAuth } from '@/context/auth-context';
import { enqueueGameResult } from '@/lib/games/offline-sync-queue';
import { getDictionary } from '@/i18n';

export function HigherLowerClient() {
  const dict = getDictionary();
  const { user } = useAuth();
  const [mode, setMode] = useState<HigherLowerMode>('matches');
  const [stats, setStats] = useState<HigherLowerStats>(INITIAL_HIGHER_LOWER_STATS);
  const [currentScore, setCurrentScore] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [guessOutcome, setGuessOutcome] = useState<'correct' | 'wrong' | null>(null);
  const [isGameOverModalOpen, setIsGameOverModalOpen] = useState(false);
  const [, startTransition] = useTransition();

  const [pool, setPool] = useState<HigherLowerPlayer[]>(() => getEligiblePlayers('matches'));
  const [leftPlayer, setLeftPlayer] = useState<HigherLowerPlayer>(() => getEligiblePlayers('matches')[0]);
  const [rightPlayer, setRightPlayer] = useState<HigherLowerPlayer>(() => {
    const initialPool = getEligiblePlayers('matches');
    return initialPool[1] ?? initialPool[0];
  });

  useEffect(() => {
    queueMicrotask(() => {
      setStats(getStoredHigherLowerStats());
      const initialPool = getEligiblePlayers('matches');
      const first = pickRandomPlayer(initialPool);
      const second = pickRandomPlayer(initialPool, [first.bdfId]);
      setLeftPlayer(first);
      setRightPlayer(second);
    });
    const onSynced = () => setStats(getStoredHigherLowerStats());
    window.addEventListener('mareona_account_state_synced', onSynced);
    return () => window.removeEventListener('mareona_account_state_synced', onSynced);
  }, []);

  const startNewGame = useCallback((targetMode: HigherLowerMode) => {
    const newPool = getEligiblePlayers(targetMode);
    const first = pickRandomPlayer(newPool);
    const second = pickRandomPlayer(newPool, [first.bdfId]);

    setPool(newPool);
    setLeftPlayer(first);
    setRightPlayer(second);
    setCurrentScore(0);
    setIsRevealed(false);
    setGuessOutcome(null);
    setIsGameOverModalOpen(false);
  }, []);

  const handleModeChange = (newMode: HigherLowerMode) => {
    setMode(newMode);
    startNewGame(newMode);
  };

  const handleGuess = (guess: HigherLowerGuess) => {
    const evaluation = evaluateHigherLower(leftPlayer, rightPlayer, mode, guess);
    setIsRevealed(true);
    setGuessOutcome(evaluation.isCorrect ? 'correct' : 'wrong');

    setTimeout(() => {
      startTransition(() => {
        if (evaluation.isCorrect) {
          const nextScore = currentScore + 1;
          setCurrentScore(nextScore);

          setStats((prev) => {
            const nextStats = recordScoreInStats(prev, mode, nextScore);
            saveHigherLowerStats(nextStats);
            return nextStats;
          });

          setLeftPlayer(rightPlayer);
          setRightPlayer(pickRandomPlayer(pool, [leftPlayer.bdfId, rightPlayer.bdfId]));
          setIsRevealed(false);
          setGuessOutcome(null);
        } else {
          setStats((prev) => {
            const nextStats = incrementGamesPlayed(prev);
            saveHigherLowerStats(nextStats);
            return nextStats;
          });
          try {
            enqueueGameResult({
              gameType: 'higher_lower',
              challengeDate: new Intl.DateTimeFormat("en-CA", {
                timeZone: "Europe/Madrid",
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              }).format(new Date()),
              won: currentScore >= 3,
              score: currentScore,
              completedAt: new Date().toISOString(),
              userId: user?.id,
            });
          } catch {
            // Offline queue allocation fallback
          }
          setIsGameOverModalOpen(true);
        }
      });
    }, 1100);
  };

  const bestScoreForMode = stats.bestScoreByMode[mode] || 0;

  return (
    <div className="flex flex-col gap-3 sm:gap-6 max-w-4xl mx-auto w-full">
      <HigherLowerHeader
        mode={mode}
        onSelectMode={handleModeChange}
        isRevealed={isRevealed}
        currentScore={currentScore}
        bestScore={bestScoreForMode}
      />

      <section
        aria-label={dict.games.higherLower.arenaAria}
        className="relative flex flex-col items-center p-2 sm:p-7 rounded-3xl"
      >
        <HigherLowerArenaBackground />

        {/* Tarjetas enfrentadas permanentemente en 2 columnas (móvil y escritorio) */}
        <div className="relative grid grid-cols-2 gap-2 sm:gap-8 items-stretch justify-items-center w-full z-10 max-w-3xl mx-auto">
          <div className="flex flex-col items-center w-full">
            <HigherLowerCard player={leftPlayer} mode={mode} isRevealed={true} />
          </div>

          {/* Insignia Central VS perfectamente centrada entre ambas tarjetas */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex h-7 w-7 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-neutral-200 bg-white/95 font-bold text-[9px] sm:text-[11px] tracking-wider text-neutral-400 shadow-xs backdrop-blur-xs pointer-events-none">
            {dict.games.higherLower.vs}
          </div>

          <div className="flex flex-col items-center w-full">
            <HigherLowerCard
              player={rightPlayer}
              mode={mode}
              isRevealed={isRevealed}
              isMystery={!isRevealed}
              outcome={guessOutcome}
              onGuess={handleGuess}
              disabled={isRevealed}
            />
          </div>
        </div>
      </section>

      <HigherLowerGameOverModal
        isOpen={isGameOverModalOpen}
        score={currentScore}
        bestScore={bestScoreForMode}
        mode={mode}
        onPlayAgain={() => startNewGame(mode)}
      />
    </div>
  );
}
