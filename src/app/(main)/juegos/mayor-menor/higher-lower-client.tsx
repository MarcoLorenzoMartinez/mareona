// Client: Orquestador interactivo del juego Mayor o Menor
'use client';

import React, { useState, useCallback, useTransition } from 'react';
import type {
  HigherLowerMode,
  HigherLowerPlayer,
  HigherLowerGuess,
  HigherLowerStats,
} from '@/lib/higher-lower/types';
import {
  getEligiblePlayers,
  pickRandomPlayer,
  evaluateHigherLower,
} from '@/lib/higher-lower/engine';
import {
  getStoredHigherLowerStats,
  saveHigherLowerStats,
  recordScoreInStats,
  incrementGamesPlayed,
} from '@/lib/higher-lower/storage';
import { HigherLowerHeader } from './higher-lower-header';
import { HigherLowerCard } from './higher-lower-card';
import { HigherLowerControls } from './higher-lower-controls';
import { HigherLowerGameOverModal } from './higher-lower-game-over-modal';

export function HigherLowerClient() {
  const [mode, setMode] = useState<HigherLowerMode>('matches');
  const [stats, setStats] = useState<HigherLowerStats>(() => getStoredHigherLowerStats());
  const [currentScore, setCurrentScore] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [guessOutcome, setGuessOutcome] = useState<'correct' | 'wrong' | null>(null);
  const [isGameOverModalOpen, setIsGameOverModalOpen] = useState(false);
  const [, startTransition] = useTransition();

  const [pool, setPool] = useState<HigherLowerPlayer[]>(() => getEligiblePlayers('matches'));
  const [leftPlayer, setLeftPlayer] = useState<HigherLowerPlayer>(() => {
    const initialPool = getEligiblePlayers('matches');
    return pickRandomPlayer(initialPool);
  });
  const [rightPlayer, setRightPlayer] = useState<HigherLowerPlayer>(() => {
    const initialPool = getEligiblePlayers('matches');
    return pickRandomPlayer(initialPool, [initialPool[0].bdfId]);
  });

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
          setIsGameOverModalOpen(true);
        }
      });
    }, 1100);
  };

  const bestScoreForMode = stats.bestScoreByMode[mode] || 0;

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      <HigherLowerHeader
        mode={mode}
        onSelectMode={handleModeChange}
        isRevealed={isRevealed}
        currentScore={currentScore}
        bestScore={bestScoreForMode}
      />

      <section
        aria-label="Área de comparación"
        className="relative flex flex-col items-center gap-6"
      >
        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-stretch justify-items-center w-full">
          <div className="flex justify-center w-full">
            <HigherLowerCard
              player={leftPlayer}
              mode={mode}
              isRevealed={true}
            />
          </div>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:flex h-11 w-11 items-center justify-center rounded-full border-2 border-[var(--border)] bg-white font-extrabold text-xs tracking-wider text-[#e2001a] shadow-md pointer-events-none">
            VS
          </div>

          <div className="flex justify-center w-full">
            <HigherLowerCard
              player={rightPlayer}
              mode={mode}
              isRevealed={isRevealed}
              isMystery={!isRevealed}
              outcome={guessOutcome}
            />
          </div>
        </div>

        <div className="w-full flex justify-center pt-1 min-h-[88px]">
          {!isRevealed ? (
            <HigherLowerControls
              onGuess={handleGuess}
              disabled={isRevealed}
              comparedPlayerName={leftPlayer.name}
            />
          ) : (
            <div className="flex items-center justify-center text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider animate-pulse">
              Comprobando...
            </div>
          )}
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
