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
      label: "Porterías a cero",
      count: cleanSheetsCount,
      pct: Math.round((cleanSheetsCount / total) * 100),
      desc: "Partidos sin encajar ningún gol",
    },
    {
      label: "Ambos equipos marcaron",
      count: bothTeamsScoredCount,
      pct: Math.round((bothTeamsScoredCount / total) * 100),
      desc: "Encuentros con goles en ambas porterías",
    },
    {
      label: "Partidos de marcador corto",
      count: tightMatchesCount,
      pct: Math.round((tightMatchesCount / total) * 100),
      desc: "Duelos resueltos con 0, 1 o 2 goles en total",
    },
    {
      label: "Partidos de marcador alto",
      count: highScoringMatchesCount,
      pct: Math.round((highScoringMatchesCount / total) * 100),
      desc: "Duelos abiertos con 3 o más goles",
    },
    {
      label: "Partidos sin ver puerta",
      count: withoutScoringCount,
      pct: Math.round((withoutScoringCount / total) * 100),
      desc: "Jornadas sin anotar goles a favor",
    },
  ];

  return (
    <div className="flex flex-col justify-between rounded-xl border border-[var(--border)] bg-white p-5 shadow-2xs">
      <div>
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
            Perfil y Guion de los Partidos
          </h2>
          <span className="text-xs font-medium text-[var(--foreground-muted)] font-sans tabular-nums">
            {matchesPlayed} jornadas de liga
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {patterns.map((p) => (
            <div
              key={p.label}
              className="flex flex-col justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3"
            >
              <div>
                <span className="text-xs font-semibold text-[var(--foreground)]">
                  {p.label}
                </span>
                <span className="block mt-0.5 text-[11px] text-[var(--foreground-muted)]">
                  {p.desc}
                </span>
              </div>

              <div className="mt-3 flex items-baseline justify-between border-t border-[var(--border)]/50 pt-2">
                <span className="text-base font-bold text-[var(--foreground)] font-sans tabular-nums">
                  {p.count} de {matchesPlayed}
                </span>
                <span className="text-xs font-semibold text-[var(--foreground-muted)] font-sans tabular-nums">
                  {p.pct}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
