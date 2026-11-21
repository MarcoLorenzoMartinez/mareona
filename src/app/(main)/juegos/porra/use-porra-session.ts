// Client: Hook de estado, sincronización Supabase y cálculo de clasificación de La Porra
'use client';

import { useState, useMemo, useEffect } from 'react';
import { toast } from '@/lib/ui/toast';
import { useAuth } from '@/context/auth-context';
import { buildUserLeaderboardEntry } from '@/lib/porra/leaderboard';
import { resolveUnclaimedPorraRewards } from '@/lib/porra/engine';
import { fetchPorraCommunityData } from '@/lib/porra/queries';
import {
  submitPorraPrediction,
  fetchAndSettleUserPorraState,
} from '@/lib/porra/actions';
import { syncAlbumAccountWithServer } from '@/lib/cards/account-sync-client';
import {
  getStoredPrediction,
  saveStoredPrediction,
  getStoredPredictionsMap,
  getClaimedPorraMatchIds,
  claimPorraRewards,
} from '@/lib/porra/storage';
import type {
  PorraLeaderboardEntry,
  PorraMatch,
  PorraPrediction,
} from '@/lib/porra/types';
import { getDictionary } from '@/i18n';

interface UsePorraSessionOptions {
  readonly currentMatch: PorraMatch | null;
  readonly finishedMatches: readonly PorraMatch[];
}

export function usePorraSession({
  currentMatch,
  finishedMatches,
}: UsePorraSessionOptions) {
  const dict = getDictionary();
  const { user, profile, openAuthModal } = useAuth();
  const userId = user?.id;
  const [claimVersion, setClaimVersion] = useState(0);
  const [justClaimedCount, setJustClaimedCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [communityEntries, setCommunityEntries] = useState<
    readonly PorraLeaderboardEntry[]
  >([]);
  const [friendsCount, setFriendsCount] = useState(0);
  const [remotePredictions, setRemotePredictions] = useState<
    Readonly<Record<string, PorraPrediction>>
  >({});

  const currentMatchId = currentMatch?.id ?? null;
  const [prevUserId, setPrevUserId] = useState(userId);
  const [prediction, setPrediction] = useState<PorraPrediction | null>(null);

  if (prevUserId !== userId) {
    setPrevUserId(userId);
    setPrediction(userId && currentMatchId ? getStoredPrediction(currentMatchId, userId) : null);
    setRemotePredictions({});
  }

  useEffect(() => {
    let active = true;

    async function loadSessionData() {
      if (userId && currentMatchId) {
        const localPred = getStoredPrediction(currentMatchId, userId);
        if (localPred && active) setPrediction(localPred);
      }
      const communityPromise = fetchPorraCommunityData(currentMatchId);

      if (!userId) {
        const res = await communityPromise;
        if (!active) return;
        setCommunityEntries(res.entries);
        setFriendsCount(res.friendsCount);
        return;
      }

      const [communityRes, userState] = await Promise.all([
        communityPromise,
        fetchAndSettleUserPorraState(),
      ]);

      if (!active) return;

      setRemotePredictions(userState.predictionsByMatchId);
      const remoteCurrentPred = currentMatchId
        ? userState.predictionsByMatchId[currentMatchId]
        : undefined;
      if (remoteCurrentPred) {
        setPrediction(remoteCurrentPred);
        saveStoredPrediction(remoteCurrentPred, userId);
      }

      if (userState.settledCount > 0) {
        const refreshed = await fetchPorraCommunityData(currentMatchId);
        if (!active) return;
        setCommunityEntries(refreshed.entries);
        setFriendsCount(refreshed.friendsCount);
      } else {
        setCommunityEntries(communityRes.entries);
        setFriendsCount(communityRes.friendsCount);
      }
    }

    void loadSessionData();
    return () => {
      active = false;
    };
  }, [currentMatchId, userId]);

  const mergedPredictionsMap = useMemo(() => {
    if (!userId) return {};
    const localMap = getStoredPredictionsMap(finishedMatches, userId);
    return {
      ...localMap,
      ...remotePredictions,
    };
  }, [finishedMatches, userId, remotePredictions]);

  const pendingRewards = useMemo(() => {
    void claimVersion;
    if (!userId) return [];
    const claimedIds = getClaimedPorraMatchIds(userId);
    return resolveUnclaimedPorraRewards(
      finishedMatches,
      mergedPredictionsMap,
      claimedIds
    );
  }, [finishedMatches, mergedPredictionsMap, userId, claimVersion]);

  const mergedLeaderboard = useMemo(() => {
    if (!userId) return communityEntries;
    const localUserEntry = buildUserLeaderboardEntry({
      userId,
      userName:
        profile?.display_name ||
        profile?.username ||
        dict.auth.common.defaultFanName,
      finishedMatches,
      predictionsByMatchId: mergedPredictionsMap,
      currentPrediction: prediction,
    });

    if (!localUserEntry) return communityEntries;

    const withoutCurrent = communityEntries.filter(
      (e) => !e.isCurrentUser && e.userId !== userId
    );
    const remoteCurrent = communityEntries.find(
      (e) => e.isCurrentUser || e.userId === userId
    );

    const combinedUserEntry: PorraLeaderboardEntry = remoteCurrent
      ? {
          ...localUserEntry,
          totalPoints: Math.max(
            remoteCurrent.totalPoints,
            localUserEntry.totalPoints
          ),
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
  }, [
    communityEntries,
    finishedMatches,
    mergedPredictionsMap,
    prediction,
    profile,
    userId,
    dict.auth.common.defaultFanName,
  ]);

  const currentUserScore = useMemo(() => {
    const mine = mergedLeaderboard.find((e) => e.isCurrentUser);
    return mine ? mine.totalPoints : undefined;
  }, [mergedLeaderboard]);

  const handleSavePrediction = async (newPred: PorraPrediction) => {
    if (!user?.id) {
      openAuthModal('signin');
      return;
    }
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await submitPorraPrediction({
        matchId: newPred.matchId,
        homeScore: newPred.homeScore,
        awayScore: newPred.awayScore,
        sportingScorers: newPred.sportingScorers,
      });

      if (!res.success || !res.data) {
        toast.error(res.error ?? 'No se pudo confirmar tu pronóstico');
        return;
      }

      const persisted = res.data;
      setPrediction(persisted);
      setRemotePredictions((prev) => ({
        ...prev,
        [persisted.matchId]: persisted,
      }));
      saveStoredPrediction(persisted, user.id);
      toast.success(dict.games.porra.toasts.predictionConfirmed);

      const refreshed = await fetchPorraCommunityData(currentMatchId);
      setCommunityEntries(refreshed.entries);
      setFriendsCount(refreshed.friendsCount);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClaimAll = () => {
    if (!user?.id) {
      openAuthModal();
      return;
    }
    const addedCount = claimPorraRewards(pendingRewards, user.id);
    if (addedCount > 0) {
      void syncAlbumAccountWithServer(user.id, 'push');
      setJustClaimedCount(addedCount);
      setClaimVersion((v) => v + 1);
      toast.success(
        addedCount === 1
          ? dict.games.porra.toasts.onePackAdded
          : `${dict.games.porra.toasts.manyPacksPrefix}${addedCount} ${dict.games.porra.toasts.manyPacksSuffix}`
      );
    }
  };

  return {
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
  };
}
