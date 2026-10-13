// Client: Requiere useState para filtrar entre todos, disputados y próximos partidos sin recargar la página
"use client";

import { useState } from "react";
import type { DomainMatchSummary } from "@/lib/sports-api/types";
import { TeamCrest } from "@/components/media/team-crest";
import { getDictionary } from "@/i18n";

type FilterMode = "all" | "finished" | "upcoming";

interface MatchesListProps {
  readonly matches: readonly DomainMatchSummary[];
}

function formatMatchDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("es-ES", {
      timeZone: "Europe/Madrid",
      weekday: "short",
      day: "numeric",
      month: "short",
    }).format(d);
  } catch {
    return "";
  }
}

function formatMatchTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("es-ES", {
      timeZone: "Europe/Madrid",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return "";
  }
}

export function MatchesList({ matches }: MatchesListProps) {
  const dict = getDictionary();
  const t = dict.season.matchesList;
  const matchT = dict.season.match;

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
          {filteredMatches.map((match) => {
            const isNext = match.externalId === nextMatchId;
            const isFinished =
              match.status === "finished" &&
              match.homeScore !== null &&
              match.awayScore !== null;
            const isConfirmedTime = match.isTimeConfirmed === true;
            const dateLabel = formatMatchDate(match.kickoffAt);
            const timeLabel = formatMatchTime(match.kickoffAt);

            return (
              <li
                key={match.externalId}
                className={`p-4 transition-colors ${
                  isNext
                    ? "bg-red-50/50 border-l-4 border-l-[var(--primary)]"
                    : "hover:bg-[var(--surface)]"
                }`}
              >
                {/* Encabezado de la fila: Jornada, fecha y estadio */}
                <div className="mb-2.5 flex items-center justify-between text-xs text-[var(--foreground-muted)]">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[var(--foreground)]">
                      {matchT.matchday} {match.matchday ?? "—"}
                    </span>
                    <span>·</span>
                    <span className="capitalize">{dateLabel}</span>
                    {isNext && (
                      <span className="rounded-xs bg-[var(--primary)] px-1.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                        {t.nextBadge}
                      </span>
                    )}
                  </div>
                  {match.venue && (
                    <span className="hidden sm:inline-block truncate max-w-[220px] text-[11px]">
                      {match.venue}
                    </span>
                  )}
                </div>

                {/* Fila del enfrentamiento */}
                <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-7 sm:gap-4">
                  {/* Equipo Local */}
                  <div className="flex items-center justify-start gap-2.5 sm:col-span-3 sm:justify-end">
                    <span
                      className={`text-sm truncate ${
                        match.homeTeam.isSporting
                          ? "font-bold text-[var(--primary)]"
                          : "font-medium text-[var(--foreground)]"
                      }`}
                    >
                      {match.homeTeam.name}
                    </span>
                    <TeamCrest
                      crestUrl={match.homeTeam.crestUrl}
                      teamName={match.homeTeam.name}
                      size="sm"
                      isSporting={match.homeTeam.isSporting}
                    />
                  </div>

                  {/* Centro: Marcador / Hora confirmada / vs (sin hora) */}
                  <div className="flex items-center justify-center sm:col-span-1">
                    {isFinished ? (
                      <span className="inline-flex items-center justify-center rounded-sm bg-neutral-100 px-2.5 py-1 text-sm font-bold tabular-nums text-[var(--foreground)]">
                        {match.homeScore} - {match.awayScore}
                      </span>
                    ) : isConfirmedTime ? (
                      <span className="inline-flex items-center justify-center rounded-sm bg-[var(--surface)] px-2.5 py-1 text-xs font-bold tabular-nums text-[var(--foreground)] border border-[var(--border)]">
                        {timeLabel}
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-[var(--foreground-muted)] uppercase tracking-wider">
                        {matchT.vs}
                      </span>
                    )}
                  </div>

                  {/* Equipo Visitante */}
                  <div className="flex items-center justify-start gap-2.5 sm:col-span-3">
                    <TeamCrest
                      crestUrl={match.awayTeam.crestUrl}
                      teamName={match.awayTeam.name}
                      size="sm"
                      isSporting={match.awayTeam.isSporting}
                    />
                    <span
                      className={`text-sm truncate ${
                        match.awayTeam.isSporting
                          ? "font-bold text-[var(--primary)]"
                          : "font-medium text-[var(--foreground)]"
                      }`}
                    >
                      {match.awayTeam.name}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
