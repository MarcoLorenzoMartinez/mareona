import Image from "next/image";
import type { HistoricalCrestEra } from "@/lib/cards/types";

interface HistoricalCrestBadgeProps {
  readonly era: HistoricalCrestEra;
  readonly size?: "sm" | "md";
  readonly className?: string;
}

const ERA_LABELS: Record<HistoricalCrestEra, string> = {
  "1905": "1905 — Sporting Club Gijonés",
  republic: "1931 — II República (Corona Mural)",
  classic_1950: "1940-60s — Real Gijón",
  golden_1980: "1970-80s — Era Dorada",
  modern: "Real Sporting",
};

/**
 * Historical Sporting crest badge rendering authentic heraldic marks for each era.
 * Uses official logo for modern era and dedicated SVGs for historical periods.
 */
export function HistoricalCrestBadge({
  era,
  size = "md",
  className = "",
}: HistoricalCrestBadgeProps) {
  const isSm = size === "sm";
  const label = ERA_LABELS[era];
  const sizePx = isSm ? 28 : 34;
  const dimensionClass = isSm ? "h-7 w-7" : "h-8.5 w-8.5";

  return (
    <div
      aria-label={`Escudo histórico: ${label}`}
      title={label}
      className={`inline-flex shrink-0 items-center justify-center ${dimensionClass} ${className}`}
    >
      {era === "modern" && (
        <Image
          src="/logo.png"
          alt="Real Sporting"
          width={sizePx}
          height={sizePx}
          unoptimized
          className="h-full w-full object-contain drop-shadow-xs"
        />
      )}

      {era === "golden_1980" && (
        /* Escudo clásico 1970-1980s: Corona real dorada, triángulo rojiblanco y letras S-G */
        <svg viewBox="0 0 36 40" className="h-full w-full drop-shadow-xs" aria-hidden="true">
          {/* Corona real */}
          <path d="M10 11 L13 5 L18 8 L23 5 L26 11 Z" fill="#d97706" stroke="#92400e" strokeWidth="0.8" />
          <circle cx="13" cy="5" r="1.2" fill="#f59e0b" />
          <circle cx="18" cy="8" r="1.2" fill="#f59e0b" />
          <circle cx="23" cy="5" r="1.2" fill="#f59e0b" />
          <rect x="11" y="11" width="14" height="2" fill="#b45309" rx="0.5" />
          {/* Triángulo rojiblanco invertido */}
          <path d="M7 13 L29 13 L18 36 Z" fill="#ffffff" stroke="#990000" strokeWidth="1" />
          <path d="M11.5 13 L14 13 L18 29 L17 29 Z" fill="#e2001a" />
          <path d="M17.2 13 L18.8 13 L18.8 35 L17.2 35 Z" fill="#e2001a" />
          <path d="M22 13 L24.5 13 L19 29 L18 29 Z" fill="#e2001a" />
          {/* Monograma S - G */}
          <text x="18" y="24" textAnchor="middle" fill="#d97706" stroke="#78350f" strokeWidth="0.4" fontSize="10" fontWeight="900" fontFamily="sans-serif">
            S
          </text>
        </svg>
      )}

      {era === "classic_1950" && (
        /* Escudo Real Gijón (1940-1960s): Corona real sobre escudo triangular en forma de 'G' */
        <svg viewBox="0 0 36 40" className="h-full w-full drop-shadow-xs" aria-hidden="true">
          {/* Corona real */}
          <path d="M10 10 L13 4 L18 7 L23 4 L26 10 Z" fill="#d97706" stroke="#92400e" strokeWidth="0.8" />
          <rect x="10" y="10" width="16" height="2" fill="#b45309" rx="0.5" />
          {/* Silueta triangular con pico curvo */}
          <path d="M6 12 L30 12 L18 37 Z" fill="#ffffff" stroke="#990000" strokeWidth="1" />
          {/* Franjas rojiblancas interiores */}
          <path d="M10 12 L13 12 L18 28 L16.5 28 Z" fill="#e2001a" />
          <path d="M17 12 L19 12 L19 35 L17 35 Z" fill="#e2001a" />
          <path d="M23 12 L26 12 L19.5 28 L18 28 Z" fill="#e2001a" />
          {/* Letra G estilizada de Real Gijón */}
          <path d="M24 16 A 7 7 0 1 0 24 26 L 24 21 L 18 21" fill="none" stroke="#b45309" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      )}

      {era === "republic" && (
        /* Escudo Segunda República (1931-1936): Corona mural almenada y escudo circular */
        <svg viewBox="0 0 36 38" className="h-full w-full drop-shadow-xs" aria-hidden="true">
          {/* Corona mural republicana (almenas de castillo) */}
          <path d="M9 10 H27 V8 H25 V6 H22 V8 H20 V6 H16 V8 H14 V6 H11 V8 H9 Z" fill="#b45309" stroke="#78350f" strokeWidth="0.6" />
          {/* Círculo con franjas rojiblancas */}
          <circle cx="18" cy="22" r="13" fill="#ffffff" stroke="#990000" strokeWidth="1" />
          <clipPath id="republic-circle-clip">
            <circle cx="18" cy="22" r="12.5" />
          </clipPath>
          <g clipPath="url(#republic-circle-clip)">
            <rect x="9" y="9" width="3" height="26" fill="#e2001a" />
            <rect x="15" y="9" width="3" height="26" fill="#e2001a" />
            <rect x="21" y="9" width="3" height="26" fill="#e2001a" />
            <rect x="27" y="9" width="3" height="26" fill="#e2001a" />
          </g>
          <circle cx="18" cy="22" r="7" fill="#ffffff" stroke="#990000" strokeWidth="0.8" />
          <text x="18" y="25" textAnchor="middle" fill="#990000" fontSize="8" fontWeight="bold" fontFamily="sans-serif">
            SG
          </text>
        </svg>
      )}

      {era === "1905" && (
        /* Escudo Orígenes (1905): Sporting Club Gijonés con monograma SCG y franjas */
        <svg viewBox="0 0 36 38" className="h-full w-full drop-shadow-xs" aria-hidden="true">
          {/* Círculo exterior vintage */}
          <circle cx="18" cy="19" r="15" fill="#ffffff" stroke="#e2001a" strokeWidth="1.5" />
          <circle cx="18" cy="19" r="13.2" fill="none" stroke="#b45309" strokeWidth="0.7" />
          <clipPath id="vintage-circle-clip">
            <circle cx="18" cy="19" r="13" />
          </clipPath>
          <g clipPath="url(#vintage-circle-clip)">
            <rect x="9" y="4" width="3.5" height="30" fill="#e2001a" />
            <rect x="16.25" y="4" width="3.5" height="30" fill="#e2001a" />
            <rect x="23.5" y="4" width="3.5" height="30" fill="#e2001a" />
          </g>
          {/* Medallón central con monograma 1905 */}
          <circle cx="18" cy="19" r="8" fill="#ffffff" stroke="#b45309" strokeWidth="1" />
          <text x="18" y="22" textAnchor="middle" fill="#990000" fontSize="7" fontWeight="900" fontFamily="sans-serif">
            SCG
          </text>
        </svg>
      )}
    </div>
  );
}
