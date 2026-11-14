// Client: Contenedor interactivo principal de La Porra, reclamo de sobres y clasificación social
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { toast } from '@/lib/ui/toast';
import { useAuth } from '@/context/auth-context';
import { PorraHeader } from './porra-header';
import { PorraMatchCard } from './porra-match-card';
import { PorraLeaderboard } from './porra-leaderboard';
import { PorraPendingRewards } from './porra-pending-rewards';
import { PorraRewardsModal } from './porra-rewards-modal';
import { isPorraSubmissionOpen } from '@/lib/porra/engine';
import { buildUserLeaderboardEntry } from '@/lib/porra/leaderboard';
import { fetchPorraCommunityData } from '@/lib/porra/queries';
import {
  getStoredPrediction,
  saveStoredPrediction,
  getStoredPredictionsMap,
  getPendingPorraRewards,
  claimPorraRewards,
} from '@/lib/porra/storage';
import type {
  PorraLeaderboardEntry,
  PorraMatch,
  PorraPrediction,
} from '@/lib/porra/types';

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
  const { user, profile, openAuthModal } = useAuth();
  const [isRewardsModalOpen, setIsRewardsModalOpen] = useState(false);
  const [claimVersion, setClaimVersion] = useState(0);
  const [justClaimedCount, setJustClaimedCount] = useState(0);
  const [communityEntries, setCommunityEntries] = useState<readonly PorraLeaderboardEntry[]>([]);
  const [friendsCount, setFriendsCount] = useState(0);

  const [prediction, setPrediction] = useState<PorraPrediction | null>(() =>
    getStoredPrediction(currentMatch.id, user?.id)
  );

  useEffect(() => {
    let active = true;
    void fetchPorraCommunityData(currentMatch.id).then((res) => {
      if (!active) return;
      setCommunityEntries(res.entries);
      setFriendsCount(res.friendsCount);
    });
    return () => {
      active = false;
    };
  }, [currentMatch.id, user?.id]);

  const pendingRewards = useMemo(() => {
    void claimVersion;
    return getPendingPorraRewards(finishedMatches, user?.id);
  }, [finishedMatches, user?.id, claimVersion]);

  const mergedLeaderboard = useMemo(() => {
    const predictionsMap = getStoredPredictionsMap(finishedMatches, user?.id);
    const localUserEntry = buildUserLeaderboardEntry({
      userId: user?.id,
      userName: profile?.display_name || profile?.username || 'Aficionado',
      finishedMatches,
      predictionsByMatchId: predictionsMap,
      currentPrediction: prediction,
    });

    if (!localUserEntry) return communityEntries;

    const withoutCurrent = communityEntries.filter(
      (e) => !e.isCurrentUser && (!user?.id || e.userId !== user.id)
    );
    const remoteCurrent = communityEntries.find(
      (e) => e.isCurrentUser || (user?.id && e.userId === user.id)
    );

    const combinedUserEntry: PorraLeaderboardEntry = remoteCurrent
      ? {
          ...localUserEntry,
          totalPoints: Math.max(remoteCurrent.totalPoints, localUserEntry.totalPoints),
          exactScoresCount: Math.max(
            remoteCurrent.exactScoresCount,
            localUserEntry.exactScoresCount
          ),
          outcomesCount: Math.max(
            remoteCurrent.outcomesCount,
            localUserEntry.outcomesCount
          ),
          lastMatchPoints:
            localUserEntry.lastMatchPoints ?? remoteCurrent.lastMatchPoints,
        }
      : localUserEntry;

    return [...withoutCurrent, combinedUserEntry];
  }, [communityEntries, finishedMatches, prediction, profile, user]);

  const currentUserScore = useMemo(() => {
    const mine = mergedLeaderboard.find((e) => e.isCurrentUser);
    return mine ? mine.totalPoints : undefined;
  }, [mergedLeaderboard]);

  const canRevealPredictions =
    prediction !== null ||
    !isPorraSubmissionOpen(
      currentMatch.kickoffAt,
      currentMatch.isFinished ? 'finished' : undefined
    );

  const handleSavePrediction = (newPred: PorraPrediction) => {
    setPrediction(newPred);
    saveStoredPrediction(newPred, user?.id);
    toast.success('Pronóstico confirmado para esta jornada.');
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
        entries={mergedLeaderboard}
        currentUserScore={currentUserScore}
        canRevealPredictions={canRevealPredictions}
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
