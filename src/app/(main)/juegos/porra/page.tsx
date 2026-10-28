import type { Metadata } from 'next';
import { PorraClient } from './porra-client';
import { fetchNextFixture, fetchSportingSquad } from '@/lib/sports-api/client';
import type { DomainPlayer } from '@/lib/sports-api/types';
import type { PorraMatch } from '@/lib/porra/types';

export const metadata: Metadata = {
  title: 'La Porra',
  description: 'Pronostica el marcador y los goleadores del Real Sporting en cada jornada.',
};

export default async function PorraPage() {
  const nextMatchSummary = await fetchNextFixture();
  const squad = await fetchSportingSquad();

  const availablePlayers = squad
    .filter((p: DomainPlayer) => p.position !== 'goalkeeper')
    .map((p: DomainPlayer) => p.displayName)
    .sort((a: string, b: string) => a.localeCompare(b));

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
      availablePlayers={
        availablePlayers.length > 0
          ? availablePlayers
          : ['Gaspar Campos', 'Juan Otero', 'Dani Queipo', 'Campuzano', 'Cote', 'Nacho Méndez', 'Gelabert', 'Dubasin']
      }
    />
  );
}
