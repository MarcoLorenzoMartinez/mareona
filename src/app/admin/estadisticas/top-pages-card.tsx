import type { TopPageStat } from "@/lib/admin/types";

interface TopPagesCardProps {
  readonly pages: readonly TopPageStat[];
}

/**
 * Visual card displaying top visited routes and pages, inspired by Vercel and Plausible.
 * Highlights fan interest across rankings, trivia and community discussions.
 */
export function TopPagesCard({ pages }: TopPagesCardProps) {
  const maxVisits = Math.max(...pages.map((p) => p.visits), 1);

  return (
    <div className="flex h-full flex-col rounded-xl border border-[var(--border)] bg-white p-5 shadow-xs">
      <div className="border-b border-[var(--border)] pb-4">
        <h2 className="text-sm font-bold text-[var(--foreground)]">Páginas más visitadas</h2>
      </div>

      <div className="mt-4 flex flex-1 flex-col justify-between divide-y divide-[var(--border)]">
        {pages.map((page) => {
          const relativePercent = Math.round((page.visits / maxVisits) * 100);

          return (
            <div key={page.path} className="relative flex items-center justify-between py-2 text-xs">
              {/* Subtle relative background fill */}
              <div
                style={{ width: `${page.visits > 0 ? relativePercent : 0}%` }}
                className="absolute inset-y-1 left-0 rounded-sm bg-neutral-100/70 transition-all duration-500"
                aria-hidden="true"
              />

              {/* Path and label */}
              <div className="relative z-10 flex min-w-0 flex-col">
                <span className="truncate font-semibold text-[var(--foreground)]">
                  {page.label}
                </span>
                <span className="truncate text-[11px] text-[var(--muted-foreground)]">
                  {page.path}
                </span>
              </div>

              {/* Numbers */}
              <div className="relative z-10 flex items-center gap-3 tabular-nums font-sans">
                <span className="text-[var(--foreground)] font-bold">
                  {page.visits.toLocaleString("es-ES")}
                </span>
                <span className="w-8 text-right text-[11px] text-[var(--muted-foreground)]">
                  {page.percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
