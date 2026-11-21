// Client: Hook managing Who Are Ya daily state, storage persistence, and guess evaluation
'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import type { SelectorOption } from './who-are-ya-selector';
import { evaluatePlayerGuess, MAX_ATTEMPTS } from '@/lib/who-are-ya/engine';
import { getPlayerForDate, getTodayDateStr } from '@/lib/who-are-ya/daily';
import { formatFigureDisplay } from '@/lib/trivia/club-figures';
import {
  getStoredPlayerGuesses,
  savePlayerGuesses,
  getStoredWhoAreYaStats,
  INITIAL_WHO_ARE_YA_STATS,
  updateWhoAreYaStatsOnFinish,
  type WhoAreYaStats,
} from '@/lib/who-are-ya/storage';
import type { WhoAreYaPlayer, PlayerGuessResult } from '@/lib/who-are-ya/types';
import { useAuth } from '@/context/auth-context';
import { enqueueGameResult } from '@/lib/games/offline-sync-queue';

export function useWhoAreYaGame(players: WhoAreYaPlayer[], initialDate: string) {
  const { user } = useAuth();
  const userId = user?.id;
  const [selectedDate, setSelectedDate] = useState<string>(initialDate);
  const [isResultModalDismissed, setIsResultModalDismissed] = useState(false);
  const [stats, setStats] = useState<WhoAreYaStats>(INITIAL_WHO_ARE_YA_STATS);
  const [playerGuessesByDate, setPlayerGuessesByDate] = useState<Record<string, PlayerGuessResult[]>>({});

  useEffect(() => {
    queueMicrotask(() => {
      const today = getTodayDateStr();
      setSelectedDate(today);
      setStats(getStoredWhoAreYaStats());
      const initialGuesses = getStoredPlayerGuesses(today);
      if (initialGuesses.length > 0) {
        setPlayerGuessesByDate({ [today]: initialGuesses });
      }
    });
  }, []);

  useEffect(() => {
    const onSynced = () => {
      setStats(getStoredWhoAreYaStats());
      const syncedGuesses = getStoredPlayerGuesses(selectedDate);
      if (syncedGuesses.length > 0) {
        setPlayerGuessesByDate((prev) => ({ ...prev, [selectedDate]: syncedGuesses }));
      }
    };
    window.addEventListener('mareona_account_state_synced', onSynced);
    return () => window.removeEventListener('mareona_account_state_synced', onSynced);
  }, [selectedDate]);

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    setIsResultModalDismissed(false);
    if (!playerGuessesByDate[newDate]) {
      const stored = getStoredPlayerGuesses(newDate);
      if (stored.length > 0) {
        setPlayerGuessesByDate((prev) => ({ ...prev, [newDate]: stored }));
      }
    }
  };

  const currentTargetPlayer = useMemo(
    () => getPlayerForDate(selectedDate, players),
    [selectedDate, players]
  );

  const playerGuesses = useMemo(
    () => playerGuessesByDate[selectedDate] || [],
    [playerGuessesByDate, selectedDate]
  );

  const isWon = playerGuesses.some((g) => g.isCorrect);
  const isGameOver = isWon || playerGuesses.length >= MAX_ATTEMPTS;

  const playerOptions: SelectorOption[] = useMemo(() => {
    const guessedIds = new Set(playerGuesses.map((g) => g.player.bdfId));
    return players
      .filter((p) => !guessedIds.has(p.bdfId))
      .map((p) => {
        const { displayName, subLabel } = formatFigureDisplay(p);
        return { id: p.bdfId, label: displayName, sublabel: subLabel };
      });
  }, [players, playerGuesses]);

  const targetDisplay = useMemo(
    () => formatFigureDisplay(currentTargetPlayer),
    [currentTargetPlayer]
  );

  const handleSelectOption = useCallback(
    (option: SelectorOption) => {
      const found = players.find((p) => p.bdfId === option.id);
      if (!found || isGameOver) return;
      const result = evaluatePlayerGuess(found, currentTargetPlayer);
      const nextGuesses = [result, ...(playerGuessesByDate[selectedDate] || [])];

      setPlayerGuessesByDate((prev) => ({
        ...prev,
        [selectedDate]: nextGuesses,
      }));

      savePlayerGuesses(selectedDate, nextGuesses);

      const nextIsWon = result.isCorrect;
      const nextIsGameOver = nextIsWon || nextGuesses.length >= MAX_ATTEMPTS;
      if (nextIsGameOver) {
        const updated = updateWhoAreYaStatsOnFinish(nextIsWon, nextGuesses.length, selectedDate);
        setStats(updated);
        try {
          enqueueGameResult({
            gameType: 'who_are_ya',
            challengeDate: selectedDate,
            won: nextIsWon,
            score: nextGuesses.length,
            completedAt: new Date().toISOString(),
            userId,
          });
        } catch {
          // Offline queue allocation fallback
        }
      }
    },
    [players, isGameOver, currentTargetPlayer, selectedDate, playerGuessesByDate, userId]
  );

  return {
    selectedDate,
    handleDateChange,
    currentTargetPlayer,
    playerGuesses,
    isWon,
    isGameOver,
    guessesCount: playerGuesses.length,
    playerOptions,
    targetDisplay,
    stats,
    isResultModalDismissed,
    setIsResultModalDismissed,
    handleSelectOption,
  };
}
