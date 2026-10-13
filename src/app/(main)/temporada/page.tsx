import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Temporada — Mareona",
  description: "Próximo partido y clasificación del Real Sporting de Gijón.",
};

interface StandingRow {
  readonly position: number;
  readonly teamName: string;
  readonly shortName: string;
  readonly played: number;
  readonly points: number;
  readonly isSporting: boolean;
  readonly zone: "direct" | "playoff" | "neutral" | "relegation";
}

const STANDINGS_SAMPLE: readonly StandingRow[] = [
  { position: 1, teamName: "Racing de Santander", shortName: "RAC", played: 9, points: 20, isSporting: false, zone: "direct" },
  { position: 2, teamName: "Levante UD", shortName: "LEV", played: 9, points: 18, isSporting: false, zone: "direct" },
  { position: 3, teamName: "Real Sporting de Gijón", shortName: "RSG", played: 9, points: 17, isSporting: true, zone: "playoff" },
  { position: 4, teamName: "Real Zaragoza", shortName: "ZAR", played: 9, points: 16, isSporting: false, zone: "playoff" },
  { position: 5, teamName: "SD Eibar", shortName: "EIB", played: 9, points: 15, isSporting: false, zone: "playoff" },
  { position: 6, teamName: "CD Castellón", shortName: "CAS", played: 9, points: 15, isSporting: false, zone: "playoff" },
  { position: 7, teamName: "Real Oviedo", shortName: "OVI", played: 9, points: 14, isSporting: false, zone: "neutral" },
  { position: 8, teamName: "Burgos CF", shortName: "BUR", played: 9, points: 14, isSporting: false, zone: "neutral" },
];

/**
 * Clean team crest badge placeholder with team acronym.
 */
function TeamBadge({
  name,
  isSporting = false,
}: {
  name: string;
  isSporting?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border text-xs font-black tracking-wider select-none ${
        isSporting
          ? "border-[var(--primary)] bg-[var(--primary)] text-white shadow-xs"
          : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)]"
      }`}
    >
      {name.slice(0, 3).toUpperCase()}
    </div>
  );
}

/**
 * Minimalist season overview page strictly answering:
 * 1. "When and who do we play next?" (Hero card)
 * 2. "Where do we stand on the table?" (Compact standings)
 */
export default function TemporadaPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* ================================================================= */}
      {/* HERO: Próximo Partido                                            */}
      {/* ================================================================= */}
      <section aria-label="Próximo Partido" className="w-full">
        <div className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-2xs">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <span className="text-xs font-semibold tracking-wider text-[var(--primary)] uppercase">
              Próximo Partido · Jornada 10
            </span>
            <span className="text-xs font-medium text-[var(--foreground-muted)]">
              LaLiga Hypermotion
            </span>
          </div>

          <div className="grid grid-cols-1 items-center gap-6 py-6 md:grid-cols-7">
            {/* Equipo Local */}
            <div className="flex items-center justify-start gap-3.5 md:col-span-3 md:justify-end">
              <span className="text-lg font-bold text-[var(--foreground)] md:text-xl">
                Real Sporting
              </span>
              <TeamBadge name="RSG" isSporting />
            </div>

            {/* Fecha, hora y marcador */}
            <div className="flex flex-col items-center justify-center rounded-md bg-[var(--surface)] py-3 px-4 text-center md:col-span-1">
              <span className="text-xs font-bold tracking-widest text-[var(--foreground-muted)] uppercase">
                Dom 19 Oct
              </span>
              <span className="text-2xl font-black tracking-tight text-[var(--foreground)]">
                18:30
              </span>
              <span className="text-[11px] font-medium text-[var(--foreground-muted)]">
                El Molinón
              </span>
            </div>

            {/* Equipo Visitante */}
            <div className="flex items-center justify-start gap-3.5 md:col-span-3">
              <TeamBadge name="ZAR" />
              <span className="text-lg font-bold text-[var(--foreground)] md:text-xl">
                Real Zaragoza
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* BLOQUE INFERIOR: Clasificación Compacta                         */}
      {/* ================================================================= */}
      <section aria-label="Clasificación" className="w-full">
        <div className="rounded-xl border border-[var(--border)] bg-white p-5 shadow-2xs">
          <div className="mb-4 flex items-center justify-between border-b border-[var(--border)] pb-3">
            <h2 className="text-base font-bold text-[var(--foreground)]">
              Clasificación
            </h2>
            <span className="text-xs text-[var(--foreground-muted)]">
              Temporada 2025/2026
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">
                Clasificación de LaLiga Hypermotion 2025/2026
              </caption>
              <thead>
                <tr className="border-b border-[var(--border)] text-xs font-semibold text-[var(--foreground-muted)] uppercase">
                  <th scope="col" className="w-12 py-2.5 pl-3 text-center">
                    Pos
                  </th>
                  <th scope="col" className="py-2.5">
                    Equipo
                  </th>
                  <th scope="col" className="w-16 py-2.5 text-center">
                    PJ
                  </th>
                  <th scope="col" className="w-16 py-2.5 pr-3 text-right">
                    Pts
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {STANDINGS_SAMPLE.map((row) => (
                  <tr
                    key={row.position}
                    className={`transition-colors ${
                      row.isSporting
                        ? "bg-red-50/70 font-semibold text-[var(--foreground)]"
                        : "hover:bg-[var(--surface)] text-[var(--foreground)]"
                    }`}
                  >
                    <td className="py-2.5 pl-3 text-center">
                      <span
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-sm text-xs font-bold ${
                          row.isSporting
                            ? "bg-[var(--primary)] text-white"
                            : row.zone === "direct"
                              ? "bg-neutral-800 text-white"
                              : row.zone === "playoff"
                                ? "bg-neutral-200 text-neutral-800"
                                : "text-[var(--foreground-muted)]"
                        }`}
                      >
                        {row.position}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`truncate text-sm ${
                            row.isSporting ? "font-bold text-[var(--primary)]" : ""
                          }`}
                        >
                          {row.teamName}
                        </span>
                        {row.isSporting && (
                          <span className="rounded-xs bg-[var(--primary)] px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase">
                            RSG
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 text-center text-[var(--foreground-muted)]">
                      {row.played}
                    </td>
                    <td className="py-2.5 pr-3 text-right font-bold text-[var(--foreground)]">
                      {row.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-3 text-[11px] text-[var(--foreground-muted)]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-xs bg-neutral-800" aria-hidden="true" />
                Ascenso directo
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-xs bg-neutral-300" aria-hidden="true" />
                Playoff
              </span>
            </div>
            <span className="font-medium">
              3ª posición · 17 pts
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
