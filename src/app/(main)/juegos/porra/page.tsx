import type { Metadata } from 'next';
import { PorraClient } from './porra-client';
import {
  fetchNextFixture,
  fetchSportingSeasonMatches,
  fetchMatchDetail,
  fetchSportingSquad,
} from '@/lib/sports-api/client';
import type { DomainPlayer, DomainMatchSummary } from '@/lib/sports-api/types';
import type { PorraMatch } from '@/lib/porra/types';

export const metadata: Metadata = {
  title: 'La Porra',
  description: 'Pronostica el marcador y los goleadores del Real Sporting en cada jornada.',
};

export default async function PorraPage() {
  "use cache";
  const [nextMatchSummary, squad, seasonMatches] = await Promise.all([
    fetchNextFixture(),
    fetchSportingSquad(),
    fetchSportingSeasonMatches(),
  ]);

  const availablePlayers = squad
    .filter((p: DomainPlayer) => p.position !== 'goalkeeper')
    .map((p: DomainPlayer) => p.displayName)
    .sort((a: string, b: string) => a.localeCompare(b));

  const completedSummaries = seasonMatches.filter(
    (m: DomainMatchSummary) =>
      m.status === 'finished' && m.homeScore !== null && m.awayScore !== null
  );

  // Enrich the 5 most recent finished matches with official Sporting goal scorers
  const recentIds: string[] = completedSummaries
    .slice(-5)
    .map((m: DomainMatchSummary) => m.externalId);
  const scorersByMatchId = new Map<string, string[]>();

  const detailResults = await Promise.allSettled(
    recentIds.map((id) => fetchMatchDetail(id))
  );

  for (const res of detailResults) {
    if (res.status === 'fulfilled' && res.value) {
      const detail = res.value;
      const sportingScorers = detail.events
        .filter((ev) => ev.type === 'goal' && ev.isSporting)
        .map((ev) => ev.player.name);
      scorersByMatchId.set(detail.externalId, sportingScorers);
    }
  }

  const finishedMatches: PorraMatch[] = completedSummaries.map(
    (m: DomainMatchSummary) => ({
      id: m.externalId,
      roundName: m.competition,
      matchday: m.matchday ?? undefined,
      homeTeam: {
        name: m.homeTeam.name,
        crestUrl: m.homeTeam.crestUrl ?? undefined,
        isSporting: m.homeTeam.isSporting,
      },
      awayTeam: {
        name: m.awayTeam.name,
        crestUrl: m.awayTeam.crestUrl ?? undefined,
        isSporting: m.awayTeam.isSporting,
      },
      kickoffAt: m.kickoffAt,
      isFinished: true,
      actualHomeScore: m.homeScore ?? 0,
      actualAwayScore: m.awayScore ?? 0,
      actualSportingScorers: scorersByMatchId.get(m.externalId) ?? [],
    })
  );

  const currentMatch: PorraMatch = {
    id: nextMatchSummary?.externalId ?? 'next-sporting-match',
    roundName: nextMatchSummary?.competition ?? 'LaLiga Hypermotion',
    matchday: nextMatchSummary?.matchday ?? undefined,
    homeTeam: {
      name: nextMatchSummary?.homeTeam?.name ?? 'Real Sporting',
      crestUrl: nextMatchSummary?.homeTeam?.crestUrl ?? undefined,
      isSporting: nextMatchSummary?.homeTeam?.isSporting ?? true,
    },
    awayTeam: {
      name: nextMatchSummary?.awayTeam?.name ?? 'Próximo Rival',
      crestUrl: nextMatchSummary?.awayTeam?.crestUrl ?? undefined,
      isSporting: nextMatchSummary?.awayTeam?.isSporting ?? false,
    },
    kickoffAt: nextMatchSummary?.kickoffAt ?? new Date().toISOString(),
    isFinished: false,
  };

  return (
    <PorraClient
      currentMatch={currentMatch}
      finishedMatches={finishedMatches}
      availablePlayers={availablePlayers}
    />
  );
}
