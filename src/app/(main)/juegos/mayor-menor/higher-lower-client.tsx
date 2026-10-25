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
import { HigherLowerModeSelector } from './higher-lower-mode-selector';
import { HigherLowerCard } from './higher-lower-card';
import { HigherLowerControls } from './higher-lower-controls';
import { HigherLowerGameOverModal } from './higher-lower-game-over-modal';

const STATS_STORAGE_KEY = 'mareona_higher_lower_stats_v1';

const INITIAL_STATS: HigherLowerStats = {
  bestScoreByMode: { matches: 0, goals: 0, minutes: 0 },
  totalGamesPlayed: 0,
};

function getStoredStats(): HigherLowerStats {
  if (typeof window === 'undefined') return INITIAL_STATS;
  try {
    const saved = localStorage.getItem(STATS_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // LocalStorage inaccessible
  }
  return INITIAL_STATS;
}

export function HigherLowerClient() {
  const [mode, setMode] = useState<HigherLowerMode>('matches');
  const [stats, setStats] = useState<HigherLowerStats>(() => getStoredStats());
  const [currentScore, setCurrentScore] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
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
    setIsGameOverModalOpen(false);
  }, []);

  const handleModeChange = (newMode: HigherLowerMode) => {
    setMode(newMode);
    startNewGame(newMode);
  };

  const handleGuess = (guess: HigherLowerGuess) => {
    setIsRevealed(true);
    const evaluation = evaluateHigherLower(leftPlayer, rightPlayer, mode, guess);

    setTimeout(() => {
      startTransition(() => {
        if (evaluation.isCorrect) {
          const nextScore = currentScore + 1;
          setCurrentScore(nextScore);

          // Update best score if beaten
          setStats((prev) => {
            const nextBest = Math.max(prev.bestScoreByMode[mode] || 0, nextScore);
            const nextStats: HigherLowerStats = {
              ...prev,
              bestScoreByMode: {
                ...prev.bestScoreByMode,
                [mode]: nextBest,
              },
            };
            try {
              localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(nextStats));
            } catch {
              // LocalStorage fallback
            }
            return nextStats;
          });

          // Move right player to left and pick new right opponent
          setLeftPlayer(rightPlayer);
          setRightPlayer(pickRandomPlayer(pool, [leftPlayer.bdfId, rightPlayer.bdfId]));
          setIsRevealed(false);
        } else {
          // Game Over
          setStats((prev) => {
            const nextStats = {
              ...prev,
              totalGamesPlayed: prev.totalGamesPlayed + 1,
            };
            try {
              localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(nextStats));
            } catch {
              // LocalStorage fallback
            }
            return nextStats;
          });
          setIsGameOverModalOpen(true);
        }
      });
    }, 1200);
  };

  const bestScoreForMode = stats.bestScoreByMode[mode] || 0;

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      <header className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
        <div>
          <span className="rounded-full bg-[#e2001a] px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
            Pasatiempo
          </span>
          <h1 className="mt-1.5 text-xl font-bold text-[var(--foreground)]">
            ¿Mayor o Menor?
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <HigherLowerModeSelector
            currentMode={mode}
            onSelectMode={handleModeChange}
            disabled={isRevealed}
          />

          <div className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-white px-3.5 py-1 text-xs font-semibold text-[var(--foreground)]">
            <span>Racha: <strong className="text-[#e2001a] font-bold tabular-nums">{currentScore}</strong></span>
            <span className="text-[var(--border)]">|</span>
            <span className="text-[var(--foreground-muted)] text-[11px]">Récord: <strong className="tabular-nums">{bestScoreForMode}</strong></span>
          </div>
        </div>
      </header>

      <section
        aria-label="Área de comparación"
        className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center justify-items-center"
      >
        <HigherLowerCard
          player={leftPlayer}
          mode={mode}
          isRevealed={true}
        />

        <div className="flex flex-col items-center gap-4 w-full max-w-sm">
          <HigherLowerCard
            player={rightPlayer}
            mode={mode}
            isRevealed={isRevealed}
            isMystery={!isRevealed}
          />

          {!isRevealed && (
            <HigherLowerControls
              onGuess={handleGuess}
              disabled={isRevealed}
              comparedPlayerName={leftPlayer.name}
            />
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
