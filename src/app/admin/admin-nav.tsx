"use client"; // Client: Resaltado accesible de pestaña activa según la URL actual

import Link from "next/link";
import { usePathname } from "next/navigation";

interface AdminNavItem {
  readonly href: string;
  readonly label: string;
}

const ADMIN_NAV_ITEMS: readonly AdminNavItem[] = [
  { href: "/admin/moderacion", label: "Moderación UGC" },
  { href: "/admin/usuarios", label: "Usuarios y Sanciones" },
  { href: "/admin/anuncios", label: "Avisos del Sistema" },
  { href: "/admin/estadisticas", label: "Métricas y Salud" },
];

/**
 * Top navigation pill bar for administrative submodules.
 * Follows AGENTS.md rule 9: pill shape (rounded-full), red active state with pure white text,
 * no mono fonts, high accessibility (WCAG 2.2 AA).
 */
export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Secciones del panel de administración"
      className="flex flex-wrap items-center gap-2 border-b border-[var(--border)] pb-4"
    >
      {ADMIN_NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 ${
              isActive
                ? "bg-[var(--brand,#e2001a)] text-white shadow-xs font-bold"
                : "border border-[var(--border)] bg-white text-[var(--muted-foreground)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
