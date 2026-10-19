// Client: Modal accesible con perfil detallado de la leyenda sportinguista
"use client";

import { useEffect } from "react";
import Image from "next/image";
import type { LegendProfile } from "@/lib/historical/legacy-types";

interface LegendDetailDialogProps {
  readonly legend: LegendProfile;
  readonly onClose: () => void;
}

export function LegendDetailDialog({ legend, onClose }: LegendDetailDialogProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="legend-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-2xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl border border-[var(--border)] shadow-2xl p-5 sm:p-7 text-[var(--foreground)]">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar ficha de leyenda"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[var(--surface)] hover:bg-neutral-200 text-neutral-700 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
        >
          ✕
        </button>

        {/* Header Profile */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 border-b border-[var(--border)] pb-5">
          <div className="relative h-28 w-28 sm:h-32 sm:w-32 shrink-0 overflow-hidden rounded-2xl border border-[var(--border)] bg-neutral-100 shadow-xs">
            <Image
              src={legend.photoUrl}
              alt={legend.name}
              fill
              sizes="(max-width: 640px) 112px, 128px"
              className="object-cover object-top"
              unoptimized
            />
          </div>

          <div className="text-center sm:text-left flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
              <span className="rounded-full bg-red-50 border border-red-200 px-2.5 py-0.5 text-xs font-semibold text-[var(--primary)]">
                {legend.eraLabel}
              </span>
              <span className="rounded-full bg-[var(--surface)] border border-[var(--border)] px-2.5 py-0.5 text-xs font-semibold text-[var(--muted-foreground)]">
                {legend.position ?? (legend.role === "coach" ? "Entrenador" : "Mito")}
              </span>
            </div>

            <h2 id="legend-modal-title" className="text-xl sm:text-2xl font-black text-[var(--foreground)] tracking-tight">
              {legend.name}
            </h2>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5 font-medium">
              {legend.fullName} · <span className="tabular-nums">{legend.yearsActive}</span>
            </p>

            {/* Quick Stats Pill */}
            {(legend.totalPlayed !== undefined || legend.totalGoals !== undefined) && (
              <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                {legend.totalPlayed !== undefined && (
                  <div className="rounded-lg bg-[var(--surface)] border border-[var(--border)] px-3 py-1 text-xs">
                    <span className="text-[var(--muted-foreground)]">Partidos: </span>
                    <span className="font-bold tabular-nums text-[var(--foreground)]">{legend.totalPlayed}</span>
                  </div>
                )}
                {legend.totalGoals !== undefined && legend.totalGoals > 0 && (
                  <div className="rounded-lg bg-[var(--surface)] border border-[var(--border)] px-3 py-1 text-xs">
                    <span className="text-[var(--muted-foreground)]">Goles: </span>
                    <span className="font-bold tabular-nums text-[var(--primary)]">{legend.totalGoals}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Biography Summary */}
        <div className="mt-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
            Trayectoria y Huella
          </h3>
          <p className="mt-2 text-sm text-[var(--foreground)] leading-relaxed">
            {legend.summary}
          </p>
        </div>

        {/* Milestones / Highlights */}
        {legend.highlights.length > 0 && (
          <div className="mt-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
              Hitos Memorables
            </h3>
            <ul className="mt-2.5 flex flex-col gap-2">
              {legend.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-[var(--foreground)]">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
                  <span className="leading-snug">{h}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Honours & Titles */}
        {legend.titles && legend.titles.length > 0 && (
          <div className="mt-5 border-t border-[var(--border)] pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
              Palmarés y Reconocimientos
            </h3>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {legend.titles.map((title, i) => (
                <span
                  key={i}
                  className="rounded-full bg-[var(--surface)] border border-[var(--border)] px-3 py-1 text-xs font-medium text-[var(--foreground)]"
                >
                  🏆 {title}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
