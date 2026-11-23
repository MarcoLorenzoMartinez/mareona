// Client: Requiere usePathname() para evaluar la ruta activa y aplicar aria-current="page"
"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-items";
import { BrandLogo } from "./brand-logo";
import { MobileNav, MobileNavFallback } from "./mobile-nav";
import { UserNav } from "@/components/auth/user-nav";
import { useSocialNotifications } from "./use-social-notifications";
import { useOfflineGuard } from "@/lib/pwa/use-offline-guard";
import { usePendingNavigation } from "@/lib/ui/use-pending-navigation";
import { getDictionary } from "@/i18n";

function DesktopNavList({
  pathname,
  unreadSocialCount = 0,
}: { readonly pathname: string | null; readonly unreadSocialCount?: number }) {
  const dict = getDictionary();
  const { isBlocked, guardNavigation } = useOfflineGuard();
  const { markPending, isPending } = usePendingNavigation(pathname);

  return (
    <nav aria-label={dict.layout.nav.desktopAria}>
      <ul className="flex items-center gap-1.5">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname !== null &&
            (item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`));
          const isItemPending = isPending(item.href);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                aria-disabled={isBlocked(item.href) ? "true" : undefined}
                aria-busy={isItemPending ? "true" : undefined}
                onClick={(e) => {
                  guardNavigation(e, item.href);
                  if (!e.defaultPrevented) {
                    markPending(item.href, isActive);
                  }
                }}
                className={`relative flex h-10 items-center justify-center rounded-md px-3.5 text-sm font-medium tracking-wide transition-colors duration-150 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--primary)] ${
                  isBlocked(item.href) ? "opacity-55 " : ""
                }${
                  isActive
                    ? "bg-white/18 font-bold text-white shadow-2xs"
                    : isItemPending
                    ? "bg-white/15 font-semibold text-white animate-pulse"
                    : "text-white/85 hover:bg-white/10 hover:text-white"
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
