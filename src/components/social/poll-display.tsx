// Client: Componente visual accesible para encuestas de aficionados con barras rojiblancas destacadas
"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { votePoll } from "@/lib/social/actions";
import type { SocialPoll } from "@/lib/social/types";

interface PollDisplayProps {
  readonly poll: SocialPoll;
}

export function PollDisplay({ poll }: PollDisplayProps) {
  const { user, openAuthModal } = useAuth();
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(() => {
    if (poll.userVotedOptionId) return poll.userVotedOptionId;
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(`mareona_poll_${poll.id}`);
    } catch {
      return null;
    }
  });

  const [votes, setVotes] = useState(() => {
    if (poll.userVotedOptionId || typeof window === "undefined") return poll.options;
    try {
      const localVoted = localStorage.getItem(`mareona_poll_${poll.id}`);
      if (localVoted) {
        return poll.options.map((opt) =>
          opt.id === localVoted ? { ...opt, votesCount: opt.votesCount + 1 } : opt
        );
      }
    } catch {
      // ignore
    }
    return poll.options;
  });

  const [totalVotes, setTotalVotes] = useState(() => {
    if (poll.userVotedOptionId || typeof window === "undefined") return poll.totalVotes;
    try {
      const localVoted = localStorage.getItem(`mareona_poll_${poll.id}`);
      if (localVoted) return poll.totalVotes + 1;
    } catch {
      // ignore
    }
    return poll.totalVotes;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasVoted = Boolean(selectedOptionId);

  const handleVote = async (optionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      openAuthModal("signin");
      return;
    }
    if (hasVoted || isSubmitting) return;

    setSelectedOptionId(optionId);
    setTotalVotes((prev) => prev + 1);
    setVotes((prev) =>
      prev.map((opt) =>
        opt.id === optionId ? { ...opt, votesCount: opt.votesCount + 1 } : opt
      )
    );

    try {
      localStorage.setItem(`mareona_poll_${poll.id}`, optionId);
    } catch {
      // ignore
    }

    setIsSubmitting(true);
    await votePoll({ pollId: poll.id, optionId });
    setIsSubmitting(false);
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-white p-3.5 shadow-2xs"
      role="region"
      aria-label="Encuesta"
    >
      <div className="space-y-2">
        {votes.map((option) => {
          const percentage =
            totalVotes > 0 ? Math.round((option.votesCount / totalVotes) * 100) : 0;
          const isSelected = selectedOptionId === option.id;

          if (hasVoted) {
            const isUserVote = isSelected;

            return (
              <div
                key={option.id}
                className={`relative overflow-hidden rounded-xl border min-h-10 px-3.5 py-2.5 text-xs transition-colors ${
                  isUserVote
                    ? "border-red-200/80 bg-red-50/15"
                    : "border-neutral-200/70 bg-neutral-50/40"
                }`}
              >
                {/* Barra de porcentaje: tono neutro sobrio sin colores estridentes */}
                <div
                  className={`absolute inset-y-0 left-0 transition-all duration-500 ease-out ${
                    isUserVote ? "bg-red-500/10" : "bg-neutral-200/60"
                  }`}
                  style={{ width: `${percentage}%` }}
                  aria-hidden="true"
                />

                <div className="relative flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className={`truncate ${
                        isUserVote ? "font-bold text-neutral-900" : "font-normal text-neutral-800"
                      }`}
                    >
                      {option.label}
                    </span>
                    {isUserVote && (
                      <span className="shrink-0 text-[11px] font-medium text-[var(--primary)]">
                        (tu voto)
                      </span>
                    )}
                  </div>

                  <span
                    className={`font-sans tabular-nums shrink-0 text-xs ${
                      isUserVote
                        ? "font-bold text-[var(--primary)]"
                        : "font-medium text-neutral-600"
                    }`}
                  >
                    {percentage}%
                  </span>
                </div>
              </div>
            );
          }

          return (
            <button
              key={option.id}
              type="button"
              onClick={(e) => handleVote(option.id, e)}
              disabled={isSubmitting}
              className="flex min-h-11 w-full items-center justify-between rounded-xl border border-neutral-200/90 bg-white px-3.5 py-2.5 text-left text-xs font-semibold text-neutral-800 transition-colors hover:border-[var(--primary)] hover:bg-red-50/40 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            >
              <span className="truncate">{option.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-2.5 flex items-center justify-between text-[11px] text-neutral-400 px-0.5">
        <span>
          <strong className="font-sans font-medium tabular-nums text-neutral-600">
            {totalVotes}
          </strong>{" "}
          {totalVotes === 1 ? "voto" : "votos"}
        </span>
      </div>
    </div>
  );
}
