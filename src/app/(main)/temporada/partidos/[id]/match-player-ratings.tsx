// Client: Calificaciones y notas a jugadores y entrenador con selector express de MVP integrado
"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/context/auth-context";
import { submitPlayerRating, submitMvpVote } from "@/lib/match-community/actions";
import { applyMvpVoteTransition } from "@/lib/match-community/mvp";
import { useLocalVote } from "@/lib/match-community/use-local-vote";
import { MatchRatingsSubmitBar } from "./match-ratings-submit-bar";
import { MatchMvpExpressBar } from "./match-mvp-express-bar";
import { MatchRatingsSectionList } from "./match-ratings-section-list";
import { buildMatchRatingTargets } from "./rating-targets";
import type { DomainMatchDetail } from "@/lib/sports-api/types";

interface MatchPlayerRatingsProps {
  readonly match: DomainMatchDetail;
}

function parseRatingsJson(raw: string | null): Record<string, number> {
  if (!raw) return {};
  try {
    const p = JSON.parse(raw);
    return typeof p === "object" && p !== null ? p : {};
  } catch {
    return {};
  }
}

export function MatchPlayerRatings({ match }: MatchPlayerRatingsProps) {
  const { user, openAuthModal } = useAuth();
  const storedRatingsRaw = useLocalVote(`mareona_ratings_${match.externalId}`);
  const storedMvpId = useLocalVote(`mareona_mvp_${match.externalId}`);

  const [draftRatings, setDraftRatings] = useState<Record<string, number>>({});
  const [draftMvpId, setDraftMvpId] = useState<string | null>(null);
  const [localSubmittedMvp, setLocalSubmittedMvp] = useState(false);
  const [localSubmittedRatings, setLocalSubmittedRatings] = useState(false);
  const [isSubmittingMvp, setIsSubmittingMvp] = useState(false);
  const [isSubmittingRatings, setIsSubmittingRatings] = useState(false);

  const storedRatings = useMemo(() => parseRatingsJson(storedRatingsRaw), [storedRatingsRaw]);
  const hasSubmittedMvp = localSubmittedMvp || Boolean(storedMvpId);
  const hasSubmittedRatings = localSubmittedRatings || Boolean(storedRatingsRaw);

  const effectiveRatings = hasSubmittedRatings && Object.keys(storedRatings).length > 0
    ? storedRatings
    : draftRatings;
  const effectiveMvpId = storedMvpId ?? draftMvpId;

  const { starters, substitutes, coach } = buildMatchRatingTargets(match);
  const candidates = [...starters, ...substitutes];

  const [mvpVotes, setMvpVotes] = useState<Record<string, number>>(() => ({
    ...(starters[0] ? { [starters[0].id]: 14 } : {}),
    ...(starters[1] ? { [starters[1].id]: 9 } : {}),
  }));

  const totalMvpVotes = Object.values(mvpVotes).reduce((sum, count) => sum + count, 0);

  if (match.status !== "finished") {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center text-xs text-[var(--foreground-muted)]">
        Las calificaciones y la votación del MVP se abrirán al finalizar el partido.
      </div>
    );
  }

  if (starters.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center text-xs text-[var(--foreground-muted)]">
        La alineación del Real Sporting aún no está disponible para valorar las actuaciones individuales.
      </div>
    );
  }

  const handleScoreChange = (targetId: string, score: number) => {
    if (hasSubmittedRatings) return;
    setDraftRatings((prev) => ({ ...prev, [targetId]: score }));
  };

  const handleSelectMvp = (playerId: string) => {
    if (hasSubmittedMvp) return;
    setDraftMvpId((prev) => (prev === playerId ? null : playerId));
  };

  const ratedCount = Object.keys(effectiveRatings).length;

  const commitMvpVote = async (playerId: string) => {
    setMvpVotes((prev) => applyMvpVoteTransition(prev, playerId, null));
    setLocalSubmittedMvp(true);
    try {
      localStorage.setItem(`mareona_mvp_${match.externalId}`, playerId);
    } catch {}
    await submitMvpVote({ matchId: match.externalId, playerId });
  };

  const handleSubmitMvp = async () => {
    if (!user) return openAuthModal("signin");
    if (!draftMvpId || hasSubmittedMvp || isSubmittingMvp) return;
    setIsSubmittingMvp(true);
    try {
      await commitMvpVote(draftMvpId);
    } finally {
      setIsSubmittingMvp(false);
    }
  };

  const handleSubmitRatings = async () => {
    if (!user) return openAuthModal("signin");
    if (ratedCount === 0 || hasSubmittedRatings || isSubmittingRatings) return;

    setIsSubmittingRatings(true);
    try {
      setLocalSubmittedRatings(true);
      try {
        localStorage.setItem(`mareona_ratings_${match.externalId}`, JSON.stringify(draftRatings));
      } catch {}
      await Promise.all(
        Object.entries(draftRatings).map(([targetId, rating]) =>
          submitPlayerRating({ matchId: match.externalId, targetId, rating })
        )
      );
    } finally {
      setIsSubmittingRatings(false);
    }
  };

  return (
    <div className="space-y-6">
      <section aria-label="Votación del MVP" className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-xs">
        <MatchMvpExpressBar
          candidates={candidates}
          selectedMvpId={effectiveMvpId}
          hasSubmitted={hasSubmittedMvp}
          mvpVotes={mvpVotes}
          totalVotes={totalMvpVotes}
          effectiveVotedId={effectiveMvpId}
          isSubmitting={isSubmittingMvp}
          onSelectMvp={handleSelectMvp}
          onSubmitMvp={handleSubmitMvp}
        />
      </section>

      <section aria-label="Calificaciones de futbolistas" className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-xs space-y-6">
        <MatchRatingsSectionList
          starters={starters}
          substitutes={substitutes}
          coach={coach}
          effectiveRatings={effectiveRatings}
          hasSubmitted={hasSubmittedRatings}
          onScoreChange={handleScoreChange}
        />
        <MatchRatingsSubmitBar
          hasSubmitted={hasSubmittedRatings}
          isSubmitting={isSubmittingRatings}
          ratedCount={ratedCount}
          onSubmit={handleSubmitRatings}
        />
      </section>
    </div>
  );
}
