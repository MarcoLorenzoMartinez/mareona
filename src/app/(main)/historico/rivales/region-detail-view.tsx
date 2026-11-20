// Client: Vista detallada de los rivales acumulados de una Comunidad Autónoma o País
"use client";

import { useMemo } from "react";
import Image from "next/image";
import type { RegionRivalSummary, RivalH2HSummary } from "@/lib/historical/rivals-types";
import spainPaths from "@/data/historical/spain-svg-paths.json";
import worldPaths from "@/data/historical/world-svg-paths.json";
import { RivalCard } from "./rival-card";
import { H2HMetricsStrip } from "@/components/sports/h2h-metrics-strip";

interface RegionDetailViewProps {
  readonly region: RegionRivalSummary;
  readonly onBack: () => void;
  readonly onSelectRival: (rival: RivalH2HSummary) => void;
}

/**
 * Editorial summary view for a selected Autonomous Community or Country.
 * Features official flag emblem and subtle SVG watermark silhouette.
 * Conforms to AGENTS.md rules 2, 3, 5, 8 and 9. Strictly <= 180 lines.
 */
export function RegionDetailView({ region, onBack, onSelectRival }: RegionDetailViewProps) {
  const flagSlug = useMemo(() => {
    return region.regionName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-");
  }, [region.regionName]);

  const flagUrl = `/flags/${flagSlug}.svg`;

  const pathItem = useMemo(() => {
    if (region.isCountry) {
      const norm = region.regionName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return worldPaths.find(
        (w) =>
          w.name.toLowerCase() === region.regionName.toLowerCase() ||
          w.name.toLowerCase() === norm ||
          w.rawName.toLowerCase() === region.regionName.toLowerCase() ||
          w.rawName.toLowerCase() === norm
      );
    }
    return spainPaths.find(
      (s) =>
        s.name.toLowerCase() === region.regionName.toLowerCase() ||
        s.id.toLowerCase() === region.regionId.toLowerCase()
    );
  }, [region.isCountry, region.regionName, region.regionId]);

  const pathViewBox = useMemo(() => {
    if (!pathItem?.path) return null;
    const nums = pathItem.path.match(/[-+]?[0-9]*\.?[0-9]+/g)?.map(Number) ?? [];
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (let i = 0; i < nums.length; i += 2) {
      const x = nums[i];
      const y = nums[i + 1];
      if (x !== undefined && y !== undefined) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
    const w = maxX - minX || 100;
    const h = maxY - minY || 100;
    const padX = w * 0.08;
    const padY = h * 0.08;
    return `${minX - padX} ${minY - padY} ${w + padX * 2} ${h + padY * 2}`;
  }, [pathItem]);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
      {/* Header Card con silueta en marca de agua */}
      <div className="relative overflow-hidden flex flex-col gap-4 rounded-xl border border-[var(--border)] bg-white p-4 shadow-2xs sm:p-6">
        {/* Silhouette Watermark */}
        {pathItem && pathViewBox && (
          <div
            className="absolute -right-6 -bottom-6 top-0 w-48 sm:w-72 pointer-events-none overflow-hidden opacity-[0.06] text-[#e2001a] flex items-center justify-end select-none"
            aria-hidden="true"
          >
            <svg
              viewBox={pathViewBox}
              className="h-full w-full object-contain"
              preserveAspectRatio="xMidYMid meet"
            >
              <path d={pathItem.path} fill="currentColor" />
            </svg>
          </div>
        )}

        <div className="relative z-10 flex items-center justify-between pb-1">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative h-6 w-9 sm:h-7 sm:w-10 shrink-0 overflow-hidden rounded-md border border-[var(--border)] shadow-2xs bg-neutral-100">
              <Image
                src={flagUrl}
                alt={`Bandera de ${region.regionName}`}
                fill
                sizes="40px"
                className="object-cover"
                unoptimized
              />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl truncate">
              {region.regionName}
            </h2>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="group shrink-0 inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-white px-3 py-1 text-xs font-semibold text-[var(--muted-foreground)] hover:border-neutral-300 hover:text-[var(--foreground)] transition-all cursor-pointer active:scale-95"
            aria-label="Cerrar detalle de la región"
          >
            ✕ Cerrar
          </button>
        </div>

        {/* Metrics Strip */}
        <div className="relative z-10">
          <H2HMetricsStrip
            played={region.totalMatches}
            won={region.won}
            drawn={region.drawn}
            lost={region.lost}
            goalsFor={region.goalsFor}
            goalsAgainst={region.goalsAgainst}
          />
        </div>
      </div>

      {/* Rivals Grid */}
      <section aria-label="Equipos de la región" className="flex flex-col gap-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">
          Equipos
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {region.rivals.map((rival) => (
            <RivalCard key={rival.name} rival={rival} onSelect={onSelectRival} />
          ))}
        </div>
      </section>
    </div>
  );
}
