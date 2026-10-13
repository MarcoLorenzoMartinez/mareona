// Client: Requiere usePathname() para evaluar la ruta activa y aplicar aria-current="page", y estado de fallback de imagen
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Gamepad2,
  History,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  readonly label: string;
  readonly href: string;
  readonly icon: LucideIcon;
  readonly description: string;
}

const NAV_ITEMS: readonly NavItem[] = [
  {
    label: "Temporada",
    href: "/temporada",
    icon: CalendarDays,
    description: "Partidos, clasificación y plantilla actual",
  },
  {
    label: "Histórico",
    href: "/historico",
    icon: History,
    description: "Archivo histórico y efemérides sportinguistas",
  },
  {
    label: "Social",
    href: "/social",
    icon: MessageSquare,
    description: "Comunidad, feed de partidos y debates",
  },
  {
    label: "Juegos",
    href: "/juegos",
    icon: Gamepad2,
    description: "La Porra de El Molinón y pasatiempos",
  },
];

/**
 * Brand logo linking to home/temporada.
 * Displays uploaded /logo.png or falls back to an accessible SVG crest mark.
 */
function BrandLogo() {
  const [hasImageError, setHasImageError] = useState(false);

  return (
    <Link
      href="/temporada"
      aria-label="Mareona — Inicio"
      className="flex items-center gap-2.5 rounded-md p-1 text-white transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--primary)]"
    >
      {!hasImageError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/logo.png"
          alt="Mareona Logo"
          width={32}
          height={32}
          onError={() => setHasImageError(true)}
          className="h-8 w-8 rounded-sm object-contain"
        />
      ) : (
        <div
          className="flex h-8 w-8 items-center justify-center rounded-sm bg-white text-[var(--primary)] shadow-xs select-none"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            {/* Minimalist wave crest forming the M */}
            <path d="M3 17c3-5 5-8 9-2 4 6 6 3 9-2" />
            <path d="M3 12c3-4 5-6 9-1 4 5 6 2 9-1" opacity="0.6" />
          </svg>
        </div>
      )}
      <div className="flex flex-col">
        <span className="text-base font-black tracking-wider text-white uppercase leading-none">
          Mareona
        </span>
        <span className="text-[10px] font-semibold tracking-widest text-white/80 uppercase mt-0.5">
          Real Sporting
        </span>
      </div>
    </Link>
  );
}

/**
 * Main dual navigation:
 * - Desktop header: Corporate red background (#e2001a), white text, typographic links only (no decorative icons).
 * - Mobile top bar: Matching corporate red header with logo.
 * - Mobile bottom bar: PWA ergonomic touch navigation with high visual clarity and functional icons.
 */
export function MainNav() {
  const pathname = usePathname();

  return (
    <>
      {/* ================================================================= */}
      {/* DESKTOP HEADER (≥ 768px): Red background, pure white typography   */}
      {/* ================================================================= */}
      <header className="sticky top-0 z-40 hidden w-full border-b border-[var(--primary-strong)] bg-[var(--primary)] text-white shadow-xs md:block">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <BrandLogo />

          <nav aria-label="Navegación principal">
            <ul className="flex items-center gap-1.5">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      className={`relative flex h-10 items-center rounded-md px-3.5 text-sm font-medium tracking-wide transition-colors duration-150 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--primary)] ${
                        isActive
                          ? "bg-white/18 font-bold text-white shadow-2xs"
                          : "text-white/85 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <span>{item.label}</span>
                      {isActive && (
                        <span
                          className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-white"
                          aria-hidden="true"
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </header>

      {/* ================================================================= */}
      {/* MOBILE TOP BAR (< 768px): Matching corporate red header           */}
      {/* ================================================================= */}
      <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-[var(--primary-strong)] bg-[var(--primary)] px-4 text-white shadow-xs md:hidden">
        <BrandLogo />
      </header>

      {/* ================================================================= */}
      {/* MOBILE BOTTOM NAVIGATION BAR (< 768px, PWA Ergonomics)           */}
      {/* ================================================================= */}
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
    </>
  );
}
