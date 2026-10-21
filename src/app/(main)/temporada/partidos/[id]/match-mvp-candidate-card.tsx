// Client: Tarjeta individual de candidato para la votación de MVP
"use client";

import { PlayerPhoto } from "@/components/media/player-photo";
import type { DomainLineupPlayer } from "@/lib/sports-api/types";

interface MatchMvpCandidateCardProps {
  readonly player: DomainLineupPlayer;
  readonly isSelected: boolean;
  readonly isSubmitted: boolean;
  readonly isVoted: boolean;
  readonly isLeader: boolean;
  readonly percentage: number;
  readonly onSelect: (playerId: string) => void;
}

export function MatchMvpCandidateCard({
  player,
  isSelected,
  isSubmitted,
  isVoted,
  isLeader,
  percentage,
  onSelect,
}: MatchMvpCandidateCardProps) {
  return (
    <button
      type="button"
      disabled={isSubmitted}
      onClick={() => onSelect(player.id)}
      className={`relative flex items-center gap-3 rounded-xl border p-2.5 text-left transition-all ${
        isSubmitted
          ? isVoted
            ? "border-[var(--primary)] bg-red-50/40 ring-1 ring-[var(--primary)] cursor-default"
            : "border-[var(--border)] bg-white opacity-85 cursor-default"
          : isSelected
          ? "border-[var(--primary)] bg-red-50/40 ring-2 ring-[var(--primary)] shadow-2xs"
          : "border-[var(--border)] bg-white hover:border-neutral-300 hover:bg-neutral-50/60"
      }`}
    >
      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-neutral-200 bg-neutral-100">
        <PlayerPhoto
          photoUrl={player.photoUrl}
          playerName={player.name}
          shirtNumber={player.jersey}
          size="sm"
          className="h-full w-full object-cover"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-xs font-bold text-neutral-900">
            {player.name}
          </span>
          {player.jersey && (
            <span className="text-[10px] text-neutral-400 font-sans tabular-nums">
              #{player.jersey}
            </span>
          )}
        </div>

        {/* Los porcentajes y barras solo se revelan tras enviar el voto */}
        {isSubmitted && (
          <div className="mt-1 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-100">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isLeader ? "bg-[var(--primary)]" : "bg-neutral-400"
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="shrink-0 text-[11px] font-bold text-neutral-600 font-sans tabular-nums">
              {percentage}%
            </span>
          </div>
        )}
      </div>

      {/* Badges de estado */}
      {isSubmitted && isVoted && (
        <span className="shrink-0 rounded-full bg-[var(--primary)] px-2 py-0.5 text-[10px] font-bold text-white font-sans">
          Tu voto
        </span>
      )}
      {!isSubmitted && isSelected && (
        <span className="shrink-0 rounded-full bg-[var(--primary)] px-2 py-0.5 text-[10px] font-bold text-white font-sans">
          Elegido
        </span>
      )}
    </button>
  );
}
