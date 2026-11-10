// Client: Manages Wordle interactive state, keyboard inputs and free-form cell cursor
'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import type { WordleChallengeState, WordleDailyWord, WordleStats } from './types';
import { getMaxAttemptsForLength, normalizeWord } from './engine';
import { handleGuessSubmission } from './submission';
import { getKeyboardLetterStatuses, clearAllWordleStorage } from './keyboard-eval';
import {
  STORAGE_KEY_PREFIX, STATS_STORAGE_KEY, INITIAL_WORDLE_STATS,
  getInitialWordleState, getInitialWordleStats,
} from './storage';

export function useWordleGame(challenge: WordleDailyWord, userId?: string) {
  const targetWord = normalizeWord(challenge.word);
  const targetLength = targetWord.length;
  const maxAttempts = getMaxAttemptsForLength(targetLength);

  const [letters, setLetters] = useState<string[]>(() => Array(targetLength).fill(''));
  const [cursorIndex, setCursorIndex] = useState<number | null>(0);
  const [activeDate, setActiveDate] = useState(challenge.id);
  const [gameState, setGameState] = useState<WordleChallengeState>(() =>
    getInitialWordleState(challenge.id, targetWord)
  );
  const [stats, setStats] = useState<WordleStats>(() => getInitialWordleStats());
  const [shakeRow, setShakeRow] = useState(false);
  const [justFinished, setJustFinished] = useState(false);
  const [, startTransition] = useTransition();

  if (activeDate !== challenge.id) {
    setActiveDate(challenge.id);
    setGameState(getInitialWordleState(challenge.id, targetWord));
    setLetters(Array(targetLength).fill(''));
    setCursorIndex(0);
    setJustFinished(false);
  }

  const setCursor = useCallback((index: number) => {
    if (index >= 0 && index < targetLength) setCursorIndex(index);
  }, [targetLength]);

  const moveCursorLeft = useCallback(() => {
    setCursorIndex((prev) => {
      if (prev === null) return targetLength - 1;
      return Math.max(0, prev - 1);
    });
  }, [targetLength]);

  const moveCursorRight = useCallback(() => {
    setCursorIndex((prev) => {
      if (prev === null) return 0;
      return Math.min(targetLength - 1, prev + 1);
    });
  }, [targetLength]);

  const addLetter = useCallback((letter: string) => {
    if (gameState.status !== 'IN_PROGRESS') return;
    const clean = normalizeWord(letter);
    if (!/^[A-ZÑ]$/.test(clean)) return;

    // If no cell is selected (e.g. word was full), ignore or do nothing
    if (cursorIndex === null) return;

    setLetters((prev) => {
      const next = [...prev];
      next[cursorIndex] = clean;
      return next;
    });

    // Advance cursor to next position or clear selection if row is now full at the end
    setCursorIndex((prev) => {
      if (prev === null) return null;
      if (prev >= targetLength - 1) return null;
      return prev + 1;
    });
  }, [gameState.status, cursorIndex, targetLength]);

  const deleteLetter = useCallback(() => {
    if (gameState.status !== 'IN_PROGRESS') return;

    // When the row is completely filled (cursorIndex === null)
    if (cursorIndex === null) {
      setLetters((prev) => {
        const next = [...prev];
        next[targetLength - 1] = '';
        return next;
      });
      setCursorIndex(targetLength - 1);
      return;
    }

    setLetters((prev) => {
      const next = [...prev];
      if (next[cursorIndex] !== '') {
        next[cursorIndex] = '';
      } else if (cursorIndex > 0) {
        next[cursorIndex - 1] = '';
      }
      return next;
    });

    setCursorIndex((prev) => {
      if (prev === null) return targetLength - 1;
      return Math.max(0, prev - 1);
    });
  }, [gameState.status, cursorIndex, targetLength]);

  const currentGuess = letters.join('');

  const submitGuess = useCallback(() => {
    handleGuessSubmission({
      gameState,
      letters,
      targetWord,
      targetLength,
      maxAttempts,
      challengeId: challenge.id,
      userId,
      onShake: () => {
        setShakeRow(true);
        setTimeout(() => setShakeRow(false), 500);
      },
      onSuccess: (newState, isWin, isLoss) => {
        setGameState(newState);
        setLetters(Array(targetLength).fill(''));
        setCursorIndex(0);
        if (isWin || isLoss) setJustFinished(true);
      },
      setStats,
    });
  }, [gameState, letters, targetLength, targetWord, maxAttempts, challenge.id, userId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'Enter') { e.preventDefault(); startTransition(() => submitGuess()); }
      else if (e.key === 'Backspace') { e.preventDefault(); startTransition(() => deleteLetter()); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); startTransition(() => moveCursorLeft()); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); startTransition(() => moveCursorRight()); }
      else if (/^[a-zA-ZñÑ]$/.test(e.key)) { startTransition(() => addLetter(e.key)); }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [submitGuess, deleteLetter, addLetter, moveCursorLeft, moveCursorRight]);

  const letterStatuses = getKeyboardLetterStatuses(gameState.guesses, targetWord);

  const resetAllProgress = useCallback(() => {
    clearAllWordleStorage(STORAGE_KEY_PREFIX, STATS_STORAGE_KEY);
    setStats(INITIAL_WORDLE_STATS);
    setGameState({ date: challenge.id, word: targetWord, guesses: [], status: 'IN_PROGRESS' });
    setLetters(Array(targetLength).fill(''));
    setCursorIndex(0);
  }, [challenge.id, targetWord, targetLength]);

  return {
    gameState,
    letters,
    currentGuess,
    cursorIndex,
    maxAttempts,
    targetLength,
    targetWord,
    shakeRow,
    stats,
    letterStatuses,
    addLetter,
    deleteLetter,
    setCursor,
    moveCursorLeft,
    moveCursorRight,
    submitGuess,
    resetAllProgress,
    justFinished,
  };
}
