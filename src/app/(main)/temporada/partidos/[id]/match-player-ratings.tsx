// Client: Calificaciones y notas a jugadores y cuerpo técnico
"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { submitPlayerRating } from "@/lib/match-community/actions";
import { MatchPlayerRatingRow, type RatingTarget } from "./match-player-rating-row";
import type { DomainMatchDetail } from "@/lib/sports-api/types";

interface MatchPlayerRatingsProps {
  readonly match: DomainMatchDetail;
}

export function MatchPlayerRatings({ match }: MatchPlayerRatingsProps) {
  const { user, openAuthModal } = useAuth();
  const [userRatings, setUserRatings] = useState<Record<string, number>>({});

  const sportingLineup = match.homeLineup?.isSporting
    ? match.homeLineup
    : match.awayLineup?.isSporting
    ? match.awayLineup
    : null;

  const coachTarget: RatingTarget = {
    id: "coach-sporting",
    name: "Cuerpo Técnico",
    role: "coach",
    averageRating: 6.8,
  };

  const playerStatsMap = match.advancedStats?.playerStats;

  const startersTargets: RatingTarget[] = (sportingLineup?.starters ?? []).map((p) => {
    const stats = playerStatsMap?.[p.id];
    return {
      id: p.id,
      name: p.name,
      role: "player",
      jersey: p.jersey,
      photoUrl: p.photoUrl,
      averageRating: stats?.rating ?? 6.5,
    };
  });

  const subsTargets: RatingTarget[] = (sportingLineup?.substitutes ?? [])
    .filter((p) => p.subbedIn || playerStatsMap?.[p.id])
    .map((p) => {
      const stats = playerStatsMap?.[p.id];
      return {
        id: p.id,
        name: p.name,
        role: "player",
        jersey: p.jersey,
        photoUrl: p.photoUrl,
        averageRating: stats?.rating ?? 6.0,
      };
    });

  const targets: RatingTarget[] = [coachTarget, ...startersTargets, ...subsTargets];

  const handleScoreChange = async (targetId: string, score: number) => {
    if (!user) {
      openAuthModal("signin");
      return;
    }
    setUserRatings((prev) => ({ ...prev, [targetId]: score }));

    await submitPlayerRating({
      matchId: match.externalId,
      targetId,
      rating: score,
    });
  };

  if (targets.length <= 1) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center text-xs text-[var(--foreground-muted)]">
        La alineación del Real Sporting aún no está disponible para valorar las actuaciones individuales.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-xs">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-neutral-900">
          Notas a los Jugadores y Entrenador
        </h3>
        <p className="text-xs text-[var(--foreground-muted)]">
          Puntúa del 1 al 10 el rendimiento de cada futbolista en el partido
        </p>
      </div>

      <div className="space-y-2">
        {targets.map((target) => (
          <MatchPlayerRatingRow
            key={target.id}
            target={target}
            userScore={userRatings[target.id] ?? null}
            onScoreChange={handleScoreChange}
          />
        ))}
      </div>
    </div>
  );
}
