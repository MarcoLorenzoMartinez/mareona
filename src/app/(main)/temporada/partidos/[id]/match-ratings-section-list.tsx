// Client: Secciones de titulares, suplentes y cuerpo técnico para calificaciones
"use client";

import { MatchPlayerRatingRow } from "./match-player-rating-row";
import type { RatingTarget } from "./rating-targets";

interface MatchRatingsSectionListProps {
  readonly starters: readonly RatingTarget[];
  readonly substitutes: readonly RatingTarget[];
  readonly coach: RatingTarget;
  readonly effectiveRatings: Record<string, number>;
  readonly hasSubmitted: boolean;
  readonly onScoreChange: (targetId: string, score: number) => void;
}

export function MatchRatingsSectionList({
  starters,
  substitutes,
  coach,
  effectiveRatings,
  hasSubmitted,
  onScoreChange,
}: MatchRatingsSectionListProps) {
  return (
    <div className="space-y-6">
      {/* 1. Titulares */}
      <section aria-labelledby="heading-titulares">
        <h4
          id="heading-titulares"
          className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-2.5"
        >
          Titulares
        </h4>
        <div className="space-y-2">
          {starters.map((target) => (
            <MatchPlayerRatingRow
              key={target.id}
              target={target}
              userScore={effectiveRatings[target.id] ?? null}
              isSubmitted={hasSubmitted}
              onScoreChange={onScoreChange}
            />
          ))}
        </div>
      </section>

      {/* 2. Cambios */}
      {substitutes.length > 0 && (
        <section aria-labelledby="heading-cambios">
          <h4
            id="heading-cambios"
            className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-2.5"
          >
            Cambios
          </h4>
          <div className="space-y-2">
            {substitutes.map((target) => (
              <MatchPlayerRatingRow
                key={target.id}
                target={target}
                userScore={effectiveRatings[target.id] ?? null}
                isSubmitted={hasSubmitted}
                onScoreChange={onScoreChange}
              />
            ))}
          </div>
        </section>
      )}

      {/* 3. Cuerpo Técnico */}
      <section aria-labelledby="heading-cuerpo-tecnico">
        <h4
          id="heading-cuerpo-tecnico"
          className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-2.5"
        >
          Cuerpo Técnico
        </h4>
        <div className="space-y-2">
          <MatchPlayerRatingRow
            key={coach.id}
            target={coach}
            userScore={effectiveRatings[coach.id] ?? null}
            isSubmitted={hasSubmitted}
            onScoreChange={onScoreChange}
          />
        </div>
      </section>
    </div>
  );
}
