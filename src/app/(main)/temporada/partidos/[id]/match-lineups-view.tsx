"use client";
// Client: Team toggle for tactical lineup presentation

import { useState } from "react";
import type { DomainMatchDetail } from "@/lib/sports-api/types";
import { getDictionary } from "@/i18n";
import { TacticalPitch } from "./tactical-pitch";

interface MatchLineupsViewProps {
  readonly match: DomainMatchDetail;
}

export function MatchLineupsView({ match }: MatchLineupsViewProps) {
  const dict = getDictionary();
  const t = dict.season.matchDetail.lineups;

  // Default to Real Sporting if playing, otherwise home team
  const defaultSide = match.awayTeam.isSporting ? "away" : "home";
  const [selectedSide, setSelectedSide] = useState<"home" | "away">(defaultSide);

  const activeLineup = selectedSide === "home" ? match.homeLineup : match.awayLineup;
  const activeTeam = selectedSide === "home" ? match.homeTeam : match.awayTeam;

  if (!match.homeLineup && !match.awayLineup) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-white p-8 text-center shadow-2xs">
        <p className="text-sm font-medium text-[var(--foreground-muted)]">
          {match.status === "scheduled" ? t.pendingLineups : t.noLineups}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Selector de equipo */}
      <div className="flex justify-center">
        <div
          role="tablist"
          aria-label={t.title}
          className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface)] p-1 shadow-2xs"
        >
          <button
            type="button"
            role="tab"
            aria-selected={selectedSide === "home"}
            onClick={() => setSelectedSide("home")}
            className={`min-h-[38px] cursor-pointer rounded-full px-5 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${
              selectedSide === "home"
                ? "bg-[var(--primary)] text-white shadow-2xs"
                : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {match.homeTeam.name}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={selectedSide === "away"}
            onClick={() => setSelectedSide("away")}
            className={`min-h-[38px] cursor-pointer rounded-full px-5 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${
              selectedSide === "away"
                ? "bg-[var(--primary)] text-white shadow-2xs"
                : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {match.awayTeam.name}
          </button>
        </div>
      </div>

      {activeLineup ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          {/* Pizarra Táctica */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <TacticalPitch
              formation={activeLineup.formation || "4-4-2"}
              starters={activeLineup.starters}
              isSporting={activeTeam.isSporting}
              teamName={activeTeam.name}
            />
          </div>

          {/* Banquillo y Suplentes */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="rounded-xl border border-[var(--border)] bg-white p-5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                  {t.substitutes}
                </h3>
                <span className="text-xs font-medium text-[var(--foreground-muted)]">
                  {activeLineup.substitutes.length} jugadores
                </span>
              </div>

              {activeLineup.substitutes.length > 0 ? (
                <ul className="divide-y divide-[var(--border)]/50">
                  {activeLineup.substitutes.map((player) => (
                    <li
                      key={player.id}
                      className="flex items-center justify-between py-2 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[var(--surface)] text-[11px] font-bold text-[var(--foreground-muted)] tabular-nums border border-[var(--border)]/60">
                          {player.jersey ?? "-"}
                        </span>
                        <span className="truncate font-medium text-[var(--foreground)]">
                          {player.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="rounded bg-[var(--surface)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--foreground-muted)] uppercase">
                          {player.positionLabel}
                        </span>
                        {player.subbedIn && (
                          <span
                            className="inline-flex items-center rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200"
                            title="Entró al terreno de juego"
                          >
                            Entró
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-[var(--foreground-muted)]">
                  {t.noLineups}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-[var(--border)] bg-white p-8 text-center shadow-2xs">
          <p className="text-sm font-medium text-[var(--foreground-muted)]">
            {t.noLineups}
          </p>
        </div>
      )}
    </div>
  );
}
