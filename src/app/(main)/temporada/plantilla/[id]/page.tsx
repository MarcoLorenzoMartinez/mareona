import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchSportingSquad } from "@/lib/sports-api/client";
import {
  resolveSportingPlayerId,
  fetchFotMobPlayerProfile,
} from "@/lib/sports-api/fotmob-player-profile";
import { PlayerProfileHero } from "./player-profile-hero";
import { PlayerPositionsPitch } from "./player-positions-pitch";
import { PlayerSeasonHeatmap } from "./player-season-heatmap";
import { PlayerSeasonStatsGrid } from "./player-season-stats-grid";
import { PlayerMatchesHistory } from "./player-matches-history";

interface PageProps {
  readonly params: Promise<{ readonly id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const squad = await fetchSportingSquad();
  const player = squad.find(
    (p) =>
      String(p.shirtNumber) === id ||
      p.id === id ||
      p.externalId === id
  );

  if (!player) {
    return { title: "Jugador no encontrado — Mareona" };
  }

  const dorsalLabel = player.shirtNumber !== null ? `#${player.shirtNumber} ` : "";
  return {
    title: `${dorsalLabel}${player.displayName} — Real Sporting — Mareona`,
    description: `Perfil, estadísticas de la temporada, posiciones tácticas y mapa de calor de ${player.displayName} en el Real Sporting.`,
  };
}

function PlayerDetailSkeleton() {
  return (
    <div className="flex flex-col gap-8 pb-12 animate-pulse" aria-busy="true">
      <div className="h-4 w-32 rounded-md bg-neutral-200" />
      <div className="h-48 rounded-3xl border border-[var(--border)] bg-white p-6 shadow-xs" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 rounded-3xl bg-neutral-100" />
        <div className="h-64 rounded-3xl bg-neutral-100" />
      </div>
    </div>
  );
}

async function PlayerDetailContent({ params }: PageProps) {
  const { id } = await params;
  const squad = await fetchSportingSquad();

  const player = squad.find(
    (p) =>
      String(p.shirtNumber) === id ||
      p.id === id ||
      p.externalId === id ||
      p.displayName.toLowerCase().replace(/\s+/g, "-") === id.toLowerCase()
  );

  if (!player) {
    notFound();
  }

  const fotmobId = await resolveSportingPlayerId(
    player.shirtNumber,
    player.displayName,
    player.fullName
  );
  const profile = fotmobId ? await fetchFotMobPlayerProfile(fotmobId) : null;

  const playedMatches = (profile?.recentMatches ?? []).filter((m) => m.playedInMatch);
  const matchesPlayed = playedMatches.length > 0 ? playedMatches.length : player.stats.appearances;
  const minutesPlayed = playedMatches.reduce((acc, m) => acc + m.minutesPlayed, 0);

  const ratedMatches = playedMatches.filter((m) => m.rating !== null);
  const averageRating =
    ratedMatches.length > 0
      ? ratedMatches.reduce((acc, m) => acc + (m.rating ?? 0), 0) / ratedMatches.length
      : null;

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* 1. Cabecera Hero con foto, biometría y datos clave */}
      <PlayerProfileHero player={player} profile={profile} />

      {/* 2. Visualizadores tácticos: Posiciones en el campo y Mapa de calor */}
      {profile && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <PlayerPositionsPitch positions={profile.positions} />
          <PlayerSeasonHeatmap points={profile.heatmap} />
        </div>
      )}

      {/* 3. Desglose detallado de estadísticas de la temporada */}
      <PlayerSeasonStatsGrid
        statsGroups={profile?.statsGroups ?? []}
        matchesPlayed={matchesPlayed}
        minutesPlayed={minutesPlayed}
        averageRating={averageRating}
      />

      {/* 4. Historial de partidos de la temporada con modal interactivo */}
      {profile && profile.recentMatches.length > 0 && fotmobId && (
        <PlayerMatchesHistory
          matches={profile.recentMatches}
          player={player}
          fotmobPlayerId={fotmobId}
        />
      )}
    </div>
  );
}

export default function PlayerDetailPage({ params }: PageProps) {
  return (
    <Suspense fallback={<PlayerDetailSkeleton />}>
      <PlayerDetailContent params={params} />
    </Suspense>
  );
}
