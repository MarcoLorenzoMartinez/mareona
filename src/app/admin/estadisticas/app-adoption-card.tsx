import type { AccessModeStat } from "@/lib/admin/types";

interface AppAdoptionCardProps {
  readonly accessModes: readonly AccessModeStat[];
  readonly matchDayMultiplier: number;
}

/**
 * Visual card displaying PWA home screen installation adoption and matchday traffic multiplier.
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

      <div className="mt-5 flex flex-1 flex-col justify-between gap-5">
        {/* PWA vs Browser ratio */}
        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[var(--foreground)]">
              App instalada en móvil (PWA)
            </span>
            <span className="font-bold text-[#e2001a] tabular-nums font-sans">
              {pwaPercent}%
            </span>
          </div>

          <div className="mt-2 flex h-2.5 w-full overflow-hidden rounded-full bg-neutral-100">
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

          <div className="mt-2 flex items-center justify-between text-[11px] text-[var(--muted-foreground)]">
            <span className="tabular-nums">
              {pwaMode?.count.toLocaleString("es-ES") ?? 0} instalaciones activas
            </span>
            <span className="tabular-nums">
              {browserMode?.count.toLocaleString("es-ES") ?? 0} vía navegador
            </span>
          </div>
        </div>

        {/* Matchday boost callout */}
        <div className="flex items-center justify-between rounded-lg border border-red-100 bg-red-50/60 p-3.5 text-xs">
          <div>
            <div className="font-bold text-red-950">Multiplicador en día de partido</div>
            <div className="text-[11px] text-red-800/80">
              Incremento medio de afluencia respecto a días laborables
            </div>
          </div>
          <div className="shrink-0 text-right">
            <span className="text-xl font-black text-[#e2001a] tabular-nums font-sans">
              +{Math.round((matchDayMultiplier - 1) * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
