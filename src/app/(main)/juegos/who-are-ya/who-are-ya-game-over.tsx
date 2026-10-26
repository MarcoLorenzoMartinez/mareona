import React from 'react';
import type { WhoAreYaGameMode } from '@/lib/who-are-ya/types';

interface WhoAreYaGameOverProps {
  isWon: boolean;
  attemptsCount: number;
  maxAttempts: number;
  mode: WhoAreYaGameMode;
  targetName: string;
  onPlayAgain: () => void;
}

export function WhoAreYaGameOver({
  isWon,
  attemptsCount,
  maxAttempts,
  mode,
  targetName,
  onPlayAgain,
}: WhoAreYaGameOverProps) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center rounded-2xl border border-[var(--border)] bg-white p-6 text-center shadow-md animate-in fade-in-50 zoom-in-95 duration-200">
      <div
        className={`inline-flex h-12 w-12 items-center justify-center rounded-full text-xl mb-3 ${
          isWon ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-[#e2001a]'
        }`}
      >
        {isWon ? '🏆' : '✕'}
      </div>

      <h3 className="text-lg font-bold text-[var(--foreground)]">
        {isWon ? '¡Enhorabuena, acertaste!' : '¡Fin del juego!'}
      </h3>

      <p className="mt-1 text-xs text-[var(--foreground-muted)]">
        {isWon
          ? `Lo lograste en ${attemptsCount} de ${maxAttempts} intentos.`
          : `El reto era ${targetName}.`}
      </p>

      <button
        type="button"
        onClick={onPlayAgain}
        className="mt-5 w-full rounded-full bg-[#e2001a] py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-[#b30015] active:scale-95 transition-all"
      >
        Jugar otro reto de {mode === 'players' ? 'jugador' : 'camiseta'}
      </button>
    </div>
  );
}
