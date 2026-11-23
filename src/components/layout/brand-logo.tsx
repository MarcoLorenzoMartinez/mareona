// Client: Logo de marca enlazado a inicio con fallback SVG y guardia offline
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useOfflineGuard } from "@/lib/pwa/use-offline-guard";
import { getDictionary } from "@/i18n";

/**
 * Brand logo linking to home/temporada.
 * Displays /logo.png or falls back to an accessible SVG crest mark.
 */
export function BrandLogo() {
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
