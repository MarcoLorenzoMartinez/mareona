// Client: Votación de MVP del partido con confirmación de envío y revelación de resultados
"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { submitMvpVote } from "@/lib/match-community/actions";
import { applyMvpVoteTransition } from "@/lib/match-community/mvp";
import { MatchMvpCandidateCard } from "./match-mvp-candidate-card";
import type { DomainMatchDetail } from "@/lib/sports-api/types";

interface MatchMvpVotingProps {
  readonly match: DomainMatchDetail;
}

export function MatchMvpVoting({ match }: MatchMvpVotingProps) {
  const { user, openAuthModal } = useAuth();
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sportingLineup = match.homeLineup?.isSporting
    ? match.homeLineup
    : match.awayLineup?.isSporting
    ? match.awayLineup
    : null;

  const candidates = [
    ...(sportingLineup?.starters ?? []),
    ...(sportingLineup?.substitutes ?? []),
  ];

  const [votes, setVotes] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    if (sportingLineup?.starters?.[0]) initial[sportingLineup.starters[0].id] = 14;
    if (sportingLineup?.starters?.[1]) initial[sportingLineup.starters[1].id] = 9;
    return initial;
  });

  const totalVotes = Object.values(votes).reduce((sum, count) => sum + count, 0);

  // La votación solo está disponible con el partido terminado
  if (match.status !== "finished") {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center text-xs text-[var(--foreground-muted)]">
        La votación del MVP se abrirá al término del partido.
      </div>
    );
  }

  if (candidates.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center text-xs text-[var(--foreground-muted)]">
        La alineación del Real Sporting aún no está disponible para votar el MVP.
      </div>
    );
  }

  const handleSelectCandidate = (playerId: string) => {
    if (hasSubmitted) return;
    setSelectedPlayerId(playerId);
  };

  const handleSubmitVote = async () => {
    if (!user) {
      openAuthModal("signin");
      return;
    }
    if (!selectedPlayerId || hasSubmitted || isSubmitting) return;

    setIsSubmitting(true);
    try {
      setVotes((prev) => applyMvpVoteTransition(prev, selectedPlayerId, null));
      setHasSubmitted(true);
      await submitMvpVote({
        matchId: match.externalId,
        playerId: selectedPlayerId,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Find leader (only displayed after submission)
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
      {/* Contador visible únicamente tras emitir el voto */}
      {hasSubmitted && (
        <div className="mb-3 flex justify-end">
          <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-600 font-sans tabular-nums">
            {totalVotes} {totalVotes === 1 ? "voto" : "votos"}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {candidates.map((player) => {
          const count = votes[player.id] ?? 0;
          const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;

          return (
            <MatchMvpCandidateCard
              key={player.id}
              player={player}
              isSelected={selectedPlayerId === player.id}
              isSubmitted={hasSubmitted}
              isVoted={selectedPlayerId === player.id}
              isLeader={leaderId === player.id && totalVotes > 0}
              percentage={percentage}
              onSelect={handleSelectCandidate}
            />
          );
        })}
      </div>

      {/* Botón de envío y bloqueo */}
      <div className="mt-5 flex flex-col items-center gap-2 border-t border-[var(--border)] pt-4">
        {!hasSubmitted ? (
          <>
            <button
              type="button"
              disabled={!selectedPlayerId || isSubmitting}
              onClick={handleSubmitVote}
              className="w-full sm:w-auto min-w-[200px] rounded-full bg-[var(--primary)] px-6 py-2.5 text-xs font-bold text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Enviando voto..." : "Enviar voto"}
            </button>
            <p className="text-[11px] text-[var(--foreground-muted)]">
              Una vez enviado tu voto, no se podrá modificar.
            </p>
          </>
        ) : (
          <div className="flex items-center gap-2 rounded-xl bg-neutral-50 px-4 py-2.5 text-xs font-semibold text-neutral-700">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Voto emitido. Resultados generales desbloqueados.</span>
          </div>
        )}
      </div>
    </div>
  );
}
