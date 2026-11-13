// Client: Previa deportiva cara a cara con histórico oficial contra el rival
"use client";

import { useState } from "react";
import Link from "next/link";
import type { RivalH2HSummary } from "@/lib/historical/rivals-types";
import type { DayMatchItem } from "@/lib/historical/ephemerides-types";
import { TeamCrest } from "@/components/media/team-crest";
import { formatRivalLocation } from "@/lib/historical/rival-location";
import { getDictionary } from "@/i18n";
import { H2HMetricsStrip } from "@/components/sports/h2h-metrics-strip";
import { RivalMatchRow } from "@/app/(main)/historico/rivales/rival-match-row";
import { HistoricalMatchDetailModal } from "@/app/(main)/historico/match-detail-modal";

interface MatchH2HPreviewProps {
  readonly rival: RivalH2HSummary | null;
  readonly opponentName: string;
  readonly opponentCrestUrl?: string | null;
}

/**
 * Editorial Head-to-Head match preview card.
 * Complies with AGENTS.md rules 2, 3, 5, 8 and 9. Strictly <= 180 lines.
 */
export function MatchH2HPreview({
  rival,
  opponentName,
  opponentCrestUrl,
}: MatchH2HPreviewProps) {
  const [selectedMatch, setSelectedMatch] = useState<DayMatchItem | null>(null);
  const dict = getDictionary();
  const t = dict.season.matchDetail.h2h;

  if (!rival) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-[var(--border)] bg-white p-8 text-center shadow-2xs">
        <TeamCrest crestUrl={opponentCrestUrl ?? null} teamName={opponentName} size="md" isSporting={false} />
        <div className="flex flex-col gap-1 max-w-md">
          <h3 className="text-base font-bold text-[var(--foreground)]">{t.noDataTitle}</h3>
          <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">{t.noDataDescription}</p>
        </div>
      </div>
    );
  }

  const wonPct = rival.played > 0 ? (rival.won / rival.played) * 100 : 0;
  const drawnPct = rival.played > 0 ? (rival.drawn / rival.played) * 100 : 0;
  const lostPct = rival.played > 0 ? (rival.lost / rival.played) * 100 : 0;
  const recentMatches = rival.matches.slice(0, 5);

  return (
    <div className="flex flex-col gap-5">
      {/* Top Editorial Card: Balance Histórico */}
      <section aria-label={t.overallBalance} className="flex flex-col gap-4 rounded-xl border border-[var(--border)] bg-white p-4 shadow-2xs sm:p-5">
        <div className="flex items-center gap-3 min-w-0">
          <TeamCrest crestUrl={opponentCrestUrl ?? rival.crestUrl ?? null} teamName={rival.name} size="md" isSporting={false} />
          <div className="flex flex-col min-w-0">
            <h3 className="text-lg font-bold tracking-tight text-[var(--foreground)] truncate sm:text-xl">
              {rival.name}
            </h3>
            <span className="text-xs text-[var(--foreground-muted)] font-medium">
              {formatRivalLocation(rival)}
            </span>
          </div>
        </div>

        {/* Big Metrics Grid: 4 cols on mobile + goals below, 5 cols on desktop */}
        <H2HMetricsStrip
          played={rival.played}
          won={rival.won}
          drawn={rival.drawn}
          lost={rival.lost}
          goalsFor={rival.goalsFor}
          goalsAgainst={rival.goalsAgainst}
          highlightWon
          labels={{
            played: t.playedShort,
            won: t.wonShort,
            drawn: t.drawnShort,
            lost: t.lostShort,
            goals: t.goals,
          }}
        />

        {/* Visual Balance Bar */}
        <div className="flex flex-col gap-1.5 pt-1">
          <div className="h-2 w-full rounded-full bg-neutral-200 overflow-hidden flex" aria-hidden="true">
            <div className="h-full bg-[var(--primary)] shrink-0 transition-all" style={{ width: `${wonPct}%` }} />
            <div className="h-full bg-neutral-300 shrink-0 transition-all" style={{ width: `${drawnPct}%` }} />
            <div className="h-full bg-neutral-700 shrink-0 transition-all" style={{ width: `${lostPct}%` }} />
          </div>
          <div className="flex justify-between items-center text-[11px] text-[var(--foreground-muted)] font-medium tabular-nums px-0.5">
            <span className="text-[var(--primary)] font-bold">{Math.round(wonPct)}% V</span>
            <span>{Math.round(drawnPct)}% E</span>
            <span className="text-neutral-700 font-bold">{Math.round(lostPct)}% D</span>
          </div>
        </div>
      </section>

      {/* Precedents Section with identical format to Historico > Rivales */}
      <section aria-label={t.recentPrecedents} className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
            {t.recentPrecedents}
          </h4>
          <Link
            href={`/historico/rivales?rival=${encodeURIComponent(rival.name)}`}
            className="text-xs font-bold text-[var(--primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded px-1 py-0.5"
          >
            {t.viewCompleteHistory} →
          </Link>
        </div>

        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-2xs divide-y divide-[var(--border)]/70">
          {recentMatches.map((m) => (
            <RivalMatchRow key={m.id} match={m} onSelect={setSelectedMatch} />
          ))}
        </div>
      </section>

      {/* Official Match Report Modal */}
      {selectedMatch && (
        <HistoricalMatchDetailModal
          match={selectedMatch}
          season={selectedMatch.season}
          onClose={() => setSelectedMatch(null)}
        />
      )}
    </div>
  );
}
