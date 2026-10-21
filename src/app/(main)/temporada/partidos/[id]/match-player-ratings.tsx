// Client: Calificaciones y notas a jugadores y entrenador con confirmación de envío
"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { submitPlayerRating } from "@/lib/match-community/actions";
import { MatchPlayerRatingRow } from "./match-player-rating-row";
import { buildMatchRatingTargets } from "./rating-targets";
import type { DomainMatchDetail } from "@/lib/sports-api/types";

interface MatchPlayerRatingsProps {
  readonly match: DomainMatchDetail;
}

export function MatchPlayerRatings({ match }: MatchPlayerRatingsProps) {
  const { user, openAuthModal } = useAuth();
  const [userRatings, setUserRatings] = useState<Record<string, number>>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Las notas solo se abren al finalizar el partido
  if (match.status !== "finished") {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center text-xs text-[var(--foreground-muted)]">
        Las notas a los futbolistas y entrenador se abrirán al finalizar el partido.
      </div>
    );
  }

  const { starters, substitutes, coach } = buildMatchRatingTargets(match);

  if (starters.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center text-xs text-[var(--foreground-muted)]">
        La alineación del Real Sporting aún no está disponible para valorar las actuaciones individuales.
      </div>
    );
  }

  const handleScoreChange = (targetId: string, score: number) => {
    if (hasSubmitted) return;
    setUserRatings((prev) => ({ ...prev, [targetId]: score }));
  };

  const ratedCount = Object.keys(userRatings).length;

  const handleSubmitRatings = async () => {
    if (!user) {
      openAuthModal("signin");
      return;
    }
    if (ratedCount === 0 || hasSubmitted || isSubmitting) return;

    setIsSubmitting(true);
    try {
      setHasSubmitted(true);
      await Promise.all(
        Object.entries(userRatings).map(([targetId, rating]) =>
          submitPlayerRating({
            matchId: match.externalId,
            targetId,
            rating,
          })
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-xs space-y-6">
      {/* Titulares */}
      <section aria-labelledby="heading-titulares">
        <div className="mb-2.5">
          <h4
            id="heading-titulares"
            className="text-xs font-bold uppercase tracking-wider text-neutral-900"
          >
            Titulares
          </h4>
        </div>
        <div className="space-y-2">
          {starters.map((target) => (
            <MatchPlayerRatingRow
              key={target.id}
              target={target}
              userScore={userRatings[target.id] ?? null}
              isSubmitted={hasSubmitted}
              onScoreChange={handleScoreChange}
            />
          ))}
        </div>
      </section>

      {/* Jugadores que entraron en los cambios */}
      {substitutes.length > 0 && (
        <section aria-labelledby="heading-cambios">
          <div className="mb-2.5">
            <h4
              id="heading-cambios"
              className="text-xs font-bold uppercase tracking-wider text-neutral-900"
            >
              Cambios
            </h4>
          </div>
          <div className="space-y-2">
            {substitutes.map((target) => (
              <MatchPlayerRatingRow
                key={target.id}
                target={target}
                userScore={userRatings[target.id] ?? null}
                isSubmitted={hasSubmitted}
                onScoreChange={handleScoreChange}
              />
            ))}
          </div>
        </section>
      )}

      {/* Entrenador */}
      <section aria-labelledby="heading-entrenador">
        <div className="mb-2.5">
          <h4
            id="heading-entrenador"
            className="text-xs font-bold uppercase tracking-wider text-neutral-900"
          >
            Entrenador
          </h4>
        </div>
        <div className="space-y-2">
          <MatchPlayerRatingRow
            key={coach.id}
            target={coach}
            userScore={userRatings[coach.id] ?? null}
            isSubmitted={hasSubmitted}
            onScoreChange={handleScoreChange}
          />
        </div>
      </section>

      {/* Botón de envío y bloqueo */}
      <div className="flex flex-col items-center gap-2 border-t border-[var(--border)] pt-4">
        {!hasSubmitted ? (
          <>
            <button
              type="button"
              disabled={ratedCount === 0 || isSubmitting}
              onClick={handleSubmitRatings}
              className="w-full sm:w-auto min-w-[200px] rounded-full bg-[var(--primary)] px-6 py-2.5 text-xs font-bold text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting
                ? "Enviando puntuaciones..."
                : ratedCount > 0
                ? `Enviar notas (${ratedCount})`
                : "Enviar notas"}
            </button>
            <p className="text-[11px] text-[var(--foreground-muted)]">
              Una vez enviadas tus notas, no se podrán modificar.
            </p>
          </>
        ) : (
          <div className="flex items-center gap-2 rounded-xl bg-neutral-50 px-4 py-2.5 text-xs font-semibold text-neutral-700">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Puntuaciones registradas. Medias generales desbloqueadas.</span>
          </div>
        )}
      </div>
    </div>
  );
}
