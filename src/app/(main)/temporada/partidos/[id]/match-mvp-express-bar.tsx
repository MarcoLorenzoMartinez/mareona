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
  readonly onSelectMvp: (id: string) => void;
}

export function MatchMvpExpressBar({
  candidates,
  selectedMvpId,
  hasSubmitted,
  mvpVotes,
  totalVotes,
  effectiveVotedId,
  onSelectMvp,
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
      <div className="rounded-xl border border-[var(--border)] bg-gradient-to-r from-red-50/70 via-white to-neutral-50/50 p-4 shadow-2xs">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--primary)] uppercase tracking-wider mb-3">
          <Trophy className="h-4 w-4 text-[var(--primary)]" />
          <span>MVP Oficial de la Afición</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
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
              <p className="text-sm font-bold text-neutral-900">{leader.name}</p>
              <p className="text-xs text-[var(--foreground-muted)] font-sans tabular-nums">
                {leaderPercentage}% de los votos ({leaderVotes}{" "}
                {leaderVotes === 1 ? "voto" : "votos"})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {leader.averageRating && (
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold block">
                  Media
                </span>
                <span className="text-base font-bold text-[var(--primary)] font-sans tabular-nums">
                  {leader.averageRating.toFixed(1)}
                </span>
              </div>
            )}
            {votedPlayer && (
              <div className="rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-medium text-neutral-700">
                Tu voto: <span className="font-bold">{votedPlayer.name}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Si aún no se ha enviado: Selector táctil de 1 toque (MVP Express)
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-1.5">
        <Star className="h-3.5 w-3.5 text-[var(--primary)] fill-[var(--primary)]" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
          Tu MVP del Partido
        </h4>
      </div>

      <div className="flex flex-wrap gap-2">
        {candidates.map((player) => {
          const isSelected = selectedMvpId === player.id;
          return (
            <button
              key={player.id}
              type="button"
              onClick={() => onSelectMvp(player.id)}
              className={`inline-flex min-h-[44px] items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] active:scale-95 ${
                isSelected
                  ? "border-[var(--primary)] bg-red-50 text-[var(--primary)] shadow-xs"
                  : "border-[var(--border)] bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50/80"
              }`}
            >
              <PlayerPhoto
                photoUrl={player.photoUrl}
                playerName={player.name}
                size="sm"
                className="h-6 w-6"
              />
              <span>{player.name}</span>
              {isSelected ? (
                <Check className="h-3.5 w-3.5 text-[var(--primary)] stroke-[3]" />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
