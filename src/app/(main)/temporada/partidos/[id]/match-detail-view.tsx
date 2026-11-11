// Client: Contenedor reactivo con polling en vivo para la vista de partido
"use client";

import { MatchHeader } from "./match-header";
import { MatchTabs } from "./match-tabs";
import { MatchPorraWidget } from "./match-porra-widget";
import { useLiveMatchPoll } from "./use-live-match-poll";
import type { DomainMatchDetail } from "@/lib/sports-api/types";
import type { RivalH2HSummary } from "@/lib/historical/rivals-types";

interface MatchDetailViewProps {
  readonly initialMatch: DomainMatchDetail;
  readonly isNextFixture?: boolean;
  readonly rivalH2H?: RivalH2HSummary | null;
}

export function MatchDetailView({
  initialMatch,
  isNextFixture = false,
  rivalH2H = null,
}: MatchDetailViewProps) {
  const { match } = useLiveMatchPoll(initialMatch);

  return (
    <div className="flex flex-col gap-6">
      <MatchHeader match={match} />
      {isNextFixture && (
        <MatchPorraWidget
          matchId={match.externalId}
          kickoffAt={match.kickoffAt}
          status={match.status}
        />
      )}
      <MatchTabs match={match} rivalH2H={rivalH2H} />
    </div>
  );
}
