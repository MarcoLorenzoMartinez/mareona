import type { TeamSeasonStats } from "@/lib/sports-api/team-season-types";
import { LeagueRankBadge } from "./league-rank-badge";

interface StatsOverviewCardsProps {
  readonly stats: TeamSeasonStats;
}

export function StatsOverviewCards({ stats }: StatsOverviewCardsProps) {
  const cards = [
    {
      title: "Puntos obtenidos",
      value: `${stats.actualPoints}`,
      subtitle: `${stats.expectedPoints.toFixed(1)} puntos esperados (xP)`,
      rank: null,
      metricDiff: stats.expectedPointsDiff > 0 ? `+${stats.expectedPointsDiff.toFixed(1)} vs xP` : null,
    },
    {
      title: "Goles por partido",
      value: stats.goalsPerMatch.toFixed(1),
      subtitle: `Total: ${(stats.goalsPerMatch * stats.matchesPlayed).toFixed(0)} goles marcados`,
      rank: stats.goalsPerMatchRank,
      metricDiff: null,
    },
    {
      title: "Goles esperados (xG)",
      value: stats.expectedGoals.toFixed(1),
      subtitle: `${stats.expectedGoalsConceded.toFixed(1)} xG concedido`,
      rank: stats.expectedGoalsRank,
      metricDiff: null,
    },
    {
      title: "Porterías a cero",
      value: `${stats.cleanSheets}`,
      subtitle: `${stats.goalsConcededPerMatch.toFixed(1)} encajados por partido`,
      rank: stats.cleanSheetsRank,
      metricDiff: null,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map((c) => (
        <div
          key={c.title}
          className="flex flex-col justify-between rounded-xl border border-[var(--border)] bg-white p-4 shadow-2xs"
        >
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
              {c.title}
            </span>
            <div className="my-1.5 flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-black text-[var(--foreground)] font-sans tabular-nums">
                {c.value}
              </span>
              {c.rank && <LeagueRankBadge rank={c.rank} />}
              {c.metricDiff && (
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-sans font-semibold tabular-nums border border-red-200 bg-red-100/70 text-[#9b0012]">
                  {c.metricDiff}
                </span>
              )}
            </div>
          </div>

          <span className="text-[11px] font-medium text-[var(--foreground-muted)]">
            {c.subtitle}
          </span>
        </div>
      ))}
    </div>
  );
}
