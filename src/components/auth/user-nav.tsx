// Client: Botón y menú de sesión para cabecera en escritorio y móvil
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { AuthAvatar } from "./auth-avatar";

export function UserNav() {
  const { user, profile, isLoading, openAuthModal, handleSignOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
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
        onClick={() => openAuthModal("signin")}
        className="flex h-9 items-center gap-1.5 rounded-md bg-white/15 px-3 text-xs font-bold text-white tracking-wide transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        aria-label="Iniciar sesión o unirme a Mareona"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span>Entrar</span>
      </button>
    );
  }

  const displayName = profile?.display_name || profile?.username || "Aficionado";
  const points = profile?.points ?? 0;

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex items-center gap-2 rounded-full p-0.5 transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        aria-expanded={isMenuOpen}
        aria-haspopup="menu"
        aria-label="Abrir menú de usuario"
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
          <span className="text-[10px] font-semibold text-white/80 tabular-nums">
            {points} pts
          </span>
        </div>
      </button>

      {isMenuOpen && (
        <div
          role="menu"
          aria-label="Opciones de cuenta"
          className="absolute right-0 mt-2 w-52 rounded-xl bg-white p-2 shadow-xl border border-neutral-100 z-50 animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="border-b border-neutral-100 px-3 py-2">
            <p className="text-xs font-bold text-neutral-900 truncate">{displayName}</p>
            <p className="text-[11px] font-semibold text-[var(--primary)] tabular-nums mt-0.5">
              {points} puntos conseguidos
            </p>
          </div>

          <div className="py-1">
            <Link
              href="/perfil"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors"
              role="menuitem"
            >
              <svg className="h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Mi Perfil</span>
            </Link>

            <Link
              href="/juegos"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors"
              role="menuitem"
            >
              <svg className="h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Mis Porras</span>
            </Link>
          </div>

          <div className="border-t border-neutral-100 pt-1">
            <button
              type="button"
              onClick={async () => {
                setIsMenuOpen(false);
                await handleSignOut();
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
              role="menuitem"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
