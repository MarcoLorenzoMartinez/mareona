// Client: Manages Wordle interactive state, localStorage persistence and keyboard inputs
'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import type { WordleChallengeState, WordleDailyWord, WordleStats } from './types';
import { evaluateGuess, getMaxAttemptsForLength, normalizeWord } from './engine';
import { isValidWordGuess } from './words';

const STORAGE_KEY_PREFIX = 'mareona_wordle_v2_state_';
const STATS_STORAGE_KEY = 'mareona_wordle_v2_stats';

const INITIAL_STATS: WordleStats = {
  played: 0,
  won: 0,
  currentStreak: 0,
  maxStreak: 0,
  guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 },
};

function getInitialState(challengeId: string, targetWord: string): WordleChallengeState {
  if (typeof window === 'undefined') {
    return {
      date: challengeId,
      word: targetWord,
      guesses: [],
      status: 'IN_PROGRESS',
    };
  }
  try {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}${challengeId}`);
    if (saved) {
      const parsed: WordleChallengeState = JSON.parse(saved);
      // Validate that stored guesses match the target word length
      const validGuesses = (parsed.guesses || []).filter(
        (g) => g && g.length === targetWord.length
      );
      return {
        date: challengeId,
        word: targetWord,
        guesses: validGuesses,
        status: parsed.status || 'IN_PROGRESS',
        completedAt: parsed.completedAt,
      };
    }
  } catch {
    // LocalStorage inaccessible
  }
  return {
    date: challengeId,
    word: targetWord,
    guesses: [],
    status: 'IN_PROGRESS',
  };
}

function getInitialStats(): WordleStats {
  if (typeof window === 'undefined') return INITIAL_STATS;
  try {
    const saved = localStorage.getItem(STATS_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // LocalStorage inaccessible
  }
  return INITIAL_STATS;
}

export function useWordleGame(challenge: WordleDailyWord) {
  const targetWord = normalizeWord(challenge.word);
  const targetLength = targetWord.length;
  const maxAttempts = getMaxAttemptsForLength(targetLength);

  const [currentGuess, setCurrentGuess] = useState('');
  const [activeDate, setActiveDate] = useState(challenge.id);
  const [gameState, setGameState] = useState<WordleChallengeState>(() =>
    getInitialState(challenge.id, targetWord)
  );
  const [stats, setStats] = useState<WordleStats>(() => getInitialStats());
  const [shakeRow, setShakeRow] = useState(false);
  const [justFinished, setJustFinished] = useState(false);
  const [, startTransition] = useTransition();

  // Reset or switch state during render when challenge date changes
  if (activeDate !== challenge.id) {
    setActiveDate(challenge.id);
    setGameState(getInitialState(challenge.id, targetWord));
    setCurrentGuess('');
    setJustFinished(false);
  }

  // Persist game state
  const saveState = useCallback((newState: WordleChallengeState) => {
    setGameState(newState);
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${newState.date}`, JSON.stringify(newState));
    } catch {
      // Storage unavailable
    }
  }, []);

  // Update stats on game completion
  const updateStatsOnCompletion = useCallback((won: boolean, attemptsCount: number, challengeDate: string) => {
    setStats((prev) => {
      const played = prev.played + 1;
      const wonCount = won ? prev.won + 1 : prev.won;
      const currentStreak = won ? prev.currentStreak + 1 : 0;
      const maxStreak = Math.max(prev.maxStreak, currentStreak);
      const guessDistribution = { ...prev.guessDistribution };

      if (won) {
        guessDistribution[attemptsCount] = (guessDistribution[attemptsCount] || 0) + 1;
      }

      const nextStats: WordleStats = {
        played,
        won: wonCount,
        currentStreak,
        maxStreak,
        guessDistribution,
        lastPlayedDate: challengeDate,
      };

      try {
        localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(nextStats));
      } catch {
        // Storage unavailable
      }

      return nextStats;
    });
  }, []);

  const addLetter = useCallback((letter: string) => {
    if (gameState.status !== 'IN_PROGRESS') return;
    const clean = normalizeWord(letter);
    if (!/^[A-ZÑ]$/.test(clean)) return;

    setCurrentGuess((prev) => {
      if (prev.length >= targetLength) return prev;
      return prev + clean;
    });
  }, [gameState.status, targetLength]);

  const deleteLetter = useCallback(() => {
    if (gameState.status !== 'IN_PROGRESS') return;
    setCurrentGuess((prev) => prev.slice(0, -1));
  }, [gameState.status]);

  const submitGuess = useCallback(() => {
    if (gameState.status !== 'IN_PROGRESS') return;
    if (currentGuess.length !== targetLength) {
      setShakeRow(true);
      setTimeout(() => setShakeRow(false), 500);
      return;
    }

    if (!isValidWordGuess(currentGuess, targetLength)) {
      setShakeRow(true);
      setTimeout(() => setShakeRow(false), 500);
      return;
    }

    const nextGuesses = [...gameState.guesses, currentGuess];
    const isWin = currentGuess === targetWord;
    const isLoss = !isWin && nextGuesses.length >= maxAttempts;

    const nextStatus = isWin ? 'WON' : isLoss ? 'LOST' : 'IN_PROGRESS';
    const newState: WordleChallengeState = {
      ...gameState,
      guesses: nextGuesses,
      status: nextStatus,
      completedAt: isWin || isLoss ? new Date().toISOString() : undefined,
    };

    saveState(newState);
    setCurrentGuess('');

    if (isWin || isLoss) {
      setJustFinished(true);
      updateStatsOnCompletion(isWin, nextGuesses.length, challenge.id);
    }
  }, [
    gameState,
    currentGuess,
    targetLength,
    targetWord,
    maxAttempts,
    saveState,
    updateStatsOnCompletion,
    challenge.id,
  ]);

  // Handle physical keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        startTransition(() => submitGuess());
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        startTransition(() => deleteLetter());
      } else if (/^[a-zA-ZñÑ]$/.test(e.key)) {
        startTransition(() => addLetter(e.key));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [submitGuess, deleteLetter, addLetter]);

  // Map keyboard evaluated states
  const letterStatuses: Record<string, 'correct' | 'present' | 'absent'> = {};
  for (const guess of gameState.guesses) {
    const evaluation = evaluateGuess(guess, targetWord);
    for (const item of evaluation) {
      const prev = letterStatuses[item.char];
      if (item.status === 'correct') {
        letterStatuses[item.char] = 'correct';
      } else if (item.status === 'present' && prev !== 'correct') {
        letterStatuses[item.char] = 'present';
      } else if (!prev) {
        letterStatuses[item.char] = 'absent';
      }
    }
  }

  // Reset all stored games and player stats
  const resetAllProgress = useCallback(() => {
    try {
      localStorage.removeItem(STATS_STORAGE_KEY);
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch {
      // storage unavailable
    }
    setStats(INITIAL_STATS);
    setGameState({
      date: challenge.id,
      word: targetWord,
      guesses: [],
      status: 'IN_PROGRESS',
    });
    setCurrentGuess('');
  }, [challenge.id, targetWord]);

  return {
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
  };
}
