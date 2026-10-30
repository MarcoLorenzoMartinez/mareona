import type { TeamSeasonStats } from "@/lib/sports-api/team-season-types";

interface StatsOverviewCardsProps {
  readonly stats: TeamSeasonStats;
}

export function StatsOverviewCards({ stats }: StatsOverviewCardsProps) {
  const cards = [
    {
      title: "Puntos obtenidos",
      value: `${stats.actualPoints}`,
      subtitle: `${stats.expectedPoints.toFixed(1)} puntos esperados (xP)`,
      rank: stats.expectedPointsDiff > 0 ? `+${stats.expectedPointsDiff.toFixed(1)} vs xP` : null,
    },
    {
      title: "Goles por partido",
      value: stats.goalsPerMatch.toFixed(1),
      subtitle: `Total: ${(stats.goalsPerMatch * stats.matchesPlayed).toFixed(0)} goles marcados`,
      rank: stats.goalsPerMatchRank ? `${stats.goalsPerMatchRank}º en liga` : null,
    },
    {
      title: "Goles esperados (xG)",
      value: stats.expectedGoals.toFixed(1),
      subtitle: `${stats.expectedGoalsConceded.toFixed(1)} xG concedido`,
      rank: stats.expectedGoalsRank ? `${stats.expectedGoalsRank}º en liga` : null,
    },
    {
      title: "Porterías a cero",
      value: `${stats.cleanSheets}`,
      subtitle: `${stats.goalsConcededPerMatch.toFixed(1)} encajados por partido`,
      rank: stats.cleanSheetsRank ? `${stats.cleanSheetsRank}º en liga` : null,
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
            <div className="my-1.5 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-[var(--foreground)] font-sans tabular-nums">
                {c.value}
              </span>
              {c.rank && (
                <span className="text-xs font-semibold text-[var(--foreground-muted)] font-sans tabular-nums">
                  · {c.rank}
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
