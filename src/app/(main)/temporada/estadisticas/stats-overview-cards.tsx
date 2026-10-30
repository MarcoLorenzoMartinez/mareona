import type { TeamSeasonStats } from "@/lib/sports-api/team-season-types";

interface StatsOverviewCardsProps {
  readonly stats: TeamSeasonStats;
}

export function StatsOverviewCards({ stats }: StatsOverviewCardsProps) {
  const cards = [
    {
      title: "Goles por partido",
      value: stats.goalsPerMatch.toFixed(1),
      subtitle: `Total: ${(stats.goalsPerMatch * stats.matchesPlayed).toFixed(0)} goles`,
      rank: stats.goalsPerMatchRank ? `#${stats.goalsPerMatchRank} en liga` : null,
    },
    {
      title: "xG (Goles esperados)",
      value: stats.expectedGoals.toFixed(1),
      subtitle: `${stats.goalsPerMatch * stats.matchesPlayed >= stats.expectedGoals ? "Eficiencia positiva" : "Generación alta"}`,
      rank: stats.expectedGoalsRank ? `#${stats.expectedGoalsRank} en liga` : null,
    },
    {
      title: "Posesión media",
      value: `${stats.averagePossession.toFixed(1)}%`,
      subtitle: `${stats.accuratePassesPerMatch.toFixed(0)} pases/partido`,
      rank: stats.possessionRank ? `#${stats.possessionRank} en liga` : null,
    },
    {
      title: "Porterías a cero",
      value: `${stats.cleanSheets}`,
      subtitle: `${stats.goalsConcededPerMatch.toFixed(1)} encajados/p.`,
      rank: stats.cleanSheetsRank ? `#${stats.cleanSheetsRank} en liga` : null,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map((c) => (
        <div
          key={c.title}
          className="flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-white p-4 shadow-2xs transition-all hover:border-neutral-300"
        >
          <div className="flex items-start justify-between gap-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
              {c.title}
            </span>
            {c.rank && (
              <span className="shrink-0 rounded-full bg-[var(--surface)] px-2 py-0.5 text-[10px] font-bold text-[var(--foreground)] border border-[var(--border)]">
                {c.rank}
              </span>
            )}
          </div>

          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--foreground)] font-sans tabular-nums">
              {c.value}
            </span>
          </div>

          <span className="text-[11px] font-medium text-[var(--foreground-muted)]">
            {c.subtitle}
          </span>
        </div>
      ))}
    </div>
  );
}
