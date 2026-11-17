// Client: Requiere useState para filtrar entre todos, disputados y próximos partidos sin recargar la página
"use client";

import { useState } from "react";
import type { DomainMatchSummary } from "@/lib/sports-api/types";
import { getDictionary } from "@/i18n";
import { MatchRow } from "./match-row";
import { useLiveMatchesPoll } from "../use-live-matches-poll";

type FilterMode = "all" | "finished" | "upcoming";

interface MatchesListProps {
  readonly matches: readonly DomainMatchSummary[];
}

/**
 * Filterable match schedule list component (All / Finished / Upcoming)
 * adhering to WCAG 2.2 AA and responsive layout.
 * Automatically polls for live match score updates during match windows.
 */
export function MatchesList({ matches: initialMatches }: MatchesListProps) {
  const { matches } = useLiveMatchesPoll(initialMatches);
  const dict = getDictionary();
  const t = dict.season.matchesList;

  const [filter, setFilter] = useState<FilterMode>("all");

  const finishedCount = matches.filter((m) => m.status === "finished").length;
  const upcomingCount = matches.length - finishedCount;

  // Identify the immediate next match
  const nextMatchId = matches.find((m) => m.status !== "finished")?.externalId;

  const filteredMatches = matches.filter((m) => {
    if (filter === "finished") return m.status === "finished";
    if (filter === "upcoming") return m.status !== "finished";
    return true;
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Filtros de partidos */}
      <div className="flex items-center">
        <div
          role="tablist"
          aria-label={t.title}
          className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface)] p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={filter === "all"}
            onClick={() => setFilter("all")}
            className={`inline-flex min-h-[36px] items-center justify-center gap-1 rounded-full px-3.5 py-1 text-xs transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-strong)] cursor-pointer ${
              filter === "all"
                ? "bg-[var(--primary)] text-white font-bold shadow-2xs"
                : "text-[var(--foreground-muted)] font-semibold hover:text-[var(--foreground)]"
            }`}
          >
            <span>{t.filters.all}</span>
            <span className="tabular-nums opacity-90">({matches.length})</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filter === "finished"}
            onClick={() => setFilter("finished")}
            className={`inline-flex min-h-[36px] items-center justify-center gap-1 rounded-full px-3.5 py-1 text-xs transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-strong)] cursor-pointer ${
              filter === "finished"
                ? "bg-[var(--primary)] text-white font-bold shadow-2xs"
                : "text-[var(--foreground-muted)] font-semibold hover:text-[var(--foreground)]"
            }`}
          >
            <span>{t.filters.played}</span>
            <span className="tabular-nums opacity-90">({finishedCount})</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filter === "upcoming"}
            onClick={() => setFilter("upcoming")}
            className={`inline-flex min-h-[36px] items-center justify-center gap-1 rounded-full px-3.5 py-1 text-xs transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-strong)] cursor-pointer ${
              filter === "upcoming"
                ? "bg-[var(--primary)] text-white font-bold shadow-2xs"
                : "text-[var(--foreground-muted)] font-semibold hover:text-[var(--foreground)]"
            }`}
          >
            <span>{t.filters.upcoming}</span>
            <span className="tabular-nums opacity-90">({upcomingCount})</span>
          </button>
        </div>
      </div>

      {/* Listado de partidos */}
      {filteredMatches.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-white p-8 text-center shadow-2xs">
          <p className="text-sm text-[var(--foreground-muted)]">{t.noMatches}</p>
        </div>
      ) : (
        <ul
          role="list"
          aria-label={t.title}
          className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-white shadow-2xs overflow-hidden"
        >
          {filteredMatches.map((match) => (
            <MatchRow
              key={match.externalId}
              match={match}
              isNext={match.externalId === nextMatchId}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
