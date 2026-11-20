// Client: Estado interactivo del juego diario ¿Quién es? con archivo por fecha y persistencia
'use client';

import { useState, useMemo, useCallback } from 'react';
import { WhoAreYaHeader } from './who-are-ya-header';
import { WhoAreYaMysteryPhoto } from './who-are-ya-mystery-photo';
import { WhoAreYaSelector, type SelectorOption } from './who-are-ya-selector';
import { WhoAreYaPlayerGrid } from './who-are-ya-player-grid';
import { WhoAreYaResultModal } from './who-are-ya-game-over';
import { WhoAreYaStatsModal } from './who-are-ya-stats-modal';
import { WhoAreYaArchiveModal } from './who-are-ya-archive-modal';
import { evaluatePlayerGuess, MAX_ATTEMPTS } from '@/lib/who-are-ya/engine';
import { getPlayerForDate, getTodayDateStr } from '@/lib/who-are-ya/daily';
import { formatFigureDisplay } from '@/lib/trivia/club-figures';
import {
  getStoredPlayerGuesses, savePlayerGuesses, getStoredWhoAreYaStats,
  updateWhoAreYaStatsOnFinish, type WhoAreYaStats,
} from '@/lib/who-are-ya/storage';
import type { WhoAreYaPlayer, PlayerGuessResult } from '@/lib/who-are-ya/types';
import { useAuth } from '@/context/auth-context';
import { enqueueGameResult } from '@/lib/games/offline-sync-queue';
import { getDictionary } from '@/i18n';

interface WhoAreYaClientProps {
  players: WhoAreYaPlayer[];
  initialDate: string;
}

export function WhoAreYaClient({ players, initialDate }: WhoAreYaClientProps) {
  const dict = getDictionary();
  const { user } = useAuth();
  const userId = user?.id;
  const [selectedDate, setSelectedDate] = useState<string>(() =>
    typeof window === 'undefined' ? initialDate : getTodayDateStr()
  );
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isResultModalDismissed, setIsResultModalDismissed] = useState(false);
  const [stats, setStats] = useState<WhoAreYaStats>(() => getStoredWhoAreYaStats());

  // Guesses state mapped per date initialized from storage
  const [playerGuessesByDate, setPlayerGuessesByDate] = useState<Record<string, PlayerGuessResult[]>>(() => {
    const activeDate = typeof window === 'undefined' ? initialDate : getTodayDateStr();
    const initialGuesses = getStoredPlayerGuesses(activeDate);
    return initialGuesses.length > 0 ? { [activeDate]: initialGuesses } : {};
  });

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

  const playerGuesses = useMemo(() => playerGuessesByDate[selectedDate] || [], [playerGuessesByDate, selectedDate]);

  const isWon = playerGuesses.some((g) => g.isCorrect);
  const isGameOver = isWon || playerGuesses.length >= MAX_ATTEMPTS;
  const guessesCount = playerGuesses.length;

  const playerOptions: SelectorOption[] = useMemo(() => {
    const guessedIds = new Set(playerGuesses.map((g) => g.player.bdfId));
    return players
      .filter((p) => !guessedIds.has(p.bdfId))
      .map((p) => {
        const { displayName, subLabel } = formatFigureDisplay(p);
        return { id: p.bdfId, label: displayName, sublabel: subLabel };
      });
  }, [players, playerGuesses]);
  const targetDisplay = useMemo(() => formatFigureDisplay(currentTargetPlayer), [currentTargetPlayer]);

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
            gameType: "who_are_ya",
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

  return (
    <div className="flex flex-col gap-6">
      <WhoAreYaHeader
        onOpenArchive={() => setIsArchiveOpen(true)}
        onOpenStats={() => setIsStatsOpen(true)}
      />

      <section
        aria-label={dict.games.whoAreYa.arenaAria}
        className="flex flex-col items-center gap-6 rounded-3xl border border-[var(--border)] bg-gradient-to-b from-white to-[var(--surface)] p-4 sm:p-8 shadow-xs"
      >
        <WhoAreYaMysteryPhoto
          imageUrl={currentTargetPlayer.photoUrl}
          name={currentTargetPlayer.name}
          attemptsCount={guessesCount}
          isGameOver={isGameOver}
          isKit={false}
        />

        {!isGameOver && (
          <div className="flex flex-col items-center gap-2 w-full max-w-md mx-auto">
            <WhoAreYaSelector
              options={playerOptions}
              onSelect={handleSelectOption}
              placeholder={dict.games.whoAreYa.searchPlaceholder}
            />
            {/* Indicador sutil y discreto de intentos restantes */}
            <span className="text-[11px] font-semibold text-[var(--foreground-muted)] tracking-wide">
              {dict.games.whoAreYa.attemptPrefix} {guessesCount + 1} {dict.games.whoAreYa.attemptOf} {MAX_ATTEMPTS}
            </span>
          </div>
        )}

        <WhoAreYaPlayerGrid guesses={playerGuesses} />
      </section>

      {/* Popup modal al finalizar la partida */}
      <WhoAreYaResultModal
        isOpen={isGameOver && !isResultModalDismissed}
        onClose={() => setIsResultModalDismissed(true)}
        isWon={isWon}
        attemptsCount={guessesCount}
        maxAttempts={MAX_ATTEMPTS}
        targetName={targetDisplay.displayName}
        targetSublabel={targetDisplay.subLabel}
        targetPhotoUrl={currentTargetPlayer.photoUrl}
        stats={stats}
        onOpenArchive={() => setIsArchiveOpen(true)}
      />

      <WhoAreYaStatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        stats={stats}
      />

      <WhoAreYaArchiveModal
        isOpen={isArchiveOpen}
        onClose={() => setIsArchiveOpen(false)}
        selectedDate={selectedDate}
        onSelectDate={handleDateChange}
      />
    </div>
  );
}
