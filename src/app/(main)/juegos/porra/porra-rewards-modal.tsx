// Client: Modal gráfico de recompensas de sobres y baremo de puntos de La Porra
'use client';

import React, { useEffect } from 'react';
import { MiniPack } from '@/components/cards/mini-pack';
import { PACK_TIERS } from '@/lib/cards/packs';
import type { PackTier } from '@/lib/cards/types';
import {
  EXACT_SCORE_POINTS,
  OUTCOME_POINTS,
  SCORER_POINTS,
} from '@/lib/porra/engine';

interface PorraRewardsModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

const REWARD_STEPS: readonly {
  readonly tier: PackTier;
  readonly pointsLabel: string;
}[] = [
  { tier: 'aficionado', pointsLabel: '1 – 2 pts' },
  { tier: 'rojiblanco', pointsLabel: '3 – 4 pts' },
  { tier: 'leyenda', pointsLabel: '5+ pts' },
];

const SCORING_RULES: readonly {
  readonly label: string;
  readonly points: string;
}[] = [
  { label: 'Marcador exacto', points: `+${EXACT_SCORE_POINTS} pts` },
  { label: 'Signo 1X2', points: `+${OUTCOME_POINTS} pts` },
  { label: 'Por cada goleador acertado', points: `+${SCORER_POINTS} pt` },
];

export function PorraRewardsModal({ isOpen, onClose }: PorraRewardsModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-2xs"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="porra-rewards-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-white p-5 sm:p-6 shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3.5">
          <h2
            id="porra-rewards-modal-title"
            className="font-sans text-base font-bold tracking-tight text-[var(--foreground)]"
          >
            Recompensas por jornada
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana de recompensas"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--foreground-muted)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--foreground)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e2001a]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Escalones visuales de sobres */}
        <div className="mt-5 grid grid-cols-3 gap-2.5 sm:gap-3">
          {REWARD_STEPS.map(({ tier, pointsLabel }) => {
            const config = PACK_TIERS[tier];
            return (
              <div
                key={tier}
                className="flex flex-col items-center justify-between gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)]/60 p-3 text-center"
              >
                <span className="rounded-full bg-[#e2001a] px-2.5 py-0.5 font-sans text-xs font-bold tabular-nums text-white">
                  {pointsLabel}
                </span>

                <div className="my-1 flex items-center justify-center">
                  <div className="scale-125 transform">
                    <MiniPack tier={tier} />
                  </div>
                </div>

                <div className="flex flex-col gap-0.5">
                  <span className="font-sans text-xs font-bold leading-tight text-[var(--foreground)]">
                    {config.name.replace('Sobre ', '')}
                  </span>
                  <span className="font-sans text-[11px] font-medium tabular-nums text-[var(--foreground-muted)]">
                    {config.cardCount} cromos
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Baremo de puntos limpio */}
        <div className="mt-5 rounded-xl border border-[var(--border)] divide-y divide-[var(--border)] overflow-hidden">
          {SCORING_RULES.map((rule) => (
            <div
              key={rule.label}
              className="flex items-center justify-between bg-white px-3.5 py-2.5"
            >
              <span className="font-sans text-xs font-semibold text-[var(--foreground)]">
                {rule.label}
              </span>
              <span className="rounded-full bg-[var(--surface)] border border-[var(--border)] px-2.5 py-0.5 font-sans text-xs font-bold tabular-nums text-[#e2001a]">
                {rule.points}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
