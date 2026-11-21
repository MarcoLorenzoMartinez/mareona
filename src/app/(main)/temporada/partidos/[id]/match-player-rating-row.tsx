// Client: Fila de puntuación (1 a 10) para un jugador o entrenador
"use client";

import { Users } from "lucide-react";
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
  readonly isSubmitted?: boolean;
  readonly onScoreChange: (targetId: string, score: number) => void;
}

const RATING_OPTIONS: Array<{
  value: number;
  label: string;
  ariaLabel: string;
  title: string;
}> = [
  { value: 0, label: "N/C", ariaLabel: "No calificable", title: "No calificable" },
  { value: 1, label: "1", ariaLabel: "Puntuar 1", title: "1 punto" },
  { value: 2, label: "2", ariaLabel: "Puntuar 2", title: "2 puntos" },
  { value: 3, label: "3", ariaLabel: "Puntuar 3", title: "3 puntos" },
  { value: 4, label: "4", ariaLabel: "Puntuar 4", title: "4 puntos" },
  { value: 5, label: "5", ariaLabel: "Puntuar 5", title: "5 puntos" },
  { value: 6, label: "6", ariaLabel: "Puntuar 6", title: "6 puntos" },
  { value: 7, label: "7", ariaLabel: "Puntuar 7", title: "7 puntos" },
  { value: 8, label: "8", ariaLabel: "Puntuar 8", title: "8 puntos" },
  { value: 9, label: "9", ariaLabel: "Puntuar 9", title: "9 puntos" },
  { value: 10, label: "10", ariaLabel: "Puntuar 10", title: "10 puntos" },
];

export function MatchPlayerRatingRow({
  target,
  userScore,
  isSubmitted = false,
  onScoreChange,
}: MatchPlayerRatingRowProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-white p-3.5 transition-all hover:border-neutral-300">
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-neutral-200 bg-neutral-100 flex items-center justify-center">
          {target.role === "coach" ? (
            <Users className="h-5 w-5 text-neutral-600" aria-hidden="true" />
          ) : (
            <PlayerPhoto
              photoUrl={target.photoUrl}
              playerName={target.name}
              shirtNumber={target.jersey}
              size="sm"
              className="h-full w-full object-cover"
            />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-xs font-bold text-neutral-900">
              {target.name}
            </span>
            {target.jersey && (
              <span className="text-[10px] text-neutral-600 font-sans tabular-nums">
                #{target.jersey}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
        {/* La media comunitaria solo se revela tras enviar las notas */}
        {isSubmitted && (
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase font-bold text-neutral-600">
              Media
            </span>
            <span className="text-xs font-bold text-neutral-800 font-sans tabular-nums">
              {target.averageRating > 0 ? target.averageRating.toFixed(1) : "N/C"}
            </span>
          </div>
        )}

        {/* Selector de notas N/C + 1..10 (bloqueado tras enviar) */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
          {RATING_OPTIONS.map((opt) => {
            const isSelected = userScore === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                disabled={isSubmitted}
                onClick={() => onScoreChange(target.id, opt.value)}
                aria-label={`${opt.ariaLabel} a ${target.name}`}
                title={opt.title}
                className={`h-7 min-w-[28px] px-1 rounded-md text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--primary)] font-sans tabular-nums ${
                  isSelected
                    ? "bg-[var(--primary)] text-white shadow-xs scale-105"
                    : isSubmitted
                    ? "bg-neutral-100 text-neutral-300 opacity-60 cursor-default"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
