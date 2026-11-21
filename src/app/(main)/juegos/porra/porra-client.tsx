// Client: Contenedor interactivo principal de La Porra, reclamo de sobres y clasificación social
'use client';

import React, { useState } from 'react';
import { PorraHeader } from './porra-header';
import { PorraMatchCard } from './porra-match-card';
import { PorraLeaderboard } from './porra-leaderboard';
import { PorraPendingRewards } from './porra-pending-rewards';
import { PorraRewardsModal } from './porra-rewards-modal';
import { usePorraSession } from './use-porra-session';
import type { PorraMatch } from '@/lib/porra/types';

interface PorraClientProps {
  readonly currentMatch: PorraMatch | null;
  readonly finishedMatches?: readonly PorraMatch[];
  readonly availablePlayers: string[];
}

export function PorraClient({
  currentMatch,
  finishedMatches = [],
  availablePlayers,
}: PorraClientProps) {
  const [isRewardsModalOpen, setIsRewardsModalOpen] = useState(false);
  const {
    user,
    prediction,
    pendingRewards,
    justClaimedCount,
    isSubmitting,
    mergedLeaderboard,
    currentUserScore,
    friendsCount,
    openAuthModal,
    handleSavePrediction,
    handleClaimAll,
  } = usePorraSession({ currentMatch, finishedMatches });

  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto w-full">
      <PorraHeader onOpenRewards={() => setIsRewardsModalOpen(true)} />

      <PorraPendingRewards
        rewards={pendingRewards}
        justClaimedCount={justClaimedCount}
        onClaimAll={handleClaimAll}
      />

      {currentMatch ? (
        <PorraMatchCard
          match={currentMatch}
          existingPrediction={prediction}
          onSavePrediction={handleSavePrediction}
          availablePlayers={availablePlayers}
          isAuthenticated={Boolean(user)}
          isSubmitting={isSubmitting}
          onRequireAuth={() => openAuthModal('signin')}
        />
      ) : (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 text-center text-sm text-neutral-600">
          No hay ningún próximo partido programado disponible en este momento.
        </div>
      )}

      <PorraLeaderboard
        entries={mergedLeaderboard}
        currentUserScore={currentUserScore}
        isAuthenticated={Boolean(user)}
        friendsCount={friendsCount}
        onOpenAuth={() => openAuthModal('signin')}
      />

      <PorraRewardsModal
        isOpen={isRewardsModalOpen}
        onClose={() => setIsRewardsModalOpen(false)}
      />
    </div>
  );
}
