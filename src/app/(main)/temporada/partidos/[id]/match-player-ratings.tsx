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

export function MatchPlayerRatings({ match }: MatchPlayerRatingsProps) {
  const { user, openAuthModal } = useAuth();
  const storedRatingsRaw = useLocalVote(`mareona_ratings_${match.externalId}`);
  const storedMvpId = useLocalVote(`mareona_mvp_${match.externalId}`);

  const [draftRatings, setDraftRatings] = useState<Record<string, number>>({});
  const [draftMvpId, setDraftMvpId] = useState<string | null>(null);
  const [localSubmitted, setLocalSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const storedRatings: Record<string, number> = useMemo(() => {
    if (!storedRatingsRaw) return {};
    try {
      const parsed = JSON.parse(storedRatingsRaw);
      return typeof parsed === "object" && parsed !== null ? parsed : {};
    } catch {
      return {};
    }
  }, [storedRatingsRaw]);

  const hasSubmitted = localSubmitted || Boolean(storedRatingsRaw) || Boolean(storedMvpId);
  const effectiveRatings = hasSubmitted && Object.keys(storedRatings).length > 0
    ? storedRatings
    : draftRatings;
  const effectiveMvpId = storedMvpId ?? draftMvpId;

  const { starters, substitutes, coach } = buildMatchRatingTargets(match);
  const candidates = [...starters, ...substitutes];

  const [mvpVotes, setMvpVotes] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    if (starters[0]) initial[starters[0].id] = 14;
    if (starters[1]) initial[starters[1].id] = 9;
    return initial;
  });

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
    if (hasSubmitted) return;
    setDraftRatings((prev) => ({ ...prev, [targetId]: score }));
  };

  const handleSelectMvp = (playerId: string) => {
    if (hasSubmitted) return;
    setDraftMvpId((prev) => (prev === playerId ? null : playerId));
  };

  const ratedCount = Object.keys(effectiveRatings).length;

  const handleSubmit = async () => {
    if (!user) {
      openAuthModal("signin");
      return;
    }
    const canSubmit = Boolean(draftMvpId) || ratedCount > 0;
    if (!canSubmit || hasSubmitted || isSubmitting) return;

    setIsSubmitting(true);
    try {
      setLocalSubmitted(true);
      const chosenMvpId = draftMvpId ?? Object.keys(draftRatings)[0] ?? null;

      if (chosenMvpId) {
        setMvpVotes((prev) => applyMvpVoteTransition(prev, chosenMvpId, null));
        try {
          localStorage.setItem(`mareona_mvp_${match.externalId}`, chosenMvpId);
        } catch {}
        await submitMvpVote({ matchId: match.externalId, playerId: chosenMvpId });
      }

      if (Object.keys(draftRatings).length > 0) {
        try {
          localStorage.setItem(`mareona_ratings_${match.externalId}`, JSON.stringify(draftRatings));
        } catch {}
        await Promise.all(
          Object.entries(draftRatings).map(([targetId, rating]) =>
            submitPlayerRating({ matchId: match.externalId, targetId, rating })
          )
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Recuadro 1: MVP del Partido */}
      <section
        aria-label="Votación del MVP"
        className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-xs"
      >
        <MatchMvpExpressBar
          candidates={candidates}
          selectedMvpId={effectiveMvpId}
          hasSubmitted={hasSubmitted}
          mvpVotes={mvpVotes}
          totalVotes={totalMvpVotes}
          effectiveVotedId={effectiveMvpId}
          onSelectMvp={handleSelectMvp}
        />
      </section>

      {/* Recuadro 2: Calificaciones individuales y cuerpo técnico */}
      <section
        aria-label="Calificaciones de futbolistas y cuerpo técnico"
        className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-xs space-y-6"
      >
        <MatchRatingsSectionList
          starters={starters}
          substitutes={substitutes}
          coach={coach}
          effectiveRatings={effectiveRatings}
          hasSubmitted={hasSubmitted}
          onScoreChange={handleScoreChange}
        />

        {/* Barra única de confirmación y bloqueo */}
        <MatchRatingsSubmitBar
          hasSubmitted={hasSubmitted}
          isSubmitting={isSubmitting}
          ratedCount={ratedCount}
          hasSelectedMvp={Boolean(draftMvpId)}
          onSubmit={handleSubmit}
        />
      </section>
    </div>
  );
}
