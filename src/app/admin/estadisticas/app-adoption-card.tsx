import type { AccessModeStat } from "@/lib/admin/types";

interface AppAdoptionCardProps {
  readonly accessModes: readonly AccessModeStat[];
  readonly matchDayMultiplier: number;
}

/**
 * Visual card displaying PWA home screen installation adoption and matchday traffic multiplier.
 * Flat, sober design without artificial alert callouts or nested colored boxes.
 */
export function AppAdoptionCard({ accessModes, matchDayMultiplier }: AppAdoptionCardProps) {
  const pwaMode = accessModes.find((m) => m.mode === "pwa");
  const browserMode = accessModes.find((m) => m.mode === "browser");

  const pwaPercent = pwaMode?.percentage ?? 0;
  const browserPercent = browserMode?.percentage ?? 0;

  return (
    <div className="flex h-full flex-col rounded-xl border border-[var(--border)] bg-white p-5 shadow-xs">
      <div className="border-b border-[var(--border)] pb-4">
        <h2 className="text-sm font-bold text-[var(--foreground)]">Adopción de la app y jornada</h2>
      </div>

      <div className="mt-5 flex flex-1 flex-col justify-between gap-6">
        {/* PWA vs Browser ratio */}
        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[var(--foreground)]">
              App instalada en móvil (PWA)
            </span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#e2001a] tabular-nums font-sans">
                {pwaPercent}%
              </span>
              <span className="text-[var(--muted-foreground)]">/</span>
              <span className="font-medium text-[var(--muted-foreground)] tabular-nums font-sans">
                {browserPercent}% web
              </span>
            </div>
          </div>

          <div className="mt-2.5 flex h-2.5 w-full overflow-hidden rounded-full bg-neutral-100">
            <div
              style={{ width: `${pwaPercent}%` }}
              className="bg-[#e2001a] transition-all duration-500"
              title={`App instalada: ${pwaPercent}%`}
            />
            <div
              style={{ width: `${browserPercent}%` }}
              className="bg-neutral-800 transition-all duration-500"
              title={`Navegador web: ${browserPercent}%`}
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] text-[var(--muted-foreground)] tabular-nums">
            <span>{pwaMode?.count.toLocaleString("es-ES") ?? 0} instalaciones activas</span>
            <span>{browserMode?.count.toLocaleString("es-ES") ?? 0} vía navegador</span>
          </div>
        </div>

        {/* Matchday boost row integrated with crisp dividing rule */}
        <div className="flex items-center justify-between border-t border-[var(--border)] pt-4 text-xs">
          <div>
            <div className="font-semibold text-[var(--foreground)]">
              Multiplicador en día de partido
            </div>
            <div className="text-[11px] text-[var(--muted-foreground)]">
              Afluencia media comparada con días laborables
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black tracking-tight text-[#e2001a] tabular-nums font-sans">
              +{Math.round((matchDayMultiplier - 1) * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
