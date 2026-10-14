import type { DomainMatchDetail } from "@/lib/sports-api/types";
import { getDictionary } from "@/i18n";
import { LineupTeamColumn } from "./lineup-team-column";

interface MatchLineupsViewProps {
  readonly match: DomainMatchDetail;
}

export function MatchLineupsView({ match }: MatchLineupsViewProps) {
  const dict = getDictionary();
  const t = dict.season.matchDetail.lineups;

  const hasLineups = Boolean(match.homeLineup || match.awayLineup);

  if (!hasLineups) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-white p-8 text-center shadow-2xs">
        <p className="text-sm font-medium text-[var(--foreground-muted)]">
          {match.status === "scheduled" ? t.pendingLineups : t.noLineups}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 items-start">
      <LineupTeamColumn lineup={match.homeLineup} team={match.homeTeam} />
      <LineupTeamColumn lineup={match.awayLineup} team={match.awayTeam} />
    </div>
  );
}

