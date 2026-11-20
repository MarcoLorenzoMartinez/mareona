// Client: Estado interactivo del juego diario ¿Quién es? con archivo por fecha y persistencia
'use client';

import { useState } from 'react';
import { WhoAreYaHeader } from './who-are-ya-header';
import { WhoAreYaMysteryPhoto } from './who-are-ya-mystery-photo';
import { WhoAreYaSelector } from './who-are-ya-selector';
import { WhoAreYaPlayerGrid } from './who-are-ya-player-grid';
import { WhoAreYaResultModal } from './who-are-ya-game-over';
import { WhoAreYaStatsModal } from './who-are-ya-stats-modal';
import { WhoAreYaArchiveModal } from './who-are-ya-archive-modal';
import { MAX_ATTEMPTS } from '@/lib/who-are-ya/engine';
import type { WhoAreYaPlayer } from '@/lib/who-are-ya/types';
import { getDictionary } from '@/i18n';
import { useWhoAreYaGame } from './use-who-are-ya-game';

interface WhoAreYaClientProps {
  players: WhoAreYaPlayer[];
  initialDate: string;
}

export function WhoAreYaClient({ players, initialDate }: WhoAreYaClientProps) {
  const dict = getDictionary();
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  const {
    selectedDate,
    handleDateChange,
    currentTargetPlayer,
    playerGuesses,
    isWon,
    isGameOver,
    guessesCount,
    playerOptions,
    targetDisplay,
    stats,
    isResultModalDismissed,
    setIsResultModalDismissed,
    handleSelectOption,
  } = useWhoAreYaGame(players, initialDate);

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
