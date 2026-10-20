// Client: Votación de MVP del partido entre jugadores del Real Sporting
"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { submitMvpVote } from "@/lib/match-community/actions";
import { PlayerPhoto } from "@/components/media/player-photo";
import type { DomainMatchDetail } from "@/lib/sports-api/types";

interface MatchMvpVotingProps {
  readonly match: DomainMatchDetail;
}

export function MatchMvpVoting({ match }: MatchMvpVotingProps) {
  const { user, openAuthModal } = useAuth();
  const sportingLineup = match.homeLineup?.isSporting
    ? match.homeLineup
    : match.awayLineup?.isSporting
    ? match.awayLineup
    : null;

  const candidates = [
    ...(sportingLineup?.starters ?? []),
    ...(sportingLineup?.substitutes ?? []),
  ];

  const [votedPlayerId, setVotedPlayerId] = useState<string | null>(null);
  const [votes, setVotes] = useState<Record<string, number>>(() => {
    // Seed initial votes for top performers if starters exist
    const initial: Record<string, number> = {};
    if (sportingLineup?.starters?.[0]) {
      initial[sportingLineup.starters[0].id] = 14;
    }
    if (sportingLineup?.starters?.[1]) {
      initial[sportingLineup.starters[1].id] = 9;
    }
    return initial;
  });

  const totalVotes = Object.values(votes).reduce((sum, count) => sum + count, 0);

  const handleVote = async (playerId: string) => {
    if (!user) {
      openAuthModal("signin");
      return;
    }
    if (votedPlayerId === playerId) return;

    setVotedPlayerId(playerId);
    setVotes((prev) => ({
      ...prev,
      [playerId]: (prev[playerId] ?? 0) + 1,
    }));

    await submitMvpVote({
      matchId: match.externalId,
      playerId,
    });
  };

  if (candidates.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center text-xs text-[var(--foreground-muted)]">
        La alineación del Real Sporting aún no está disponible para votar el MVP.
      </div>
    );
  }

  // Find leader
  let leaderId: string | null = null;
  let maxVotes = 0;
  for (const [id, count] of Object.entries(votes)) {
    if (count > maxVotes) {
      maxVotes = count;
      leaderId = id;
    }
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-xs">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-neutral-900">
            MVP de la Afición
          </h3>
          <p className="text-xs text-[var(--foreground-muted)]">
            Elige al jugador más determinante del Real Sporting
          </p>
        </div>
        <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-600 font-sans tabular-nums">
          {totalVotes} {totalVotes === 1 ? "voto" : "votos"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {candidates.map((player) => {
          const count = votes[player.id] ?? 0;
          const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
          const isVoted = votedPlayerId === player.id;
          const isLeader = leaderId === player.id && totalVotes > 0;

          return (
            <button
              key={player.id}
              type="button"
              onClick={() => handleVote(player.id)}
              className={`relative flex items-center gap-3 rounded-xl border p-2.5 text-left transition-all ${
                isVoted
                  ? "border-[var(--primary)] bg-red-50/40 ring-1 ring-[var(--primary)]"
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
              </div>

              {isVoted && (
                <span className="shrink-0 rounded-full bg-[var(--primary)] px-2 py-0.5 text-[10px] font-bold text-white">
                  Tu voto
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
