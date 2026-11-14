// Client: Panel acumulativo de notificaciones de sobres ganados pendientes de reclamar en La Porra
'use client';

import React from 'react';
import Link from 'next/link';
import { MiniPack } from '@/components/cards/mini-pack';
import { PACK_TIERS } from '@/lib/cards/packs';
import type { PorraUnclaimedReward } from '@/lib/porra/types';

interface PorraPendingRewardsProps {
  readonly rewards: readonly PorraUnclaimedReward[];
  readonly justClaimedCount: number;
  readonly onClaimAll: () => void;
}

export function PorraPendingRewards({
  rewards,
  justClaimedCount,
  onClaimAll,
}: PorraPendingRewardsProps) {
  if (rewards.length === 0 && justClaimedCount === 0) {
    return null;
  }

  if (rewards.length === 0 && justClaimedCount > 0) {
    return (
      <section
        aria-live="polite"
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3.5 shadow-2xs"
      >
        <span className="font-sans text-xs sm:text-sm font-semibold text-[var(--foreground)]">
          ✓{' '}
          {justClaimedCount === 1
            ? '1 sobre reclamado y guardado en tu inventario.'
            : `${justClaimedCount} sobres reclamados y guardados en tu inventario.`}
        </span>
        <Link
          href="/juegos/album"
          className="inline-flex shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-white px-3.5 py-1.5 font-sans text-xs font-bold text-[#e2001a] transition-colors hover:border-[#e2001a] active:scale-95"
        >
          Abrir en el Álbum →
        </Link>
      </section>
    );
  }

  const buttonLabel =
    rewards.length === 1
      ? 'Reclamar sobre'
      : `Reclamar sobres (${rewards.length})`;

  return (
    <section
      aria-label="Recompensas pendientes de La Porra"
      className="flex flex-col overflow-hidden rounded-2xl border border-[#e2001a]/30 bg-white shadow-xs"
    >
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-red-50/40 px-4 py-2.5">
        <span className="font-sans text-xs font-bold uppercase tracking-wider text-[#e2001a]">
          {rewards.length === 1
            ? 'Tienes 1 recompensa por reclamar'
            : `Tienes ${rewards.length} recompensas acumuladas`}
        </span>
        <span className="rounded-full bg-[#e2001a] px-2 py-0.5 font-sans text-[11px] font-bold tabular-nums text-white">
          {rewards.length}
        </span>
      </div>

      <ul className="divide-y divide-[var(--border)]">
        {rewards.map(({ match, prediction, evaluation, rewardTier }) => {
          const packConfig = PACK_TIERS[rewardTier];
          const matchPrefix = match.matchday ? `J${match.matchday} · ` : '';

          return (
            <li
              key={match.id}
              className="flex items-center justify-between gap-3 px-4 py-3"
            >
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate font-sans text-xs sm:text-sm font-bold tabular-nums text-[var(--foreground)]">
                  {matchPrefix}
                  {match.homeTeam.name} {match.actualHomeScore} - {match.actualAwayScore}{' '}
                  {match.awayTeam.name}
                </span>
                <div className="flex flex-wrap items-center gap-1.5 font-sans text-[11px] font-medium tabular-nums text-[var(--foreground-muted)]">
                  <span>
                    Tu pronóstico: {prediction.homeScore} - {prediction.awayScore}
                  </span>
                  <span>·</span>
                  <span className="font-bold text-[#e2001a]">
                    +{evaluation.points} {evaluation.points === 1 ? 'pt' : 'pts'}
                  </span>
                  <span>·</span>
                  <span className="font-semibold text-[var(--foreground)]">
                    {packConfig.name}
                  </span>
                </div>
              </div>

              <div className="shrink-0">
                <MiniPack tier={rewardTier} />
              </div>
            </li>
          );
        })}
      </ul>

      <div className="border-t border-[var(--border)] bg-[var(--surface)]/50 p-3">
        <button
          type="button"
          onClick={onClaimAll}
          className="flex h-10 w-full cursor-pointer items-center justify-center rounded-xl bg-[#e2001a] px-4 font-sans text-xs sm:text-sm font-bold text-white shadow-2xs transition-colors hover:bg-[#b30015] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e2001a] focus-visible:ring-offset-2"
        >
          {buttonLabel}
        </button>
      </div>
    </section>
  );
}
