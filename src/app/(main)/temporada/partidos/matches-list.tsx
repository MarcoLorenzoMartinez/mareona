// Client: Requiere useState para filtrar entre todos, disputados y próximos partidos sin recargar la página
"use client";

import { useState } from "react";
import type { DomainMatchSummary } from "@/lib/sports-api/types";
import { getDictionary } from "@/i18n";
import { MatchRow } from "./match-row";

type FilterMode = "all" | "finished" | "upcoming";

interface MatchesListProps {
  readonly matches: readonly DomainMatchSummary[];
}

/**
 * Filterable match schedule list component (All / Finished / Upcoming)
 * adhering to WCAG 2.2 AA and responsive layout.
 */
export function MatchesList({ matches }: MatchesListProps) {
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
      <div
        role="tablist"
        aria-label={t.title}
        className="flex items-center gap-2 border-b border-[var(--border)] pb-3"
      >
        <button
          type="button"
          role="tab"
          aria-selected={filter === "all"}
          onClick={() => setFilter("all")}
          className={`inline-flex min-h-[44px] items-center rounded-md px-3.5 py-2 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-strong)] ${
            filter === "all"
              ? "bg-[var(--primary)] text-white"
              : "bg-neutral-100 text-[var(--foreground-muted)] hover:bg-neutral-200 hover:text-[var(--foreground)]"
          }`}
        >
          {t.filters.all} ({matches.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={filter === "finished"}
          onClick={() => setFilter("finished")}
          className={`inline-flex min-h-[44px] items-center rounded-md px-3.5 py-2 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-strong)] ${
            filter === "finished"
              ? "bg-[var(--primary)] text-white"
              : "bg-neutral-100 text-[var(--foreground-muted)] hover:bg-neutral-200 hover:text-[var(--foreground)]"
          }`}
        >
          {t.filters.played} ({finishedCount})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={filter === "upcoming"}
          onClick={() => setFilter("upcoming")}
          className={`inline-flex min-h-[44px] items-center rounded-md px-3.5 py-2 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-strong)] ${
            filter === "upcoming"
              ? "bg-[var(--primary)] text-white"
              : "bg-neutral-100 text-[var(--foreground-muted)] hover:bg-neutral-200 hover:text-[var(--foreground)]"
          }`}
        >
          {t.filters.upcoming} ({upcomingCount})
        </button>
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
