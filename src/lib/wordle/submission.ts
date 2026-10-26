import { isValidWordGuess } from './words';
import type { WordleChallengeState, WordleStats } from './types';
import { computeUpdatedWordleStats, saveWordleState } from './storage';

export interface SubmitAttemptParams {
  gameState: WordleChallengeState;
  letters: string[];
  targetWord: string;
  targetLength: number;
  maxAttempts: number;
  challengeId: string;
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
  onShake,
  onSuccess,
  setStats,
}: SubmitAttemptParams): void {
  if (gameState.status !== 'IN_PROGRESS') return;

  if (!letters.every((char) => char !== '')) {
    onShake();
    return;
  }

  const guessWord = letters.join('');
  if (!isValidWordGuess(guessWord, targetLength)) {
    onShake();
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
  }
}

