"use client"; // Client: Resaltado accesible de pestaña activa según la URL actual

import Link from "next/link";
import { usePathname } from "next/navigation";

interface AdminNavItem {
  readonly href: string;
  readonly label: string;
}

const ADMIN_NAV_ITEMS: readonly AdminNavItem[] = [
  { href: "/admin/estadisticas", label: "Métricas" },
  { href: "/admin/moderacion", label: "Moderación" },
  { href: "/admin/usuarios", label: "Usuarios" },
  { href: "/admin/anuncios", label: "Comunicados" },
];

/**
 * Secondary navigation bar for the administrative section.
 * Aligns with the platform's visual standard (SeasonNav / HistoricoNav):
 * typographic tabs, 44px min tap targets, corporate red active border, and zero AI pill styling.
 */
export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Secciones del panel de administración"
      className="w-full border-b border-[var(--border)] bg-white"
    >
      <div className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto scrollbar-none px-4 sm:px-6">
        {ADMIN_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (pathname !== null && pathname.startsWith(`${item.href}/`));
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`inline-flex min-h-[44px] items-center border-b-2 px-3.5 py-2 text-sm font-semibold transition-all duration-150 whitespace-nowrap active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-strong)] focus-visible:ring-offset-2 ${
                isActive
                  ? "border-[var(--primary)] text-[var(--primary)]"
                  : "border-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
