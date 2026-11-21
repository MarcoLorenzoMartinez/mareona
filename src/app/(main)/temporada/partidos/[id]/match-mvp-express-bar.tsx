// Client: Selector express de MVP del partido y tarjeta destacada de resultados
"use client";

import { Trophy, Star, Check } from "lucide-react";
import { PlayerPhoto } from "@/components/media/player-photo";
import type { RatingTarget } from "./rating-targets";

interface MatchMvpExpressBarProps {
  readonly candidates: readonly RatingTarget[];
  readonly selectedMvpId: string | null;
  readonly hasSubmitted: boolean;
  readonly mvpVotes: Record<string, number>;
  readonly totalVotes: number;
  readonly effectiveVotedId: string | null;
  readonly isSubmitting?: boolean;
  readonly onSelectMvp: (id: string) => void;
  readonly onSubmitMvp?: () => void;
}

export function MatchMvpExpressBar({
  candidates,
  selectedMvpId,
  hasSubmitted,
  mvpVotes,
  totalVotes,
  effectiveVotedId,
  isSubmitting = false,
  onSelectMvp,
  onSubmitMvp,
}: MatchMvpExpressBarProps) {
  if (candidates.length === 0) return null;

  // Si ya se ha enviado el voto, se desvela el ganador del MVP
  if (hasSubmitted) {
    let leader = candidates[0]!;
    let maxVotes = -1;
    for (const c of candidates) {
      const v = mvpVotes[c.id] ?? 0;
      if (v > maxVotes) {
        maxVotes = v;
        leader = c;
      }
    }

    const leaderVotes = maxVotes > 0 ? maxVotes : 0;
    const leaderPercentage =
      totalVotes > 0 ? Math.round((leaderVotes / totalVotes) * 100) : 0;
    const votedPlayer = candidates.find((c) => c.id === effectiveVotedId);

    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="relative shrink-0">
            <PlayerPhoto
              photoUrl={leader.photoUrl}
              playerName={leader.name}
              size="md"
            />
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--primary)] text-[10px] font-bold text-white shadow-xs">
              ★
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--primary)] uppercase tracking-wider">
              <Trophy className="h-3.5 w-3.5" />
              <span>MVP Oficial de la Afición</span>
            </div>
            <p className="text-base font-bold text-neutral-900 mt-0.5">{leader.name}</p>
            <p className="text-xs text-[var(--foreground-muted)] font-sans tabular-nums">
              {leaderPercentage}% de los votos ({leaderVotes}{" "}
              {leaderVotes === 1 ? "voto" : "votos"})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {leader.averageRating > 0 && (
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold block">
                Media
              </span>
              <span className="text-lg font-bold text-[var(--primary)] font-sans tabular-nums">
                {leader.averageRating.toFixed(1)}
              </span>
            </div>
          )}
          {votedPlayer && (
            <div className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
              Tu voto: <span className="font-bold">{votedPlayer.name}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Si aún no se ha enviado: Cuadrícula simétrica con botón directo de envío
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1.5">
        <Star className="h-3.5 w-3.5 text-[var(--primary)] fill-[var(--primary)]" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
          Tu MVP del Partido
        </h4>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {candidates.map((player) => {
          const isSelected = selectedMvpId === player.id;
          return (
            <button
              key={player.id}
              type="button"
              onClick={() => onSelectMvp(player.id)}
              className={`group flex items-center justify-between min-h-[48px] rounded-xl border px-3 py-2 text-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] active:scale-[0.98] ${
                isSelected
                  ? "border-[var(--primary)] bg-red-50/80 text-[var(--primary)] ring-1 ring-[var(--primary)] shadow-2xs font-bold"
                  : "border-[var(--border)] bg-white text-neutral-800 hover:border-neutral-300 hover:bg-neutral-50/80 font-medium"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <PlayerPhoto
                  photoUrl={player.photoUrl}
                  playerName={player.name}
                  size="sm"
                  className="h-7 w-7 shrink-0"
                />
                <div className="min-w-0 text-left">
                  <p className="truncate text-xs font-semibold leading-tight">
                    {player.name}
                  </p>
                  {player.jersey ? (
                    <span className="text-[10px] text-neutral-400 font-sans tabular-nums">
                      #{player.jersey}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="shrink-0 ml-1.5">
                {isSelected ? (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-2xs">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </span>
                ) : (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border border-neutral-200 text-neutral-300 group-hover:border-neutral-300 group-hover:text-neutral-400 transition-colors">
                    <Star className="h-3 w-3" />
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Botón de envío directo en el recuadro del MVP */}
      <div className="flex justify-end pt-3 border-t border-[var(--border)]">
        <button
          type="button"
          disabled={!selectedMvpId || isSubmitting}
          onClick={onSubmitMvp}
          className="w-full sm:w-auto inline-flex items-center justify-center min-h-[40px] min-w-[170px] rounded-full bg-[var(--primary)] px-5 py-2 text-xs font-bold text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 shadow-2xs"
        >
          {isSubmitting ? "Enviando voto..." : "Enviar voto MVP"}
        </button>
      </div>
    </div>
  );
}
