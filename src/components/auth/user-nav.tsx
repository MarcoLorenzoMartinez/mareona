// Client: Botón y menú de sesión para cabecera en escritorio y móvil
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { AuthAvatar } from "./auth-avatar";
import { checkCurrentUserAdminAction } from "@/lib/admin/guard-actions";
import { useOfflineGuard } from "@/lib/pwa/use-offline-guard";
import { getDictionary } from "@/i18n";

export function UserNav() {
  const dict = getDictionary();
  const { user, profile, isLoading, openAuthModal, handleSignOut } = useAuth();
  const { isOnline, guardAction, guardNavigation } = useOfflineGuard();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    if (!user) return;

    void checkCurrentUserAdminAction().then((hasAdmin) => {
      if (mounted) {
        setIsAdmin(hasAdmin);
      }
    });

    return () => {
      mounted = false;
    };
  }, [user]);

  const showAdmin = Boolean(user) && isAdmin;

  useEffect(() => {
    if (!isMenuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setIsMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [isMenuOpen]);

  if (isLoading) {
    return (
      <div className="h-9 w-9 animate-pulse rounded-full bg-white/20" aria-hidden="true" />
    );
  }

  if (!user) {
    return (
      <button
        type="button"
        onClick={() => {
          if (guardAction(dict.auth.userNav.offlineSignInNotice)) openAuthModal("signin");
        }}
        aria-disabled={isOnline ? undefined : "true"}
        className={`flex min-h-[44px] sm:min-h-9 items-center gap-1.5 rounded-md bg-white/15 px-3 text-xs font-bold text-white tracking-wide transition-[background-color,opacity] hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
          isOnline ? "" : "opacity-60"
        }`}
        aria-label={dict.auth.userNav.signInAria}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span>{dict.auth.userNav.signInLabel}</span>
      </button>
    );
  }

  const displayName = profile?.display_name || profile?.username || dict.auth.common.defaultFanName;
  const username = profile?.username || "aficionado";

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex min-h-[44px] min-w-[44px] items-center justify-center lg:justify-start gap-2 rounded-full p-1 transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        aria-expanded={isMenuOpen}
        aria-haspopup="menu"
        aria-label={dict.auth.userNav.openMenuAria}
      >
        <AuthAvatar
          src={profile?.avatar_url}
          alt={displayName}
          size="sm"
        />
        <div className="hidden lg:flex flex-col text-left text-white leading-tight">
          <span className="text-xs font-bold truncate max-w-[120px]">
            {displayName}
          </span>
          <span className="text-[10px] font-medium text-white/80 truncate max-w-[120px]">
            @{username}
          </span>
        </div>
      </button>

      {isMenuOpen && (
        <div
          role="menu"
          aria-label={dict.auth.userNav.menuAria}
          className="absolute right-0 mt-2 w-52 rounded-xl bg-white p-2 shadow-xl border border-neutral-100 z-50 animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="border-b border-neutral-100 px-3 py-2">
            <p className="text-xs font-bold text-neutral-900 truncate">{displayName}</p>
            <p className="text-[11px] font-medium text-neutral-500 mt-0.5">
              @{username}
            </p>
          </div>

          <div className="py-1">
            {showAdmin && (
              <Link
                href="/admin/estadisticas"
                onClick={(e) => {
                  setIsMenuOpen(false);
                  guardNavigation(e, "/admin/estadisticas");
                }}
                aria-disabled={isOnline ? undefined : "true"}
                className={`flex min-h-[40px] items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold text-[#e2001a] hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] transition-colors ${isOnline ? "" : "opacity-55"}`}
                role="menuitem"
              >
                <svg className="h-4 w-4 shrink-0 text-[#e2001a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>{dict.auth.userNav.adminLink}</span>
              </Link>
            )}

            <Link
              href="/perfil"
              onClick={(e) => {
                setIsMenuOpen(false);
                guardNavigation(e, "/perfil");
              }}
              aria-disabled={isOnline ? undefined : "true"}
              className={`flex min-h-[40px] items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] transition-colors ${isOnline ? "" : "opacity-55"}`}
              role="menuitem"
            >
              <svg className="h-4 w-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{dict.auth.userNav.profileLink}</span>
            </Link>
          </div>

          <div className="border-t border-neutral-100 pt-1">
            <button
              type="button"
              onClick={async () => {
                setIsMenuOpen(false);
                await handleSignOut();
              }}
              className="flex min-h-[40px] w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] transition-colors"
              role="menuitem"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>{dict.auth.userNav.signOutButton}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
