// Client: Estado interactivo del juego diario Who Are Ya con archivo por fecha
'use client';

import { useState, useMemo, useCallback } from 'react';
import { WhoAreYaHeader } from './who-are-ya-header';
import { WhoAreYaMysteryPhoto } from './who-are-ya-mystery-photo';
import { WhoAreYaSelector, type SelectorOption } from './who-are-ya-selector';
import { WhoAreYaPlayerGrid } from './who-are-ya-player-grid';
import { WhoAreYaKitGrid } from './who-are-ya-kit-grid';
import { WhoAreYaResultModal } from './who-are-ya-game-over';
import { WhoAreYaArchiveModal } from './who-are-ya-archive-modal';
import {
  evaluatePlayerGuess,
  evaluateKitGuess,
  MAX_ATTEMPTS,
} from '@/lib/who-are-ya/engine';
import {
  getPlayerForDate,
  getKitForDate,
  getTodayDateStr,
} from '@/lib/who-are-ya/daily';
import type {
  WhoAreYaGameMode,
  WhoAreYaPlayer,
  WhoAreYaKit,
  PlayerGuessResult,
  KitGuessResult,
} from '@/lib/who-are-ya/types';

interface WhoAreYaClientProps {
  players: WhoAreYaPlayer[];
  kits: WhoAreYaKit[];
}

export function WhoAreYaClient({ players, kits }: WhoAreYaClientProps) {
  const [mode, setMode] = useState<WhoAreYaGameMode>('players');
  const todayStr = useMemo(() => getTodayDateStr(), []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isResultModalDismissed, setIsResultModalDismissed] = useState(false);

  // Guesses state mapped per date and mode
  const [playerGuessesByDate, setPlayerGuessesByDate] = useState<Record<string, PlayerGuessResult[]>>({});
  const [kitGuessesByDate, setKitGuessesByDate] = useState<Record<string, KitGuessResult[]>>({});

  const handleModeChange = (newMode: WhoAreYaGameMode) => {
    setMode(newMode);
    setIsResultModalDismissed(false);
  };

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    setIsResultModalDismissed(false);
  };

  const currentTargetPlayer = useMemo(
    () => getPlayerForDate(selectedDate, players),
    [selectedDate, players]
  );

  const currentTargetKit = useMemo(
    () => getKitForDate(selectedDate, kits),
    [selectedDate, kits]
  );

  const playerGuesses = useMemo(() => playerGuessesByDate[selectedDate] || [], [playerGuessesByDate, selectedDate]);
  const kitGuesses = useMemo(() => kitGuessesByDate[selectedDate] || [], [kitGuessesByDate, selectedDate]);

  const isPlayerWon = playerGuesses.some((g) => g.isCorrect);
  const isPlayerGameOver = isPlayerWon || playerGuesses.length >= MAX_ATTEMPTS;

  const isKitWon = kitGuesses.some((g) => g.isCorrect);
  const isKitGameOver = isKitWon || kitGuesses.length >= MAX_ATTEMPTS;

  const activeIsGameOver = mode === 'players' ? isPlayerGameOver : isKitGameOver;
  const activeIsWon = mode === 'players' ? isPlayerWon : isKitWon;
  const activeGuessesCount = mode === 'players' ? playerGuesses.length : kitGuesses.length;

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

  const kitOptions: SelectorOption[] = useMemo(() => {
    const guessedIds = new Set(kitGuesses.map((g) => g.kit.id));
    return kits
      .filter((k) => !guessedIds.has(k.id))
      .map((k) => ({
        id: k.id,
        label: k.label,
        sublabel: k.details,
      }));
  }, [kits, kitGuesses]);

  const handleSelectOption = useCallback(
    (option: SelectorOption) => {
      if (mode === 'players') {
        const found = players.find((p) => p.bdfId === option.id);
        if (!found || isPlayerGameOver) return;
        const result = evaluatePlayerGuess(found, currentTargetPlayer);
        setPlayerGuessesByDate((prev) => ({
          ...prev,
          [selectedDate]: [result, ...(prev[selectedDate] || [])],
        }));
      } else {
        const found = kits.find((k) => k.id === option.id);
        if (!found || isKitGameOver) return;
        const result = evaluateKitGuess(found, currentTargetKit);
        setKitGuessesByDate((prev) => ({
          ...prev,
          [selectedDate]: [result, ...(prev[selectedDate] || [])],
        }));
      }
    },
    [mode, players, kits, isPlayerGameOver, isKitGameOver, currentTargetPlayer, currentTargetKit, selectedDate]
  );

  return (
    <div className="flex flex-col gap-6">
      <WhoAreYaHeader
        currentMode={mode}
        onSelectMode={handleModeChange}
        selectedDate={selectedDate}
        isToday={selectedDate === todayStr}
        onOpenArchive={() => setIsArchiveOpen(true)}
      />

      <section
        aria-label="Zona de juego"
        className="flex flex-col items-center gap-6 rounded-3xl border border-[var(--border)] bg-gradient-to-b from-white to-[var(--surface)] p-4 sm:p-8 shadow-xs"
      >
        <WhoAreYaMysteryPhoto
          imageUrl={mode === 'players' ? currentTargetPlayer.photoUrl : currentTargetKit.image}
          name={mode === 'players' ? currentTargetPlayer.name : currentTargetKit.label}
          attemptsCount={activeGuessesCount}
          isGameOver={activeIsGameOver}
          isKit={mode === 'kits'}
        />

        {!activeIsGameOver && (
          <div className="flex flex-col items-center gap-2 w-full max-w-md mx-auto">
            <WhoAreYaSelector
              options={mode === 'players' ? playerOptions : kitOptions}
              onSelect={handleSelectOption}
              placeholder={
                mode === 'players'
                  ? 'Busca un jugador del Real Sporting...'
                  : 'Selecciona una camiseta del Sporting...'
              }
            />
            {/* Indicador sutil y discreto de intentos restantes */}
            <span className="text-[11px] font-semibold text-[var(--foreground-muted)] tracking-wide">
              Intento {activeGuessesCount + 1} de {MAX_ATTEMPTS}
            </span>
          </div>
        )}

        {mode === 'players' ? (
          <WhoAreYaPlayerGrid guesses={playerGuesses} />
        ) : (
          <WhoAreYaKitGrid guesses={kitGuesses} />
        )}
      </section>

      {/* Popup modal al finalizar la partida */}
      <WhoAreYaResultModal
        isOpen={activeIsGameOver && !isResultModalDismissed}
        onClose={() => setIsResultModalDismissed(true)}
        isWon={activeIsWon}
        attemptsCount={activeGuessesCount}
        maxAttempts={MAX_ATTEMPTS}
        mode={mode}
        targetName={mode === 'players' ? currentTargetPlayer.name : currentTargetKit.label}
        targetSublabel={mode === 'players' ? currentTargetPlayer.fullName : currentTargetKit.details}
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
