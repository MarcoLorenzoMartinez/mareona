// Client: Requiere usePathname() para evaluar la ruta activa en móvil y aplicar aria-current
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-items";

/**
 * Mobile bottom navigation bar (< 768px, PWA Ergonomics)
 * conforming to WCAG 2.2 AA touch targets (≥44px) and active tab indicators.
 */
export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegación móvil"
      className="fixed bottom-0 inset-x-0 z-50 border-t border-[var(--border)] bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <ul className="grid grid-cols-4 items-center">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex h-14 min-w-[44px] flex-col items-center justify-center gap-1 transition-transform duration-100 ease-out active:scale-90 select-none touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-strong)] ${
                  isActive
                    ? "text-[var(--primary)]"
                    : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <Icon
                    className={`h-5 w-5 ${
                      isActive
                        ? "text-[var(--primary)] stroke-[2.25]"
                        : "text-[var(--foreground-muted)] stroke-[1.75]"
                    }`}
                    aria-hidden="true"
                  />
                  {isActive && (
                    <span
                      className="absolute -top-1 -right-1 h-1.5 w-1.5 rounded-full bg-[var(--primary)]"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <span
                  className={`text-[11px] leading-none tracking-tight ${
                    isActive ? "font-bold text-[var(--primary)]" : "font-medium"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
