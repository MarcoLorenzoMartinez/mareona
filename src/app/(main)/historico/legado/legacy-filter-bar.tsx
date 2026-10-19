// Client: Barra selectora de secciones para el Legado Histórico
"use client";

import type { LegacyTab } from "@/lib/historical/legacy-types";

interface LegacyFilterBarProps {
  readonly activeTab: LegacyTab;
  readonly onTabChange: (tab: LegacyTab) => void;
}

const TABS: readonly { readonly id: LegacyTab; readonly label: string }[] = [
  { id: "records", label: "Récords y Palmarés" },
  { id: "legends", label: "Muro de Leyendas" },
];


/**
 * Filter bar adhering to AGENTS.md rules 8 and 9:
 * - Segmented control in rounded-full pill styling.
 * - Active state in corporate Sporting red with white text.
 */
export function LegacyFilterBar({ activeTab, onTabChange }: LegacyFilterBarProps) {
  return (
    <div className="flex items-center overflow-x-auto pb-1 scrollbar-none">
      <div
        role="tablist"
        aria-label="Secciones del legado sportinguista"
        className="inline-flex rounded-full border border-[var(--border)] bg-neutral-100 p-1"
      >
        {TABS.map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => onTabChange(tab.id)}
              className={`min-h-[38px] rounded-full px-4 text-xs font-bold transition-all active:scale-95 whitespace-nowrap ${
                isSelected
                  ? "bg-[var(--primary)] text-white shadow-xs"
                  : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
