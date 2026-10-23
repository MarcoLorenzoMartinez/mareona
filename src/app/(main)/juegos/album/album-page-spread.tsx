import type { ReactNode } from "react";

interface AlbumPageSpreadProps {
  readonly children: ReactNode;
  /** Section title printed at the top of the page (e.g. "Década de los 70") */
  readonly pageTitle: string;
  /** Subtitle / era description */
  readonly pageSubtitle?: string;
  /** Overall owned progress for this spread (0–1) */
  readonly progress: number;
}

/**
 * Simulates a double-page spread of a physical sticker album.
 * Uses a warm cream/ivory paper background with subtle linen texture,
 * a vertical spine shadow in the centre, period-style typography,
 * and a printed progress counter in the corner margin.
 */
export function AlbumPageSpread({
  children,
  pageTitle,
  pageSubtitle,
  progress,
}: AlbumPageSpreadProps) {
  const pct = Math.round(progress * 100);

  return (
    <section
      aria-label={`Pliego de álbum: ${pageTitle}`}
      className="relative w-full rounded-sm overflow-hidden"
      style={{
        // Warm ivory/cream cardboard paper base
        background:
          "linear-gradient(160deg, #f5efe0 0%, #ede4cc 35%, #e8ddc4 60%, #ede4cc 100%)",
        // Subtle linen grain via SVG noise filter defined in CSS
        boxShadow:
          "0 4px 24px rgba(80,50,10,0.18), 0 1px 4px rgba(80,50,10,0.12), inset 0 0 0 1px rgba(180,140,60,0.15)",
      }}
    >
      {/* Outer margin frame (printed album border lines) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-2 rounded-none"
        style={{ border: "1px solid rgba(160,120,50,0.22)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-3 rounded-none"
        style={{ border: "0.5px solid rgba(160,120,50,0.12)" }}
      />

      {/* Spine shadow (center gutter of the double-page) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 w-6 hidden lg:block"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(80,40,0,0.12) 30%, rgba(80,40,0,0.18) 50%, rgba(80,40,0,0.12) 70%, transparent)",
        }}
      />

      {/* Page header with printed title typography */}
      <div className="relative z-10 flex items-start justify-between px-5 pt-5 pb-3">
        <div>
          <h2
            className="font-sans text-sm font-black uppercase tracking-[0.18em] text-amber-900/80"
            style={{ textShadow: "0 1px 0 rgba(255,240,200,0.6)" }}
          >
            {pageTitle}
          </h2>
          {pageSubtitle && (
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-amber-800/50">
              {pageSubtitle}
            </p>
          )}
        </div>

        {/* Progress counter in album margin style */}
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-[9px] font-bold uppercase tracking-widest text-amber-700/60">
            Completado
          </span>
          <span className="font-sans text-sm font-black tabular-nums text-amber-900/70">
            {pct}%
          </span>
          {/* Thin progress bar (printed gauge) */}
          <div
            className="h-0.5 w-16 rounded-full overflow-hidden"
            style={{ background: "rgba(180,140,60,0.22)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                background: "rgba(180,60,0,0.55)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Decorative thin rule under header (printed divider line) */}
      <div
        aria-hidden="true"
        className="mx-5 mb-4 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(160,120,50,0.35) 20%, rgba(160,120,50,0.35) 80%, transparent)",
        }}
      />

      {/* Card grid area */}
      <div className="relative z-10 px-4 pb-6">{children}</div>

      {/* Page footer margin with album edition branding */}
      <div
        aria-hidden="true"
        className="flex items-center justify-center pb-3 pt-1"
      >
        <span className="text-[7px] font-bold uppercase tracking-[0.3em] text-amber-800/30">
          Álbum Oficial · Real Sporting de Gijón · Mareona
        </span>
      </div>
    </section>
  );
}
