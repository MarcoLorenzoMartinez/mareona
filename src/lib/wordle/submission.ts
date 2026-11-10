import { isValidWordGuess } from './words';
import type { WordleChallengeState, WordleStats } from './types';
import { computeUpdatedWordleStats, saveWordleState } from './storage';
import { enqueueGameResult } from '@/lib/games/offline-sync-queue';
import { toast } from '@/lib/ui/toast';

export interface SubmitAttemptParams {
  gameState: WordleChallengeState;
  letters: string[];
  targetWord: string;
  targetLength: number;
  maxAttempts: number;
  challengeId: string;
  userId?: string;
  onShake: () => void;
  onSuccess: (nextState: WordleChallengeState, isWin: boolean, isLoss: boolean) => void;
  setStats: React.Dispatch<React.SetStateAction<WordleStats>>;
}

/**
 * Validates and commits a submitted wordle guess.
 */
export function handleGuessSubmission({
  gameState,
  letters,
  targetWord,
  targetLength,
  maxAttempts,
  challengeId,
  userId,
  onShake,
  onSuccess,
  setStats,
}: SubmitAttemptParams): void {
  if (gameState.status !== 'IN_PROGRESS') return;

  if (!letters.every((char) => char !== '')) {
    onShake();
    toast.error('Faltan letras');
    return;
  }

  const guessWord = letters.join('');
  if (!isValidWordGuess(guessWord, targetLength)) {
    onShake();
    toast.error('Palabra no válida');
    return;
  }

  const nextGuesses = [...gameState.guesses, guessWord];
  const isWin = guessWord === targetWord;
  const isLoss = !isWin && nextGuesses.length >= maxAttempts;
  const nextStatus = isWin ? 'WON' : isLoss ? 'LOST' : 'IN_PROGRESS';

  const newState: WordleChallengeState = {
    ...gameState,
    guesses: nextGuesses,
    status: nextStatus,
    completedAt: isWin || isLoss ? new Date().toISOString() : undefined,
  };

  saveWordleState(newState);
  onSuccess(newState, isWin, isLoss);

  if (isWin || isLoss) {
    setStats((prev) => computeUpdatedWordleStats(prev, isWin, nextGuesses.length, challengeId));
    try {
      enqueueGameResult({
        gameType: 'wordle',
        challengeDate: challengeId,
        won: isWin,
        score: nextGuesses.length,
        completedAt: newState.completedAt || new Date().toISOString(),
        userId,
      });
    } catch {
      // Offline queue allocation fallback
    }
  }
}

