// Client: Fila de puntuación (1 a 10) para un jugador o entrenador
"use client";

import { PlayerPhoto } from "@/components/media/player-photo";

export interface RatingTarget {
  readonly id: string;
  readonly name: string;
  readonly role: "player" | "coach";
  readonly jersey?: number | null;
  readonly photoUrl?: string | null;
  readonly averageRating: number;
}

interface MatchPlayerRatingRowProps {
  readonly target: RatingTarget;
  readonly userScore: number | null;
  readonly onScoreChange: (targetId: string, score: number) => void;
}

export function MatchPlayerRatingRow({
  target,
  userScore,
  onScoreChange,
}: MatchPlayerRatingRowProps) {
  const scores = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-white p-3.5 transition-all hover:border-neutral-300">
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-neutral-200 bg-neutral-100">
          <PlayerPhoto
            photoUrl={target.photoUrl}
            playerName={target.name}
            shirtNumber={target.jersey}
            size="sm"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-xs font-bold text-neutral-900">
              {target.name}
            </span>
            {target.jersey && (
              <span className="text-[10px] text-neutral-400 font-sans tabular-nums">
                #{target.jersey}
              </span>
            )}
          </div>
          <span className="text-[11px] text-[var(--foreground-muted)]">
            {target.role === "coach" ? "Entrenador" : "Jugador"}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase font-bold text-neutral-400">
            Media
          </span>
          <span className="text-xs font-bold text-neutral-800 font-sans tabular-nums">
            {target.averageRating.toFixed(1)}
          </span>
        </div>

        {/* Selector de notas 1..10 */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
          {scores.map((score) => {
            const isSelected = userScore === score;
            return (
              <button
                key={score}
                type="button"
                onClick={() => onScoreChange(target.id, score)}
                aria-label={`Puntuar ${score} a ${target.name}`}
                className={`h-7 w-7 rounded-md text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--primary)] font-sans tabular-nums ${
                  isSelected
                    ? "bg-[var(--primary)] text-white shadow-xs scale-105"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                {score}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
