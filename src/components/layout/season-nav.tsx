// Client: Requiere usePathname() para evaluar la ruta activa y aplicar aria-current="page"
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SeasonTab {
  readonly label: string;
  readonly href: string;
  readonly isAvailable: boolean;
}

const SEASON_TABS: readonly SeasonTab[] = [
  { label: "Resumen", href: "/temporada", isAvailable: true },
  { label: "Partidos", href: "/temporada/partidos", isAvailable: true },
  { label: "Clasificación", href: "/temporada/clasificacion", isAvailable: false },
  { label: "Plantilla", href: "/temporada/plantilla", isAvailable: false },
];

/**
 * Secondary navigation bar for the Temporada section.
 * Renders typographic tabs with touch targets >= 44px and WCAG 2.2 AA compliant focus rings.
 */
export function SeasonNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Secciones de la temporada"
      className="w-full border-b border-[var(--border)] bg-white"
    >
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none px-1">
        {SEASON_TABS.map((tab) => {
          const isActive = pathname === tab.href;

          if (!tab.isAvailable) {
            return (
              <span
                key={tab.label}
                aria-disabled="true"
                className="inline-flex min-h-[44px] items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-300 cursor-not-allowed select-none whitespace-nowrap"
              >
                {tab.label}
                <span className="rounded-xs bg-neutral-100 px-1.5 py-0.5 text-[9px] font-semibold text-neutral-400">
                  Próx.
                </span>
              </span>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={isActive ? "page" : undefined}
              className={`inline-flex min-h-[44px] items-center border-b-2 px-3.5 py-2 text-sm font-semibold transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-strong)] focus-visible:ring-offset-2 ${
                isActive
                  ? "border-[var(--primary)] text-[var(--primary)]"
                  : "border-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
