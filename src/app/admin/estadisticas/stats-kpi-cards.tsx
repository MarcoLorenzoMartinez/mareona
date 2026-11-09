import type { ProductHealthMetrics } from "@/lib/admin/stats-actions";

interface StatsKpiCardsProps {
  readonly metrics: ProductHealthMetrics;
}

/**
 * High-density KPI cards for platform engagement and community health.
 * Strictly adheres to AGENTS.md: zero mono fonts, tabular numerals, clean surface borders.
 */
export function StatsKpiCards({ metrics }: StatsKpiCardsProps) {
  const cards = [
    {
      title: "Usuarios",
      value: metrics.totalUsers,
      subtext: `+${metrics.newUsersToday} en 24h`,
      highlight: false,
    },
    {
      title: "Publicaciones",
      value: metrics.totalPosts,
      subtext: "Mensajes e hilos",
      highlight: false,
    },
    {
      title: "Pronósticos",
      value: metrics.totalPredictions,
      subtext: "Porras enviadas",
      highlight: false,
    },
    {
      title: "Bloqueos",
      value: metrics.blockedAttemptsCount,
      subtext: `${metrics.flaggedPostsCount} pendientes`,
      highlight: metrics.flaggedPostsCount > 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className={`rounded-xl border bg-white p-5 shadow-xs transition-shadow ${
            card.highlight
              ? "border-amber-300 bg-amber-50/30"
              : "border-[var(--border)]"
          }`}
        >
          <span className="text-xs font-semibold text-[var(--muted-foreground)]">
            {card.title}
          </span>
          <div className="mt-2 text-2xl font-black tracking-tight text-[var(--foreground)] tabular-nums">
            {card.value.toLocaleString("es-ES")}
          </div>
          <p className="mt-1 text-xs text-[var(--muted-foreground)] tabular-nums">
            {card.subtext}
          </p>
        </div>
      ))}
    </div>
  );
}
