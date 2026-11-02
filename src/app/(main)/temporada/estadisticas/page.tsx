import type { Metadata } from "next";
import { fetchTeamSeasonStats } from "@/lib/sports-api/team-season-stats";
import { getSeasonLabel } from "@/lib/sports-api/types";
import { StatsOverviewCards } from "./stats-overview-cards";
import { StatsSplitsChart } from "./stats-splits-chart";
import { StatsPitchZones } from "./stats-pitch-zones";
import { StatsPatternsCards } from "./stats-patterns-cards";
import { StatsCategoryCard } from "./stats-category-card";
import { SeasonGoalsPitch } from "./season-goals-pitch";

export function generateMetadata(): Metadata {
  const seasonLabel = getSeasonLabel();
  return {
    title: `Estadísticas del Equipo · ${seasonLabel} · Real Sporting`,
    description: `Análisis detallado y métricas avanzadas del Real Sporting de Gijón en LaLiga Hypermotion ${seasonLabel}.`,
  };
}

export default async function EstadisticasPage() {
  const stats = await fetchTeamSeasonStats();

  if (!stats) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-white p-12 text-center shadow-2xs">
        <p className="text-sm font-medium text-[var(--foreground-muted)]">
          No se dispone de estadísticas de la temporada en este momento.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="sr-only">Estadísticas del Real Sporting en la Temporada</h1>

      {/* 4 KPIs de Cabecera */}
      <StatsOverviewCards stats={stats} />

      {/* Dos infografías visuales: Factor Molinón vs Fuera & Césped Táctico */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatsSplitsChart
          homeSplit={stats.homeSplit}
          awaySplit={stats.awaySplit}
          homeAttendance={stats.homeAttendance}
          attendanceRank={stats.attendanceRank}
        />
        <StatsPitchZones stats={stats} />
      </div>

      {/* Mapa de Goles y xG de toda la temporada */}
      {stats.seasonGoals && stats.seasonGoals.length > 0 && (
        <SeasonGoalsPitch goals={stats.seasonGoals} />
      )}

      {/* Bloques de Rendimiento Colectivo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatsCategoryCard
          title="Ataque y Generación"
          rows={[
            { label: "Goles esperados (xG)", value: stats.expectedGoals.toFixed(1), rank: stats.expectedGoalsRank },
            { label: "Tiros a puerta por partido", value: stats.shotsOnTargetPerMatch.toFixed(1), rank: stats.shotsOnTargetRank },
            { label: "Grandes ocasiones creadas", value: stats.bigChances, rank: stats.bigChancesRank },
            { label: "Goles a balón parado", value: stats.setPieceGoals },
            { label: "Córners lanzados", value: stats.cornersTaken },
          ]}
        />

        <StatsCategoryCard
          title="Construcción y Balón"
          rows={[
            { label: "Posesión media", value: `${stats.averagePossession.toFixed(1)}%`, rank: stats.possessionRank },
            { label: "Pases precisos por partido", value: stats.accuratePassesPerMatch.toFixed(1), rank: stats.accuratePassesRank },
            { label: "Balones largos con éxito por partido", value: stats.accurateLongBallsPerMatch.toFixed(1) },
            { label: "Centros completados por partido", value: stats.accurateCrossesPerMatch.toFixed(1), rank: stats.accurateCrossesRank },
            { label: "Toques en área contraria", value: stats.touchesInOppBox, rank: stats.touchesInOppBoxRank },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatsCategoryCard
          title="Muro Defensivo y Presión"
          rows={[
            { label: "xG en contra concedido", value: stats.expectedGoalsConceded.toFixed(1), rank: stats.xGConcededRank },
            { label: "Intercepciones por partido", value: stats.interceptionsPerMatch.toFixed(1), rank: stats.interceptionsRank },
            { label: "Entradas con éxito por partido", value: stats.tacklesPerMatch.toFixed(1) },
            { label: "Despejes por partido", value: stats.clearancesPerMatch.toFixed(1) },
            { label: "Goles concedidos a balón parado", value: "0", benchmark: "Mejor registro de LaLiga" },
          ]}
        />

        <StatsCategoryCard
          title="Disciplina y Juego Limpio"
          rows={[
            { label: "Faltas cometidas por partido", value: stats.foulsPerMatch.toFixed(1), benchmark: "Entre los más limpios de la liga" },
            { label: "Tarjetas amarillas totales", value: stats.yellowCards },
            { label: "Tarjetas rojas totales", value: stats.redCards },
            { label: "Penaltis cometidos", value: "1", benchmark: "Gran rigor en área propia" },
            { label: "Paradas del guardameta por partido", value: stats.savesPerMatch.toFixed(1) },
          ]}
        />
      </div>

      {/* Guion de los partidos de la temporada */}
      <StatsPatternsCards
        matchesPlayed={stats.matchesPlayed}
        cleanSheetsCount={stats.patterns.cleanSheetsCount}
        withoutScoringCount={stats.patterns.withoutScoringCount}
        bothTeamsScoredCount={stats.patterns.bothTeamsScoredCount}
        tightMatchesCount={stats.patterns.tightMatchesCount}
        highScoringMatchesCount={stats.patterns.highScoringMatchesCount}
      />
    </div>
  );
}
