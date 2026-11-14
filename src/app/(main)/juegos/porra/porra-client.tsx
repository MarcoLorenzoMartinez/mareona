// Client: Contenedor interactivo principal de La Porra, reclamo de sobres y modal de recompensas
'use client';

import React, { useState, useMemo } from 'react';
import { toast } from '@/lib/ui/toast';
import { useAuth } from '@/context/auth-context';
import { PorraHeader } from './porra-header';
import { PorraMatchCard } from './porra-match-card';
import { PorraLeaderboard } from './porra-leaderboard';
import { PorraPendingRewards } from './porra-pending-rewards';
import { PorraRewardsModal } from './porra-rewards-modal';
import {
  getStoredPrediction,
  saveStoredPrediction,
  getPendingPorraRewards,
  claimPorraRewards,
} from '@/lib/porra/storage';
import type { PorraMatch, PorraPrediction } from '@/lib/porra/types';

interface PorraClientProps {
  readonly currentMatch: PorraMatch;
  readonly finishedMatches?: readonly PorraMatch[];
  readonly availablePlayers: string[];
}

export function PorraClient({
  currentMatch,
  finishedMatches = [],
  availablePlayers,
}: PorraClientProps) {
  const { user, openAuthModal } = useAuth();
  const [isRewardsModalOpen, setIsRewardsModalOpen] = useState(false);
  const [claimVersion, setClaimVersion] = useState(0);
  const [justClaimedCount, setJustClaimedCount] = useState(0);

  const [prediction, setPrediction] = useState<PorraPrediction | null>(() =>
    getStoredPrediction(currentMatch.id, user?.id)
  );

  const pendingRewards = useMemo(() => {
    void claimVersion;
    return getPendingPorraRewards(finishedMatches, user?.id);
  }, [finishedMatches, user?.id, claimVersion]);

  const handleSavePrediction = (newPred: PorraPrediction) => {
    setPrediction(newPred);
    saveStoredPrediction(newPred, user?.id);
  };

  const handleClaimAll = () => {
    if (!user?.id) {
      openAuthModal();
      return;
    }
    const addedCount = claimPorraRewards(pendingRewards, user.id);
    if (addedCount > 0) {
      setJustClaimedCount(addedCount);
      setClaimVersion((v) => v + 1);
      toast.success(
        addedCount === 1
          ? '+1 sobre añadido a tu inventario del Álbum.'
          : `+${addedCount} sobres añadidos a tu inventario del Álbum.`
      );
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto w-full">
      <PorraHeader onOpenRewards={() => setIsRewardsModalOpen(true)} />

      <PorraPendingRewards
        rewards={pendingRewards}
        justClaimedCount={justClaimedCount}
        onClaimAll={handleClaimAll}
      />

      <PorraMatchCard
        match={currentMatch}
        existingPrediction={prediction}
        onSavePrediction={handleSavePrediction}
        availablePlayers={availablePlayers}
      />

      <PorraLeaderboard
        entries={[]}
        currentUserScore={undefined}
      />

      <PorraRewardsModal
        isOpen={isRewardsModalOpen}
        onClose={() => setIsRewardsModalOpen(false)}
      />
    </div>
  );
}
