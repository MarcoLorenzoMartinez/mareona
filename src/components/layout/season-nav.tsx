// Client: Requiere usePathname() para evaluar la ruta activa y aplicar aria-current="page"
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getDictionary } from "@/i18n";

/**
 * Secondary navigation bar for the Temporada section.
 * Renders typographic tabs with touch targets >= 44px and WCAG 2.2 AA compliant focus rings.
 */
export function SeasonNav() {
  const pathname = usePathname();
  const dict = getDictionary();

  const seasonTabs = [
    { label: dict.season.tabs.overview, href: "/temporada", isAvailable: true },
    { label: dict.season.tabs.matches, href: "/temporada/partidos", isAvailable: true },
    { label: dict.season.tabs.standings, href: "/temporada/clasificacion", isAvailable: true },
    { label: dict.season.tabs.squad, href: "/temporada/plantilla", isAvailable: true },
  ];

  return (
    <nav
      aria-label="Secciones de la temporada"
      className="w-full border-b border-[var(--border)] bg-white"
    >
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none px-1">
        {seasonTabs.map((tab) => {
          const isActive =
            tab.href === "/temporada"
              ? pathname === "/temporada"
              : pathname.startsWith(tab.href);

          if (!tab.isAvailable) {
            return (
              <span
                key={tab.label}
                aria-disabled="true"
                className="inline-flex min-h-[44px] items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-300 cursor-not-allowed select-none whitespace-nowrap"
              >
                {tab.label}
                <span className="rounded-xs bg-neutral-100 px-1.5 py-0.5 text-[9px] font-semibold text-neutral-400">
                  {dict.common.upcoming}
                </span>
              </span>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={isActive ? "page" : undefined}
              className={`inline-flex min-h-[44px] items-center border-b-2 px-3.5 py-2 text-sm font-semibold transition-all duration-150 whitespace-nowrap active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-strong)] focus-visible:ring-offset-2 ${
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
