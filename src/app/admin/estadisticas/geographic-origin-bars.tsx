"use client"; // Client: Selector interactivo entre Provincias y Países

import { useState } from "react";
import type { GeographicOriginStat } from "@/lib/admin/types";

interface GeographicOriginBarsProps {
  readonly provinces: readonly GeographicOriginStat[];
  readonly countries: readonly GeographicOriginStat[];
}

type OriginTab = "provinces" | "countries";

const PALETTE = ["bg-[#e2001a]", "bg-neutral-800", "bg-neutral-600", "bg-neutral-400"];

/**
 * Geographic distribution panel with a clean toggle to switch between
 * Spanish provinces and international countries.
 */
export function GeographicOriginBars({ provinces, countries }: GeographicOriginBarsProps) {
  const [activeTab, setActiveTab] = useState<OriginTab>("provinces");

  const items = activeTab === "provinces" ? provinces : countries;

  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
        <h2 className="text-sm font-bold text-[var(--foreground)]">Origen de la Mareona</h2>

        {/* Tab selector */}
        <div className="flex items-center rounded-full bg-neutral-100 p-0.5">
          <button
            type="button"
            onClick={() => setActiveTab("provinces")}
            className={`rounded-full px-3 py-1 text-xs transition-colors ${
              activeTab === "provinces"
                ? "bg-[#e2001a] font-bold text-white shadow-xs"
                : "font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            Provincias
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("countries")}
            className={`rounded-full px-3 py-1 text-xs transition-colors ${
              activeTab === "countries"
                ? "bg-[#e2001a] font-bold text-white shadow-xs"
                : "font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            Países
          </button>
        </div>
      </div>

      {/* Stacked continuous progress bar */}
      <div className="mt-5 flex h-3 w-full overflow-hidden rounded-full bg-neutral-100">
        {items.map((item, idx) => (
          <div
            key={item.key}
            style={{ width: `${item.percentage}%` }}
            className={`${PALETTE[idx % PALETTE.length]} transition-all duration-300`}
            title={`${item.label}: ${item.percentage}%`}
          />
        ))}
      </div>

      {/* Individual items list */}
      <div className="mt-5 divide-y divide-[var(--border)]">
        {items.map((item, idx) => (
          <div key={item.key} className="flex items-center justify-between py-2.5 text-xs">
            <div className="flex items-center gap-2.5">
              <span
                className={`h-2.5 w-2.5 rounded-full ${PALETTE[idx % PALETTE.length]}`}
                aria-hidden="true"
              />
              <span className="font-semibold text-[var(--foreground)]">{item.label}</span>
            </div>

            <div className="flex items-center gap-3 tabular-nums">
              <span className="text-[var(--muted-foreground)]">
                {item.visits.toLocaleString("es-ES")} visitas
              </span>
              <span className="w-10 text-right font-bold text-[var(--foreground)]">
                {item.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
