// Client: Requiere usePathname() para evaluar la ruta activa y aplicar aria-current="page", y estado de fallback de imagen
"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-items";
import { MobileNav, MobileNavFallback } from "./mobile-nav";
import { UserNav } from "@/components/auth/user-nav";
import { useSocialNotifications } from "./use-social-notifications";
import { useOfflineGuard } from "@/lib/pwa/use-offline-guard";
import { getDictionary } from "@/i18n";

/**
 * Brand logo linking to home/temporada.
 * Displays uploaded /logo.png or falls back to an accessible SVG crest mark.
 */
function BrandLogo() {
  const dict = getDictionary();
  const [hasImageError, setHasImageError] = useState(false);
  const { guardNavigation } = useOfflineGuard();

  return (
    <Link
      href="/"
      onClick={(e) => guardNavigation(e, "/")}
      aria-label={dict.layout.brand.homeAria}
      className="flex items-center gap-2.5 rounded-md p-1 text-white transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--primary)]"
    >
      {!hasImageError ? (
        <Image
          src="/logo.png"
          alt={dict.layout.brand.logoAlt}
          width={32}
          height={32}
          priority
          unoptimized
          onError={() => setHasImageError(true)}
          className="h-8 w-8 rounded-sm object-contain"
        />
      ) : (
        <div
          className="flex h-8 w-8 items-center justify-center rounded-sm bg-white text-[var(--primary)] shadow-xs select-none"
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <path d="M3 17c3-5 5-8 9-2 4 6 6 3 9-2" />
            <path d="M3 12c3-4 5-6 9-1 4 5 6 2 9-1" opacity="0.6" />
          </svg>
        </div>
      )}
      <div className="flex flex-col">
        <span className="text-base font-black tracking-wider text-white uppercase leading-none">
          {dict.layout.brand.name}
        </span>
        <span className="text-[10px] font-semibold tracking-widest text-white/80 uppercase mt-0.5">
          {dict.layout.brand.club}
        </span>
      </div>
    </Link>
  );
}

function DesktopNavList({
  pathname,
  unreadSocialCount = 0,
}: { readonly pathname: string | null; readonly unreadSocialCount?: number }) {
  const dict = getDictionary();
  const { isBlocked, guardNavigation } = useOfflineGuard();

  return (
    <nav aria-label={dict.layout.nav.desktopAria}>
      <ul className="flex items-center gap-1.5">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname !== null &&
            (item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`));

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                aria-disabled={isBlocked(item.href) ? "true" : undefined}
                onClick={(e) => guardNavigation(e, item.href)}
                className={`relative flex h-10 items-center justify-center rounded-md px-3.5 text-sm font-medium tracking-wide transition-colors duration-150 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--primary)] ${
                  isBlocked(item.href) ? "opacity-55 " : ""
                }${
                  isActive ? "bg-white/18 font-bold text-white shadow-2xs" : "text-white/85 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="relative inline-flex items-center">
                  {item.label}
                  {item.href === "/social" && unreadSocialCount > 0 && (
                    <span
                      className="absolute -top-1 -right-3 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-white px-1 text-[9px] font-bold leading-none tabular-nums text-[var(--primary)]"
                      aria-label={`${unreadSocialCount} ${dict.layout.nav.notificationsAriaSuffix}`}
                    >
                      {unreadSocialCount > 9 ? "9+" : unreadSocialCount}
                    </span>
                  )}
                </span>
                {isActive && <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-white" aria-hidden="true" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function MainNavInner() {
  const pathname = usePathname();
  const socialNotifications = useSocialNotifications();

  return (
    <>
      <header className="sticky top-0 z-40 hidden w-full border-b border-[var(--primary-strong)] bg-[var(--primary)] text-white shadow-xs md:block">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <BrandLogo />
          <div className="flex items-center gap-5">
            <DesktopNavList pathname={pathname} unreadSocialCount={socialNotifications.totalUnread} />
            <UserNav />
          </div>
        </div>
      </header>

      <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-[var(--primary-strong)] bg-[var(--primary)] px-4 text-white shadow-xs md:hidden">
        <BrandLogo />
        <UserNav />
      </header>

      <MobileNav />
    </>
  );
}

export function MainNavFallback() {
  return (
    <>
      <header className="sticky top-0 z-40 hidden w-full border-b border-[var(--primary-strong)] bg-[var(--primary)] text-white shadow-xs md:block">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <BrandLogo />
          <div className="flex items-center gap-5">
            <DesktopNavList pathname={null} />
            <div className="h-9 w-9 rounded-full bg-white/20" aria-hidden="true" />
          </div>
        </div>
      </header>

      <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-[var(--primary-strong)] bg-[var(--primary)] px-4 text-white shadow-xs md:hidden">
        <BrandLogo />
        <div className="h-9 w-9 rounded-full bg-white/20" aria-hidden="true" />
      </header>

      <MobileNavFallback />
    </>
  );
}

/**
 * Main dual navigation:
 * - Desktop header: Corporate red background (#e2001a), white text, typographic links.
 * - Mobile top bar: Matching corporate red header with logo.
 * - Mobile bottom bar: PWA ergonomic touch navigation via MobileNav.
 * Encapsulates internal Suspense boundary with structural fallback for PPR static shell compatibility.
 */
export function MainNav() {
  return (
    <Suspense fallback={<MainNavFallback />}>
      <MainNavInner />
    </Suspense>
  );
}
