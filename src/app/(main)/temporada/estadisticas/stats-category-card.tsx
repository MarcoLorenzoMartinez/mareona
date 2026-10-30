interface StatRow {
  readonly label: string;
  readonly value: string | number;
  readonly rank?: number | null;
  readonly benchmark?: string;
}

interface StatsCategoryCardProps {
  readonly title: string;
  readonly iconLabel: string;
  readonly rows: readonly StatRow[];
}

export function StatsCategoryCard({ title, iconLabel, rows }: StatsCategoryCardProps) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-white p-5 shadow-2xs">
      <div>
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">
            {title}
          </h2>
          <span className="rounded-full bg-[var(--surface)] px-2.5 py-0.5 text-[10px] font-bold text-[var(--foreground-muted)] border border-[var(--border)]">
            {iconLabel}
          </span>
        </div>

        <ul className="divide-y divide-neutral-100">
          {rows.map((row) => (
            <li key={row.label} className="flex items-center justify-between py-2.5">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[var(--foreground)]">
                  {row.label}
                </span>
                {row.benchmark && (
                  <span className="text-[10px] text-[var(--foreground-muted)]">
                    {row.benchmark}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-[var(--foreground)] font-sans tabular-nums">
                  {row.value}
                </span>
                {row.rank && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                      row.rank <= 6
                        ? "bg-[#e2001a]/10 text-[#e2001a] border-[#e2001a]/20"
                        : "bg-neutral-100 text-neutral-600 border-neutral-200"
                    }`}
                  >
                    #{row.rank}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
