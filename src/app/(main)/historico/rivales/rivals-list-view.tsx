// Client: Vista contenedora del listado de rivales (conmutación entre tabla y cuadrícula)
"use client";

import type { RivalH2HSummary, RivalLayoutMode, RivalSortOption } from "@/lib/historical/rivals-types";
import { RivalsTableView } from "./rivals-table-view";
import { RivalCard } from "./rival-card";

interface RivalsListViewProps {
  readonly rivals: readonly RivalH2HSummary[];
  readonly layoutMode: RivalLayoutMode;
  readonly activeSort: RivalSortOption;
  readonly onSortChange: (sort: RivalSortOption) => void;
  readonly onSelect: (rival: RivalH2HSummary) => void;
}

export function RivalsListView({
  rivals,
  layoutMode,
  activeSort,
  onSortChange,
  onSelect,
}: RivalsListViewProps) {
  if (rivals.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-white p-8 text-center shadow-2xs">
        <p className="text-sm font-semibold text-[var(--foreground)]">
          No se encontraron rivales con esos criterios
        </p>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Prueba con otro término de búsqueda o selecciona el filtro &quot;Todos&quot;.
        </p>
      </div>
    );
  }

  if (layoutMode === "table") {
    return (
      <RivalsTableView
        rivals={rivals}
        onSelect={onSelect}
        activeSort={activeSort}
        onSortChange={onSortChange}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {rivals.map((rival) => (
        <RivalCard key={rival.name} rival={rival} onSelect={onSelect} />
      ))}
    </div>
  );
}
