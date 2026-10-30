// Client: Contenedor reactivo con polling en vivo para la vista de partido
"use client";

import { MatchHeader } from "./match-header";
import { MatchTabs } from "./match-tabs";
import { MatchPorraWidget } from "./match-porra-widget";
import { useLiveMatchPoll } from "./use-live-match-poll";
import type { DomainMatchDetail } from "@/lib/sports-api/types";

interface MatchDetailViewProps {
  readonly initialMatch: DomainMatchDetail;
}

export function MatchDetailView({ initialMatch }: MatchDetailViewProps) {
  const { match } = useLiveMatchPoll(initialMatch);

  return (
    <div className="flex flex-col gap-6">
      <MatchHeader match={match} />
      <MatchPorraWidget
        matchId={match.externalId}
        kickoffAt={match.kickoffAt}
        status={match.status}
      />
      <MatchTabs match={match} />
    </div>
  );
}
