// Client: Componente visual accesible para encuestas de aficionados con barras rojiblancas destacadas
"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { votePoll } from "@/lib/social/actions";
import type { SocialPoll } from "@/lib/social/types";

interface PollDisplayProps {
  readonly poll: SocialPoll;
}

export function PollDisplay({ poll }: PollDisplayProps) {
  const { user, openAuthModal } = useAuth();
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(
    poll.userVotedOptionId ?? null
  );
  const [votes, setVotes] = useState(poll.options);
  const [totalVotes, setTotalVotes] = useState(poll.totalVotes);
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
                className={`relative overflow-hidden rounded-xl border min-h-11 px-3.5 py-2.5 text-xs transition-colors ${
                  isUserVote
                    ? "border-red-200/90 bg-red-50/20"
                    : "border-neutral-200/80 bg-neutral-100/50"
                }`}
              >
                {/* Barra de porcentaje: el voto del usuario en rojo sutil y las demás respuestas en gris */}
                <div
                  className={`absolute inset-y-0 left-0 transition-all duration-500 ease-out ${
                    isUserVote
                      ? "bg-red-200/80"
                      : "bg-neutral-200"
                  }`}
                  style={{ width: `${percentage}%` }}
                  aria-hidden="true"
                />

                <div className="relative flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1.5 truncate">
                    {isUserVote && (
                      <Check
                        className="h-4 w-4 shrink-0 text-[var(--primary)] stroke-[2.5]"
                        aria-hidden="true"
                      />
                    )}
                    <span
                      className={`truncate ${
                        isUserVote ? "font-bold text-neutral-950" : "font-medium text-neutral-800"
                      }`}
                    >
                      {option.label}
                    </span>
                  </span>
                  <span
                    className={`font-sans tabular-nums shrink-0 text-xs font-bold ${
                      isUserVote
                        ? "text-[var(--primary)] font-black"
                        : "text-neutral-800"
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

      <div className="mt-2.5 flex items-center justify-between text-[11px] text-neutral-500 px-0.5">
        <span>
          <strong className="font-sans font-bold tabular-nums text-neutral-800">
            {totalVotes}
          </strong>{" "}
          {totalVotes === 1 ? "voto" : "votos"}
        </span>
        {hasVoted && (
          <span className="text-[var(--primary)] font-bold">Voto registrado</span>
        )}
      </div>
    </div>
  );
}
