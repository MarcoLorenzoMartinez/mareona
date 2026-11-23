// Client: Requiere usePathname() para evaluar la ruta activa en móvil y aplicar aria-current
"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { NAV_ITEMS } from "./nav-items";
import { useSocialNotifications } from "./use-social-notifications";
import { useOfflineGuard } from "@/lib/pwa/use-offline-guard";
import { usePendingNavigation } from "@/lib/ui/use-pending-navigation";
import { getDictionary } from "@/i18n";

function MobileNavList({
  pathname,
  unreadSocialCount = 0,
}: {
  readonly pathname: string | null;
  readonly unreadSocialCount?: number;
}) {
  const dict = getDictionary();
  const { isBlocked, guardNavigation } = useOfflineGuard();
  const { markPending, isPending } = usePendingNavigation(pathname);

  return (
    <nav
      aria-label={dict.layout.nav.mobileAria}
      className="fixed bottom-0 inset-x-0 z-50 border-t border-[var(--border)] bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <ul className="grid grid-cols-5 items-center">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname !== null &&
            (item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`));
          const isItemPending = isPending(item.href);
          const Icon = item.icon;

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
                className={`flex h-14 min-w-[44px] flex-col items-center justify-center gap-1 transition-[transform,opacity] duration-100 ease-out active:scale-90 select-none touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-strong)] ${
                  isBlocked(item.href) ? "opacity-45 " : ""
                }${
                  isActive || isItemPending
                    ? "text-[var(--primary)]"
                    : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <Icon
                    className={`h-5 w-5 ${
                      isActive || isItemPending
                        ? "text-[var(--primary)] stroke-[2.25]"
                        : "text-[var(--foreground-muted)] stroke-[1.75]"
                    }${isItemPending ? " opacity-70" : ""}`}
                    aria-hidden="true"
                  />
                  {isItemPending && (
                    <Loader2
                      className="absolute -top-1 -right-2.5 h-3 w-3 animate-spin text-[var(--primary)]"
                      aria-hidden="true"
                    />
                  )}
                  {!isItemPending && item.href === "/social" && unreadSocialCount > 0 && (
                    <span
                      className="absolute -top-1 -right-2 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[var(--primary)] px-1 text-[9px] font-bold tabular-nums text-white ring-2 ring-white"
                      aria-label={`${unreadSocialCount} ${dict.layout.nav.notificationsAriaSuffix}`}
                    >
                      {unreadSocialCount > 9 ? "9+" : unreadSocialCount}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[11px] leading-none tracking-tight ${
                    isActive || isItemPending ? "font-bold text-[var(--primary)]" : "font-medium"
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

function MobileNavInner() {
  const pathname = usePathname();
  const notifications = useSocialNotifications();
  return <MobileNavList pathname={pathname} unreadSocialCount={notifications.totalUnread} />;
}

export function MobileNavFallback() {
  return <MobileNavList pathname={null} />;
}

/**
 * Mobile bottom navigation bar (< 768px, PWA Ergonomics).
 * Encapsulates Suspense boundary to guarantee static HTML shell prerendering with zero layout shift.
 */
export function MobileNav() {
  return (
    <Suspense fallback={<MobileNavFallback />}>
      <MobileNavInner />
    </Suspense>
  );
}
