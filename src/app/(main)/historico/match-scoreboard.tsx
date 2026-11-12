// Client: Marcador con escudo, tanteo y fondo de estadio
"use client";

import Image from "next/image";
import type { HistoricalMatch } from "@/lib/historical/types";
import type { getStadiumAsset } from "@/lib/sports-api/stadiums";
import { TeamCrest } from "@/components/media/team-crest";

interface MatchScoreboardProps {
  readonly match: HistoricalMatch;
  readonly stadiumAsset: ReturnType<typeof getStadiumAsset>;
}

export function MatchScoreboard({ match, stadiumAsset }: MatchScoreboardProps) {
  const isSportingHome = match.homeTeam === "Real Sporting";
  const isSportingAway = match.awayTeam === "Real Sporting";

  return (
    <div
      id="match-modal-title"
      className="relative overflow-hidden grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4 my-4 py-4 bg-[var(--surface)] rounded-xl border border-[var(--border)] px-3 sm:px-6"
    >
      {stadiumAsset && (
        <div className="pointer-events-none absolute inset-0 z-0 select-none overflow-hidden" aria-hidden="true">
          <Image
            src={stadiumAsset.imagePath}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 900px"
            className="object-cover opacity-15"
          />
        </div>
      )}

      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-end gap-2 text-right">
        <span
          className={`text-sm sm:text-base ${
            isSportingHome ? "font-bold text-[var(--primary)]" : "font-bold text-[var(--foreground)]"
          }`}
        >
          {match.homeTeam}
        </span>
        <TeamCrest
          crestUrl={match.homeCrestUrl}
          teamName={match.homeTeam}
          size="md"
          isSporting={isSportingHome}
        />
      </div>

      <div className="relative z-10 px-3 py-1 bg-white rounded-lg border border-[var(--border)] text-base sm:text-xl font-black tabular-nums shadow-2xs">
        {match.homeScore} - {match.awayScore}
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row-reverse items-center justify-end gap-2 text-left">
        <span
          className={`text-sm sm:text-base ${
            isSportingAway ? "font-bold text-[var(--primary)]" : "font-bold text-[var(--foreground)]"
          }`}
        >
          {match.awayTeam}
        </span>
        <TeamCrest
          crestUrl={match.awayCrestUrl}
          teamName={match.awayTeam}
          size="md"
          isSporting={isSportingAway}
        />
      </div>
    </div>
  );
}
