import type { Metadata } from "next";
import { fetchTeamSeasonStats } from "@/lib/sports-api/team-season-stats";
import { getSeasonLabel } from "@/lib/sports-api/types";
import { StatsOverviewCards } from "./stats-overview-cards";
import { StatsSplitsChart } from "./stats-splits-chart";
import { StatsPitchZones } from "./stats-pitch-zones";
import { StatsCategoryCard } from "./stats-category-card";

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

      {/* Bloques de Rendimiento Colectivo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatsCategoryCard
          title="Ataque y Generación"
          iconLabel="Ofensivo"
          rows={[
            { label: "Goles esperados (xG)", value: stats.expectedGoals.toFixed(1), rank: stats.expectedGoalsRank },
            { label: "Tiros a puerta por partido", value: stats.shotsOnTargetPerMatch.toFixed(1), rank: stats.shotsOnTargetRank },
            { label: "Grandes ocasiones creadas", value: stats.bigChances, rank: stats.bigChancesRank },
            { label: "Goles a balón parado", value: stats.setPieceGoals },
            { label: "Córners lanzados", value: stats.cornersTaken },
          ]}
        />

        <StatsCategoryCard
          title="Muro Defensivo y Presión"
          iconLabel="Defensivo"
          rows={[
            { label: "xG en contra concedido", value: stats.expectedGoalsConceded.toFixed(1), rank: stats.xGConcededRank },
            { label: "Intercepciones por partido", value: stats.interceptionsPerMatch.toFixed(1), rank: stats.interceptionsRank },
            { label: "Entradas con éxito por partido", value: stats.tacklesPerMatch.toFixed(1) },
            { label: "Paradas por partido", value: stats.savesPerMatch.toFixed(1) },
            { label: "Goles concedidos a balón parado", value: "0", benchmark: "Mejor registro de LaLiga" },
          ]}
        />
      </div>
    </div>
  );
}
