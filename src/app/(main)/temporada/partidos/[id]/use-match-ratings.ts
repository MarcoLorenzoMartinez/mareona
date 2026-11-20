// Client: Hook de carga, votación MVP y envío de calificaciones de partido con persistencia en Supabase
"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "@/lib/ui/toast";
import { useAuth } from "@/context/auth-context";
import {
  getMatchCommunityRatings,
  submitMatchPlayerRatings,
  submitMvpVote,
} from "@/lib/match-community/actions";
import { applyMvpVoteTransition } from "@/lib/match-community/mvp";
import { buildMatchRatingTargets, type RatingTarget } from "./rating-targets";
import type { DomainMatchDetail } from "@/lib/sports-api/types";

function overlayCommunityAverage(
  target: RatingTarget,
  averages: Readonly<Record<string, number>>
): RatingTarget {
  return {
    ...target,
    averageRating: averages[target.id] ?? 0,
  };
}

export function useMatchRatings(match: DomainMatchDetail) {
  const { user, openAuthModal } = useAuth();
  const [draftRatings, setDraftRatings] = useState<Record<string, number>>({});
  const [draftMvpId, setDraftMvpId] = useState<string | null>(null);
  const [persistedMvpId, setPersistedMvpId] = useState<string | null>(null);
  const [persistedRatings, setPersistedRatings] = useState<Record<string, number>>({});
  const [mvpVotes, setMvpVotes] = useState<Record<string, number>>({});
  const [communityAverages, setCommunityAverages] = useState<Record<string, number>>({});
  const [isSubmittingMvp, setIsSubmittingMvp] = useState(false);
  const [isSubmittingRatings, setIsSubmittingRatings] = useState(false);

  const sessionKey = `${match.externalId}_${user?.id ?? "anon"}`;
  const [prevSessionKey, setPrevSessionKey] = useState(sessionKey);
  if (prevSessionKey !== sessionKey) {
    setPrevSessionKey(sessionKey);
    setPersistedMvpId(null);
    setPersistedRatings({});
    setDraftMvpId(null);
    setDraftRatings({});
  }

  useEffect(() => {
    if (match.status !== "finished") return;
    let active = true;

    void getMatchCommunityRatings(match.externalId).then((state) => {
      if (!active) return;
      setMvpVotes(state.mvpVoteCounts);
      setCommunityAverages(state.communityRatingAverages);
      setPersistedMvpId(state.userMvpPlayerId);
      setPersistedRatings(state.userRatings);
    });

    return () => {
      active = false;
    };
  }, [match.externalId, match.status, user?.id]);

  const rawTargets = useMemo(() => buildMatchRatingTargets(match), [match]);
  const starters = useMemo(
    () => rawTargets.starters.map((t) => overlayCommunityAverage(t, communityAverages)),
    [rawTargets.starters, communityAverages]
  );
  const substitutes = useMemo(
    () => rawTargets.substitutes.map((t) => overlayCommunityAverage(t, communityAverages)),
    [rawTargets.substitutes, communityAverages]
  );
  const coach = useMemo(
    () => overlayCommunityAverage(rawTargets.coach, communityAverages),
    [rawTargets.coach, communityAverages]
  );

  const hasSubmittedMvp = Boolean(persistedMvpId);
  const hasSubmittedRatings = Object.keys(persistedRatings).length > 0;
  const effectiveRatings = hasSubmittedRatings ? persistedRatings : draftRatings;
  const effectiveMvpId = persistedMvpId ?? draftMvpId;
  const totalMvpVotes = Object.values(mvpVotes).reduce((sum, count) => sum + count, 0);
  const ratedCount = Object.keys(effectiveRatings).length;

  const handleScoreChange = (targetId: string, score: number) => {
    if (hasSubmittedRatings) return;
    setDraftRatings((prev) => ({ ...prev, [targetId]: score }));
  };

  const handleSelectMvp = (playerId: string) => {
    if (hasSubmittedMvp) return;
    setDraftMvpId((prev) => (prev === playerId ? null : playerId));
  };

  const handleSubmitMvp = async () => {
    if (!user) return openAuthModal("signin");
    if (!draftMvpId || hasSubmittedMvp || isSubmittingMvp) return;
    setIsSubmittingMvp(true);
    try {
      const res = await submitMvpVote({ matchId: match.externalId, playerId: draftMvpId });
      if (!res.success || !res.data) {
        toast.error(res.error ?? "No se pudo registrar tu voto al MVP");
        return;
      }
      setPersistedMvpId(res.data.playerId);
      setMvpVotes((prev) =>
        Object.keys(res.data?.mvpVoteCounts ?? {}).length > 0
          ? res.data!.mvpVoteCounts
          : applyMvpVoteTransition(prev, draftMvpId, null)
      );
      toast.success("Voto al MVP registrado");
    } finally {
      setIsSubmittingMvp(false);
    }
  };

  const handleSubmitRatings = async () => {
    if (!user) return openAuthModal("signin");
    if (ratedCount === 0 || hasSubmittedRatings || isSubmittingRatings) return;

    setIsSubmittingRatings(true);
    try {
      const res = await submitMatchPlayerRatings({
        matchId: match.externalId,
        ratings: Object.entries(draftRatings).map(([targetId, rating]) => ({
          targetId,
          rating,
        })),
      });

      if (!res.success || !res.data) {
        toast.error(res.error ?? "No se pudieron guardar tus calificaciones");
        return;
      }

      setPersistedRatings(res.data.userRatings);
      setCommunityAverages(res.data.communityRatingAverages);
      toast.success("Calificaciones registradas");
    } finally {
      setIsSubmittingRatings(false);
    }
  };

  return {
    starters,
    substitutes,
    coach,
    candidates: [...starters, ...substitutes],
    hasSubmittedMvp,
    hasSubmittedRatings,
    effectiveRatings,
    effectiveMvpId,
    mvpVotes,
    totalMvpVotes,
    ratedCount,
    isSubmittingMvp,
    isSubmittingRatings,
    handleScoreChange,
    handleSelectMvp,
    handleSubmitMvp,
    handleSubmitRatings,
  };
}
