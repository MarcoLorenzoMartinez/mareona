// Client: Requiere usePathname() para evaluar la ruta activa y aplicar aria-current="page"
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getDictionary } from "@/i18n";

/**
 * Secondary navigation bar for the Histórico section.
 * Renders typographic tabs with touch targets >= 44px and WCAG 2.2 AA compliant focus rings.
 */
export function HistoricoNav() {
  const pathname = usePathname();
  const dict = getDictionary();

  const historicoTabs = [
    { label: dict.historico.tabs.trajectory, href: "/historico" },
    { label: dict.historico.tabs.ephemerides, href: "/historico/efemerides" },
    { label: dict.historico.tabs.rivals, href: "/historico/rivales" },
    { label: dict.historico.tabs.legacy, href: "/historico/legado" },
  ];

  return (
    <nav
      aria-label="Secciones del archivo histórico"
      className="w-full border-b border-[var(--border)] bg-white"
    >
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none px-1">
        {historicoTabs.map((tab) => {
          const isActive =
            tab.href === "/historico"
              ? pathname === "/historico"
              : pathname.startsWith(tab.href);

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
