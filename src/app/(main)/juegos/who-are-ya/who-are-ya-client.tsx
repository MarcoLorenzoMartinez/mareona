// Client: Estado interactivo del juego diario ¿Quién es? con archivo por fecha
'use client';

import { useState, useMemo, useCallback } from 'react';
import { WhoAreYaHeader } from './who-are-ya-header';
import { WhoAreYaMysteryPhoto } from './who-are-ya-mystery-photo';
import { WhoAreYaSelector, type SelectorOption } from './who-are-ya-selector';
import { WhoAreYaPlayerGrid } from './who-are-ya-player-grid';
import { WhoAreYaResultModal } from './who-are-ya-game-over';
import { WhoAreYaArchiveModal } from './who-are-ya-archive-modal';
import { evaluatePlayerGuess, MAX_ATTEMPTS } from '@/lib/who-are-ya/engine';
import { getPlayerForDate } from '@/lib/who-are-ya/daily';
import type { WhoAreYaPlayer, PlayerGuessResult } from '@/lib/who-are-ya/types';

interface WhoAreYaClientProps {
  players: WhoAreYaPlayer[];
  initialDate: string;
}

export function WhoAreYaClient({ players, initialDate }: WhoAreYaClientProps) {
  const todayStr = initialDate;
  const [selectedDate, setSelectedDate] = useState<string>(initialDate);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isResultModalDismissed, setIsResultModalDismissed] = useState(false);

  // Guesses state mapped per date
  const [playerGuessesByDate, setPlayerGuessesByDate] = useState<Record<string, PlayerGuessResult[]>>({});

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    setIsResultModalDismissed(false);
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
      .map((p) => ({
        id: p.bdfId,
        label: p.name,
        sublabel: p.fullName !== p.name ? p.fullName : undefined,
      }));
  }, [players, playerGuesses]);

  const handleSelectOption = useCallback(
    (option: SelectorOption) => {
      const found = players.find((p) => p.bdfId === option.id);
      if (!found || isGameOver) return;
      const result = evaluatePlayerGuess(found, currentTargetPlayer);
      setPlayerGuessesByDate((prev) => ({
        ...prev,
        [selectedDate]: [result, ...(prev[selectedDate] || [])],
      }));
    },
    [players, isGameOver, currentTargetPlayer, selectedDate]
  );

  return (
    <div className="flex flex-col gap-6">
      <WhoAreYaHeader
        selectedDate={selectedDate}
        isToday={selectedDate === todayStr}
        onOpenArchive={() => setIsArchiveOpen(true)}
      />

      <section
        aria-label="Zona de juego"
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
              placeholder="Busca un jugador del Real Sporting..."
            />
            {/* Indicador sutil y discreto de intentos restantes */}
            <span className="text-[11px] font-semibold text-[var(--foreground-muted)] tracking-wide">
              Intento {guessesCount + 1} de {MAX_ATTEMPTS}
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
        targetName={currentTargetPlayer.name}
        targetSublabel={currentTargetPlayer.fullName}
        onOpenArchive={() => setIsArchiveOpen(true)}
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
