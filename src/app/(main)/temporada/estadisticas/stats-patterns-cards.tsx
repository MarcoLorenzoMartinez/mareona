interface StatsPatternsCardsProps {
  readonly matchesPlayed: number;
  readonly cleanSheetsCount: number;
  readonly withoutScoringCount: number;
  readonly bothTeamsScoredCount: number;
  readonly tightMatchesCount: number;
  readonly highScoringMatchesCount: number;
}

export function StatsPatternsCards({
  matchesPlayed,
  cleanSheetsCount,
  withoutScoringCount,
  bothTeamsScoredCount,
  tightMatchesCount,
  highScoringMatchesCount,
}: StatsPatternsCardsProps) {
  const total = matchesPlayed || 1;

  const patterns = [
    {
      label: "Portería a cero",
      count: cleanSheetsCount,
      pct: Math.round((cleanSheetsCount / total) * 100),
    },
    {
      label: "Sin marcar gol",
      count: withoutScoringCount,
      pct: Math.round((withoutScoringCount / total) * 100),
    },
    {
      label: "Ambos equipos marcaron",
      count: bothTeamsScoredCount,
      pct: Math.round((bothTeamsScoredCount / total) * 100),
    },
    {
      label: "Marcador de 0 a 2 goles",
      count: tightMatchesCount,
      pct: Math.round((tightMatchesCount / total) * 100),
    },
    {
      label: "3 o más goles",
      count: highScoringMatchesCount,
      pct: Math.round((highScoringMatchesCount / total) * 100),
    },
  ];

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
        Guion de los Partidos
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {patterns.map((p) => (
          <div
            key={p.label}
            className="flex flex-col justify-between rounded-xl border border-red-200/80 bg-white p-4 shadow-2xs transition-colors hover:border-[#e2001a]/30"
          >
            <span className="text-xs font-bold text-[var(--foreground)]">
              {p.label}
            </span>

            <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-2.5">
              <span className="text-base sm:text-lg font-black text-[var(--foreground)] font-sans tabular-nums">
                {p.count} de {matchesPlayed}
              </span>
              <span className="inline-flex items-center rounded-full border border-red-200 bg-red-100/70 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-[#9b0012]">
                {p.pct}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
