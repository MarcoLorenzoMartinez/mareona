// Client: Estado interactivo del juego Who Are Ya (jugadores y camisetas)
'use client';

import { useState, useMemo, useCallback } from 'react';
import { WhoAreYaHeader } from './who-are-ya-header';
import { WhoAreYaMysteryPhoto } from './who-are-ya-mystery-photo';
import { WhoAreYaSelector, type SelectorOption } from './who-are-ya-selector';
import { WhoAreYaPlayerGrid } from './who-are-ya-player-grid';
import { WhoAreYaKitGrid } from './who-are-ya-kit-grid';
import { WhoAreYaGameOver } from './who-are-ya-game-over';
import {
  evaluatePlayerGuess,
  evaluateKitGuess,
  getDailyIndex,
  MAX_ATTEMPTS,
} from '@/lib/who-are-ya/engine';
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
  const [playerOffset, setPlayerOffset] = useState(0);
  const [kitOffset, setKitOffset] = useState(0);

  const [playerGuesses, setPlayerGuesses] = useState<PlayerGuessResult[]>([]);
  const [kitGuesses, setKitGuesses] = useState<KitGuessResult[]>([]);

  // Current targets
  const currentTargetPlayer = useMemo(() => {
    const idx = getDailyIndex(players.length, playerOffset);
    return players[idx] || players[0];
  }, [players, playerOffset]);

  const currentTargetKit = useMemo(() => {
    const idx = getDailyIndex(kits.length, kitOffset);
    return kits[idx] || kits[0];
  }, [kits, kitOffset]);

  // Game state
  const isPlayerWon = playerGuesses.some((g) => g.isCorrect);
  const isPlayerGameOver = isPlayerWon || playerGuesses.length >= MAX_ATTEMPTS;

  const isKitWon = kitGuesses.some((g) => g.isCorrect);
  const isKitGameOver = isKitWon || kitGuesses.length >= MAX_ATTEMPTS;

  const activeIsGameOver = mode === 'players' ? isPlayerGameOver : isKitGameOver;
  const activeIsWon = mode === 'players' ? isPlayerWon : isKitWon;
  const activeGuessesCount = mode === 'players' ? playerGuesses.length : kitGuesses.length;

  // Options for selector
  const playerOptions: SelectorOption[] = useMemo(() => {
    const guessedIds = new Set(playerGuesses.map((g) => g.player.bdfId));
    return players
      .filter((p) => !guessedIds.has(p.bdfId))
      .map((p) => ({
        id: p.bdfId,
        label: p.name,
        sublabel: `${p.fullName} • ${p.position} (${p.startYear} - ${p.endYear})`,
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
        setPlayerGuesses((prev) => [result, ...prev]);
      } else {
        const found = kits.find((k) => k.id === option.id);
        if (!found || isKitGameOver) return;
        const result = evaluateKitGuess(found, currentTargetKit);
        setKitGuesses((prev) => [result, ...prev]);
      }
    },
    [mode, players, kits, isPlayerGameOver, isKitGameOver, currentTargetPlayer, currentTargetKit]
  );

  const handleResetCurrentMode = () => {
    if (mode === 'players') {
      setPlayerOffset((prev) => prev + 13);
      setPlayerGuesses([]);
    } else {
      setKitOffset((prev) => prev + 7);
      setKitGuesses([]);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <WhoAreYaHeader
        currentMode={mode}
        onSelectMode={setMode}
        attemptsCount={activeGuessesCount}
        maxAttempts={MAX_ATTEMPTS}
        onReset={handleResetCurrentMode}
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

        {!activeIsGameOver ? (
          <WhoAreYaSelector
            options={mode === 'players' ? playerOptions : kitOptions}
            onSelect={handleSelectOption}
            placeholder={
              mode === 'players'
                ? 'Busca un jugador del Real Sporting...'
                : 'Selecciona una camiseta del Sporting...'
            }
          />
        ) : (
          <WhoAreYaGameOver
            isWon={activeIsWon}
            attemptsCount={activeGuessesCount}
            maxAttempts={MAX_ATTEMPTS}
            mode={mode}
            targetName={mode === 'players' ? currentTargetPlayer.name : currentTargetKit.label}
            onPlayAgain={handleResetCurrentMode}
          />
        )}

        {mode === 'players' ? (
          <WhoAreYaPlayerGrid guesses={playerGuesses} />
        ) : (
          <WhoAreYaKitGrid guesses={kitGuesses} />
        )}
      </section>
    </div>
  );
}
