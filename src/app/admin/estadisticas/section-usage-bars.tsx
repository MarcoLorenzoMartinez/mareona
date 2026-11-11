import type { SectionUsageStat } from "@/lib/admin/types";

interface SectionUsageBarsProps {
  readonly sections: readonly SectionUsageStat[];
}

const SECTION_COLORS: Record<string, string> = {
  temporada: "bg-[#e2001a]",
  juegos: "bg-neutral-800",
  social: "bg-neutral-600",
  historico: "bg-neutral-400",
};

/**
 * Section popularity bars reflecting fan engagement across Mareona modules.
 * Renders stably even with 0 visits to maintain grid symmetry.
 */
export function SectionUsageBars({ sections }: SectionUsageBarsProps) {
  const hasVisits = sections.some((s) => s.visits > 0);

  return (
    <div className="flex h-full flex-col rounded-xl border border-[var(--border)] bg-white p-5 shadow-xs">
      <div className="border-b border-[var(--border)] pb-4">
        <h2 className="text-sm font-bold text-[var(--foreground)]">Uso por sección</h2>
      </div>

      {/* Stacked continuous progress bar */}
      <div className="mt-5 flex h-3 w-full overflow-hidden rounded-full bg-neutral-100">
        {hasVisits ? (
          sections.map((sec) => (
            <div
              key={sec.key}
              style={{ width: `${sec.percentage}%` }}
              className={`${SECTION_COLORS[sec.key] ?? "bg-neutral-500"} transition-all duration-300`}
              title={`${sec.label}: ${sec.percentage}%`}
            />
          ))
        ) : (
          <div className="h-full w-full bg-neutral-100" />
        )}
      </div>

      {/* Individual rows */}
      <div className="mt-5 flex-1 divide-y divide-[var(--border)]">
        {sections.map((sec) => (
          <div key={sec.key} className="flex items-center justify-between py-2.5 text-xs">
            <div className="flex items-center gap-2.5">
              <span
                className={`h-2.5 w-2.5 rounded-full ${SECTION_COLORS[sec.key] ?? "bg-neutral-500"}`}
                aria-hidden="true"
              />
              <span className="font-semibold text-[var(--foreground)]">{sec.label}</span>
            </div>

            <div className="flex items-center gap-3 tabular-nums">
              <span className="text-[var(--muted-foreground)]">
                {sec.visits.toLocaleString("es-ES")} visitas
              </span>
              <span className="w-10 text-right font-bold text-[var(--foreground)]">
                {sec.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
