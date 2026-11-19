import type { Metadata } from "next";
import {
  fetchNextFixture,
  fetchSpotlightFixture,
  fetchStandings,
} from "@/lib/sports-api/client";
import { formatMatchDate, formatMatchTime } from "@/lib/sports-api/dates";
import {
  getSeasonLabel,
  type DomainStandingRow,
  type DomainMatchSummary,
} from "@/lib/sports-api/types";
import { getEphemeridesForDay } from "@/lib/historical/ephemerides-service";
import { getMadridMonthDay, pickFeaturedEphemeris } from "@/lib/historical/featured-ephemeris";
import { NextFixtureHero } from "./temporada/next-fixture-hero";
import { SeasonSummaryTable } from "./temporada/season-summary-table";
import { DailyActionsCard } from "./_home/daily-actions-card";
import { DailyGlanceStrip } from "./_home/daily-glance-strip";
import { TodayInHistoryCard } from "./_home/today-in-history-card";

export const metadata: Metadata = {
  title: "Inicio",
  description: "Actualidad, partidos, clasificación y actualidad del Real Sporting de Gijón.",
};

export default async function HomePage() {
  "use cache";
  let standings: readonly DomainStandingRow[] = [];
  let match: DomainMatchSummary | null = null;
  let nextFixture: DomainMatchSummary | null = null;

  try {
    const [standingsRes, matchRes, nextRes] = await Promise.allSettled([
      fetchStandings(undefined, undefined, { includeSplits: false }),
      fetchSpotlightFixture(),
      fetchNextFixture(),
    ]);

    if (standingsRes.status === "fulfilled" && standingsRes.value.length > 0) {
      standings = standingsRes.value;
    }

    if (matchRes.status === "fulfilled") {
      match = matchRes.value;
    }

    if (nextRes.status === "fulfilled") {
      nextFixture = nextRes.value;
    }
  } catch {
    // Falls back to transparent empty state without fake data
  }

  const seasonLabel = getSeasonLabel();
  const { month, day } = getMadridMonthDay();
  const featured = pickFeaturedEphemeris(getEphemeridesForDay(month, day));

  const porra = nextFixture
    ? {
        matchId: nextFixture.externalId,
        kickoffAt: nextFixture.kickoffAt,
        opponentName: (nextFixture.homeTeam.isSporting ? nextFixture.awayTeam : nextFixture.homeTeam).name,
        kickoffLabel: `${formatMatchDate(nextFixture.kickoffAt, nextFixture.isTimeConfirmed ?? true, false)} · ${formatMatchTime(nextFixture.kickoffAt)}`,
      }
    : null;

  return (
    <div className="flex flex-col gap-6">
      <NextFixtureHero match={match} />

      {/* Mobile-only compact glance strip: keeps games visible without pushing table down */}
      <DailyGlanceStrip porra={porra} />

      {/* Main layout: Table leads on mobile, 2 columns (7/5) on desktop */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-stretch">
        <div className="h-full lg:col-span-7">
          <SeasonSummaryTable standings={standings} seasonLabel={seasonLabel} />
        </div>
        <div className="flex flex-col gap-5 lg:col-span-5">
          <div className="hidden lg:block">
            <DailyActionsCard porra={porra} />
          </div>
          {featured && (
            <TodayInHistoryCard featured={featured} />
          )}
        </div>
      </div>
    </div>
  );
}
