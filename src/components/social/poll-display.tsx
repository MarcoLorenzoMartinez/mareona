// Client: Componente visual accesible para encuestas de aficionados con barras rojiblancas destacadas
"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { votePoll } from "@/lib/social/actions";
import type { SocialPoll } from "@/lib/social/types";
import { getDictionary } from "@/i18n";

interface PollDisplayProps {
  readonly poll: SocialPoll;
}

export function PollDisplay({ poll }: PollDisplayProps) {
  const dict = getDictionary();
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
      className="mt-3 w-full space-y-3 pt-1"
      role="region"
      aria-label={dict.social.poll.regionAria}
    >
      <div className="space-y-3">
        {votes.map((option) => {
          const percentage =
            totalVotes > 0 ? Math.round((option.votesCount / totalVotes) * 100) : 0;
          const isSelected = selectedOptionId === option.id;

          if (hasVoted) {
            const isUserVote = isSelected;

            return (
              <div key={option.id} className="space-y-1.5">
                <div className="flex items-baseline justify-between gap-3 text-xs">
                  <span
                    className={`truncate ${
                      isUserVote
                        ? "font-bold text-neutral-900"
                        : "font-normal text-neutral-700"
                    }`}
                  >
                    {option.label}
                  </span>

                  <span
                    className={`font-sans tabular-nums shrink-0 text-xs ${
                      isUserVote
                        ? "font-bold text-[var(--primary)]"
                        : "font-semibold text-neutral-600"
                    }`}
                  >
                    {percentage}%
                  </span>
                </div>

                {/* Barra de progreso limpia: roja si es tu elección, gris neutro si no */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${
                      isUserVote ? "bg-[var(--primary)]" : "bg-neutral-300"
                    }`}
                    style={{ width: `${percentage}%` }}
                    aria-hidden="true"
                  />
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
              className="flex min-h-10 w-full items-center justify-center rounded-full border border-neutral-300/80 bg-white px-4 py-2 text-center text-xs font-semibold text-neutral-800 transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] cursor-pointer"
            >
              <span className="truncate">{option.label}</span>
            </button>
          );
        })}
      </div>

      <div className="text-[11px] font-medium text-neutral-600">
        <span className="font-sans tabular-nums">{totalVotes}</span>{" "}
        {totalVotes === 1 ? dict.social.poll.voteSingular : dict.social.poll.votePlural}
      </div>
    </div>
  );
}
