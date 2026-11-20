// Client: Calificaciones y notas a jugadores y entrenador con selector express de MVP integrado
"use client";

import { MatchRatingsSubmitBar } from "./match-ratings-submit-bar";
import { MatchMvpExpressBar } from "./match-mvp-express-bar";
import { MatchRatingsSectionList } from "./match-ratings-section-list";
import { useMatchRatings } from "./use-match-ratings";
import type { DomainMatchDetail } from "@/lib/sports-api/types";

interface MatchPlayerRatingsProps {
  readonly match: DomainMatchDetail;
}

export function MatchPlayerRatings({ match }: MatchPlayerRatingsProps) {
  const {
    starters,
    substitutes,
    coach,
    candidates,
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
  } = useMatchRatings(match);

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
