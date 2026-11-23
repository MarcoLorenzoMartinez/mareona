// Client: Requiere usePathname() para evaluar la ruta activa y aplicar scroll automático hacia la pestaña seleccionada
"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePendingNavigation } from "@/lib/ui/use-pending-navigation";
import { getDictionary } from "@/i18n";

function SeasonNavList({ pathname }: { readonly pathname: string | null }) {
  const dict = getDictionary();
  const { markPending, isPending } = usePendingNavigation(pathname);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollAffordance = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    checkScrollAffordance();
    el.addEventListener("scroll", checkScrollAffordance, { passive: true });
    window.addEventListener("resize", checkScrollAffordance, { passive: true });

    return () => {
      el.removeEventListener("scroll", checkScrollAffordance);
      window.removeEventListener("resize", checkScrollAffordance);
    };
  }, [checkScrollAffordance]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !pathname) return;

    const activeTab = container.querySelector<HTMLElement>('[aria-current="page"]');
    if (activeTab) {
      const containerRect = container.getBoundingClientRect();
      const activeRect = activeTab.getBoundingClientRect();
      const targetScrollLeft =
        container.scrollLeft +
        (activeRect.left - containerRect.left) -
        containerRect.width / 2 +
        activeRect.width / 2;

      container.scrollTo({
        left: Math.max(0, targetScrollLeft),
        behavior: "smooth",
      });
    }
  }, [pathname]);

  const seasonTabs = [
    { label: dict.season.tabs.matches, shortLabel: dict.season.tabs.matches, href: "/temporada/partidos", isAvailable: true },
    { label: dict.season.tabs.standings, shortLabel: dict.season.tabs.standingsShort, href: "/temporada/clasificacion", isAvailable: true },
    { label: dict.season.tabs.stats, shortLabel: dict.season.tabs.statsShort, href: "/temporada/estadisticas", isAvailable: true },
    { label: dict.season.tabs.squad, shortLabel: dict.season.tabs.squad, href: "/temporada/plantilla", isAvailable: true },
    { label: dict.season.tabs.lineup, shortLabel: dict.season.tabs.lineup, href: "/temporada/pizarra", isAvailable: true },
  ];

  return (
    <nav
      aria-label="Secciones de la temporada"
      className="relative w-full border-b border-[var(--border)] bg-white"
    >
      {/* Left gradient indicator when scrolled on ultra-narrow viewports */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-4 bg-gradient-to-r from-white to-transparent transition-opacity duration-200 sm:hidden ${
          canScrollLeft ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        ref={containerRef}
        className="grid grid-cols-5 w-full sm:flex sm:w-auto sm:items-center sm:gap-1 overflow-x-auto scrollbar-none px-0.5 sm:px-2 overscroll-x-contain"
      >
        {seasonTabs.map((tab) => {
          const isActive =
            pathname !== null && pathname.startsWith(tab.href);
          const isTabPending = isPending(tab.href);

          if (!tab.isAvailable) {
            return (
              <span
                key={tab.label}
                aria-disabled="true"
                className="inline-flex min-h-[44px] items-center justify-center gap-1 px-1 sm:px-3 py-2 text-sm font-medium text-neutral-300 cursor-not-allowed select-none whitespace-nowrap"
              >
                <span className="sm:hidden">{tab.shortLabel}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="hidden sm:inline rounded-xs bg-neutral-100 px-1.5 py-0.5 text-[9px] font-semibold text-neutral-400">
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
              aria-busy={isTabPending ? "true" : undefined}
              onClick={() => markPending(tab.href, isActive)}
              className={`inline-flex min-h-[44px] items-center justify-center border-b-2 px-1 sm:px-3.5 py-2 text-sm font-semibold transition-all duration-150 whitespace-nowrap active:scale-[0.98] text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-strong)] focus-visible:ring-offset-2 ${
                isActive
                  ? "border-[var(--primary)] text-[var(--primary)]"
                  : isTabPending
                  ? "border-[var(--primary)]/50 text-[var(--primary)] animate-pulse"
                  : "border-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              }`}
            >
              <span className="sm:hidden">{tab.shortLabel}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Right gradient indicator when overflow exists on ultra-narrow viewports */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-4 bg-gradient-to-l from-white to-transparent transition-opacity duration-200 sm:hidden ${
          canScrollRight ? "opacity-100" : "opacity-0"
        }`}
      />
    </nav>
  );
}

function SeasonNavInner() {
  const pathname = usePathname();
  return <SeasonNavList pathname={pathname} />;
}

export function SeasonNavFallback() {
  return <SeasonNavList pathname={null} />;
}

/**
 * Secondary navigation bar for the Temporada section.
 * Encapsulates internal Suspense boundary with structural fallback for PPR static shell compatibility.
 */
export function SeasonNav() {
  return (
    <Suspense fallback={<SeasonNavFallback />}>
      <SeasonNavInner />
    </Suspense>
  );
}
