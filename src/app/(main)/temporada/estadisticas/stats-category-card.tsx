import { LeagueRankBadge } from "./league-rank-badge";

interface StatRow {
  readonly label: string;
  readonly value: string | number;
  readonly rank?: number | null;
}

interface StatsCategoryCardProps {
  readonly title: string;
  readonly rows: readonly StatRow[];
}

export function StatsCategoryCard({ title, rows }: StatsCategoryCardProps) {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-[var(--border)] bg-white p-5 shadow-2xs">
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)] border-b border-[var(--border)] pb-3 mb-2">
          {title}
        </h2>

        <ul className="divide-y divide-neutral-100">
          {rows.map((row) => (
            <li key={row.label} className="flex items-center justify-between py-2.5">
              <span className="text-xs font-semibold text-[var(--foreground)]">
                {row.label}
              </span>

              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[var(--foreground)] font-sans tabular-nums">
                  {row.value}
                </span>
                <LeagueRankBadge rank={row.rank} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
